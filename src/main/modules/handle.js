const { ipcMain, BrowserWindow, screen } = require("electron")
const { attach, detach, refresh } = require("electron-as-wallpaper")
const path = require('path')

let wallpaper

ipcMain.handle('ask-open-wallpaper', async (event, someArgument) => {
    try {
        const { msg, URL } = someArgument

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
                skipTaskbar: true,  // 是否在任务栏中显示窗口
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

        attach(wallpaper)
        wallpaper.show()
        refresh()

        return 'ok'
    } catch (error) {
        console.error('Error asking to open wallpaper', error)
        return 'error'
    }

})

global.wallpaperHandle = wallpaper

ipcMain.handle('ask-close-wallpaper', () => {
    try {
        if (wallpaper) {
            wallpaper.hide()
        }
        // refresh()
    } catch (error) {
        console.error('Error requesting to close wallpaper:', error)
    }
})
