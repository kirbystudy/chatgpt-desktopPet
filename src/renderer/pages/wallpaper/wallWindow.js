const { getGlobal } = require('@electron/remote')
const video = document.getElementById('video')
const { imgUrl } = getGlobal('shareVariable')

// 更新视频标签的src属性
if (imgUrl) {
    video.src = imgUrl.replaceAll('\\', '/')
}


