// 获取remote
const remote = require('@electron/remote')
const { ipcRenderer } = require('electron')

// 获取 screen模块
const screen = remote.screen

// 是否在拖动操作
let dragging = false

// 鼠标左键是否按下
let mousedown_left = false

let mouseOnPage

draggableHandle()

function draggableHandle () {
  var stage = document.getElementById('oml-stage')
  var canvas = document.getElementById('oml-canvas')
  var controls = document.getElementById('oml-controls')
  controls.style.display = 'none'
  var levitated = document.getElementById('oml-levitated-btn')
  levitated.style.display = 'none'

  const control_box = document.createElement('div')
  control_box.classList.add('control_btn')

  stage.appendChild(control_box)

  const dialog_box = document.createElement('div')
  dialog_box.classList.add('control_item')
  dialog_box.textContent = '对话框'
  control_box.appendChild(dialog_box)

  const setting = document.createElement('div')
  setting.classList.add('control_item')
  setting.setAttribute('id', 'setting')
  setting.textContent = '设置'
  control_box.appendChild(setting)


  // 监听鼠标按下事件
  canvas.addEventListener('mousedown', (event) => {
    if (event.button == 0) {
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

  window.addEventListener('mousemove', () => {
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

const setting = document.getElementById('setting')

setting.addEventListener('click', () => {
  ipcRenderer.send('Setting', 'Open')
})

ipcRenderer.on('onloadLive2d', (event, data) => {
  localStorage.setItem('live2d', data)
})

