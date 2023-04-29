const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron')
const remote = require('@electron/remote/main')
const dialog = require('electron').dialog
const screen = require('electron').screen

const path = require('path')
var package = require('../../package.json')
var fs = require('fs')

// 系统托盘全局对象
let appTray = null

// 设置全局对象
let mainWindow = null; let settings = null;
let sch = null;

// 模型窗口大小
const win_width = 350
const win_height = 500

// 热加载
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module)
  } catch (_) { }
}


// 创建并控制浏览器窗口
function createWindow () {

  mainWindow = new BrowserWindow({
    width: win_width,          // 窗口的宽度
    height: win_height,        // 窗口的高度 
    skipTaskbar: true,         // 是否在任务栏中显示窗口
    frame: false,              // 设置为 false 时可以创建一个无边框窗口  
    transparent: true,         // 窗口透明
    alwaysOnTop: true,         // 窗口是否永远在别的窗口的上面
    resizable: false,          // 窗口大小是否可调整
    webPreferences: {
      enableRemoteModule: true,   // 允许使用remote
      nodeIntegration: true,      // node下所有东西都可以在渲染进程中使用
      contextIsolation: false,    // 禁用上下文隔离
      allowFileAccess: true,      // 允许在本地访问文件
    },
  })

  // 获取桌面大小
  let size = screen.getPrimaryDisplay().workAreaSize

  // 获取窗口大小
  let winSize = mainWindow.getSize()

  // 初始位置为右下角
  mainWindow.setPosition(size.width - winSize[0], size.height - winSize[1])

  // 主进程和渲染进程之间可以共享 JavaScript 对象
  remote.initialize()
  // 允许在渲染进程中访问主进程的 JavaScript 对象
  remote.enable(mainWindow.webContents)

  // 加载本地文件
  mainWindow.loadFile('./src/renderer/pages/index.html')

  // 监听closed事件后执行
  mainWindow.on('closed', () => { mainWindow = null })

}

// 创建日程表窗口
function createScheduleShow() {
    // 设置窗口打开监听
    var set_windth = screen.getPrimaryDisplay().workAreaSize.width

    // 设置窗口
    sch = new BrowserWindow({
        width: parseInt(set_windth / 3),
        height: parseInt((set_windth / 2) * (14 / 16)),
        minWidth: 570,
        minHeight: 470,
        skipTaskbar: false,
        alwaysOnTop: true,
        transparent: false,
        frame: false,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#202020",
            symbolColor: "white"
        },
        resizable: true,
        show: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            zoomFactor: 1
        }
    })

    // 加载本地文件
    sch.loadFile(path.join(__dirname, '../renderer/pages/schedule/index.html'))

    // 监听closed事件后执行
    sch.on('closed', () => { sch = null })
}

// 创建设置窗口
function createSettingShow () {
  // 设置窗口打开监听
  var set_windth = screen.getPrimaryDisplay().workAreaSize.width

  // 设置窗口
  settings = new BrowserWindow({
    width: parseInt(set_windth / 3),
    height: parseInt((set_windth / 3) * (14 / 16)),
    minWidth: 470,
    minHeight: 320,
    skipTaskbar: false,
    alwaysOnTop: true,
    transparent: false,
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#202020",
      symbolColor: "white"
    },
    resizable: true,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      zoomFactor: 1
    }
  })

  // 加载本地文件
  settings.loadFile(path.join(__dirname, '../renderer/pages/setting.html'))

  // 监听closed事件后执行
  settings.on('closed', () => { settings = null })
}

// 创建系统托盘菜单
function createTrayMenu () {

  var trayMenuTemplate = [
    {
      label: '设置',
      click: function () {
        // 打开设置页面
        if (settings == null || settings.isDestroyed()) {
          createSettingShow()
        }
      }
    },
    {
      label: '关于',
      click: function () {
        // 弹出一个窗口，内容为作品，作者描述
        dialog.showMessageBox({
          title: '关于',
          type: 'info',
          message: "项目名称: " + package.name + "\n版本号: v" + package.version
        })
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
  appTray = new Tray(path.join(__dirname, '../../assets/app.ico'))

  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('Live2D DeskTopPet')

  // 图标的上下文菜单
  let contextMenu = Menu.buildFromTemplate(trayMenuTemplate)

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu)
}

// ipc监听，获取主窗体位置
ipcMain.on('getMainPos', (event) => {
  const pos = mainWindow.getPosition()
  event.returnValue = pos
})

// ipc监听，拖拽主窗体
ipcMain.on('dragMain', (event, mouseOnPage) => {
  // 获取鼠标的位置
  const { x, y } = screen.getCursorScreenPoint()

  // 计算窗口新坐标
  let newPosX = x - mouseOnPage[0]
  let newPosY = y - mouseOnPage[1]

  // 获取桌面大小
  let size = screen.getPrimaryDisplay().workAreaSize

  // 获取窗口大小
  let winSize = mainWindow.getSize()

  // 窗口四个代表性边缘坐标值
  let winPosY_up = newPosY // 上边
  let winPosY_down = newPosY + winSize[1] // 下边
  let winPosX_left = newPosX // 左边
  let winPosX_right = newPosX + winSize[0] // 右边

  // 窗口上方超出屏幕，重置Y为0
  if (winPosY_up < 0) {
    newPosY = 0
  }

  // 窗口下方超出屏幕，重置Y为 屏幕高度最大值 - 窗口高度
  if (winPosY_down > size.height) {
    newPosY = size.height - winSize[1]
  }

  // 窗口左边超出屏幕，重置X为0
  if (winPosX_left < 0) {
    newPosX = 0
  }

  // 窗口右边超出屏幕，重置X为 屏幕长度最大值 - 窗口长度
  if (winPosX_right > size.width) {
    newPosX = size.width - winSize[0]
  }

  mainWindow.setPosition(newPosX, newPosY)
  mainWindow.setSize(win_width, win_height)
  mainWindow.transparent = true
})

// ipc监听，打开设置窗口
ipcMain.on('Setting', (event, arg) => {
  if (arg == 'Open') {
    if (settings == null || settings.isDestroyed()) {
      createSettingShow()
    }
  }
})

// ipc监听，打开日程表窗口
ipcMain.on('Schedule', (event, arg) => {
    if (arg == 'Open') {
        if (sch == null || sch.isDestroyed()) {
            createScheduleShow()
        }
    }
})

// ipc监听，刷新进程
ipcMain.on('MainPage', (event, value) => {
  if (value == 'refresh') {
    mainWindow.reload()
  }
})

var live2dPath = ''

// ipc监听，更换live2d
ipcMain.on('changeLive2d', (event, arg) => {
  switchLive2d(arg[0], arg[1])
  mainWindow.webContents.send('onloadLive2d', live2dPath)
  mainWindow.reload()
})


function switchLive2d (live2d_text, live2d_val) {

  var modelPath = path.join(__dirname, '../../model/' + live2d_text + '/' + live2d_text + '.model.json')
  var model3Path = path.join(__dirname, '../../model/' + live2d_text + '/' + live2d_text + '.model3.json')
  if(fs.existsSync(modelPath)) {
    live2dPath = '../../../model/' + live2d_text + '/' + live2d_text + '.model.json'
  }

  if(fs.existsSync(model3Path)) {
    live2dPath = '../../../model/' + live2d_text + '/' + live2d_text + '.model3.json'
  }
}

// 当Electron完成时，将调用此方法
// 初始化，并准备创建浏览器窗口。
// 某些API只能在此事件发生后使用。
app.on('ready', () => {
  // 创建窗口
  createWindow()

  // 创建系统托盘
  createTrayMenu()
})

// 当所有窗口都被关闭后退出
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
