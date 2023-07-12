const { BrowserWindow, screen, globalShortcut } = require('electron')
const remote = require('@electron/remote/main')

let mainWindow = null

// 模型窗口大小
const win_width = 300
const win_height = 400

// 创建并控制浏览器窗口
function createWindow() {

    mainWindow = new BrowserWindow({
        width: win_width,          // 窗口的宽度
        height: win_height,        // 窗口的高度 
        skipTaskbar: true,         // 是否在任务栏中显示窗口
        frame: false,              // 设置为 false 时可以创建一个无边框窗口  
        transparent: true,         // 窗口透明
        alwaysOnTop: false,        // 窗口是否永远在别的窗口的上面
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

    // 注册快捷键
    const ret = globalShortcut.register('Alt+F12', () => {
        // 当前窗口打开 DevTools
        mainWindow.webContents.openDevTools()
    })

    globalShortcut.register('F11', () => {
        // 禁止执行默认操作，即全屏切换
        return false
    })

    if (!ret) {
        console.log("注册快捷键失败")
    }

    mainWindow.on('close', (event) => {

        // 阻止窗口关闭
        event.preventDefault()

        // 向渲染进程发送消息
        mainWindow.webContents.send('exitEvent')

        setTimeout(() => {
            mainWindow.destroy() // 关闭窗口
        }, 4000)
    })

    // 监听closed事件后执行
    mainWindow.on('closed', () => { mainWindow = null })

    return mainWindow
}

module.exports = createWindow