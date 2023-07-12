const { ipcMain, BrowserWindow, screen } = require("electron")
const { attach, detach, refresh } = require("electron-as-wallpaper")
const path = require('path')

let wallpapers = []

ipcMain.handle('ask-open-wallpaper', async (event, someArgument) => {
    const { msg, URL } = someArgument

    // 配置全局变量
    global.shareVariable = {
        url: URL
    }

    const displays = screen.getAllDisplays()

    if (displays.length === 0) {
        throw new Error('没有连接的显示器')
    }

    // 取消当前的动态壁纸绑定
    wallpapers.forEach((wallpaper) => {
        if (wallpaper) {
            wallpaper.close()
        }
        refresh()
    })

    wallpapers = []

    // 创建或更新窗口
    for (let i = 0; i < displays.length; i++) {
        if (!wallpapers[i]) {
            const wallpaper = new BrowserWindow({
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

            wallpaper.on('closed', () => wallpapers[i] = null)
            wallpapers[i] = wallpaper
            require('@electron/remote/main').enable(wallpaper.webContents)

            wallpaper.loadFile(path.resolve(
                __dirname,
                '../../renderer/pages/wallpaper/wallWindow.html'
            )).then(() => {
                attach(wallpaper)
                wallpaper.show()
                refresh()
            }).catch((error) => {
                console.log(error)
            })
        }

        const display = displays[i]

        // 设置窗口边界
        const { width, height } = display.workAreaSize
        wallpapers[i].setBounds({ width, height, x: display.bounds.x, y: display.bounds.y })

        // 发送URL到壁纸窗口的渲染进程
        wallpapers[i].webContents.send('update-wallpaper-url', URL);
    }

    // 显示分辨率更改时
    screen.on('display-metrics-changed', () => {
        const displays = screen.getAllDisplays()

        if (displays.length === 0) {
            throw new Error('没有连接的显示器')
        }

        // 更新窗口边界
        for (let i = 0; i < displays.length; i++) {
            const display = displays[i]
            const { width, height } = display.workAreaSize
            wallpapers[i].setBounds({ width, height, x: display.bounds.x, y: display.bounds.y })
        }
    })

    return 'ok'
})

global.wallpaperHandle = wallpapers

ipcMain.on('ask-close-wallpaper', (event, arg) => {
    wallpapers.forEach((wallpaper) => {
        if (wallpaper) {
            wallpaper.close()
        }
    })
    refresh()
})
