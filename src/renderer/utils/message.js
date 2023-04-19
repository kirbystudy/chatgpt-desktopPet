function showMessage (text, timeout) {

  if (Array.isArray(text)) {
    text = text[Math.floor(Math.random() * text.length + 1) - 1]
  }
  $('.message').stop()
  $('.message').html(text).fadeTo(200, 1)
  if (timeout == null) {
    timeout = 5000
  }
  hideMessage(timeout)
}

function hideMessage (timeout) {
  $('.message').stop().css('opacity', 1)
  if (timeout == null) {
    timeout = 5000
  }
  $('.message').delay(timeout).fadeTo(200, 0)
}

function showHitokoto () {
  $.getJSON('https://v1.hitokoto.cn/', (res) => {
    showMessage(res.hitokoto, 5000)
  })
}

function init () {
  if ($('#msg').is(':hidden')) {
    $('#msg').css('display', 'block')
  } else {
    $('#msg').css('display', 'none')
  }
}

window.setInterval(showHitokoto, 20000)

showHitokoto()