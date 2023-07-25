const { ipcRenderer } = require('electron')
// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')

window.$ = window.jQuery = require('../../utils/jquery.min.js')

// 创建弹窗组件实例
const popupComponent = new PopupComponent()

// 读取config.json
const configPath = path.resolve(__dirname, '../../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

const feedbackBtn = document.getElementById('feedback_button')

// 发送内容
var message = document.getElementById('feedback_content')
const wordCount = document.getElementById('wordCount')
const clearText = document.getElementById('clear_text')

message.addEventListener('input', () => {
  const count = message.value.length
  wordCount.textContent = count
})

clearText.addEventListener('click', () => {
  message.value = ''
  wordCount.textContent = 0
})

// 上一次请求的时间
let lastRequestTime = 0

feedbackBtn.addEventListener('click', () => {
  const count = message.value.length
  if (count > 200) {
    // popupComponent.openPopup('秋蒂桌宠', '字数超过了200字')
    showMessage('字数超过了200字', 'warning')
    return
  }
  var str = message.value

  if (str.length == 0) {
    // popupComponent.openPopup('秋蒂桌宠', '留言内容不能为空!')
    showMessage('留言内容不能为空!', 'warning')
    return
  }

  if (str.length > 0) {
    const formData = new FormData()
    formData.append('content', str)

    const currentTime = new Date().getTime()

    if (currentTime - lastRequestTime < 5000) {
      // popupComponent.openPopup('秋蒂桌宠', '请等待至少5秒钟再尝试请求!')
      showMessage('请等待至少5秒钟再尝试请求!', 'warning')
      message.value = ''
      wordCount.textContent = 0
      return
    }

    fetch(`${config.feedBack.url}`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // 处理响应
        return response.text()
      })
      .then((response) => {
        if (response == 'SUCCESS') {
          // popupComponent.openPopup('秋蒂桌宠', '感谢您的留言!')
          showMessage('感谢您的留言!', 'success')
        }
        message.value = ''
        wordCount.textContent = 0
      })
      .catch((error) => {
        // 处理错误
        console.log(error)
      })
      .finally(() => {
        lastRequestTime = currentTime

        setTimeout(() => {
          // 重置计时器
          lastRequestTime = 0
        }, 5000)
      })
  }
})

window.onload = function () {
  var package = require('../../../../package.json')
  const app_version = document.getElementById('app_version')
  app_version.innerText = 'v' + package.version
}

var contentPages = document.getElementsByClassName('setting_page')
var highlight = document.getElementById('highlight')

// 选项点击事件处理程序
function handleOptionClick(event) {
  var target = event.target
  var id = target.id
  var contentId = id.replace('Tab', '')

  // 隐藏所有的内容
  for (var i = 0; i < contentPages.length; i++) {
    contentPages[i].classList.remove('active')
  }

  // 显示目标内容
  var content = document.getElementById(contentId)
  if (content) {
    content.classList.add('active')

    // 更新选项卡的高亮位置
    var tabWidth = target.offsetWidth
    var tabOffsetLeft = target.offsetLeft
    highlight.style.left = tabOffsetLeft + 'px'
    highlight.style.width = tabWidth + 'px'

    // 存储选中的选项
    localStorage.setItem('selectedOption', id)
  }
}

// 添加点击事件委托到选项父容器
var selection = document.querySelector('.selection')
selection.addEventListener('click', function (event) {
  if (event.target.classList.contains('selection_bar')) {
    handleOptionClick(event)
  }
})

// 检查是否有选中的选项并恢复状态
var selectedOption = localStorage.getItem('selectedOption')
if (selectedOption === null) {
  var versionInfoTab = document.getElementById('versionInfoTab')
  var versionInfoContent = document.getElementById('versionInfo')
  if (versionInfoTab && versionInfoContent) {
    versionInfoTab.classList.add('active')
    versionInfoContent.classList.add('active')
  }
} else {
  var selectedTab = document.getElementById(selectedOption)
  var contentId = selectedOption.replace('Tab', '')
  var content = document.getElementById(contentId)

  if (selectedTab && content && highlight) {
    selectedTab.classList.add('active')
    content.classList.add('active')
    var tabWidth = selectedTab.offsetWidth
    var tabOffsetLeft = selectedTab.offsetLeft
    highlight.style.left = tabOffsetLeft + 'px'
    highlight.style.width = tabWidth + 'px'
  }
}

/* ----------------------------- 开机自启动 ----------------------------- */

// 获取开关按钮元素
const toggle_power = document.getElementById('toggle_power')
// 从 localStorage 中获取开关状态，默认为 false
let isToggleOn = localStorage.getItem('isToggleOn') === 'true'

// 初始化时更新开关状态
updateToggleStatus()

// 点击开关按钮时触发的事件处理函数
toggle_power.addEventListener('click', toggleSwitch)

// 监听主进程反馈以更新开关状态
ipcRenderer.on('togglePowerStatus', (event, isEnabled) => {
  // 更新开关状态
  isToggleOn = isEnabled
  // 更新开关按钮状态
  updateToggleStatus()
  // 根据开关状态显示不同的消息提示
  const message = isEnabled ? '已成功开启' : '已成功关闭'
  // 打开提示消息框
  // popupComponent.openPopup('秋蒂桌宠', message)
  showMessage(message, 'success')
})

// 切换开关状态的函数
function toggleSwitch() {
  // 反转开关状态
  isToggleOn = !isToggleOn
  // 获取最新的开关状态
  const enabled = isToggleOn
  // 发送开关状态给主进程
  ipcRenderer.send('toggle_power', enabled)
  // 更新开关按钮状态
  updateToggleStatus()
  // 将最新的开关状态保存到 localStorage 中
  localStorage.setItem('isToggleOn', isToggleOn)
}

// 更新开关按钮状态的函数
function updateToggleStatus() {
  toggle_power.checked = isToggleOn
}

/* ----------------------------- 开机自启动 ----------------------------- */

/* ----------------------------- Bilibili 直播通知 ----------------------------- */

// 获取通知按钮元素
const liveNotification = document.getElementById('liveNotification')
// 从 localStorage 中获取通知状态，默认为 false
let isToggleOnLive = localStorage.getItem('isToggleOnLive') === 'true'

// 初始化时更新通知状态
updateLiveToggleStatus()

// 点击通知按钮时触发的事件处理函数
liveNotification.addEventListener('click', toggleLiveSwitch)

// 切换通知状态的函数
function toggleLiveSwitch() {
  // 反转通知状态
  isToggleOnLive = !isToggleOnLive
  // 更新通知按钮状态
  updateLiveToggleStatus()
  // 根据开关状态显示不同的消息提示
  const message = isToggleOnLive ? '已成功开启' : '已成功关闭'
  // 打开提示消息框
  showMessage(message, 'success')
  // 将最新的通知状态保存到 localStorage 中
  localStorage.setItem('isToggleOnLive', isToggleOnLive)
}

// 更新通知按钮状态的函数
function updateLiveToggleStatus() {
  liveNotification.checked = isToggleOnLive
}

/* ----------------------------- Bilibili 直播通知 ----------------------------- */

/* ----------------------------- 音频控制 ----------------------------- */

const volumeControl = document.getElementById('volumeControl')
const param = document.querySelector('.param')

volumeControl.value = localStorage.getItem('volumeParam')
param.innerHTML = (localStorage.getItem('volumeParam') * 100).toFixed(0)

volumeControl.addEventListener('input', () => {
  param.innerHTML = (volumeControl.value * 100).toFixed(0)
  localStorage.setItem('volumeParam', volumeControl.value)
})

/* ----------------------------- 音频控制 ----------------------------- */

/* ----------------------------- 上传本地模型文件 ----------------------------- */

const uploadFile = document.getElementById('uploadFile')
const localModelSelect = document.getElementById('localModelSelect')
const xAxis = document.getElementById('xAxis')
const yAxis = document.getElementById('yAxis')
const scaling = document.getElementById('scaling')
const updateModelBtn = document.getElementById('updateModelBtn')

const localxAxis = localStorage.getItem('xAxis')
const localyAxis = localStorage.getItem('yAxis')
const localScaling = localStorage.getItem('scaling')

if (localxAxis && localyAxis && localScaling) {
  xAxis.value = localxAxis
  yAxis.value = localyAxis
  scaling.value = localScaling
}

uploadFile.addEventListener('click', () => {
  localModelSelect.value = null
  localModelSelect.click()
})

localModelSelect.addEventListener('change', (event) => {
  let selectedModel = event.target.files[0]
  let modelUrl = selectedModel.path

  // 更新path属性值
  config.live2d.path = modelUrl

  // 将更新后的JSON数据写回文件
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
})

updateModelBtn.addEventListener('click', () => {
  config.live2d.x = xAxis.value
  config.live2d.y = yAxis.value
  config.live2d.scale = scaling.value

  showMessage('更新成功', 'success')

  localStorage.setItem('xAxis', xAxis.value)
  localStorage.setItem('yAxis', yAxis.value)
  localStorage.setItem('scaling', scaling.value)

  setTimeout(() => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  }, 1500)
})

/* ----------------------------- 上传本地模型文件 ----------------------------- */
