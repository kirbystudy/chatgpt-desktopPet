const { ipcRenderer } = require('electron')

const hover_box = document.getElementById('hover_box')

hover_box.addEventListener('click', () => {
    setTimeout(() => {
        ipcRenderer.send('MainPage', 'Show')
        ipcRenderer.send('hoverBox', 'Close')
    }, 500)

})
