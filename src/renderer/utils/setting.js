const { ipcRenderer } = require('electron')
// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')
window.$ = window.jQuery = require('../utils/jquery.min.js')


// 读取config.json
const configPath = path.resolve(__dirname, '../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const config = JSON.parse(jsonContent)

// showItem()

// function showItem() {
//   live2dShow()
// }


// function live2dShow() {
//   var text = ''
//   var index = 0
//   var live2dPath = path.join(__dirname, '../../../model/')
//   let files = fs.readdirSync(live2dPath)
//   for (var item in files) {
//     let stat = fs.statSync(live2dPath + files[item])
//     if (stat.isDirectory()) {
//       text += `<option class="option" value="${index}">${files[item]}</option>`
//       index++
//     }
//   }

//   $('#live2d-show').html(text)
// }

// $('#live2d-show').on('change', () => {
//   var live2d_text = $('#live2d-show option:selected').text()
//   var live2d_val = $('#live2d-show option:selected').val()
//   ipcRenderer.send('changeLive2d', [live2d_text, live2d_val])
// })


const versionInfoTab = document.getElementById('versionInfoTab')
const modelSettingTab = document.getElementById('modelSettingTab')
const versionInfo = document.getElementById('versionInfo')
const modelSetting = document.getElementById('modelSetting')
const highlight = document.getElementById('highlight')

versionInfoTab.addEventListener('click', () => {
  versionInfo.style.display = 'block'
  modelSetting.style.display = 'none'
  highlight.style.left = '15px'
  highlight.style.width = '70px'
})

// modelSettingTab.addEventListener('click', () => {
//   versionInfo.style.display = 'none'
//   modelSetting.style.display = 'block'
//   highlight.style.left = '115px'
//   highlight.style.width = '70px'
// })

const feedbackBtn = document.getElementById('feedback_button')

// 发送内容
var message = document.getElementById('feedback_content')
const wordCount = document.getElementById('wordCount')
const clearText = document.getElementById('clear_text')

message.addEventListener('input', () => {
  const count = message.value.length
  wordCount.textContent = count
})

clearText.addEventListener('click', () => {
  message.value = ''
  wordCount.textContent = 0
})

feedbackBtn.addEventListener('click', () => {
  const count = message.value.length
  if (count > 200) {
    openPopup('秋蒂桌宠', '字数超过了200字')
  }
  var str = message.value

  if (str.length == 0) {
    openPopup('秋蒂桌宠', '留言内容不能为空!')
  }

  if (str.length > 0) {
    const formData = new FormData();
    formData.append('content', str);

    fetch(`${config.feedBack.url}`, {
      method: 'POST',
      body: formData
    })
      .then(response => {
        // 处理响应
        return response.text()
      })
      .then(response => {
        if (response == 'SUCCESS') {
          openPopup('秋蒂桌宠', '感谢您的留言!')
        }
        message.value = ''
        wordCount.textContent = 0
      })
      .catch(error => {
        // 处理错误
        console.log(error)
      });
  }
})

window.onload = function () {
  var package = require('../../../package.json')
  const app_version = document.getElementById('app_version')
  app_version.innerText = 'v' + package.version
}
