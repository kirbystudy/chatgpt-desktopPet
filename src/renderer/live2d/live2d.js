async function createModel(store, view, roleId) {

    var model = ''
    if(roleId == undefined) {
        model = store.role[0].model
    } else if(roleId == store.role[0].roleId) {
        model = store.role[0].model
    } else if(roleId == store.role[1].roleId) {
        model = store.role[1].model
    }
    
    store.model = await PIXI.live2d.Live2DModel.from(model)
    
    const app = new PIXI.Application({
        view: view,
        autoStart: true,
        resizeTo: window,
        backgroundAlpha: 0
    })

    app.stage.addChild(store.model)

    if(roleId == undefined) {
        store.model.x = store.role[0].x
        store.model.y = store.role[0].y
        store.model.scale.set(store.role[0].scale)
    } else if(roleId == store.role[0].roleId) {
        store.model.x = store.role[0].x
        store.model.y = store.role[0].y
        store.model.scale.set(store.role[0].scale)
    } else if(roleId == store.role[1].roleId) {
        store.model.x = store.role[1].x
        store.model.y = store.role[1].y
        store.model.scale.set(store.role[1].scale)
    }

    return app
}
