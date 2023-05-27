const { ipcRenderer } = require('electron')

const hover_box = document.getElementById('hover_box')

hover_box.addEventListener('click', () => {
    setTimeout(() => {
        ipcRenderer.send('MainPage', 'Show')
    }, 500)
    
    setTimeout(() => {
        ipcRenderer.send('hoverBox', 'Close')
    }, 500)
})
