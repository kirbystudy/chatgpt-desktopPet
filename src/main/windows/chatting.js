const { BrowserWindow } = require('electron')
const path = require('path')

let chatting = null

// 创建chatgpt聊天窗口
function createChattingShow() {

    chatting = new BrowserWindow({
        width: 800,
        height: 600,
        skipTaskbar: false,
        transparent: false,
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

    // 监听closed事件后执行
    chatting.on('closed', () => { chatting = null })

    return chatting
}

module.exports = createChattingShow