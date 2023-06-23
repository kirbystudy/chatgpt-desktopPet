const { BrowserWindow, Menu } = require('electron')
const path = require('path')

let speechSynthesis = null

// 创建语音合成窗口
function createSpeechSynthesisShow() {

    speechSynthesis = new BrowserWindow({
        width: 1024,
        height: 768,
        resizable: false,
        icon: path.join(__dirname, '../../../assets/app_128.ico'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            zoomFactor: 1
        }
    })

    Menu.setApplicationMenu(null)

    // 加载本地文件
    speechSynthesis.loadFile(path.join(__dirname, '../../renderer/pages/speechSynthesis/speechSynthesis.html'))

    // 监听closed事件后执行
    speechSynthesis.on('closed', () => { speechSynthesis = null })

    return speechSynthesis
}

module.exports = createSpeechSynthesisShow