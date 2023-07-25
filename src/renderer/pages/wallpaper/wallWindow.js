const { getGlobal } = require('@electron/remote')
const video = document.getElementById('video')
const { imgUrl } = getGlobal('shareVariable')

if (imgUrl) {
    video.src = imgUrl.replaceAll('\\', '/')
}