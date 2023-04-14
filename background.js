const { app, BrowserWindow, screen } = require('electron')

//热加载
const reLoader = require("electron-reloader")
reLoader(module)

function createWindow () {
  win = new BrowserWindow({
    x: screen.getPrimaryDisplay().workAreaSize.width - 360,
    y: screen.getPrimaryDisplay().workAreaSize.height - 600,
    skipTaskbar: true, // 不显示任务栏
    frame: false,      // 不显示菜单栏 
    transparent: true, // 透明
    alwaysOnTop: true, // 置顶显示
    width: 800,
    height: 600,
    webPreferences: {
      devTools: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  win.loadURL(`file:${__dirname}/index.html`)
}

// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)