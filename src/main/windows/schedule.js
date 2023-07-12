const { BrowserWindow, Menu } = require('electron')
const path = require('path')

let sch = null

// 创建日程表窗口
function createScheduleShow() {

    sch = new BrowserWindow({
        width: 1024,
        height: 768,
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
    sch.loadFile(path.join(__dirname, '../../renderer/pages/schedule/index.html'))

    // 监听closed事件后执行
    sch.on('closed', () => { sch = null })

    return sch
}

module.exports = createScheduleShow