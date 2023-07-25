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

// 在全局作用域中定义一个变量来跟踪播放状态
let playAudioing = false

const app = document.getElementById('app')
const canvas = document.getElementById('canvas')
const setting = document.getElementById('setting')
const schedule = document.getElementById('schedule')
const chatting = document.getElementById('chatting')
const wallpaper = document.getElementById('wallpaper')
const community = document.getElementById('community')
const speechSynthesis = document.getElementById('speechSynthesis')
const hide = document.getElementById('hide')

const control_btn = document.querySelector('.control_btn')
const control_item = document.querySelectorAll('.control_item')
const controlBox = document.querySelector('.control_box')

controlBox.addEventListener('click', () => {
  control_btn.classList.toggle('active')
  controlBox.classList.toggle('clicked')
})

// 定时器的全局变量
let timer = null

window.onload = function () {
  loadLive2D()

  const upArrow = document.getElementById('up_arrow')
  const downArrow = document.getElementById('down_arrow')

  control_btn.addEventListener('scroll', function () {
    if (control_btn.scrollTop === 0) {
      upArrow.style.opacity = '0'
    } else {
      upArrow.style.opacity = '1'
    }

    if (control_btn.scrollTop + control_btn.clientHeight === control_btn.scrollHeight) {
      downArrow.style.opacity = '0'
    } else {
      downArrow.style.opacity = '1'
    }
  })

  setting.addEventListener('click', () => {
    ipcRenderer.send('Setting', 'Open')
  })

  schedule.addEventListener('click', () => {
    ipcRenderer.send('Schedule', 'Open')
  })

  chatting.addEventListener('click', () => {
    ipcRenderer.send('Chatting', 'Open')
  })

  wallpaper.addEventListener('click', () => {
    ipcRenderer.send('Wallpaper', 'Open')
  })

  community.addEventListener('click', () => {
    ipcRenderer.send('Community', 'Open')
  })

  speechSynthesis.addEventListener('click', () => {
    ipcRenderer.send('speechSynthesis', 'Open')
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

  control_item.forEach(item => {
    item.addEventListener('mouseover', (event) => {
      if (event.target.innerText == '日程') {
        debounce(() => showMessage('要打开日程表吗?', 1500, true))
      } else if (event.target.innerText == '聊天') {
        debounce(() => showMessage('要打开聊天吗?', 1500, true))
      } else if (event.target.innerText == '关于') {
        debounce(() => showMessage('要打开设置吗?', 1500, true))
      } else if (event.target.innerText == '隐藏') {
        debounce(() => showMessage('要隐藏模型吗?', 1500, true))
      } else if (event.target.innerText == '壁纸') {
        debounce(() => showMessage('要打开壁纸吗?', 1500, true))
      } else if (event.target.innerText == '语音') {
        debounce(() => showMessage('要打开语音吗?', 1500, true))
      } else if (event.target.innerText == '社区') {
        debounce(() => showMessage('要打开社区吗?', 1500, true))
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
        const volume = localStorage.getItem('volumeParam')
        loadAudio(arrayBuffer, volume)
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

  // 启动实时通知功能
  setupLiveNotify()

  // 初始化音量
  if (localStorage.getItem('volumeParam') === null) {
    localStorage.setItem('volumeParam', 0.5)
  }

})

// 调用函数启动实时通知功能
function setupLiveNotify() {
  let intervalId = null // 定时器的 ID

  // 启动定时器
  const startTimer = () => {
    if (intervalId === null) {
      // 使用 setInterval 函数每隔 5分钟 调用 queryLiveNotify 函数
      intervalId = setInterval(queryLiveNotify, 300000)
    }
  }

  // 停止定时器
  const stopTimer = () => {
    if (intervalId !== null) {
      // 使用 clearInterval 函数停止定时器
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // 查询实时通知
  const queryLiveNotify = () => {
    // 使用 ipcRenderer 发送 liveNotify 事件
    ipcRenderer.send('liveNotify')
  };

  // 初始化实时通知功能
  const initLiveNotify = () => {
    // 从本地存储中获取 isToggleOnLive 的值
    const isToggleOnLive = localStorage.getItem('isToggleOnLive')

    if (isToggleOnLive === 'true') {
      // 如果 isToggleOnLive 的值为 'true'，启动定时器
      startTimer()
    } else if (isToggleOnLive === 'false') {
      // 如果 isToggleOnLive 的值为 'false'，停止定时器
      stopTimer()
    }
  }

  // 处理存储变化事件
  const handleStorageChange = (event) => {
    if (event.key === 'isToggleOnLive') {
      // 调用初始化实时通知功能
      initLiveNotify()
    }
  };

  // 监听 storage 事件，当本地存储发生变化时触发 handleStorageChange 函数
  window.addEventListener('storage', handleStorageChange)

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

// 退出事件处理
ipcRenderer.on('exitEvent', () => {
  playAudio(path.join(__dirname, '../../renderer/resources/退出桌宠.wav'))
})