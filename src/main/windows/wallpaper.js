const { BrowserWindow, Menu } = require('electron')
const path = require('path')

let wallpaper = null

// 创建壁纸窗口
function createWallpaper() {

    wallpaper = new BrowserWindow({
        width: 1300,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        icon: path.join(__dirname, '../../../assets/app_128.ico'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            allowFileAccess: true
        }
    })


    // 加载本地文件
    wallpaper.loadFile(path.join(__dirname, '../../renderer/pages/wallpaper/wallpaper.html'))

    if (process.platform === 'win32') {
        // hook掉标题栏右键菜单
        wallpaper.hookWindowMessage(278, () => {
            wallpaper.setEnabled(false)

            setTimeout(() => {
                wallpaper.setEnabled(true)
            }, 100)
            return true
        })
    }

    // 监听closed事件后执行
    wallpaper.on('closed', () => { wallpaper = null })

    return wallpaper
}

module.exports = createWallpaper