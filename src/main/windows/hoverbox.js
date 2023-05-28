const { BrowserWindow, screen } = require('electron')
const path = require('path')

let hoverBox = null

// 创建悬浮球窗口
function createHoverBox() {

  hoverBox = new BrowserWindow({
    width: 70,
    height: 70,
    x: screen.getPrimaryDisplay().workAreaSize.width - 100,
    y: screen.getPrimaryDisplay().workAreaSize.height - 80,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      zoomFactor: 1
    }
  })

  // 加载本地文件
  hoverBox.loadFile(path.join(__dirname, '../../renderer/pages/hoverbox.html'))

  // 监听closed事件后执行
  hoverBox.on('closed', () => { hoverBox = null })

  return hoverBox
}

module.exports = createHoverBox