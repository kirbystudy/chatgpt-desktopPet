const { ipcRenderer } = require("electron")

exports.openChildWind = (event, type, URL) => {
    const { id } = event.target
    
    if (type === 'mp4' && !id) return
    const someArgument = { msg: 'Request to open wallpaper window', URL }

    ipcRenderer.invoke('ask-open-wallpaper', someArgument).then((result) => {})
}

exports.closeWallPaper = function () {
    ipcRenderer.invoke('ask-close-wallpaper')
}