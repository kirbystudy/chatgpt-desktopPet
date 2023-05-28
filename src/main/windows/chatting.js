const { BrowserWindow } = require('electron')
const path = require('path')

let chatting = null;

// 创建chatting聊天窗口
function createChattingShow() {

    chatting = new BrowserWindow({
        width: 480,
        height: 680,
        skipTaskbar: false,
        alwaysOnTop: false,
        transparent: true,
        frame: false,
        resizable: false,
        icon: path.join(__dirname, '../../../assets/app_128.ico'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            zoomFactor: 1
        }
    })

    // 加载本地文件
    chatting.loadFile(path.join(__dirname, '../../renderer/pages/chatting.html'))

    chatting.webContents.on('did-finish-load', (event) => {
        // 发送消息给渲染进程chat
        chatting.webContents.send('openChatting', [
            {
                'user': 'TA',
                'time': '00:00',
                'text': '你好'
            },
            {
                'user': 'ME',
                'time': '00:00',
                'text': '你吃饭了吗'
            },
            {
                'user': 'TA',
                'time': '00:00',
                'text': '吃了'
            },
        ]
        )
    })

    // 监听closed事件后执行
    chatting.on('closed', () => { chatting = null })

    return chatting
}

module.exports = createChattingShow