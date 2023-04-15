const { app, BrowserWindow, screen, Menu, Tray } = require('electron')
const path = require('path')

// 热加载
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module)
  } catch (_) { }
}

// 创建并控制浏览器窗口
function createWindow () {

  win = new BrowserWindow({
    x: screen.getPrimaryDisplay().workAreaSize.width - 360,    // 窗口相对于屏幕左侧的偏移量
    y: screen.getPrimaryDisplay().workAreaSize.height - 600,   // 窗口相对于屏幕顶端的偏移量
    skipTaskbar: true, // 是否在任务栏中显示窗口
    frame: false,      // 设置为 false 时可以创建一个无边框窗口  
    transparent: true, // 窗口透明
    alwaysOnTop: true, // 窗口是否永远在别的窗口的上面
    resizable: false,  // 窗口大小是否可调整
    width: 800,        // 窗口的宽度
    height: 600,       // 窗口的高度 
    webPreferences: {
      enableRemoteModule: true,   // 允许使用remote
      nodeIntegration: true,      // node下所有东西都可以在渲染进程中使用
      contextIsolation: false,    // 禁用上下文隔离
      webSecurity: false          // 禁用跨域资源共享限制
    }
  })

  // 加载本地文件
  win.loadURL(`file://${path.resolve(__dirname, 'index.html')}`)

}

// 创建系统托盘菜单
function createTrayMenu() {
  
  var trayMenuTemplate = [
    {
      label: '设置',
      click: function () {
        // 打开设置页面
      }
    },
    {
      label: '关于',
      click: function () {
        // 弹出一个窗口，内容为作品，作者描述
      }
    },
    {
      label: '退出',
      click: function () {
        // 退出程序
        app.quit()
      }
    }
  ]

  // 系统托盘图标目录
  appTray = new Tray(path.join(__dirname, './src/image/app.ico'));
  
  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('Live2D DeskTopPet');

  // 图标的上下文菜单
  let contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);
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
