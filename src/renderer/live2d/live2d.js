async function loadModel(store, view) {

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

        // 检查是否在播放
        if (!playAudioing) {
            if (hitAreas.includes('摸头')) {
                store.model.motion('tap_head')
                playAudio(path.join(__dirname, '../../../model/qiudi/摸头.wav'))
            }

            if (hitAreas[0] === '摸胸' || hitAreas[1] === '摸手臂' || hitAreas[2] === '摸腿') {
                store.model.motion('tap_body')
                playAudio(path.join(__dirname, '../../../model/qiudi/摸胸.wav'))
            }

            if (hitAreas[0] === '摸手臂') {
                store.model.motion('tap_hand')
                playAudio(path.join(__dirname, '../../../model/qiudi/摸手.wav'))
            }

            if (hitAreas[0] === '摸腿') {
                store.model.motion('tap_shank')
                playAudio(path.join(__dirname, '../../../model/qiudi/摸腿.wav'))
            }
        }

    })

    return app
}