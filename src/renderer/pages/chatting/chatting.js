const ipcRenderer = require('electron').ipcRenderer
const maximizeBtn = document.querySelector('.maximize')
const minimizeBtn = document.querySelector('.minimize')
const closeBtn = document.querySelector('.close')
window.$ = window.jQuery = require('../../utils/jquery.min.js')

// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')

// 创建弹窗组件实例
const popupComponent = new PopupComponent()

// 读取config.json
const configPath = path.resolve(__dirname, '../../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

maximizeBtn.addEventListener('mouseenter', () => {
  // 显示最大化按钮
  maximizeBtn.classList.add('show')
})

maximizeBtn.addEventListener('mouseleave', () => {
  // 隐藏最大化按钮
  maximizeBtn.classList.remove('show')
})

minimizeBtn.addEventListener('mouseenter', () => {
  // 显示最小化按钮
  minimizeBtn.classList.add('show')
})

minimizeBtn.addEventListener('mouseleave', () => {
  // 隐藏最小化按钮
  minimizeBtn.classList.remove('show')
})

closeBtn.addEventListener('mouseenter', () => {
  // 显示关闭按钮
  closeBtn.classList.add('show')
})

closeBtn.addEventListener('mouseleave', () => {
  // 隐藏关闭按钮
  closeBtn.classList.remove('show')
})

maximizeBtn.addEventListener('click', () => {
  ipcRenderer.send('Chatting', 'maximize-window')
})

minimizeBtn.addEventListener('click', () => {
  ipcRenderer.send('Chatting', 'minimize-window')
})

closeBtn.addEventListener('click', () => {
  ipcRenderer.send('Chatting', 'close-window')
})

// 标记是否可以发送请求
let canSendRequest = true

// 保存上一次的用户信息
let lastUserMessage = ''

let message = document.getElementById('chatinput')

$(document).ready(function () {

  message.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault()
      $('#sendbutton').click()
      this.value = ''
    }
  })

  $('#sendbutton').click(() => {

    sending(message.value)

    // 清空对话框
    message.value = ''

  })
})

async function sending(userMessage) {

  if (userMessage.trim().length === 0) {
    // popupComponent.openPopup('秋蒂桌宠', '文本内容不能为空')
    showMessage('文本内容不能为空', 'warning')
    return
  }

  if (userMessage.trim().length >= 500) {
    popupComponent.openPopup('秋蒂桌宠', '字数限制在500字内')
    showMessage('字数限制在500字内', 'warning')
    message.value = ''
    return
  }

  if (!canSendRequest) {
    // popupComponent.openPopup('秋蒂桌宠', '请等待至少3秒后再发送请求')
    showMessage('请等待至少3秒后再发送请求', 'warning')
    message.value = ''
    return
  }

  // 获取按钮元素
  let myButton = document.getElementById('sendbutton')

  // 禁用按钮
  message.disabled = true

  myButton.classList.add('disabled')
  myButton.innerHTML = ''
  myButton.classList.add("loading")

  // 创建实例对象
  let dialogBoxYou = new DialogBox('#chatlog', 'dialog-box1', '../../image/user.png')

  //构建对话框内容
  let dialogContentYou = userMessage

  //将对话框内容添加到组件中显示。
  dialogBoxYou.setText(dialogContentYou)

  // 对话框拉到底部
  scrollToBottom()

  // 创建实例对象
  let dialogBoxRobot = new DialogBox('#chatlog', 'dialog-box', '../../image/qiudi.jpg')

  // 对话框拉到底部
  scrollToBottom()

  const formData = new FormData()
  formData.append('ruleType', config.gpt.ruleType)
  formData.append('command', userMessage)

  lastUserMessage = userMessage

  dialogBoxRobot.setContent('秋蒂正在思考...')

  await fetch(`${config.gpt.url}`, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      // 处理响应
      return response.text()
    })
    .then(data => {
      dialogBoxRobot.removeContent()
      if (data === '系统繁忙，请稍后再试') {
        dialogBoxRobot.appendContent('秋蒂正拼命思考中，请稍后再试or点击重试按钮再发一次，啾咪~')
        appendMessage()
        scrollToBottom()
      } else {
        let parsedMessageRobot = marked.parse(data)
        dialogBoxRobot.appendContent(parsedMessageRobot)
        scrollToBottom()
      }

      // 设置发送请求的等待时间（毫秒）
      const requestWaitTime = 3000
      canSendRequest = false

      // 在指定的等待时间后设置 canSendRequest 为 true，允许发送下一个请求
      setTimeout(() => {
        canSendRequest = true
      }, requestWaitTime)
    })
    .catch(error => {
      // 处理错误
      console.log(error)
    }).finally(() => {
      // 启用按钮
      message.disabled = false
      myButton.classList.remove('disabled')
      myButton.innerHTML = '提交'
      myButton.classList.remove('loading')
    })

  let chat_log = document.getElementById('chatlog')
  chat_log.scrollTop = chat_log.scrollHeight

}

function scrollToBottom() {
  // 找到消息列表容器
  let messages = $('.messages')

  // 将消息列表容器的滚动到底部位置
  messages.scrollTop(messages.prop("scrollHeight"))
}

class DialogBox {
  constructor(selector, className, imgUrl) {
    this.element = document.querySelector(selector)
    this.header = null
    this.content = null
    this.dialogBox = null
    if (this.element) {
      // 创建头部和内容区域元素
      this.header = document.createElement('div')
      this.header.classList.add('header')
      this.content = document.createElement('div')
      this.content.classList.add('content')
      this.dialogBox = document.createElement('div')
      this.dialogBox.classList.add(className)
      // 添加到容器中
      this.dialogBox.appendChild(this.header)
      this.dialogBox.appendChild(this.content)
      this.element.appendChild(this.dialogBox)
      this.header.style.backgroundImage = "url('" + imgUrl + "')"
      this.header.style.backgroundSize = "cover"
    } else {
      console.error(`Element with selector ${selector} not found.`)
    }
  }
  setTitle(title) {
    if (this.header) {
      // 设置标题文本
      const titleNode = document.createTextNode(title)
      while (this.header.firstChild) {
        // 删除旧节点
        this.header.removeChild(this.header.firstChild)
      }
      this.header.appendChild(titleNode)
    }
  }
  setContent(contentHTML) {
    if (this.content) {
      //设置内容区域的 html 内容
      this.content.innerHTML = contentHTML
    }
  }
  appendContent(contentHTML) {
    if (this.content) {
      //设置内容区域的 html 内容
      this.content.innerHTML += contentHTML
    }
  }
  removeContent() {
    if (this.content) {
      //设置内容区域的 html 内容
      this.content.innerHTML = null
    }
  }
  setText(contentText) {
    // 创建 Text 节点
    if (this.content) {
      let textNode = document.createTextNode(contentText)
      this.p = document.createElement('p')
      this.content.appendChild(this.p)
      this.p.appendChild(textNode)
    }
  }
  appendText(contentText) {
    // 创建 Text 节点
    if (this.content) {
      if (!this.p) {
        this.p = document.createElement('p')
        let textNode = document.createTextNode(contentText)
        this.content.appendChild(this.p)
        this.p.appendChild(textNode)
      } else {
        let textNode = this.p.childNodes[0]
        textNode.nodeValue += contentText
      }
    }
  }
}

// 聊天记录中追加消息
function appendMessage() {
  const chat_right_content = document.querySelectorAll('.dialog-box1 .content')

  // 添加重发按钮
  const resendButton = document.createElement('img')
  resendButton.src = '../../image/repeat.png'
  resendButton.title = '重发'
  resendButton.classList.add('resend_button')
  resendButton.addEventListener('click', () => {
    sending(lastUserMessage)
  })

  // 将消息和重发按钮添加到聊天日志
  chat_right_content.forEach((item) => {
    item.appendChild(resendButton)
  })
}