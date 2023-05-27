async function createModel(store, view) {

    store.model4 = await PIXI.live2d.Live2DModel.from(store.live2d);
    
    const app = new PIXI.Application({
        view: view,
        autoStart: true,
        resizeTo: window,
        backgroundAlpha: 0
    });

    app.stage.addChild(store.model4);

    store.model4.y = 30
    store.model4.scale.set(store.scale);

    if (store.model4.internalModel.coreModel._parameterIds.includes("ParamMouthOpenY")) {
        store.parameterIndex = store.model4.internalModel.coreModel.getParameterIndex("ParamMouthOpenY")
    }

    if (store.model4.internalModel.coreModel._parameterIds.includes("PARAM_MOUTH_OPEN_Y")) {
        store.parameterIndex = store.model4.internalModel.coreModel.getParameterIndex("PARAM_MOUTH_OPEN_Y")
    }

    if (store.model4.internalModel.coreModel._parameterIds.includes("ParamMouthA")) {
        store.parameterIndex = store.model4.internalModel.coreModel.getParameterIndex("ParamMouthA")
    }

    return app
}
