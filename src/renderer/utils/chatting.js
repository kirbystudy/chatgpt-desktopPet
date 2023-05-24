const ipcRenderer = require('electron').ipcRenderer
window.$ = window.jQuery = require('../utils/jquery.min.js')

// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')

// 读取config.json
const configPath = path.resolve(__dirname, '../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

function showChatting(text) {
    // var textContainer = $('#chat_middle_item')
    // var textChatting = ''
    // for (var i = 0; i < text.length; i++) {
    //     if (text[i]['user'] == 'TA') {
    //         textChatting +=
    //             `<div class="chat_left clearfix">
    //             <div class="chat_left_item_1">
    //                 <img src="../image/qiudi.jpg">
    //             </div>
    //             <div class="chat_left_item_2">
    //                 <div class="chat_left_time">${text[i]['time']}</div>
    //                 <div class="chat_left_content">${text[i]['text']}</div>
    //             </div>
    //         </div>`
    //     } else {
    //         textChatting +=
    //             `<div class="chat_right clearfix">
    //             <div class="chat_right_item_1">
    //                 <img src="../image/user.png">
    //             </div>
    //             <div class="chat_right_item_2">
    //                 <div class="chat_right_time">${text[i]['time']}</div>
    //                 <div class="chat_right_content">${text[i]['text']}</div>
    //             </div>
    //         </div>`
    //     }
    // }
    // textContainer.html(textChatting)
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
            send_btn.classList.add("loading");


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
        if (str.length == 0) {
            openPopup('秋蒂桌宠', '文本内容不能为空!')
            return
        }

        send_btn.classList.add('disabled')
        send_btn.innerHTML = ''
        send_btn.classList.add("loading");

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
    })
}

// 获取回复
function getReply(str) {

    const send_btn = document.getElementById('send_button')

    const formData = new FormData();
    formData.append('ruleType', config.gpt.ruleType);
    formData.append('command', str);

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
            const content_1 = match[1]   
            const code = match[2]
            const content_2 = match[3]
            const content_3 = match[4]
            answer +=
                `
            <div class="chat_left_item_1">
                <img src="../image/qiudi.jpg">
            </div>
            <div class="chat_left_item_2">
                <div class="chat_left_time">${time}</div>
                <div class="chat_left_content">
                    <pre><code>${content_1}</code></pre>
                    <pre><code>${code}</code></pre>
                    <pre><code>${content_2}</code></pre>
                    <pre><code>${content_3}</code></pre>
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

        // 语音播报
        getVoice(str)

    }
}

// 语音功能
function getVoice(str) {
    const playAudio = document.getElementById('playAudio')

    // 匹配中文字符的正则表达式
    var chineseReg = /[^\x00-\xff]+/g

    // 匹配中文和日语字符的正则表达式
    const chineseAndJapaneseReg = /[\u3040-\u309F\u30A0-\u30FF]+[\u4E00-\u9FA5a-zA-Z0-9\s、。？！~]+/g

    // 匹配英文字符的正则表达式
    var pattern = /[a-zA-Z]+/g;

    // 将英文字符替换为空
    var result = str.replace(pattern, '');

    if (result.length <= 35) {
        if (chineseReg.test(result)) {
            fetch(`${config.vits.url}?text=[ZH]${result}[ZH]&uId=${config.vits.uid}&token=${config.vits.token}&mId=${config.vits.modelId}&rId=${config.vits.roleId}&ar=${config.vits.ar}&domin=${config.vits.domin}&va=${config.vits.va}`, {
                headers: {
                    'Content-Disposition': 'inline'
                }
            }).then(res => {
                return res.blob()
            }).then(blob => {
                const objectURL = URL.createObjectURL(blob)
                playAudio.src = objectURL
                playAudio.volume = 0.4
                playAudio.play()
            })
        } else if (chineseAndJapaneseReg.test(str)) {
            fetch(`${config.vits.url}?text=[ZH]${result}[ZH]&uId=${config.vits.uid}&token=${config.vits.token}&mId=${config.vits.modelId}&rId=${config.vits.roleId}&ar=${config.vits.ar}&domin=${config.vits.domin}&va=${config.vits.va}`, {
                headers: {
                    'Content-Disposition': 'inline'
                }
            }).then(res => {
                return res.blob()
            }).then(blob => {
                const objectURL = URL.createObjectURL(blob)
                playAudio.src = objectURL
                playAudio.volume = 0.4
                playAudio.play()
            })
        } else {
            console.log('英文字符不处理!')
        }
    }

}


(function () {
    $('#close_btn').on('click', () => {
        ipcRenderer.send('closeChatting', 'Close')
    })
})()

ipcRenderer.on('openChatting', (event, data) => {
    showChatting(data)
})