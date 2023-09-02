// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')

// 读取config.json
const configPath = path.resolve(__dirname, '../../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)


const dropdownRoleContainer = document.getElementById('roleInput')
const dropdownLanguagesContainer = document.getElementById('languagesInput')
const dropdownRole = document.getElementById('dropdownRole')
const dropdownLanguages = document.getElementById('dropdownLanguages')
const arrowDownRole = document.getElementById('arrowDownRole')
const arrowDownLanguages = document.getElementById('arrowDownLanguages')
const dropdownRoleList = document.getElementById('dropdownRoleList')
const dropdownLanguagesList = document.getElementById('dropdownLanguagesList')
const textElement = document.getElementById('textInput')
const inputRoleElement = document.getElementById('role')
const inputLanguagesElement = document.getElementById('languages')
const slide = document.querySelector('.slide')
const param = document.querySelector('.param')
const intro = document.querySelector('.intro')
const outputAudio = document.querySelector('.output-audio')
const textButton = document.getElementById('text-button')
const progressBar = document.getElementById('progressBar')
const progress = progressBar.querySelector('.progress')
const progressText = document.getElementById('progressText')
const tipMessage = document.getElementById('tipMessage')

slide.addEventListener('input', () => {
    param.innerHTML = slide.value
})

// 点击其他地方隐藏下拉选项
document.addEventListener('click', (event) => {
    hideDropdownOptions(event.target)
})

// 隐藏下拉选项
function hideDropdownOptions(target) {
    // 检查点击的目标元素是否在下拉选项以及下拉按钮之外
    if (!dropdownRoleContainer.contains(target) && target !== arrowDownRole) {
        dropdownRole.style.display = 'none'
        arrowDownRole.classList.remove('open')
    }

    if (!dropdownLanguagesContainer.contains(target) && target !== arrowDownLanguages) {
        dropdownLanguages.style.display = 'none'
        arrowDownLanguages.classList.remove('open')
    }
}

function toggleDropdownRole() {
    dropdownRole.style.display = (dropdownRole.style.display === 'block') ? 'none' : 'block'
    arrowDownRole.classList.toggle('open')
}

function toggleDropdownLanguages() {
    dropdownLanguages.style.display = (dropdownLanguages.style.display === 'block') ? 'none' : 'block'
    arrowDownLanguages.classList.toggle('open')
}

// 全局配置（可根据需要修改）
const headers = {
    uid: `${config.vits.header.uid}`, // 用户 ID
    token: `${config.vits.header.token}`, // 认证令牌
}

let dropdownOption = []   // 存放异步加载的下拉菜单选项
let selectedRoleOption = null // 存放角色选中的选项
let selectedLanguagesOption = null // 存放语言选中的选项

// 获取角色模型
async function loadDropdownOptions() {
    const url = `${config.vits.getUrlAllMod}`

    try {
        // 发送请求
        const response = await fetch(url, { method: 'GET', headers })

        // 解析返回的数据
        const { data } = await response.json()

        dropdownOption = data

        // 渲染下拉菜单选项
        renderDropdownOptions()

        // 初始化加载高亮显示第一项
        selectedRoleOption = document.querySelector('.select-dropdown-item')
        selectedRoleOption.classList.add('selected')

        selectedLanguagesOption = document.querySelector('.display')
        selectedLanguagesOption.classList.add('selected')
    } catch (error) {
        console.error('请求出错：', error)
    }
}

// 渲染下拉框选项
function renderDropdownOptions() {
    inputRoleElement.value = dropdownOption[0].title

    dropdownOption.forEach((option) => {
        const item = document.createElement('li')
        item.classList.add('select-dropdown-item')
        item.textContent = option.title
        dropdownRoleList.appendChild(item)
    })

    // 为每个选项添加点击事件
    dropdownRoleList.addEventListener('click', handleRoleOptionClick)
}

// 角色点击事件
function handleRoleOptionClick(event) {

    // 获取当前选中的选项元素
    const optionElement = event.target.closest('.select-dropdown-item')

    if (!optionElement) {
        return
    }

    // 更新选中的选项
    if (selectedRoleOption) {
        selectedRoleOption.classList.remove('selected')
    }

    selectedRoleOption = optionElement
    selectedRoleOption.classList.add('selected')

    // 将选项文本更新到输入框
    inputRoleElement.value = selectedRoleOption.textContent

    // 隐藏下拉菜单
    hideDropdownOptions(event.target)
}

// 语言点击事件 
function handleLanguagesOptionClick(event) {

    // 获取当前选中的选项元素
    const optionElement = event.target.closest('.select-dropdown-item')

    if (!optionElement) {
        return
    }

    // 更新选中的选项
    if (selectedLanguagesOption) {
        selectedLanguagesOption.classList.remove('selected')
    }

    selectedLanguagesOption = optionElement
    selectedLanguagesOption.classList.add('selected')

    // 将选项文本更新到输入框
    inputLanguagesElement.value = selectedLanguagesOption.textContent

    // 隐藏下拉菜单
    hideDropdownOptions(event.target)
}

/**
 * 初始化输入框和按钮状态
 * @param {Element} textButton - 文本生成语音的按钮
 * @param {Element} textElement - 文本输入框
 */
function initInputStatus(textButton, textElement) {
    const inputValue = textElement.value.trim();
    setButtonStatus(textButton, inputValue.length <= 3, '开始合成', false);

    textElement.addEventListener('input', function () {
        const inputValue = this.value.trim();
        setButtonStatus(textButton, inputValue.length <= 3, '开始合成', false);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    loadDropdownOptions()

    // 初始化按钮状态
    initInputStatus(textButton, textElement)

    dropdownRoleContainer.addEventListener('click', toggleDropdownRole)
    dropdownLanguagesContainer.addEventListener('click', toggleDropdownLanguages)

    // 为每个选项添加点击事件
    dropdownLanguagesList.addEventListener('click', handleLanguagesOptionClick)

    textButton.addEventListener('click', getTextHash)


})

async function getTextHash() {

    // 验证输入是否存在
    if (!textElement || !inputRoleElement || !inputLanguagesElement) {
        tipMessage.style.display = 'block'
        tipMessage.innerHTML = '输入内容不存在'

        setTimeout(() => {
            tipMessage.style.display = 'none'
        }, 5000);
        return
    }

    if(textElement.value.length > 500) {
        showMessage('文本内容不得超过500个字符左右', 'warning')
        return
    }


    const text = textElement.value
    const title = inputRoleElement.value

    const languages = getLanguageCode(inputLanguagesElement.value)

    const { modelId, roleId } = getModelAndRole(dropdownOption, title)

    // 将进度条宽度设置为0
    progress.style.width = '0'

    tipMessage.style.display = 'none'

    // audio音频控件隐藏
    const audioElements = document.getElementsByTagName('audio')

    if (audioElements.length > 0) {
        const dataURI = audioElements[0].src
        // 释放 blob URL
        URL.revokeObjectURL(dataURI)
        outputAudio.removeChild(audioElements[0])
    }

    // 设置按钮状态
    setButtonStatus(textButton, true, '', true)

    try {
        const url = `${config.vits.getUrlByText2Hash}`
        const headers = {
            'uid': `${config.vits.header.uid}`,
            'token': `${config.vits.header.token}`,
            'Content-Type': 'application/json'
        }
        const jsonData = {
            modelId: parseInt(modelId),
            roleId: roleId,
            lang: languages,
            text: text
        }

        // 发送请求
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(jsonData) })

        // 解析返回的数据
        const { data } = await response.json()

        let urls = await getUrlByHashCode(data[0].hashCode)
        await playAudio(urls)

        clearInputFieldAndCheckButtonStatus()

        intro.style.display = 'block'

    } catch (error) {
        clearInputFieldAndCheckButtonStatus()

        tipMessage.style.display = 'block'
        tipMessage.innerHTML = '合成失败'

        setTimeout(() => {
            tipMessage.style.display = 'none'
        }, 5000);

    }
}

function clearInputFieldAndCheckButtonStatus() {
    textElement.value = ''
    const inputValue = textElement.value.trim();
    setButtonStatus(textButton, inputValue.length <= 3, '开始合成', false);
}

function getLanguageCode(language) {
    switch (language) {
        case '中文':
            return '[ZH]';
        case '日语':
            return '[JA]';
        case '英语':
            return '[EN]';
        case '粤语':
            return '[GD]';
    }
}

/**
 * 设置按钮状态
 * @param {Element} button - 按钮元素
 * @param {boolean} isDisabled - 是否禁用按钮
 * @param {string} text - 按钮文本
 * @param {boolean} isLoading - 是否显示加载动画
 */

function setButtonStatus(button, isDisabled, text, isLoading) {
    if (isDisabled) {
        button.classList.add('disabled')
    } else {
        button.classList.remove('disabled')
    }

    textButton.innerHTML = text

    if (isLoading) {
        progressBar.style.display = 'block'
        tipMessage.style.display = 'block'
        button.classList.add('loading')
    } else {
        progressBar.style.display = 'none'
        tipMessage.style.display = 'none'
        button.classList.remove('loading')
    }
}

// 根据选项的标题获取模型ID和角色ID
function getModelAndRole(options, title) {
    let modelId
    let roleId

    options.forEach(item => {
        if (title === item.title) {
            const [mid, rid] = item.code.split('-')
            modelId = mid
            roleId = rid
        }
    })

    return { modelId, roleId }
}



// 获取指定散列码对应的 URL 列表
async function getUrlByHashCode(hashCode) {
    const url = `${config.vits.getUrlByHashCode}${hashCode}`

    // 发送 HTTP 请求并获取响应数据
    try {
        const response = await fetch(url, { method: 'GET', headers })

        // 解析响应数据，获取包含 URL 的数据数组
        const { data } = await response.json()

        // 等待所有任务完成
        await waitAllTask()

        // 一次性获取所有数据
        const totalCount = data.length
        const result = await getAllData(url, totalCount)

        return result
    } catch (error) {
        console.error('请求出错', error)
        throw error // 抛出异常以便上层函数处理
    }
}


// 计算进度条每次移动的步长
const interval = 50 // 进度条移动的时间间隔，单位为毫秒
let step // 每次移动的步长

function calcProgressBarStep(total) {
    step = 100 / total * interval
}

// 封装等待预计时间的函数
async function waitPredictTime(total) {
    let currentSecond = total / 1000
    // 创建一个定时器，每秒更新提示信息
    let timerId = setInterval(() => {
        tipMessage.innerHTML = `还需等待${currentSecond} 秒`
        currentSecond--

        // 当倒计时结束时清除定时器
        if (currentSecond < 0) {
            clearInterval(timerId)
            tipMessage.innerHTML = `正在生成音频...`
        }
    }, 1000)
    await new Promise((resolve) => setTimeout(resolve, total))
}

// 封装移动进度条的函数
async function moveProgressBar() {
    let count = 0

    // 返回一个Promise对象，并在每次移动后进行进行resolve

    return new Promise((resolve) => {
        const timer = setInterval(() => {
            count += step
            progress.style.width = `${count}%`   // 设置进度条宽度，从而达到移动效果
            progressText.innerText = `${count.toFixed(1)}%`  // 更新进度文本

            // 如果进度条已经达到100，则停止移动并 resolve Promise 对象
            if (count >= 100) {
                clearInterval(timer)
                resolve()
            }
        }, interval)
    })
}

// 等待所有任务完成
async function waitAllTask() {
    try {
        const getAllTaskRes = await fetch(
            `${config.vits.getUrlAllTask}`,
            { headers }
        )

        // 解析响应数据，获取当前任务数和预计等待时间
        const { data } = await getAllTaskRes.json()
        // 如果当前任务数(num)是0，则默认等待的时间(total)为10秒
        let total
        const num = data.num
        if (num === 0) {
            total = 10000
        } else {
            total = data.total * 1000
        }

        // 如果有任务在执行，则等待预计时间
        if (total > 0) {
            // 计算进度条每次移动的步长
            calcProgressBarStep(total)

            // 等待预计时间和移动进度条完成
            await Promise.all([waitPredictTime(total), moveProgressBar(total)])
        } else {
            tipMessage.innerHTML = `当前任务数：${num}`
        }
    } catch (error) {
        console.error('请求出错', error)
        throw error
    }
}


// 获取所有数据
async function getAllData(url, totalCount) {
    const count = 5
    const queryTimes = Math.ceil(totalCount / count) // 查询次数

    let result = []

    // 分批次查询数据
    for (let i = 0; i < queryTimes; i++) {

        const response = await fetch(url, { method: 'GET', headers })

        // 解析响应数据，获取包含 URL 的数据数组
        try {
            const { data } = await response.json()
            // 将 result 数组和 data 数组合并为一个新数组，并赋值给 result 变量
            result = [...result, ...data]
        } catch (error) {
            console.error('解析响应数据出错', error)
        }

        // 查询间隔 5 秒钟（可根据需要调整）
        await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    return result
}

// 播放音频
async function playAudio(data) {
    // 创建一个 AudioContext 对象
    const audioContext = new AudioContext()

    // 加载所有音频文件
    const audioBuffers = await Promise.allSettled(data.map(async item => {
        const response = await fetch(item.url)
        const arrayBuffer = await response.arrayBuffer()
        return await audioContext.decodeAudioData(arrayBuffer)
    }))

    // 获取声道数，采样率等参数
    const channelCount = audioBuffers[0].value.numberOfChannels
    const sampleRate = audioBuffers[0].value.sampleRate

    // 计算所需的总时间长度
    let totalTimeLength = 0
    audioBuffers.forEach(buffer => {
        totalTimeLength += buffer.value.duration
    })

    // 创建一个输出音频缓冲区
    const outputBuffer = audioContext.createBuffer(
        channelCount, // 声道数
        Math.round(sampleRate * totalTimeLength), // 总样本数
        sampleRate // 采样率
    )

    // 混合音频数据并调整音量大小
    const volume = 0.5 // 音量倍数，0.5 表示减小一倍音量，2 表示增大一倍音量
    for (let channel = 0; channel < channelCount; channel++) {
        const outputData = outputBuffer.getChannelData(channel)
        let offset = 0
        audioBuffers.forEach(buffer => {
            const inputData = buffer.value.getChannelData(channel)
            for (let i = 0; i < inputData.length; i++) {
                outputData[i + offset] += inputData[i] * volume
            }
            offset += buffer.value.length
        })
    }

    // 创建一个新的 BufferSource 节点
    const source = audioContext.createBufferSource()

    // 设置缓冲区数据
    source.buffer = outputBuffer

    // 设置播放速度为1
    source.playbackRate.value = slide.value

    // 通过连接到音频上下文的分析器节点来播放音频
    source.connect(audioContext.destination)

    // 播放音频
    // source.start()

    // 编码 PCM 数据为 WAV 格式
    const wavEncoder = new WavAudioEncoder(outputBuffer.sampleRate, outputBuffer.numberOfChannels)
    wavEncoder.encode([outputBuffer.getChannelData(0)])
    const wavBlob = new Blob([wavEncoder.finish()], { type: 'audio/wav' })

    // 将 WAV 数据转换为 URL 格式
    const dataURI = URL.createObjectURL(wavBlob)

    // 创建一个新的 Audio 标签元素
    const audioElement = document.createElement('audio')

    audioElement.src = dataURI
    audioElement.controls = true
    audioElement.type = 'audio/wav'

    // 将音频元素添加到页面中
    const outputAudio = document.querySelector('.output-audio')
    outputAudio.appendChild(audioElement)

}