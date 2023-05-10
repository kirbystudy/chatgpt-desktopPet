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

window.onload = function () {
  const stage = document.getElementById('oml-stage')
  const controls = document.getElementById('oml-controls')
  const levitated = document.getElementById('oml-levitated-btn')
  controls.style.display = 'none'
  levitated.style.display = 'none'

  const control_box = document.createElement('div')
  control_box.classList.add('control_btn')
  stage.appendChild(control_box)

  const schedule_box = document.createElement('div')
  schedule_box.classList.add('control_item')
  schedule_box.setAttribute('id', 'schedule')
  schedule_box.textContent = '日程表'
  control_box.appendChild(schedule_box)

  const dialog_box = document.createElement('div')
  dialog_box.classList.add('control_item')
  dialog_box.textContent = '对话框'
  control_box.appendChild(dialog_box)

  const setting_box = document.createElement('div')
  setting_box.classList.add('control_item')
  setting_box.setAttribute('id', 'setting')
  setting_box.textContent = '设置'
  control_box.appendChild(setting_box)

  const setting = document.getElementById('setting')

  setting.addEventListener('click', () => {
    ipcRenderer.send('Setting', 'Open')
  })

  const schedule = document.getElementById('schedule')
  schedule.addEventListener('click', () => {
    ipcRenderer.send('Schedule', 'Open')
  })

  draggableHandle()


  const control_btn = document.querySelector('.control_btn')

  stage.addEventListener('mouseover', () => {
    control_btn.style.opacity = 1
  })

  stage.addEventListener('mouseout', () => {
    control_btn.style.opacity = 0
  })

}


function draggableHandle () {

  var canvas = document.getElementById('oml-canvas')

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




ipcRenderer.on('onloadLive2d', (event, data) => {
  localStorage.setItem('live2d', data)
});

