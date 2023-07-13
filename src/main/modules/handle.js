const { ipcMain, BrowserWindow, screen } = require("electron")
const { attach, detach, refresh } = require("electron-as-wallpaper")
const path = require('path')

let wallpaper

ipcMain.handle('ask-open-wallpaper', async (event, someArgument) => {
    try {
        const { msg, URL } = someArgument

        // 配置全局变量
        global.shareVariable = {
            imgUrl: URL
        }

        if (!wallpaper) {
            wallpaper = new BrowserWindow({
                enableLargerThanScreen: true,
                autoHideMenuBar: true,
                fullscreen: true,
                frame: false,
                show: false,
                webPreferences: {
                    backgroundThrottling: false,
                    webSecurity: false,
                    nodeIntegration: true,
                    contextIsolation: false,
                    webviewTag: true
                }
            })
        }
        
        if (wallpaper) {
            require('@electron/remote/main').enable(wallpaper.webContents)
        }

        await wallpaper.loadURL(path.resolve(
            __dirname,
            '../../renderer/pages/wallpaper/wallWindow.html'
        ))

        // 沉于桌面图标之下图层
        attach(wallpaper)
        wallpaper.show()
        refresh()

        return 'ok'
    } catch (error) {
        console.error('询问打开壁纸时出错：', error)
        return 'error'
    }

})

// 暴露壁纸窗口数组给全局对象
global.wallpaperHandle = wallpaper

ipcMain.on('ask-close-wallpaper', () => {
    try {
        if (wallpaper) {
            wallpaper.hide()
        }
        refresh()
    } catch (error) {
        console.error('请求关闭壁纸时出错:', error)
    }
})
