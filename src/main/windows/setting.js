const { BrowserWindow, Menu } = require('electron')
const path = require('path')

let settings = null

// 创建设置窗口
function createSettingShow() {
    
    settings = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
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
    settings.loadFile(path.join(__dirname, '../../renderer/pages/setting/setting.html'))
    
    // 监听closed事件后执行 
    settings.on('closed', () => { settings = null })

    return settings
}

module.exports = createSettingShow