const { app, Menu, Tray } = require('electron')
const createSettingShow = require('../windows/setting')
const dialog = require('electron').dialog
const path = require('path')
const { refresh } = require("electron-as-wallpaper");

// 系统托盘全局对象
let appTray = null

// 标记是否正在退出程序的状态，默认为false表示不在退出状态
let isExiting = false

// 创建系统托盘菜单
function createTrayMenu() {

    var trayMenuTemplate = [
        {
            label: '设置',
            click: function () {
                if (global.settings == null || global.settings.isDestroyed()) {
                    global.settings = createSettingShow()
                }
            }
        },
        {
            label: '退出',
            click: () => {

                if (isExiting) {
                    return   // 如果正在退出程序，则不执行后续操作
                }

                // 设置正在退出状态
                isExiting = true

                // 退出程序
                dialog.showMessageBox({
                    type: 'info',
                    buttons: ["我手滑了", "真的要离开我吗"],
                    title: '退出',
                    message: '真的要退出吗?',
                }).then((res) => {

                    if (res.response == 1) {
                        // 清除动态壁纸
                        if (global.wallpaperHandle) global.wallpaperHandle.close()
                        refresh()

                        // 禁用点击托盘图标
                        appTray.setContextMenu(null);
                        app.quit()
                    }

                    isExiting = false   // 重置正在退出标志为false，允许再次进行退出操作
                }).catch(() => {
                    isExiting = false   // 出错时重置正在退出标志为false，允许再次进行退出操作
                })
            }
        }
    ]

    // 系统托盘图标目录
    appTray = new Tray(path.join(__dirname, '../../../assets/app_128.ico'))

    // 设置此托盘图标的悬停提示内容
    appTray.setToolTip('秋蒂桌宠')

    // 图标的上下文菜单
    let contextMenu = Menu.buildFromTemplate(trayMenuTemplate)

    // 设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu)
}

module.exports = createTrayMenu