async function createModel(store, view) {

    store.model = await PIXI.live2d.Live2DModel.from(store.path)
    
    const app = new PIXI.Application({
        view: view,
        autoStart: true,
        resizeTo: window,
        backgroundAlpha: 0
    })

    app.stage.addChild(store.model)

    store.model.y = store.y
    store.model.scale.set(store.scale)

    return app
}
