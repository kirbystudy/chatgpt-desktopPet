const { ipcRenderer } = require("electron")

exports.openChildWind = (event, type, URL) => {
    const { id } = event.target
    
    if (type === 'mp4' && !id) return
    const someArgument = { msg: '请求打开墙纸窗口', URL }

    ipcRenderer.invoke('ask-open-wallpaper', someArgument).then((result) => {})
}

exports.closeWallPaper = function () {
    ipcRenderer.send('ask-close-wallpaper')
}