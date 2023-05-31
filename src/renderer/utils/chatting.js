const ipcRenderer = require('electron').ipcRenderer
const screen = require('../utils/screen')
window.$ = window.jQuery = require('../utils/jquery.min.js')


// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')

// 读取config.json
const configPath = path.resolve(__dirname, '../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

function showChatting() {
    sending()
}

function sending() {
    var send_message = document.getElementById('chat_middle_item')
    const send_btn = document.getElementById('send_button')

    // 发送内容
    var message = document.getElementById('chat_context_item')

    // 回车键发送消息
    message.addEventListener('keydown', (event) => {

        if (event.key === 'Enter') {

            // 阻止默认的回车键行为，以避免换行
            event.preventDefault()

            var str = message.value
            if (str.length == 0) {
                openPopup('秋蒂桌宠', '文本内容不能为空!')
                return
            }

            send_btn.classList.add('disabled')
            send_btn.innerHTML = ''
            send_btn.classList.add("loading")


            if (str.length > 0) {
                var date = new Date()
                var hour = date.getHours()
                var minute = date.getMinutes()
                var time = ''
                if (minute < 10) {
                    time = hour + ':0' + minute
                } else {
                    time = hour + ':' + minute
                }

                var answer =
                    `
                <div class="chat_right_item_1">
                    <img src="../image/user.png">
                </div>
                <div class="chat_right_item_2">
                    <div class="chat_right_time">${time}</div>
                    <div class="chat_right_content">${str}</div>
                </div>
                `

                var oLi = document.createElement('div')
                oLi.setAttribute('class', 'chat_right clearfix')
                oLi.innerHTML = answer

                send_message.append(oLi)

                // 清空消息框
                message.value = ''

                // 保存信息
                ipcRenderer.send('push_chattingText', { 'user': 'ME', 'time': time, 'text': str })

                // 滚动条
                send_message.scrollTop = send_message.scrollHeight

                // 请求chatgpt接口
                getReply(str)
            }
        }
    })

    // 鼠标点击发送消息
    send_btn.addEventListener('click', () => {

        var str = message.value

        if (str.length >= 500) {
            openPopup('秋蒂桌宠', '字数限制在500字内')
            return
        }
        if (str.length == 0) {
            openPopup('秋蒂桌宠', '文本内容不能为空!')
            return
        }

        send_btn.classList.add('disabled')
        send_btn.innerHTML = ''
        send_btn.classList.add("loading")


        var date = new Date()
        var hour = date.getHours()
        var minute = date.getMinutes()
        var time = ''
        if (minute < 10) {
            time = hour + ':0' + minute
        } else {
            time = hour + ':' + minute
        }

        var answer =
            `
                <div class="chat_right_item_1">
                    <img src="../image/user.png">
                </div>
                <div class="chat_right_item_2">
                    <div class="chat_right_time">${time}</div>
                    <div class="chat_right_content">${str}</div>
                </div>
                `

        var oLi = document.createElement('div')
        oLi.setAttribute('class', 'chat_right clearfix')
        oLi.innerHTML = answer

        send_message.append(oLi)

        // 清空消息框
        message.value = ''

        // 保存信息
        ipcRenderer.send('push_chattingText', { 'user': 'ME', 'time': time, 'text': str })

        // 滚动条
        send_message.scrollTop = send_message.scrollHeight

        // 请求chatgpt接口
        getReply(str)

    })
}

// 获取回复
function getReply(str) {

    const send_btn = document.getElementById('send_button')

    const formData = new FormData()
    formData.append('ruleType', config.gpt.ruleType)
    formData.append('command', str)

    fetch(`${config.gpt.url}`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            // 处理响应
            return response.text()
        })
        .then(data => {
            showReply(data)
        })
        .catch(error => {
            // 处理错误
            console.log(error)
        })
        .finally(() => {
            send_btn.classList.remove('disabled')
            send_btn.innerHTML = '发送'
            send_btn.classList.remove('loading')
        })
}

// 显示回复
function showReply(str) {
    if (str.length > 0) {
        var reply_message = document.getElementById('chat_middle_item')
        var date = new Date()
        var hour = date.getHours()
        var minute = date.getMinutes()
        var time = ''
        if (minute < 10) {
            time = hour + ':0' + minute
        } else {
            time = hour + ':' + minute
        }

        const regex = /^([^\n]+)\n([\s\S]+)\n([^\n]+)\n([^\n]+)/
        const match = str.match(regex)

        var answer = ''

        if (match) {

            answer +=
                `
            <div class="chat_left_item_1">
                <img src="../image/qiudi.jpg">
            </div>
            <div class="chat_left_item_2">
                <div class="chat_left_time">${time}</div>
                <div class="chat_left_content">
                    <pre><code>${str}</code></pre>
                </div>
            </div>
            `
        } else {
            answer +=
                `
            <div class="chat_left_item_1">
                <img src="../image/qiudi.jpg">
            </div>
            <div class="chat_left_item_2">
                <div class="chat_left_time">${time}</div>
                <div class="chat_left_content">${str}</div>
            </div>
            `
        }


        var oLi = document.createElement('div')
        oLi.setAttribute('class', 'chat_left clearfix')
        oLi.innerHTML = answer

        reply_message.append(oLi)

        // 保存信息
        ipcRenderer.send('push_chattingText', { 'user': 'TA', 'time': time, 'text': str })

        // 滚动条
        reply_message.scrollTop = reply_message.scrollHeight

    }
}

(function () {

    $('#minimize').on('click', () => {
        ipcRenderer.send('closeChatting', 'minimize')
    })

    let originalTitle = $('#maximize').attr('title')
    let isTitleChanged = false
    let chatMiddleSetHeight = $('.chat_middle')
    let chatBottomSetHeight = $('.chat_bottom')
    $('#maximize').on('click', () => {
        ipcRenderer.send('closeChatting', 'maximize')
        if (isTitleChanged) {
            screen.getScreenInfo((screenInfo) => {
                console.log(screenInfo.width, screenInfo.height, screenInfo.scalingFactor)
                if (screenInfo.width == 1366 && screenInfo.height == 768) {
                    chatMiddleSetHeight.css('height', '20rem')
                    chatBottomSetHeight.css('height', '10rem')
                    $('.chat_top').css('-webkit-app-region', 'drag')
                    $('#maximize').attr('title', originalTitle)
                    isTitleChanged = false
                }

                if (screenInfo.width == 1280 && screenInfo.height == 720 && screenInfo.scalingFactor == 1.5) {
                    chatMiddleSetHeight.css('height', '20rem')
                    chatBottomSetHeight.css('height', '10rem')
                    $('.chat_top').css('-webkit-app-region', 'drag')
                    $('#maximize').attr('title', originalTitle)
                    isTitleChanged = false
                }

                if (screenInfo.width == 1920 && screenInfo.height == 1080 && screenInfo.scalingFactor == 1) {
                    chatMiddleSetHeight.css('height', '26rem')
                    chatBottomSetHeight.css('height', '14rem')
                    $('.chat_top').css('-webkit-app-region', 'drag')
                    $('#maximize').attr('title', '还原')
                    isTitleChanged = false
                }
            })

        } else {
            screen.getScreenInfo((screenInfo) => {
                console.log(screenInfo.width, screenInfo.height, screenInfo.scalingFactor)
                if (screenInfo.width == 1366 && screenInfo.height == 768) {
                    chatMiddleSetHeight.css('height', '28rem')
                    chatBottomSetHeight.css('height', '10rem')
                    $('.chat_top').css('-webkit-app-region', 'no-drag')
                    $('#maximize').attr('title', '还原')
                    isTitleChanged = true
                }

                if (screenInfo.width == 1280 && screenInfo.height == 720 && screenInfo.scalingFactor == 1.5) {
                    chatMiddleSetHeight.css('height', '32rem')
                    chatBottomSetHeight.css('height', '10rem')
                    $('.chat_top').css('-webkit-app-region', 'no-drag')
                    $('#maximize').attr('title', '还原')
                    isTitleChanged = true
                }

                if (screenInfo.width == 1920 && screenInfo.height == 1080 && screenInfo.scalingFactor == 1) {
                    chatMiddleSetHeight.css('height', '51rem')
                    chatBottomSetHeight.css('height', '13rem')
                    $('.chat_top').css('-webkit-app-region', 'no-drag')
                    $('#maximize').attr('title', '还原')
                    isTitleChanged = true
                }
            })

        }
    })

    $('#close').on('click', () => {
        ipcRenderer.send('closeChatting', 'close')
    })

    screen.getScreenInfo((screenInfo) => {
        if (screenInfo.width == 1280 && screenInfo.height == 720 && screenInfo.scalingFactor == 1.5) {
            chatMiddleSetHeight.css('height', '20rem')
            chatBottomSetHeight.css('height', '10rem')
        }
    })

})()

ipcRenderer.on('openChatting', (event, data) => {
    showChatting(data)
})