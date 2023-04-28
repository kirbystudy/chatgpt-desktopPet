
OML2D.loadOhMyLive2D({
  source: './',
  models: [
    { path: localStorage.getItem('live2d') == null ? '../../../model/桃濑日和/桃濑日和.model3.json' : localStorage.getItem('live2d') },
  ],
  mobileShow: true,
  tips: {
    style: {
      offsetY: 80
    },
    idleTips: {
      async remote () {
        const request = await fetch('https://v1.hitokoto.cn/')
        const result = await request.json()
        return { text: result.hitokoto }
      }
    }
  }
})



