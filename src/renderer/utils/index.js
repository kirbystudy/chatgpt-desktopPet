// 获取remote
const remote = require('@electron/remote')
// 获取 screen模块
const screen = remote.screen
const { ipcRenderer } = require('electron')
const screenUtils = require('../utils/screen')
window.$ = window.jQuery = require('../utils/jquery.min.js')
const loadAudio = require('../../renderer/utils/mouth')

// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')

// 读取config.json
const configPath = path.resolve(__dirname, '../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

const app = document.getElementById('app')
const canvas = document.getElementById('canvas')
const setting = document.getElementById('setting')
const schedule = document.getElementById('schedule')
const chatting = document.getElementById('chatting')
const hide = document.getElementById('hide')

const control_btn = document.querySelector('.control_btn')
const control_item = document.querySelectorAll('.control_item')

// 定时器的全局变量
let timer = null

window.onload = function () {
  loadLive2D()

  setting.addEventListener('click', () => {
    ipcRenderer.send('Setting', 'Open')
  })

  schedule.addEventListener('click', () => {
    ipcRenderer.send('Schedule', 'Open')
  })

  chatting.addEventListener('click', () => {
    ipcRenderer.send('Chatting', 'Open')
  })

  hide.addEventListener('click', () => {
    showMessage("右下角有悬浮小球哦~", 3000, true)
    setTimeout(() => {
      ipcRenderer.send('MainPage', 'Hide')
    }, 1300)

    setTimeout(() => {
      ipcRenderer.send('hoverBox', 'Open')
      showMessage("我回来啦", 3000, true)
    }, 1300)

  })

  app.addEventListener('mouseover', () => {
    control_btn.style.opacity = 1
  })

  app.addEventListener('mouseout', () => {
    control_btn.style.opacity = 0
  })

  control_item.forEach(item => {
    item.addEventListener('mouseover', (event) => {
      if (event.target.innerText == '日程') {
        debounce(() => showMessage('要打开日程表吗?', 1500, true))
      } else if (event.target.innerText == '聊天') {
        debounce(() =>  showMessage('要打开聊天吗?', 1500, true))
      } else if (event.target.innerText == '关于') {
        debounce(() => showMessage('要打开设置吗?', 1500, true))
      } else if (event.target.innerText == '隐藏') {
        debounce(() => showMessage('要隐藏模型吗?', 1500, true))
      }
    })
  })
}

// 优化代码
// 实现防抖机制，接收一个函数和一个延迟时间作为参数
function debounce(fn, delay = 300) {
  // 每次调用 debounce 函数时，清空之前的定时器
  clearTimeout(timer)
  // 设置一个新的定时器，并在一定时间后执行被包装的函数
  timer = setTimeout(() => {
    fn()
  }, delay);
}

// 初始化live2d模型
function loadLive2D() {
  loadModel(config.live2d, canvas)

  setTimeout(() => {
    app.classList.add("show")
  }, 1000)

  setTimeout(() => {
    const greeting = getGreeting()
    if (greeting === '早上好') {
      playAudio(path.join(__dirname, '../../renderer/resources/早上好.wav'))
    } else if (greeting === '中午好') {
      playAudio(path.join(__dirname, '../../renderer/resources/中午好.wav'))
    } else if (greeting === '下午好') {
      playAudio(path.join(__dirname, '../../renderer/resources/下午好.wav'))
    } else if (greeting === '晚上好') {
      playAudio(path.join(__dirname, '../../renderer/resources/晚上好.wav'))
    }
    showMessage(greeting, 3000, true)
  }, 2000)
}

// 播放音频
function playAudio(filePath) {
  try {
    fetch(`file:///${filePath}`)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        loadAudio(arrayBuffer)
      })
  } catch (error) {
    console.log(error)
  }

}

// 显示消息框
function showMessage(text, timeout, flag) {
  if (flag || sessionStorage.getItem('message-text') === '' || sessionStorage.getItem('message-text') === null) {
    if (flag) {
      sessionStorage.setItem('message-text', text)
    }
    $('#message_box').stop()
    $('#message_box').html(text).fadeTo(200, 1)
    if (timeout === undefined) timeout = 5000
    hideMessage(timeout)
  }

}

// 隐藏消息框
function hideMessage(timeout) {
  $('#message_box').stop().css('opacity', 1)
  if (timeout === undefined) timeout = 5000
  window.setTimeout(() => {
    sessionStorage.removeItem('message-text')
  }, timeout)
  $('#message_box').delay(timeout).fadeTo(200, 0)
}

function getGreeting() {
  // 获取当前时间的小时数
  const hour = new Date().getHours()

  if (hour > 5 && hour <= 11) {
    return '早上好'
  } else if (hour > 11 && hour <= 13) {
    return '中午好'
  } else if (hour > 13 && hour <= 18) {
    return '下午好'
  } else if (hour > 18 && hour <= 22) {
    return '晚上好'
  } else {
    return '夜深了，注意休息'
  }
}

// DOM内容解析完成后触发事件
document.addEventListener('DOMContentLoaded', () => {

  // 启动拖拽事件处理函数
  screenUtils.getScreenInfo((screenInfo) => {

    // 屏幕缩放级别为100%
    if (screenInfo.scalingFactor == 1) {
      draggableHandle()
    }

    // 屏幕缩放级别为150%
    if (screenInfo.scalingFactor == 1.5) {
      draggableHandle()
    }
  })

})

// 鼠标拖拽事件
function draggableHandle() {

  // 是否在拖动操作
  let dragging = false

  // 鼠标左键是否按下
  let mousedownLeft = false

  // 鼠标相对于窗口坐标
  let mouseOnPage

  function handleMouseDown(event) {
    if (event.button === 0) {
      mousedownLeft = true
    }

    // 获取鼠标位置
    const { x, y } = screen.getCursorScreenPoint()

    // 从主进程获取当前窗口的位置
    const pos = ipcRenderer.sendSync('getMainPos')

    // 计算鼠标相对于窗口的坐标
    mouseOnPage = [x - pos[0], y - pos[1]]
  }

  function handleMouseUp() {
    mousedownLeft = false
    dragging = false
  }

  function handleMouseMove() {
    if (mousedownLeft) {
      dragging = true
    }

    if (dragging) {
      // 移动窗口操作发送到主进程
      ipcRenderer.send('dragMain', mouseOnPage)
    }
  }

  // 监听鼠标按下事件
  canvas.addEventListener('mousedown', handleMouseDown)

  // 监听鼠标抬起事件
  window.addEventListener('mouseup', handleMouseUp)

  // 监听鼠标移动事件
  window.addEventListener('mousemove', handleMouseMove)
}

// 退出事件处理
ipcRenderer.on('exitEvent', () => {
  playAudio(path.join(__dirname, '../../renderer/resources/退出桌宠.wav'))
})