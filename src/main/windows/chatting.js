const { BrowserWindow, screen } = require('electron')
const path = require('path')

let chatting = null

// 创建chatting聊天窗口
function createChattingShow() {

    // 设置窗口打开监听
    var set_windth = screen.getPrimaryDisplay().workAreaSize.width

    chatting = new BrowserWindow({
        width: parseInt((set_windth / 3) * 1.25),
        height: parseInt((set_windth / 3) * 1.08),
        minWidth: 800,
        minHeight: 600,
        skipTaskbar: false,
        alwaysOnTop: true,
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

    // 窗口在屏幕中央
    chatting.center()

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

    // 禁止拖动图片到外部
    chatting.webContents.addListener('will-navigate', (event) => {
        // 判断是否为图片拖动事件
        if (event.sourceCapabilities.firesTouchEvents) {
            event.preventDefault();
        }
    });

    chatting.webContents.addListener('will-redirect', (event) => {
        // 判断是否为图片拖动事件
        if (event.sourceCapabilities.firesTouchEvents) {
            event.preventDefault();
        }
    });

    // 监听closed事件后执行
    chatting.on('closed', () => { chatting = null })

    return chatting
}

module.exports = createChattingShow