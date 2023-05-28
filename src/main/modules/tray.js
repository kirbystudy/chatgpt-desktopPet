const { app, Menu, Tray } = require('electron')
const createSettingShow = require('../windows/setting')
const dialog = require('electron').dialog
const path = require('path')

// 系统托盘全局对象
let appTray = null

// 创建系统托盘菜单
function createTrayMenu() {

    var trayMenuTemplate = [
        {
            label: '设置',
            click: function () {
                createSettingShow()
            }
        },
        {
            label: '退出',
            click: function () {
                // 退出程序
                dialog.showMessageBox({
                    type: 'info',
                    buttons: ["我手滑了", "告辞"],
                    title: '退出',
                    message: '真的要退出吗?'
                }).then((res) => {
                    if (res.response == 1) {
                        app.quit()
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }
        }
    ]

    // 系统托盘图标目录
    appTray = new Tray(path.join(__dirname, '../../../assets/app_128.ico'))

    // 设置此托盘图标的悬停提示内容
    appTray.setToolTip('Live2D DeskTopPet')

    // 图标的上下文菜单
    let contextMenu = Menu.buildFromTemplate(trayMenuTemplate)

    // 设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu)
}

module.exports = createTrayMenu