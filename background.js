const { app, BrowserWindow, screen } = require('electron')
const electron = require('electron')
const { spawn } = require('child_process')
let serverProcess

// 热加载
const reLoader = require("electron-reloader")
reLoader(module)



//electron app
//const app = electron.app
//electron窗口
//const BrowserWindow = electron.BrowserWindow

//electron ipc通讯 主进程
const ipcMain = electron.ipcMain
//electron 菜单
const Menu = electron.Menu
//electron 系统托盘
const Tray = electron.Tray
//electron screen
const screen_main = electron.screen;

const path = require('path')

//主窗口对象
//var mainWindow = null
//系统托盘对象
var appTray = null

function createWindow () {
  win = new BrowserWindow({
    x: screen.getPrimaryDisplay().workAreaSize.width - 360,
    y: screen.getPrimaryDisplay().workAreaSize.height - 600,
    skipTaskbar: true, // 不显示任务栏
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

function settingWindow(){
    //监听到closed事件后执行
    win.on('closed', () => { win = null })


    //系统托盘右键菜单
    var trayMenuTemplate = [
        {
            label: '设置',
            click: function () {
                //打开设置页面
            }
        },
        {
            label: '关于',
            click: function () {
                //弹出一个窗口，内容为作品，作者描述
            }
        },
        {
            label: '退出',
            click: function () {
                //退出程序
                app.quit();
            }
        }
    ];
    //系统托盘图标目录
    appTray = new Tray(path.join(__dirname, './image/ico.ico'));
    //设置此托盘图标的悬停提示内容
    appTray.setToolTip('这是个系统托盘');
    //图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    //设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);
}


// 当Electron完成时，将调用此方法
// 初始化，并准备创建浏览器窗口。
// 某些API只能在此事件发生后使用。
app.on('ready', () => {
  // 启动node服务
  startServices();
  // 创建窗口
  createWindow();
  // 设置
  settingWindow();

})


//ipc监听，拖拽主窗体
ipcMain.on('dragMain', (event, mouseOnPage) => {
    //1.获取鼠标新位置
    const { x, y } = screen_main.getCursorScreenPoint();
    // console.log("鼠标新左键坐标:" + x + " " + y)
    // console.log("接收鼠标相对于窗口坐标:" + mouseOnPage[0] + " " + mouseOnPage[1])

    //2.计算窗口新坐标
    const pos = mainWindow.getPosition();
    let newWinPointX = x - mouseOnPage[0];
    let newWinPointY = y - mouseOnPage[1];

    //3.禁止超出屏幕
    //获取桌面大小
    let size = screen_main.getPrimaryDisplay().workAreaSize
    // console.log(size)
    //获取窗口大小
    let winSize = mainWindow.getSize()
    //窗口四个代表性边缘坐标值
    //上边
    let winPoint_up_y = newWinPointY;
    //下边
    let winPoint_down_y = newWinPointY + winSize[1]
    //左边
    let winPoint_left_x = newWinPointX
    //右边
    let winPoint_right_x = newWinPointX + winSize[0]

    //窗口上方超出屏幕，重置Y为0
    if (winPoint_up_y < 0) {
        newWinPointY = 0;
    }
    //窗口下方超出屏幕，重置Y为 屏幕高度最大值 - 窗口高度
    if (winPoint_down_y > size.height) {
        newWinPointY = size.height - winSize[1];
    }
    //窗口左边超出屏幕，重置X为0
    if (winPoint_left_x < 0) {
        newWinPointX = 0;
    }
    //窗口左边超出屏幕，重置X为 屏幕长度最大值 - 窗口长度
    if (winPoint_right_x > size.width) {
        newWinPointX = size.width - winSize[0];
    }

    //4.移动窗口
    mainWindow.setPosition(newWinPointX, newWinPointY);
    mainWindow.transparent = true;
})

//ipc监听，获取主窗体位置
ipcMain.on('getMainPoint', (event, msg) => {
    const pos = mainWindow.getPosition();
    event.returnValue = pos;
})


//所有窗口关闭时，退出APP
// app.on('window-all-closed', function () {
//     if (process.platform !== 'darwin') {
//         app.quit()
//     }
// })


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