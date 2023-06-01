// 获取remote
const remote = require('@electron/remote')
const { ipcRenderer } = require('electron')
const screenUtils = require('../utils/screen')
window.$ = window.jQuery = require('../utils/jquery.min.js')

// 获取 screen模块
const screen = remote.screen

const app = document.getElementById('app')
const canvas = document.getElementById('canvas')
const setting = document.getElementById('setting')
const schedule = document.getElementById('schedule')
const chatting = document.getElementById('chatting')
const hide = document.getElementById('hide')

const control_btn = document.querySelector('.control_btn')
const control_item = document.querySelectorAll('.control_item')

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
    showMessage("已进入专注模式，右下角有悬浮小球", 3000, true)
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
      if (event.target.innerText == '日程表') {
        showMessage('要打开日程表吗?', 1500, true)
      } else if (event.target.innerText == '对话框') {
        showMessage('要打开对话框吗?', 1500, true)
      } else if (event.target.innerText == '关于') {
        showMessage('要打开设置吗?', 1500, true)
      } else if (event.target.innerText == '隐藏') {
        showMessage('要隐藏模型吗?', 1500, true)
      }
    })
  })

}

// 初始化live2d模型
function loadLive2D() {
  createModel(store.state, canvas)

  setTimeout(() => {
    app.classList.add("show")
  }, 1000)

  setTimeout(() => {
    const greeting = getGreeting()
    showMessage(greeting, 3000, true)
  }, 2000)
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

  if (hour >= 0 && hour <= 5) {
    return '凌晨好'
  } else if (hour > 5 && hour <= 11) {
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