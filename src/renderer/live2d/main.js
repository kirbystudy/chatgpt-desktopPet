OML2D.loadOhMyLive2D({
  source: './',
  models: [
    { path: '../../../model/桃濑日和/hiyori_pro_t11.model3.json', scale: localStorage.getItem('settingBtn') },
    // { path: 'model/桃濑日和/hiyori_pro_t11.model3.json'},
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



