const { ipcRenderer } = require('electron');

ipcRenderer.on('update-wallpaper-url', (event, URL) => {
    // 更新视频标签的src属性
    const video = document.getElementById('video')
    video.src = URL.replaceAll('\\','/')
})

