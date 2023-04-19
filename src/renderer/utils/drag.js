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

this.window.onload = function () {
  draggableHandle()
}

function draggableHandle () {
  var canvas = document.getElementById('canvas')

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