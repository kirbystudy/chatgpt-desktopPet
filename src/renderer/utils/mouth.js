let audioCtx; let analyser; let frequencyData;

let playing = false; let o = 80;

// 获取音频
async function loadAudio(buffer, volume) {
    createAnalyser()
    audioCtx.decodeAudioData(buffer)
        .then((decodeData) => {

            // 创建音频控制节点
            const gainNode = audioCtx.createGain()

            // 将增益节点连接到输出设备
            gainNode.connect(audioCtx.destination)

            // 设置音量级别在 0 到 1 之间
            gainNode.gain.value = volume

            // 新建Buffer源
            const source = audioCtx.createBufferSource()
            source.buffer = decodeData

            // 将缓冲区源节点连接到音量控制节点和输出设备
            source.connect(gainNode)

            // 连接 音频分析器
            source.connect(analyser)

            // 开始播放
            playing = true

            playAudioing = true
            // run()
            setTimeout(() => {
                source.start(0)
            }, 0.5)

            source.onended = () => {
                // 停止播放
                playing = false

                playAudioing = false
            }
        }).catch(error => {
            console.log(error)
        })
}

// function run() {
//     if (!playing) return
//     const frequencyData = getByteFrequencyData()

//     const arr = []

//     for (var i = 0; i < 700; i += o) {
//         arr.push(frequencyData[i])
//     }
//     setMouthOpenY((arrayAdd(arr) / arr.length - 20) / store.state.percentage, store)

//     setTimeout(run, 1000 / 60)
// }

// function setMouthOpenY(v) {
//     v = Math.max(0, Math.min(1, v))
//     store.state.model4.internalModel.coreModel.setParameterValueByIndex(store.state.parameterIndex, v, 1, true)
// }

function createAnalyser() {
    // 创建音频上下文
    audioCtx = new AudioContext()

    // 新建分析仪
    analyser = audioCtx.createAnalyser()

    // 根据 频率分辨率建立个 Uint8Array 数组备用
    frequencyData = new Uint8Array(analyser.frequencyBinCount)

    // 取音频文件成 arraybuffer
}

function getByteFrequencyData() {
    analyser.getByteFrequencyData(frequencyData)
    return frequencyData
}


function arrayAdd(a) {
    return a.reduce((i, a) => i + a, 0)
}


module.exports = loadAudio