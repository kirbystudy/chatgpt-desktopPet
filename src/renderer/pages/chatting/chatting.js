const ipcRenderer = require('electron').ipcRenderer
const maximizeBtn = document.querySelector('.maximize')
const minimizeBtn = document.querySelector('.minimize')
const closeBtn = document.querySelector('.close')
window.$ = window.jQuery = require('../../utils/jquery.min.js')

// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')
const Api2d = require('../../utils/api2d.js')

// 创建弹窗组件实例
const popupComponent = new PopupComponent()


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

/* ----------------------------- 右侧配置项 -----------------------------*/

const sidebarToggle = document.querySelector('.sidebar_toggle')

// 如果点击的不是侧边栏或按钮，则隐藏侧边栏
let sidebar = document.getElementById('config')
let toggleBtn = document.getElementById('setting')

let isClick = false

document.addEventListener('click', (event) => {
  if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
    hideSidebar()
  } else if (toggleBtn.contains(event.target)) {
    toggleSidebar()
  }
})

function hideSidebar() {
  isClick = false
  sidebarToggle.classList.remove('rotate')
  sidebar.classList.remove('show')
  sidebar.classList.add('hide')
}

function toggleSidebar() {
  if (isClick) {
    hideSidebar()
  } else {
    isClick = true
    sidebarToggle.classList.add('rotate')
    sidebar.classList.remove('hide')
    sidebar.classList.add('show')
  }
}

/* ----------------------------- 右侧配置项 -----------------------------*/


/* ----------------------------- 下拉框内容 -----------------------------*/

// 获取下拉框图标
const arrow_down = document.getElementById('input-suffix')

// 获取下拉内容
const dropdown = document.getElementById('select-dropdown')

const dropdownContainer = document.getElementById('select-input')

// 获取用于显示选中值的输入框
var input_inner = document.getElementById('input-inner')

// 获取所有下拉选项
var dropdownOption = document.querySelectorAll('.select-dropdown-item')

// 文本域
const textarea = document.getElementById('textarea-inner')

// 角色显示/隐藏
const role_script = document.getElementById('role_script')

// 按钮显示/隐藏
const btn_script = document.getElementById('btn_script')
const upload_script = document.getElementById('upload_script')

// 角色提示
const useRole = document.querySelector('.useRole')

// 上传按钮
const uploadBtn = document.getElementById('upload_avatar_btn')

// 在页面加载完成后执行代码
window.addEventListener('DOMContentLoaded', () => {

  // 获取下拉选项元素
  var optionElements = document.querySelectorAll('.select-dropdown-item')

  // 获取缓存中的 role_name 值
  var cachedRoleName = localStorage.getItem('role_name')

  // 获取缓存中的 role_text 值
  const cacheRoleText = localStorage.getItem(`role_text_${encodeURIComponent(cachedRoleName)}`)

  // 设置默认选中文本
  var defaultSelectedText = cachedRoleName ? cachedRoleName : '小埋'

  // 遍历每个下拉选项元素
  optionElements.forEach((optionElement) => {

    // 获取当前选项的文本内容
    var currentText = optionElement.textContent.replace('内置角色', '')

    // 判断是否为默认选中项，设置高亮样式
    if (currentText === defaultSelectedText) {
      optionElement.classList.add('selected')
    }
  })

  // 设置角色引导词的显示状态
  if (defaultSelectedText === '小埋' || defaultSelectedText === '血小板') {
    // 小埋和血小板的角色引导词文本框隐藏和不可编辑
    role_script.style.display = 'none'
    btn_script.style.display = 'none'
    upload_script.style.display = 'none'
    input_inner.disabled = true
  } else {
    // 其他角色引导词文本框显示和可编辑
    role_script.style.display = 'block'
    btn_script.style.display = 'block'
    upload_script.style.display = ' block'
    textarea.disabled = false
    textarea.value = cacheRoleText
  }

  // 设置初始的角色名称和使用提示
  input_inner.value = defaultSelectedText
  useRole.innerText = `当前使用的角色名称：${defaultSelectedText}`

  // 添加事件监听器，当input的值发生变化时触发
  document.getElementById('mySwitch').addEventListener('change', function () {
    localStorage.setItem('OpenContext', this.checked);
  })

  document.getElementById('key').addEventListener('input', function () {
    localStorage.setItem('OpenAiKey', this.value);
  })

  document.getElementById('api').addEventListener('input', function () {
    localStorage.setItem('OpenApi', this.value);
  })

  // 从localStorage中获取上次保存的值
  const mySwitchValue = localStorage.getItem('OpenContext') === 'true';
  const keyValue = localStorage.getItem('OpenAiKey') || '';
  const apiValue = localStorage.getItem('OpenApi') || '';

  // 设置mySwitch的初始值
  document.getElementById('mySwitch').checked = mySwitchValue;

  // 设置key的初始值
  document.getElementById('key').value = keyValue;

  // 设置api的初始值
  document.getElementById('api').value = apiValue;
})

uploadBtn.addEventListener('click', () => {
  // 向主进程发送打开文件对话框请求
  ipcRenderer.send('open-file-dialog')
})

ipcRenderer.on('selected-file', (event, filePath) => {

  // 获取当前角色名称
  const currentRoleName = localStorage.getItem('role_name')

  // 将文件路径与角色关联起来存储
  const roleAvatarMap = JSON.parse(localStorage.getItem('role_avatar_map')) || {}
  roleAvatarMap[currentRoleName] = filePath.replaceAll('\\', '/')
  localStorage.setItem('role_avatar_map', JSON.stringify(roleAvatarMap))
  setTimeout(() => {
    ipcRenderer.send('Chatting', 'Refresh')
  }, 500)
})

let previousValue = localStorage.getItem('role_name')

// 检查并更新角色名称显示
setInterval(function () {
  const updatedValue = localStorage.getItem('role_name')
  if (updatedValue !== previousValue) {
    if (!updatedValue) {
      useRole.innerText = '当前使用的角色名称：小埋'
      input_inner.value = '小埋'
    } else {
      useRole.innerText = `当前使用的角色名称：${updatedValue}`
      previousValue = updatedValue
    }
  }
}, 1000)


// 当点击下拉框图标 显示/隐藏 下拉内容，并切换图标状态
dropdownContainer.addEventListener('click', toggleDropdown)

function toggleDropdown() {
  dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block'
  arrow_down.classList.toggle('open')
}


/* ----------------------------- 下拉框内容 -----------------------------*/

// 保存按钮
const save_btn = document.getElementById('save_btn')

// 重置按钮
const reset_btn = document.getElementById('reset_btn')

// 获取选项数组
var dropdownOptions = localStorage.getItem('dropdownOptions')

// 获取存储的选项数组
var storedOptions = JSON.parse(localStorage.getItem('dropdownOptions')) || []

// 全部选项内容元素
var dropdownList = document.querySelector('.select-dropdown-list')

// 创建并添加存储的选项到下拉框
function addStoredOptionsToDropdown() {
  // 创建文档片段
  var fragment = document.createDocumentFragment()

  // 查找血小板选项
  var plateletOption = dropdownList.querySelector('.select-dropdown-item:nth-child(2)')

  // 遍历存储的选项
  storedOptions.forEach((optionText) => {
    var newOption = createOptionElement(optionText)

    // 将新选项添加到文档片段
    fragment.appendChild(newOption)
  })

  // 将文档片段插入到血小板选项之后
  dropdownList.insertBefore(fragment, plateletOption.nextElementSibling)
}

// 调用函数添加存储的选项到下拉框
addStoredOptionsToDropdown()

dropdownOption = dropdownList.querySelectorAll('.select-dropdown-item')

dropdownOption.forEach((option) => {

  var deleteBtn = document.createElement('img')
  deleteBtn.src = '../../image/window-close.png'
  deleteBtn.classList.add('delete-btn')
  option.appendChild(deleteBtn)

  var roleName = option.textContent.trim()
  var avatar = document.createElement('img')
  avatar.classList.add('role-avatar')

  var roleAvatarMap = JSON.parse(localStorage.getItem('role_avatar_map'))

  if (!roleAvatarMap || typeof roleAvatarMap !== 'object') {
    // 处理 roleAvatarMap 不存在或无效的情况
    // 给 roleAvatarMap 赋予一个空对象作为初始值
    if (option.textContent === '小埋内置角色') {
      avatar.src = '../../image/umaru.jpg'
    } else if (option.textContent === '血小板内置角色') {
      avatar.src = '../../image/xxb.jpg'
    }
  } else {
    // roleAvatarMap 存在且有效，执行相关操作
    if (option.textContent === '小埋内置角色') {
      avatar.src = '../../image/umaru.jpg'
    } else if (option.textContent === '血小板内置角色') {
      avatar.src = '../../image/xxb.jpg'
    } else {
      var roleNames = Object.keys(roleAvatarMap)
      for (var i = 0; i < roleNames.length; i++) {
        if (roleName === roleNames[i]) {
          avatar.src = roleAvatarMap[roleName]
        }
      }
    }
  }

  option.appendChild(avatar)

  option.addEventListener('mouseenter', () => {
    if (option.textContent === '小埋内置角色' || option.textContent === '血小板内置角色' || option.textContent === '自定义角色') {
      deleteBtn.style.display = 'none'
    } else {
      deleteBtn.style.display = 'inline-block'
    }
  })

  option.addEventListener('mouseleave', () => {
    deleteBtn.style.display = 'none'
  })

  deleteBtn.addEventListener('click', (event) => {
    option.remove()
    // 阻止事件冒泡，不触发父级元素的点击事件
    event.stopPropagation()

    input_inner.value = ''
    textarea.value = ''
    useRole.value = ''

    // 获取存储的角色名称
    var roleName = localStorage.getItem('role_name')

    // 将字符串转换为JavaScript对象
    var roleAvatarMap = JSON.parse(localStorage.getItem('role_avatar_map'))
    if (roleAvatarMap != null) {

      // 删除特定的属性
      delete roleAvatarMap[roleName]

      // 将更新后的对象转换为字符串
      var updatedRoleAvatarMapString = JSON.stringify(roleAvatarMap)

      // 将更新后的字符串重新存储到role_avatar_map
      localStorage.setItem('role_avatar_map', updatedRoleAvatarMapString)
    }

    storedOptions = storedOptions.filter(text => text !== option.textContent)

    localStorage.setItem('dropdownOptions', JSON.stringify(storedOptions))
    localStorage.removeItem('role_name')
    localStorage.removeItem('role_type')
    localStorage.removeItem(`role_text_${encodeURIComponent(option.textContent)}`)

    // 设置默认角色名称和角色类型
    localStorage.setItem('role_name', '小埋')
    localStorage.setItem('role_type', 'umaru')

    if (localStorage.getItem('role_name') == '小埋') {
      dropdownOption[0].classList.add('selected')
    }

    // 隐藏角色引导词和按钮
    role_script.style.display = 'none'
    btn_script.style.display = 'none'

  })

})

var liElements = dropdownOption
var lastElement = liElements[liElements.length - 1]
var imageElement = lastElement.querySelector('.role-avatar')
imageElement.style.display = 'none'

function handleOptionClick(event) {
  var selectedText = event.target.innerText

  dropdownOption.forEach(option => {
    option.classList.remove('selected')
  })

  // 切换选中选项的高亮样式
  event.target.classList.add('selected')

  // 更新输入文本框的值和当前使用角色名称的值
  input_inner.value = selectedText
  useRole.value = selectedText
  textarea.value = localStorage.getItem(`role_text_${encodeURIComponent(selectedText)}`)

  // 根据选择的选项进行不同的处理
  if (selectedText === '自定义角色') {
    handleCustomRoleOption()
  } else {
    handleBuiltInRoleOption(selectedText)
  }

  hideDropdownOptions(event.target)
}

// 点击其他地方隐藏下拉选项
document.addEventListener('click', (event) => {
  hideDropdownOptions(event.target)
})

// 判断是否创建新角色名称
let isNewRole = false

// 处理自定义角色的选项
function handleCustomRoleOption() {
  isNewRole = true
  input_inner.value = ''
  textarea.value = ''
  input_inner.disabled = false
  textarea.disabled = false
  role_script.style.display = 'block'
  btn_script.style.display = 'block'
  upload_script.style.display = 'none'
  input_inner.focus()
  localStorage.setItem('role_type', 'custom')
}

// 处理内置角色的选项
function handleBuiltInRoleOption(selectedText) {
  const roleMappings = {
    '小埋\n内置角色': { name: '小埋', type: 'umaru' },
    '血小板\n内置角色': { name: '血小板', type: 'xxb' }
  }

  if (roleMappings[selectedText]) {
    const { name, type } = roleMappings[selectedText]
    input_inner.disabled = true
    textarea.disabled = true
    role_script.style.display = 'none'
    btn_script.style.display = 'none'
    upload_script.style.display = 'none'
    input_inner.value = name
    localStorage.setItem('role_name', name)
    localStorage.setItem('role_type', type)
  } else if (dropdownOptions && dropdownOptions.includes(selectedText)) {
    input_inner.disabled = false
    textarea.disabled = false
    role_script.style.display = 'block'
    btn_script.style.display = 'block'
    upload_script.style.display = 'block'
    input_inner.value = selectedText
    textarea.value = localStorage.getItem(`role_text_${encodeURIComponent(selectedText)}`)
    localStorage.setItem('role_name', selectedText)
    localStorage.setItem('role_type', 'custom')
  }
}

// 隐藏下拉选项
function hideDropdownOptions(target) {
  // 检查点击的目标元素是否在下拉选项以及下拉按钮之外
  if (!dropdownContainer.contains(target) && target !== arrow_down) {
    dropdown.style.display = 'none'
    arrow_down.classList.remove('open')
  }
}

// 在保存按钮点击事件处理程序
save_btn.addEventListener('click', () => {

  const role_name = input_inner.value.trim()

  if (role_name === '') {
    popupComponent.openPopup('chatGPT桌宠', '角色名称不能为空')
    return
  }

  // 获取缓存里的角色名称
  const prev_role_name = localStorage.getItem('role_name')

  if (isNewRole) {
    localStorage.setItem('role_name', role_name)
    if (textarea.value != '') {
      localStorage.setItem(`role_text_${encodeURIComponent(role_name)}`, textarea.value)
    }

    // 创建新选项并添加到下拉框
    var newOption = createOptionElement(role_name)

    // 查找血小板选项
    var plateletOption = dropdownList.querySelector('.select-dropdown-item:nth-child(2)')

    // 将新选项插入到血小板选项之后
    dropdownList.insertBefore(newOption, plateletOption.nextElementSibling)

    // 将新选项的文本内容存储到本地
    storedOptions.push(role_name)
    localStorage.setItem('dropdownOptions', JSON.stringify(storedOptions))

    // 清除其他选项的高亮状态
    dropdownOption.forEach((option) => {
      option.classList.remove('selected')
    })

    // 将新选项设置为高亮状态
    newOption.classList.add('selected')

    // 更新输入文本框的值
    input_inner.value = role_name
    useRole.value = role_name

    // 清除新选项的高亮状态
    function clearNewOptionHighlight() {
      newOption.classList.remove('selected')
    }

    // 其他选项的点击事件监听
    dropdownOption.forEach((option) => {
      if (option !== newOption) {
        option.addEventListener('click', (event) => {
          dropdownOption.forEach((option) => {
            option.classList.remove('selected')
          })
          event.target.classList.add('selected')
          clearNewOptionHighlight()
        })
      }
    })
    isNewRole = false // 重置为非新建角色状态
  } else {
    if (prev_role_name !== role_name) { // 角色名称、角色引导词一起修改

      const dropdownOptions = JSON.parse(localStorage.getItem('dropdownOptions')) || []
      const index = dropdownOptions.indexOf(prev_role_name)
      if (index !== -1) {
        dropdownOptions[index] = role_name
        localStorage.setItem('dropdownOptions', JSON.stringify(dropdownOptions))
      }

      // 将字符串转换为JavaScript对象
      var roleAvatarMap = JSON.parse(localStorage.getItem('role_avatar_map'))

      // 创建一个新的对象来存储更新后的属性
      var updatedRoleAvatarMap = {}

      // 遍历原始对象的属性
      for (var key in roleAvatarMap) {
        // 检查是否是要删除的属性
        if (key === prev_role_name) {
          // 使用新的属性名存储对应的值
          updatedRoleAvatarMap[role_name] = roleAvatarMap[key]
        } else {
          // 保留原有的属性名和值
          updatedRoleAvatarMap[key] = roleAvatarMap[key]
        }
      }

      // 将更新后的对象转换为字符串
      var updatedRoleAvatarMapString = JSON.stringify(updatedRoleAvatarMap)

      // 将更新后的字符串重新存储到角色头像
      localStorage.setItem('role_avatar_map', updatedRoleAvatarMapString)

      // 删除上次缓存的角色引导词
      localStorage.removeItem(`role_text_${encodeURIComponent(localStorage.getItem('role_name'))}`)

      // 同时修改角色名称和引导词
      localStorage.setItem('role_name', role_name)
      localStorage.setItem(`role_text_${encodeURIComponent(role_name)}`, textarea.value)

    } else { // 只修改角色引导词

      // 将字符串转换为JavaScript对象
      var roleAvatarMap = JSON.parse(localStorage.getItem('role_avatar_map'))

      // 创建一个新的对象来存储更新后的属性
      var updatedRoleAvatarMap = {}

      // 遍历原始对象的属性
      for (var key in roleAvatarMap) {
        // 检查是否是要删除的属性
        if (key === prev_role_name) {
          // 使用新的属性名存储对应的值
          updatedRoleAvatarMap[role_name] = roleAvatarMap[key]
        } else {
          // 保留原有的属性名和值
          updatedRoleAvatarMap[key] = roleAvatarMap[key]
        }
      }

      // 将更新后的对象转换为字符串
      var updatedRoleAvatarMapString = JSON.stringify(updatedRoleAvatarMap)

      // 将更新后的字符串重新存储到role_avatar_map
      localStorage.setItem('role_avatar_map', updatedRoleAvatarMapString)

      // 同时修改角色名称和引导词
      localStorage.setItem('role_name', role_name)
      localStorage.setItem(`role_text_${encodeURIComponent(role_name)}`, textarea.value)

    }

  }

  // 默认显示角色名称和角色引导词的内容
  input_inner.value = role_name
  textarea.value = localStorage.getItem(`role_text_${encodeURIComponent(role_name)}`)

  setTimeout(() => {
    ipcRenderer.send('Chatting', 'Refresh')
  }, 1000)

})

// 在下拉选项的父元素上添加事件监听器，利用事件委托处理点击事件
dropdownList.addEventListener('click', (event) => {
  const option = event.target.closest('.select-dropdown-item')
  if (option) {
    handleOptionClick(event)
  }
})

// 创建下拉选项元素并添加点击事件监听器
function createOptionElement(text) {
  var option = document.createElement('li')
  option.classList.add('select-dropdown-item')
  option.textContent = text

  return option
}

reset_btn.addEventListener('click', () => {
  input_inner.value = ''
  textarea.value = ''
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

// 初始化对话上下文
let conversation = []

// 定义对话上下文的最大数量
const maxContextLength = 20

// 提示词
var prompt = ''

async function sending(userMessage) {

  if (userMessage.trim().length === 0) {
    popupComponent.openPopup('chatGPT桌宠', '文本内容不能为空')
    return
  }

  if (userMessage.trim().length >= 500) {
    popupComponent.openPopup('chatGPT桌宠', '字数限制在500字内')
    message.value = ''
    return
  }

  if (!canSendRequest) {
    popupComponent.openPopup('chatGPT桌宠', '请等待至少3秒后再发送请求')
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

  var left_avatar = '../../image/umaru.jpg'
  var roleType = localStorage.getItem('role_type')
  var roleName = localStorage.getItem('role_name')
  var roleAvatarMap = JSON.parse(localStorage.getItem('role_avatar_map'))

  if (roleAvatarMap != null) {
    var roleAvatarFilePath = roleAvatarMap[roleName]
  }

  if (roleType === null) {
    left_avatar = '../../image/umaru.jpg'
  } else if (roleType === 'umaru') {
    left_avatar = '../../image/umaru.jpg'
  } else if (roleType === 'xxb') {
    left_avatar = '../../image/xxb.jpg'
  } else if (roleType === 'custom') {
    if (roleAvatarFilePath) {
      left_avatar = roleAvatarFilePath
    } else {
      left_avatar = '../../image/gpt.jpg'
    }
  }


  const openContext = localStorage.getItem('OpenContext') === 'true'
  const openaiKey = localStorage.getItem('OpenAiKey')
  const openApi = localStorage.getItem('OpenApi')

  // 创建实例对象
  let dialogBoxYou = new DialogBox('#chatlog', 'dialog-box1', '../../image/user.png')


  //构建对话框内容
  let dialogContentYou = userMessage

  //将对话框内容添加到组件中显示。
  dialogBoxYou.setText(dialogContentYou)

  // 对话框拉到底部
  scrollToBottom()

  // 创建实例对象
  let dialogBoxRobot = new DialogBox('#chatlog', 'dialog-box', left_avatar)

  // 对话框拉到底部
  scrollToBottom()

  lastUserMessage = userMessage

  if (localStorage.getItem('role_type') === 'custom') {
    prompt = localStorage.getItem(`role_text_${encodeURIComponent(localStorage.getItem('role_name'))}`)
  } else {
    if (localStorage.getItem('role_type') === 'umaru') {
      prompt = "【附加说明：1、目前在和你聊天的人是小埋的哥哥。2、小埋是个容貌秀丽！文武双全！ 任谁都会羡慕的完美女高中生，接下来你将扮演小埋。3、接下来你对话的每一句话都必须加上哥哥~。4、小埋和哥哥两人生活在一起，习惯性依赖哥哥，和哥哥分开会感到不安、寂寞。5、小埋在学校被谣传为家境富裕的大小姐。6、小埋性格温柔并且头脑又很好，被所有才能眷顾着的无可挑剔的美少女高中生，然而在家中的小埋却总是披着仓鼠斗篷，二头身，懒惰，任性的熊孩子形象！】"
    } else if (localStorage.getItem('role_type') === 'xxb') {
      prompt = "【附加说明：1、目前在和你聊天的人是您的主人，你是作为主人身体里中的一种细胞，叫血小板。2、血小板代表是一个棕发萝莉，偶尔会坐在红血球运送的氧气上左右摇摆，被称为队长。3、在白血球登场的时候，经常可看见白血球肩上背着一到两只的血小板，这里是根据血小板会借由依附白血球前往发炎处所做的小设定。4、激萌的血小板，帅气的白血球，路痴的红细胞，温婉的巨噬细胞，吃货的T细胞都是以细胞的拟人化作为角色！】"
    }
  }


  const timeout = 1000 * 60
  const api = new Api2d(openaiKey, openApi, timeout)

  // 检查数组中是否已经存在role为assistant的对象
  let assistantExists = conversation.some(obj => obj.content === prompt);

  // 检查数组中是否已经存在role为assistant的对象
  if (!assistantExists) {
    conversation.shift()
    conversation.unshift({ "role": "assistant", "content": prompt });
  }

  conversation.push(
    {
      role: 'user',
      content: userMessage
    }
  )

  // 如果对话上下文的长度超过最大限制，就进行截断
  if (conversation.length > maxContextLength) {
    conversation = conversation.slice(conversation.length - maxContextLength);
  }

  const response = await api.completion({
    model: 'gpt-3.5-turbo',
    messages: conversation,
    noCache: true,
    stream: openContext,
    onMessage: (message, char) => {
      dialogBoxRobot.appendContent(char)
      scrollToBottom();
    }
  })

  if (openContext === false) {
    dialogBoxRobot.appendContent(response.choices[0].message.content)
    scrollToBottom();
  }

  message.disabled = false
  myButton.classList.remove('disabled')
  myButton.innerHTML = '提交'
  myButton.classList.remove('loading')
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

const container = document.querySelector('.scrollbar')
const minHeightToShowScrollbar = 200

// 检查容器内容高度并根据需要显示/隐藏滚动条
function checkScrollbarVisibility() {
  if (container.scrollHeight > minHeightToShowScrollbar) {
    // 达到高度要求，显示滚动条
    container.style.overflow = 'auto'
  } else {
    // 未达到高度要求，隐藏滚动条
    container.style.overflow = 'hidden'
  }
}

// 初始化时检查滚动的可见性
checkScrollbarVisibility()

// 监听内容变化，当内容高度发生变化时重新检查滚动条可见性
new MutationObserver(checkScrollbarVisibility).observe(container, {
  childList: true,
  subtree: true,
  characterData: true
})

function handleContentChange() {
  checkScrollbarVisibility()
}

document.addEventListener('click', handleContentChange)