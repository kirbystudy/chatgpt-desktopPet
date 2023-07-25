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

// 本地缓存，用于记录用户收到直播通知的状态
const cacheFile = path.join(process.cwd(), '/cache/bilibili/cache.json')

let cache = {}

// 设置缓存过期时间为6小时
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000

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

    if (status) {
        switch (status) {
            case 0:
                break
            case 1:
                // 判断是否需要推送通知
                if (!isCacheExpired(room_id)) {
                    break
                }
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

    const folderPath = path.join(process.cwd(), 'cache', 'bilibili')

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }

    const fileName = path.join(folderPath, `bilibili_${room.room_id}.jpg`)

    await saveFile(room.avatar, fileName)

    notifier.notify({
        title: title,
        message: room.title,
        icon: fileName,
        sound: true,
        wait: true
    },
        function (err, response) {
            if (response === 'activate') {  // 用户点击通知
                const URL = `https://live.bilibili.com/${room.room_id}`
                openURL(URL)
                updateCache(room.room_id)
            } else if (response === 'dismissed') {   // 用户点击关闭
                updateCache(room.room_id)
            }
        }
    )
}

async function saveFile(url, fileName) {
    return new Promise(resolve => {
        if (url.startsWith('http:')) {
            url = url.replace('http:', 'https:')
        }
        https.get(url, (res) => {
            const file = fs.createWriteStream(fileName)
            res.pipe(file)

            file.on('finish', () => {
                file.close()
                resolve()
            })
        }).on("error", (err) => {
            console.log("Error: ", err.message)
        })
    })
}

function openURL(url) {
    switch (process.platform) {
        case "darwin":
            child_process.spawn('open', [url])
            break
        case "win32":
            child_process.exec(`start ${url}`)
            break
        default:
            child_process.spawn('xdg-open', [url])
    }
}

const roomList = config.bilibili.map(item => {
    return {
        room_id: item.roomId,
        name: item.username,
        cover: '',
        avatar: '',
        title: '',
    }
})

// 检查缓存是否过期
function isCacheExpired(room_id) {
    if (cache[room_id] && cache[room_id].timestamp) {
        const expirationDate = new Date(cache[room_id].timestamp + CACHE_EXPIRATION)
        return expirationDate <= new Date()
    }
    return true
}

// 更新缓存时间戳
function updateCache(room_id) {
    cache[room_id] = {
        timestamp: new Date().getTime()
    }

    fs.writeFile(cacheFile, JSON.stringify(cache), (err) => {
        if (err) {
            console.error(`更新缓存文件失败 ${room_id}: ${err}`)
        }
    })
}

// 读取缓存文件
fs.readFile(cacheFile, 'utf-8', (err, data) => {
    if (!err) {
        try {
            cache = JSON.parse(data)
        } catch (error) {
            console.error(`文件解析失败：${error}`)
        }
    }
})

module.exports.liveNotify = function () {
    roomList.forEach(room => {
        console.log(`监控直播间：${room.room_id} -> ${room.name}`)
        getLiveRoomData(room.room_id)
    })
}