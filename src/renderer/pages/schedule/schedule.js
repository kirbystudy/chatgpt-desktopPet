const ipcRenderer = require('electron').ipcRenderer

var courseList = [];

// 这部分到时候保持之前周一到周五不变的数据，增加周六日的，逻辑需要改
var courseListOther = [];
var week = window.innerWidth > 360 ? ['周一', '周二', '周三', '周四', '周五'] :
    ['一', '二', '三', '四', '五'];
var day = new Date().getDay();
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
    [{ index: '15', name: '23:30' }, 1]
];
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
];
var Timetable = null;

$(function () {
    $.get('http://osu.natapp1.cc/qd/sch', function (resp) {
        var data = JSON.parse(resp);
        for (let w = 1; w <= 7; w++) {
            var c = data[w + ""];
            var we = [];
            for (let i = 0; i < 15; i++) {
                we.push(c[i].content)
            }
            if (w <= 5) {
                courseList.push(we);
                courseListOther.push(we);
            } else {
                courseListOther.push(we);
            }
        }

        // 实例化(初始化课表)
        Timetable = new Timetables({
            el: '#coursesTable',
            timetables: courseList,
            week: week,
            timetableType: courseType,
            highlightWeek: day,
            gridOnClick: function (e) {
                var num = e.index - 1;
                //var test = JSON.stringify(wType[num]);
                //alert(test);
                // alert(e.name + '  ' + e.week + ' ' + wType[num].name);
                
                openPopup('秋蒂桌宠', e.name + ' ' +  e.week + ' ' + wType[num].name)
                console.log(e);
            },
            styles: {
                Gheight: 50
            }
        });

    })
});


//切换课表
function onChange() {

    Timetable.setOption({
        timetables: courseListOther,
        week: ['一', '二', '三', '四', '五', '六', '日'],
        styles: {
            palette: ['#dedcda', '#ff4081']
        },
        timetableType: courseType,
        gridOnClick: function (e) {
            var num = e.index - 1;
            //var test = JSON.stringify(wType[num]);
            //alert(test);
            openPopup('秋蒂桌宠', e.name + ' 周' +  e.week + ' ' + wType[num].name)
            console.log(e);
        }
    });
};


(function () {
    $('#close_btn').on('click', () => {
        ipcRenderer.send('closeSchedule', 'Close')
    })
})()