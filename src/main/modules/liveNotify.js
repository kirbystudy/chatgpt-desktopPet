const https = require('https')
const notifier = require('node-notifier')
const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

// 读取config.json
const configPath = path.resolve(__dirname, '../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

async function getLiveRoomData(room_id) {
    const url = `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${room_id}`

    try {
        https.get(url, (response) => {
            let data = ''

            response.on('data', (chunk) => {
                data += chunk
            })

            response.on('end', () => {
                const json = JSON.parse(data)
                parseRoomData(room_id, json)
            })
        })
    } catch (error) {
        console.error(error.message)
    }
}

function parseRoomData(room_id, json) {
    if (json.data === null || json.data === undefined) {
        return
    }

    const room = roomList.find(data => data.room_id === room_id)
    room.cover = json.data.room_info.cover
    room.avatar = json.data.anchor_info.base_info.face
    room.title = json.data.room_info.title
    if (!room.name) {
        room.name = json.data.anchor_info.base_info.uname
    }

    const status = json.data.room_info.live_status

    if (status !== room.status) {
        room.status = status
        switch (status) {
            case 0:
                break
            case 1:
                showNotify(room, '{name}正在直播')
                break
            case 2:
                break
            default:
                console.log(`未知状态：${status}`)
        }
    }
}

async function showNotify(room, title) {
    title = title.replace('{name}', room.name)
        .replace('{title}', room.title)
        .replace('{room_id}', room.room_id)

    const date = new Date().toLocaleString()
    console.log(`${title} ${room.title} ${date}`)

    const fileName = path.resolve(__dirname + `/avatar_${room.room_id}.jpg`)
    await saveFile(room.avatar, fileName)

    notifier.notify({
        title: title,
        message: room.title,
        icon: fileName,
        sound: true,
        wait: true
    },
        function (err, response) {
            if (response === 'activate') {
                const URL = `https://live.bilibili.com/${room.room_id}`
                openURL(URL)
            }
        }
    )
}

async function saveFile(url, fileName) {
    try {
        if (url.startsWith('http:')) {
            url = url.replace('http:', 'https:')
        }

        https.get(url, (response) => {
            let data = ''

            response.setEncoding('binary')

            response.on('data', (chunk) => {
                data += chunk
            })

            response.on('end', () => {
                fs.writeFileSync(fileName, Buffer.from(data, 'binary'))  // 将响应数据写入文件
                console.log(`文件已保存：${fileName}`)
            })
        })
    } catch (error) {
        console.log("Error: ", error.message)
    }
}

function openURL(url) {
    switch (process.platform) {
        case "darwin":
            child_process.spawn('open', [url])
            break
        case "win32":
            child_process.exec(start`${url}`)
            break
        default:
            child_process.spawn('xdg-open', [url])
    }
}

const roomList = config.bilibili.map(item => {
    return {
        room_id: item.roomId,
        name: item.username,
        status: 0,
        cover: '',
        avatar: '',
        title: '',
    }
})

module.exports.liveNotify = function () {
    roomList.forEach(room => {
        console.log(`监控直播间：${room.room_id} -> ${room.name}`)
        getLiveRoomData(room.room_id)
    })
}