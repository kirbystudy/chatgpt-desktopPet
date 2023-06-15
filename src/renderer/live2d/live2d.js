async function createModel(store, view) {

    store.model = await PIXI.live2d.Live2DModel.from(store.path)
    
    const app = new PIXI.Application({
        view: view,
        autoStart: true,
        resizeTo: window,
        backgroundAlpha: 0
    })

    app.stage.addChild(store.model)
    store.model.x = store.x
    store.model.y = store.y
    store.model.scale.set(store.scale)

    store.model.on('hit', (hitAreas) => {

        if (hitAreas.includes('摸头')) {
            store.model.motion('tap_head')
        }

        if (hitAreas.includes('摸胸')) {
            store.model.motion('tap_body')
        }

        if (hitAreas.includes('摸手臂')) {
            store.model.motion('tap_hand')
        }

        if (hitAreas.includes('摸腿')) {
            store.model.motion('tap_shank')
        }
    })

    return app
}
