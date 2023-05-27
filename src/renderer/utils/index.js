// 获取remote
const remote = require('@electron/remote')
const { ipcRenderer } = require('electron')
window.$ = window.jQuery = require('../utils/jquery.min.js')

// 获取 screen模块
const screen = remote.screen

// 是否在拖动操作
let dragging = false

// 鼠标左键是否按下
let mousedown_left = false

let mouseOnPage

const app = document.getElementById('app')
const canvas = document.getElementById('canvas')

window.onload = function () {
  loadLive2D()

  const control_box = document.createElement('div')
  control_box.classList.add('control_btn')
  app.appendChild(control_box)

  const schedule_box = document.createElement('div')
  schedule_box.classList.add('control_item')
  schedule_box.setAttribute('id', 'schedule')
  schedule_box.textContent = '日程表'
  control_box.appendChild(schedule_box)

  const dialog_box = document.createElement('div')
  dialog_box.classList.add('control_item')
  dialog_box.setAttribute('id', 'chatting')
  dialog_box.textContent = '对话框'
  control_box.appendChild(dialog_box)

  const setting_box = document.createElement('div')
  setting_box.classList.add('control_item')
  setting_box.setAttribute('id', 'setting')
  setting_box.textContent = '关于'
  control_box.appendChild(setting_box)

  const hide_box = document.createElement('div')
  hide_box.classList.add('control_item')
  hide_box.setAttribute('id', 'hide')
  hide_box.textContent = '隐藏'
  control_box.appendChild(hide_box)

  const setting = document.getElementById('setting')
  setting.addEventListener('click', () => {
    ipcRenderer.send('Setting', 'Open')
  })

  const schedule = document.getElementById('schedule')
  schedule.addEventListener('click', () => {
    ipcRenderer.send('Schedule', 'Open')
  })

  const chatting = document.getElementById('chatting')
  chatting.addEventListener('click', () => {
    ipcRenderer.send('Chatting', 'Open')
  })

  const hide = document.getElementById('hide')
  hide.addEventListener('click', () => {
    showMessage("(o゜▽゜)o☆要进入专注模式吗? 专注模式下，秋蒂将缩小至右下角悬浮球，避免遮挡屏幕~")
    setTimeout(() => {
      ipcRenderer.send('MainPage', 'Hide')
    }, 1300)

    setTimeout(() => {
      ipcRenderer.send('hoverBox', 'Open')
    }, 1300)
  })

  draggableHandle()

  const control_btn = document.querySelector('.control_btn')

  app.addEventListener('mouseover', () => {
    control_btn.style.opacity = 1
  })

  app.addEventListener('mouseout', () => {
    control_btn.style.opacity = 0
  })

  ipcRenderer.on('playAudio', (event, buffer) => {
    loadAudio(buffer, store.state)
  })
}

// 初始化live2d模型
function loadLive2D() {
  createModel(store.state, canvas)
}

// 显示消息框
function showMessage(text, timeout, flag) {
  $('#message_box').html(text).fadeTo(200, 1)
  if (timeout === undefined) timeout = 5000
  hideMessage(timeout)
}

// 隐藏消息框
function hideMessage(timeout) {
  $('#message_box').stop().css('opacity', 1)
  if (timeout === undefined) timeout = 5000
  $('#message_box').delay(timeout).fadeTo(200, 0)
}

function getGreeting() {
  // 获取当前时间的小时数
  const hour = new Date().getHours();

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
  setTimeout(() => {
    app.classList.add("show")
  }, 1000)

  setTimeout(() => {
    const greeting = getGreeting()
    showMessage(greeting)
  }, 2000)
})

// 鼠标拖拽事件
function draggableHandle() {

  // 监听鼠标按下事件
  canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
      mousedown_left = true
    }

    // 获取鼠标位置
    const { x, y } = screen.getCursorScreenPoint()

    // 从主进程获取当前窗口的位置
    const pos = ipcRenderer.sendSync('getMainPos')

    // 鼠标相对于窗口坐标
    mouseOnPage = [(x - pos[0]), (y - pos[1])]
  })

  window.addEventListener('mouseup', () => {
    mousedown_left = false
    dragging = false
  })

  window.addEventListener('mousemove', (event) => {
    
    // 按下鼠标并移动, 拖动操作为true
    if (mousedown_left) {
      dragging = true
    }

    // 执行拖动操作
    if (dragging) {
      // 移动窗口操作发送到主进程
      ipcRenderer.send('dragMain', mouseOnPage)
    }
  })
}