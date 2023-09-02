const { BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

let community = null

// 创建设置窗口
function createCommunityShow() {
    
    community = new BrowserWindow({
        width: 1300,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, '../../../assets/app_128.ico'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            zoomFactor: 1
        }
    })

    Menu.setApplicationMenu(null)

    // 加载本地文件
    community.loadURL('http://nnfan.natapp1.cc')

    community.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        shell.openExternal(url)
      })

    // 监听closed事件后执行 
    community.on('closed', () => { community = null })

    return community
}

module.exports = createCommunityShow