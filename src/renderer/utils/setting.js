const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
window.$ = window.jQuery = require('../utils/jquery.min.js')

showItem()

function showItem () {

  vitsShow()
  live2dShow()
}

async function vitsShow () {

  var text = ''
  
  const res = await fetch('http://soundai.natapp1.cc/vits/getAllMod',
  {
    method: 'get',
    headers: {
      'uId': '3014085426',
      'token': 'ef60cc9e-ab8f-463f-93dd-9969e7109f5b'
    }
  })
  var result = await res.json()

  for (var index in result.data) {
    console.log(result.data[index].title)
    text += `<option class="option" value="${index}">${result.data[index].title}</option>`
  }

  $('#vits-show').html(text)
}

function live2dShow () {
  var text = ''
  var index = 0
  var live2dPath = path.join(__dirname, '../../../model/')
  let files = fs.readdirSync(live2dPath)
  for (var item in files) {
    let stat = fs.statSync(live2dPath + files[item])
    if (stat.isDirectory()) {
      text += `<option class="option" value="${index}">${files[item]}</option>`
      index++
    }
  }

  $('#live2d-show').html(text)
}

$('#live2d-show').on('change', () => {
  var live2d_text = $('#live2d-show option:selected').text()
  var live2d_val = $('#live2d-show option:selected').val()
  ipcRenderer.send('changeLive2d', [live2d_text, live2d_val])
})


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

modelSettingTab.addEventListener('click', () => {
  versionInfo.style.display = 'none'
  modelSetting.style.display = 'block'
  highlight.style.left = '115px'
  highlight.style.width = '70px'
})

window.onload = function () {
  var package = require('../../../package.json')
  const app_version = document.getElementById('app_version')
  const node_version = document.getElementById('node_version')
  const chrome_version = document.getElementById('chrome_version')
  const electron_version = document.getElementById('electron_version')

  app_version.innerText = package.name + ' v' + package.version
  node_version.innerText = process.versions['node']
  chrome_version.innerText = process.versions['chrome']
  electron_version.innerText = process.versions['electron']  
}
