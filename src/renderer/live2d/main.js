class live2d {
  constructor() {
    this.model4 = null
    this.canvas = document.getElementById("canvas")
    this.canvas.style.height = "auto"
    this.app = null
    this.cubism4Model = '../../../model/asuna_01/asuna_01.model.json'
  }

  async loadingModel () {
    this.app = new PIXI.Application({
      view: document.getElementById("canvas"),
      autoStart: true,
      resizeTo: document.body,
      backgroundAlpha: 0,
      backgroundColor: 0x000000,
    })

    this.model4 = await PIXI.live2d.Live2DModel.from(this.cubism4Model)
    this.model4.scale.set(0.12)
    this.app.stage.addChild(this.model4)
  }
}

var app = new live2d()
console.log(app)
app.loadingModel()




