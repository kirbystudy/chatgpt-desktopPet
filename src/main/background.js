const { app, ipcMain, globalShortcut, screen } = require('electron')
const createWindow = require('./windows/mainWindow')
const createTrayMenu = require('./modules/tray')
const createSettingShow = require('./windows/setting')
const createScheduleShow = require('./windows/schedule')
const createChattingShow = require('./windows/chatting')
const createWallpaper = require('./windows/wallpaper')
const createCommunityShow = require('./windows/community')
const createSpeechSynthesisShow = require('./windows/speechSynthesis')
const createHoverBox = require('./windows/hoverbox')
const { liveNotify } = require('./modules/liveNotify')
require('./modules/handle')
const wallpaper = require('wallpaper')

// 解决使用win.hide()再使用win.show()会引起窗口闪烁问题
app.commandLine.appendSwitch('wm-window-animations-disabled')

// 热加载
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module)
  } catch (_) { }
}

// 阻止应用多开
const isAppInstance = app.requestSingleInstanceLock()
if (!isAppInstance) {
  app.exit(0)
} else {
  app.on('second-instance', () => {
    if (global.mainWindow.isMaximized()) {
      global.mainWindow.restore()
    }
    global.mainWindow.focus()
    global.mainWindow.show()
  })
}

// ipc监听，获取主窗体位置
ipcMain.on('getMainPos', (event) => {
  const pos = global.mainWindow.getPosition()
  event.returnValue = pos
})

// ipc监听，拖拽主窗体
ipcMain.on('dragMain', (event, mouseOnPage) => {

  const winWidth = 300
  const winHeight = 400

  // 获取鼠标在目标屏幕上的位置
  const { x, y } = screen.getCursorScreenPoint()

  // 获取所有屏幕的信息
  const displays = screen.getAllDisplays()

  // 查询包含鼠标位置的屏幕
  let display = null
  for (let i = 0; i < displays.length; i++) {
    const bounds = displays[i].bounds
    if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
      display = displays[i]
      break
    }
  }

  if (!display) {
    // 如果找不到包含鼠标位置的屏幕，则使用当前窗口所在的屏幕
    display = screen.getDisplayMatching(global.mainWindow.getBounds())
  }

  // 计算窗口新坐标
  let newPosX = x - mouseOnPage[0] - display.bounds.x
  let newPosY = y - mouseOnPage[1] - display.bounds.y

  // 获取窗口大小
  let winSize = global.mainWindow.getSize()

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
  if (winPosY_down > display.bounds.height) {
    newPosY = display.bounds.height - winSize[1]
  }

  // 窗口左边超出屏幕，重置X为0
  if (winPosX_left < 0) {
    newPosX = 0
  }

  // 窗口右边超出屏幕，重置X为 屏幕长度最大值 - 窗口长度
  if (winPosX_right > display.bounds.width) {
    newPosX = display.bounds.width - winSize[0]
  }

  global.mainWindow.setPosition(display.bounds.x + newPosX, display.bounds.y + newPosY)
  global.mainWindow.setSize(winWidth, winHeight)
  global.mainWindow.transparent = true
})

// ipc监听，打开设置窗口
ipcMain.on('Setting', (event, arg) => {
  if (arg == 'Open') {
    if (global.settings == null || global.settings.isDestroyed()) {
      global.settings = createSettingShow()
    }
  }
})

// ipc监听，打开日程表窗口
ipcMain.on('Schedule', (event, arg) => {
  if (arg == 'Open') {
    if (global.schedule == null || global.schedule.isDestroyed()) {
      global.schedule = createScheduleShow()
    }
  }
})

// ipc监听，打开chat聊天窗口
ipcMain.on('Chatting', (event, arg) => {
  if (arg === 'Open') {
    if (global.chatting == null || global.chatting.isDestroyed()) {
      global.chatting = createChattingShow()
    }
  }

  if (arg == 'minimize-window') {
    global.chatting.minimize()
  }

  if (arg == 'maximize-window') {
    if (global.chatting.isMaximized()) {
      global.chatting.unmaximize()
    } else {
      global.chatting.maximize()
    }
  }

  if (arg == 'close-window') {
    global.chatting.close()
  }
})

// ipc监听，打开壁纸窗口
ipcMain.on('Wallpaper', (event, arg) => {
  if (arg == 'Open') {
    if (global.wallpaper == null || global.wallpaper.isDestroyed()) {
      global.wallpaper = createWallpaper()
    }
  }

  if (arg == 'minimize-window') {
    global.wallpaper.minimize()
  }

  if (arg == 'maximize-window') {
    if (global.wallpaper.isMaximized()) {
      global.wallpaper.unmaximize()
    } else {
      global.wallpaper.maximize()
    }
  }

  if (arg == 'close-window') {
    global.wallpaper.close()
  }

})

// ipc监听，打开社区窗口
ipcMain.on('Community', (event, arg) => {
  if (arg == 'Open') {
    if (global.community == null || global.community.isDestroyed()) {
      global.community = createCommunityShow()
    }
  }
})

// ipc监听，打开VITS语音合成窗口
ipcMain.on('speechSynthesis', (event, arg) => {
  if (arg == 'Open') {
    if (global.speechSynthesis == null || global.speechSynthesis.isDestroyed()) {
      global.speechSynthesis = createSpeechSynthesisShow()
    }
  }
})

// ipc监听，显示悬浮球
ipcMain.on('hoverBox', (event, data) => {
  if (data == 'Open') {
    if (global.hoverBox == null || global.hoverBox.isDestroyed()) {
      global.hoverBox = createHoverBox()
    }
  } else if (data == 'Close') {
    event.preventDefault()
    global.hoverBox.hide()
  }
})

// ipc监听，主界面隐藏和显示
ipcMain.on('MainPage', (event, data) => {
  if (data == 'Hide') {
    event.preventDefault()
    global.mainWindow.hide()
  } else if (data == 'Show') {
    global.mainWindow.show()
    // 点击悬浮球后手动关闭，销毁hoverBox窗口对象
    global.hoverBox.close()
  }
})

// ipc监听，开机自启动
ipcMain.on('toggle_power', (event, enabled) => {
  if (!app.getLoginItemSettings().openAtLogin && enabled) {
    app.setLoginItemSettings({
      openAtLogin: true
    })
  } else if (app.getLoginItemSettings().openAtLogin && !enabled) {
    app.setLoginItemSettings({
      openAtLogin: false
    })
  }

  // 发送反馈消息以更新开关状态
  const isEnabled = app.getLoginItemSettings().openAtLogin
  global.settings.webContents.send('togglePowerStatus', isEnabled)
})

// ipc监听，实现bilibili直播通知的函数
ipcMain.on('liveNotify', () => {
  liveNotify()
});

// ipc监听，设置桌面静态壁纸
ipcMain.on('set-wallpaper', (_, arg) => {
  setWallpaper(arg)
})

function setWallpaper(wallpaperFile) {
  wallpaper.set(wallpaperFile)
}


// 当Electron完成时，将调用此方法
// 初始化，并准备创建浏览器窗口。
// 某些API只能在此事件发生后使用。
app.on('ready', () => {

  // 创建窗口
  global.mainWindow = createWindow()

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

app.on('will-quit', () => {
  // 注销所有全局快捷键
  globalShortcut.unregisterAll()
})
