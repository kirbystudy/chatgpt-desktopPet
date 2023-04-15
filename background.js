const { app, BrowserWindow, screen } = require('electron')
const { spawn } = require('child_process')
let serverProcess

// 热加载
const reLoader = require("electron-reloader")
reLoader(module)

function createWindow () {
  win = new BrowserWindow({
    x: screen.getPrimaryDisplay().workAreaSize.width - 360,
    y: screen.getPrimaryDisplay().workAreaSize.height - 600,
    // skipTaskbar: true, // 不显示任务栏
    frame: false,      // 不显示菜单栏 
    transparent: true, // 界面透明
    alwaysOnTop: true, // 置顶显示
    resizable: false,  // 不可调节大小
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  win.loadURL(`file:${__dirname}/index.html`)
  
}


// 当Electron完成时，将调用此方法
// 初始化，并准备创建浏览器窗口。
// 某些API只能在此事件发生后使用。
app.on('ready', () => {
  // 启动node服务
  startServices();
  // 创建窗口
  createWindow()
})


// 当所有窗口都被关闭后退出
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
  stopServices()
})

function startServices() {
  // 启动服务
  serverProcess = spawn('node', ['app.js']);
}

function stopServices() {
  // 结束服务
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null
  }
}