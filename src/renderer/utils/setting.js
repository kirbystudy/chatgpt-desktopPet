const { ipcRenderer } = require('electron')
// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')
window.$ = window.jQuery = require('../utils/jquery.min.js')


// 读取config.json
const configPath = path.resolve(__dirname, '../../../config/config.json')
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
    openPopup('秋蒂桌宠', '字数超过了200字')
    return
  }
  var str = message.value

  if (str.length == 0) {
    openPopup('秋蒂桌宠', '留言内容不能为空!')
    return
  }

  if (str.length > 0) {
    const formData = new FormData()
    formData.append('content', str)

    const currentTime = new Date().getTime()

    if (currentTime - lastRequestTime < 5000) {
      openPopup('秋蒂桌宠', '请等待至少5秒钟再尝试请求!')
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
          openPopup('秋蒂桌宠', '感谢您的留言!')
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
  var package = require('../../../package.json')
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

var toggle_power = document.getElementById('toggle_power')

const isToggleOn = localStorage.getItem('isToggleOn') === 'true'

isToggleOn ? toggle_power.checked = true : toggle_power.checked = false

toggle_power.addEventListener('click', () => {

  let newToggleOn = !isToggleOn
  const enabled = toggle_power.checked
  ipcRenderer.send('toggle_power', enabled)
  newToggleOn ? toggle_power.checked = true : toggle_power.checked = false
  localStorage.setItem('isToggleOn', newToggleOn)
})

// 监听主进程反馈以更新开关状态
ipcRenderer.on('toggle_power_status', (event, isEnabled) => {
  toggle_power.checked = isEnabled
  if (isEnabled) {
    openPopup('秋蒂桌宠', '已成功开启')
  } else {
    openPopup('秋蒂桌宠', '已成功关闭')
  }
})
