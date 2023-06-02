const { ipcRenderer } = require('electron')
// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')

window.$ = window.jQuery = require('../../utils/jquery.min.js')

// 创建弹窗组件实例
const popupComponent = new PopupComponent();

// 读取config.json
const configPath = path.resolve(__dirname, '../../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

const versionInfoTab = document.getElementById('versionInfoTab')
const modelSettingTab = document.getElementById('modelSettingTab')
const versionInfo = document.getElementById('versionInfo')
const modelSetting = document.getElementById('modelSetting')
const highlight = document.getElementById('highlight')

versionInfoTab.addEventListener('click', () => {
  versionInfo.style.display = 'block'
  modelSetting.style.display = 'none'
  highlight.style.left = '15px'
  highlight.style.width = '70px'
})

modelSettingTab.addEventListener('click', () => {
  versionInfo.style.display = 'none'
  modelSetting.style.display = 'block'
  highlight.style.left = '115px'
  highlight.style.width = '70px'
})

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
    popupComponent.openPopup('秋蒂桌宠', '字数超过了200字')
    return
  }
  var str = message.value

  if (str.length == 0) {
    popupComponent.openPopup('秋蒂桌宠', '留言内容不能为空!')
    return
  }

  if (str.length > 0) {
    const formData = new FormData()
    formData.append('content', str)

    const currentTime = new Date().getTime()

    if (currentTime - lastRequestTime < 5000) {
      popupComponent.openPopup('秋蒂桌宠', '请等待至少5秒钟再尝试请求!')
      message.value = ''
      wordCount.textContent = 0
      return
    }

    fetch(`${config.feedBack.url}`, {
      method: 'POST',
      body: formData
    })
      .then(response => {
        // 处理响应
        return response.text()
      })
      .then(response => {
        if (response == 'SUCCESS') {
          popupComponent.openPopup('秋蒂桌宠', '感谢您的留言!')
        }
        message.value = ''
        wordCount.textContent = 0
      })
      .catch(error => {
        // 处理错误
        console.log(error)
      }).finally(() => {
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

  const minimize = document.getElementById('minimize')
  const maximize = document.getElementById('maximize')
  const close = document.getElementById('close')

  minimize.addEventListener('click', () => {
    ipcRenderer.send('Setting', 'minimize')
  })

  let originalTitle = $('#maximize').attr('title')
  let isTitleChanged = false
  $('#maximize').on('click', () => {
    ipcRenderer.send('Setting', 'maximize')
    if (isTitleChanged) {
      $('#maximize').attr('title', originalTitle)
      isTitleChanged = false
    } else {
      $('#maximize').attr('title', '还原')
      isTitleChanged = true
    }
  })

  close.addEventListener('click', () => {
    ipcRenderer.send('Setting', 'close')
  })
}

// 获取开关按钮元素
const toggle_power = document.getElementById('toggle_power')
// 从 localStorage 中获取开关状态，默认为 false
let isToggleOn = localStorage.getItem('isToggleOn') === 'true'

// 初始化时更新开关状态
updateToggleStatus()

// 点击开关按钮时触发的事件处理函数
toggle_power.addEventListener('click', toggleSwitch)

// 监听主进程反馈以更新开关状态
ipcRenderer.on('toggle_power_status', (event, isEnabled) => {
  // 更新开关状态
  isToggleOn = isEnabled
  // 更新开关按钮状态
  updateToggleStatus()
  // 根据开关状态显示不同的消息提示
  const message = isEnabled ? '已成功开启' : '已成功关闭'
  // 打开弹窗
  popupComponent.openPopup('秋蒂桌宠', message)
});

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
