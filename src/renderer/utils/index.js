// 获取remote
const remote = require('@electron/remote')
// 获取 screen模块
const screen = remote.screen
const { ipcRenderer } = require('electron')
const screenUtils = require('../utils/screen')
window.$ = window.jQuery = require('../utils/jquery.min.js')

// 引入 fs 和 path 模块
const path = require('path')
const fs = require('fs')

// 读取config.json
const configPath = path.resolve(__dirname, '../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

const app = document.getElementById('app')
const canvas = document.getElementById('canvas')
const setting = document.getElementById('setting')
const speechSynthesis = document.getElementById('speechSynthesis')
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

  speechSynthesis.addEventListener('click', () => {
    ipcRenderer.send('speechSynthesis', 'Open')
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
      if (event.target.innerText == '语音') {
        debounce(() => showMessage('要打开语音吗?', 1500, true))
      } else if (event.target.innerText == '聊天') {
        debounce(() => showMessage('要打开聊天吗?', 1500, true))
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
function loadLive2D(roleId) {

  createModel(config.live2d, canvas, roleId)

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

  ipcRenderer.on('loadlive2d', (event, value) => {
    loadLive2D(value)
  })

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

  // 启动实时通知功能
  setupLiveNotify()

})

// 调用函数启动实时通知功能
function setupLiveNotify() {
  let intervalId = null; // 定时器的 ID

  // 启动定时器
  const startTimer = () => {
    if (intervalId === null) {
      // 使用 setInterval 函数每隔 1分钟 调用 queryLiveNotify 函数
      intervalId = setInterval(queryLiveNotify, 60000);
    }
  };

  // 停止定时器
  const stopTimer = () => {
    if (intervalId !== null) {
      // 使用 clearInterval 函数停止定时器
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // 查询实时通知
  const queryLiveNotify = () => {
    // 使用 ipcRenderer 发送 liveNotify 事件
    ipcRenderer.send('liveNotify');
  };

  // 初始化实时通知功能
  const initLiveNotify = () => {
    // 从本地存储中获取 isToggleOnLive 的值
    const isToggleOnLive = localStorage.getItem('isToggleOnLive');

    if (isToggleOnLive === 'true') {
      // 如果 isToggleOnLive 的值为 'true'，启动定时器
      startTimer();
    } else if (isToggleOnLive === 'false') {
      // 如果 isToggleOnLive 的值为 'false'，停止定时器
      stopTimer();
    }
  }

  // 处理存储变化事件
  const handleStorageChange = (event) => {
    if (event.key === 'isToggleOnLive') {
      // 调用初始化实时通知功能
      initLiveNotify();
    }
  };

  // 监听 storage 事件，当本地存储发生变化时触发 handleStorageChange 函数
  window.addEventListener('storage', handleStorageChange);

  // 调用初始化实时通知功能
  initLiveNotify()
}

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