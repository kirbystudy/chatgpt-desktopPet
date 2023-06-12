const { ipcRenderer } = require('electron')

const hover_box = document.getElementById('hover_box')
const bubble_img = localStorage.getItem('bubble_img')
if (bubble_img) {
    hover_box.style.backgroundImage = `url(${bubble_img})`
} else {
    hover_box.style.backgroundImage = `url(../image/app.png)`
}

hover_box.addEventListener('click', () => {
    setTimeout(() => {
        ipcRenderer.send('MainPage', 'Show')
        ipcRenderer.send('hoverBox', 'Close')
    }, 500)

})
