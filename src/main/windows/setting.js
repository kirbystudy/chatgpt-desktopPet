const { BrowserWindow, screen } = require('electron')
const path = require('path')

let settings = null;

// 创建设置窗口
function createSettingShow() {
    
    // 设置窗口打开监听
    var set_windth = screen.getPrimaryDisplay().workAreaSize.width

    settings = new BrowserWindow({
        width: parseInt(set_windth / 3),
        height: parseInt(set_windth / 3) * 0.875,
        minWidth: 470,
        minHeight: 320,
        skipTaskbar: false,
        alwaysOnTop: true,
        transparent: false,
        frame: false,
        resizable: false,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#202020",
            symbolColor: "white"
        },
        resizable: true,
        show: true,
        icon: path.join(__dirname, '../../../assets/app_128.ico'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            zoomFactor: 1
        }
    })

    // 加载本地文件
    settings.loadFile(path.join(__dirname, '../../renderer/pages/setting.html'))

    // 监听closed事件后执行
    settings.on('closed', () => { settings = null })

    return settings
}

module.exports = createSettingShow