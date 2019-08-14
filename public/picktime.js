var util = require("../utils/util");
const date = new Date()
const years = []
const months = []
var  days = []
const ours = []
const minues = []
const value = []
var indexy = 0
for (let i = 1990; i <= date.getFullYear() ; i++) {
    years.push(i)
    if (i == date.getFullYear()) {
        value.push(indexy)
    }
    indexy++
}

var indexm = 0
for (let i = 1; i <= 12; i++) {
    if (i.toString().length == 1) {
        i = '0' + i
    }
    months.push(i)
    if (i == date.getMonth() + 1) {
        value.push(indexm)
    }
    indexm++
}
var indexd = 0
for (let i = 1; i <= 31; i++) {
  if (i.toString().length == 1) {
    i = '0' + i
  }
    days.push(i)
    if (i == date.getDate()) {
        value.push(indexd)
    }
    indexd++
}

var indexo = 0
for (let i = 1; i <= 23; i++) {
  if (i.toString().length == 1) {
    i = '0' + i
  }
    ours.push(i)
    if (i == date.getHours()) {
        value.push(indexo)
    }
    indexo++
}

var indexmi = 0
for (let i = 0; i < 60; i++) {
  if (i.toString().length == 1) {
    i = '0' + i
  }
    minues.push(i)
    if (i == date.getMinutes() + 1) {
        value.push(indexmi)
    }
    indexmi++
}
function inite(that) {
    that.setData({
        alltime: [],
        hidden: 0,
        conditiontime: true,
        years: years,
        year: date.getFullYear(),
        months: months,
        month: date.getMonth() + 1,
        days: days,
        day: date.getDate(),
        ours: ours,
        our: date.getHours(),
        minues: minues,
        minue: date.getMinutes() + 1,
        value: value,
    })
}

function bindMultiPickerChange(e, that) {
    const val = e.detail.value
  
    that.data.value = val
    clickOk(that)
  
}
function clickOk(that) {
    var alltime = that.data.alltime
    alltime[that.data.timeindex] = years[that.data.value[0]] + '年' + months[that.data.value[1]] + '月' + days[that.data.value[2]] + '日' + ours[that.data.value[3]] + '时' + minues[that.data.value[4]] + '分'
    //重置days
    days=[]
    var dayarr=getMonthDays(that.data.value[0])
    var howdays = dayarr[that.data.value[1]]
    for (let i = 1; i <= howdays; i++) {
      if (i.toString().length == 1) {
        i = '0' + i
      }
      days.push(i)
      }
    that.setData({
      days: days,
    })
    that.setData({
        year: years[that.data.value[0]],
        month: months[that.data.value[1]],
        day: days[that.data.value[2]],
        our: ours[that.data.value[3]],
        minue: minues[that.data.value[4]],
        alltime: alltime
    })
}
// 时间选择器确定按钮
function timesure(e, that) {
    that.setData({ conditiontime: !that.data.conditiontime, condition: !that.data.condition, hidden: 1 })
    console.log(e)
}
// 时间选择器取消按钮
function timecancel(that) {
    that.setData({ conditiontime: !that.data.conditiontime, condition: !that.data.condition })
}
// 获取当年每月的天数
function getMonthDays(year) {
  var leapYearDay = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 1 : 0;
  return [31, 28 + leapYearDay, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
};
module.exports = {
    inite: inite,
    timesure: timesure,
    timecancel: timecancel,
    clickOk: clickOk,
    // postHidden: postHidden,
    bindMultiPickerChange: bindMultiPickerChange,
};