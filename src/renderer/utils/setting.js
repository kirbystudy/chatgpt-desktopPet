const { ipcRenderer } = require('electron')
const slider = document.querySelector('.slider-input');
const value = document.querySelector('.slider-value');
var settingBtn = document.getElementById('settingBtn') 

settingBtn.addEventListener('click', () => {
  localStorage.setItem('settingBtn', slider.value)
  ipcRenderer.send('MainPage', 'refresh')
})

slider.addEventListener('input', (e) => {
  value.textContent = e.target.value;
})

