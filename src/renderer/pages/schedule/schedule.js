const ipcRenderer = require('electron').ipcRenderer
const path = require('path')

var courseListOther = []

// 获取当前日期时间
let date = new Date()

// 获取当前日期
let weekDay = date.getDay()

// 计算本周周一到周日的日期
let monday = new Date(
  date.getTime() - (weekDay === 0 ? 6 : weekDay - 1) * 24 * 60 * 60 * 1000
) // 本周周一的日期
let tuesday = new Date(monday.getTime() + 1 * 24 * 60 * 60 * 1000) // 本周周二的日期
let wednesday = new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000) // 本周周三的日期
let thursday = new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000) // 本周周四的日期
let friday = new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000) // 本周周五的日期
let saturday = new Date(monday.getTime() + 5 * 24 * 60 * 60 * 1000) // 本周周六的日期
let sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000) // 本周周日的日期

let num1 = monday.getMonth() + 1 + '/' + monday.getDate()
let num2 = tuesday.getMonth() + 1 + '/' + tuesday.getDate()
let num3 = wednesday.getMonth() + 1 + '/' + wednesday.getDate()
let num4 = thursday.getMonth() + 1 + '/' + thursday.getDate()
let num5 = friday.getMonth() + 1 + '/' + friday.getDate()
let num6 = saturday.getMonth() + 1 + '/' + saturday.getDate()
let num7 = sunday.getMonth() + 1 + '/' + sunday.getDate()

var week = [
  `周一\n${num1}`,
  `周二\n${num2}`,
  `周三\n${num3}`,
  `周四\n${num4}`,
  `周五\n${num5}`,
  `周六\n${num6}`,
  `周日\n${num7}`,
]
var courseType = [
  [{ index: '1', name: '8:30' }, 1],
  [{ index: '2', name: '9:30' }, 1],
  [{ index: '3', name: '10:30' }, 1],
  [{ index: '4', name: '11:30' }, 1],
  [{ index: '5', name: '12:30' }, 1],
  [{ index: '6', name: '14:30' }, 1],
  [{ index: '7', name: '15:30' }, 1],
  [{ index: '8', name: '16:30' }, 1],
  [{ index: '9', name: '17:30' }, 1],
  [{ index: '10', name: '18:30' }, 1],
  [{ index: '11', name: '19:30' }, 1],
  [{ index: '12', name: '20:30' }, 1],
  [{ index: '13', name: '21:30' }, 1],
  [{ index: '14', name: '22:30' }, 1],
  [{ index: '15', name: '23:30' }, 1],
]
var wType = [
  { index: '1', name: '8:30' },
  { index: '2', name: '9:30' },
  { index: '3', name: '10:30' },
  { index: '4', name: '11:30' },
  { index: '5', name: '12:30' },
  { index: '6', name: '14:30' },
  { index: '7', name: '15:30' },
  { index: '8', name: '16:30' },
  { index: '9', name: '17:30' },
  { index: '10', name: '18:30' },
  { index: '11', name: '19:30' },
  { index: '12', name: '20:30' },
  { index: '13', name: '21:30' },
  { index: '14', name: '22:30' },
  { index: '15', name: '23:30' },
]
var Timetable = null

$(function () {
  $.get('http://osu.natapp1.cc/qd/sch', function (resp) {
    var data = JSON.parse(resp)
    for (let w = 1; w <= 7; w++) {
      var c = data[w + '']
      var we = []
      for (let i = 0; i < 15; i++) {
        we.push(c[i].content)
      }
      if (w <= 5) {
        courseListOther.push(we)
      } else {
        courseListOther.push(we)
      }
    }

    // 实例化(初始化课表)
    Timetable = new Timetables({
      el: '#coursesTable',
      timetables: courseListOther,
      week: week,
      timetableType: courseType,
      highlightWeek: weekDay,
      gridOnClick: function (e) {
        var num = e.index - 1
        showMessage(
          `${e.name + '' + e.week.split('\n')[0] + ' ' + wType[num].name}`,
          'success'
        )
      },
      styles: {
        Gheight: 50,
      },
    })
  })
})
