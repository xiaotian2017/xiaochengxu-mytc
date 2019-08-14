var util = require("../utils/util");
function initetime(that){

  var date = new Date()
  gettime(date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), that)
}
function gettime(month, day, hour, minte, that) {
  var date = new Date()
  var years = []
  var months = []
  var days = []
  var hours = []
  var mintes = []

  var multiArray = [[], [], [], [], []]
  var multiArray2 = [[], [], [], [], []]
  for (let i = date.getFullYear(); i <= date.getFullYear() + 1; i++) {
    multiArray[0].push(i + "年")
    multiArray2[0].push(i)
  }

  for (let i = month; i <= 12; i++) {
    if (i >= 10) {
      multiArray[1].push(i + "月")
      multiArray2[1].push(i)
    }
    else {
      multiArray[1].push("0" + i + "月")
      multiArray2[1].push("0" + i)
    }
  }

  for (let i = day; i <= 31; i++) {
    if (i >= 10) {
      multiArray[2].push(i + "日")
      multiArray2[2].push(i)
    }
    else {

      multiArray[2].push("0" + i + "日")
      multiArray2[2].push("0" + i)
    }
  }

  for (let i = hour; i < 24; i++) {
    if (i >= 10) {
      multiArray[3].push(i + "时")
      multiArray2[3].push(i)
    }
    else {
      multiArray[3].push("0" + i + "时")
      multiArray2[3].push("0" + i)
    }
  }
  for (let i = minte; i < 60; i++) {
    if (i >= 10) {
      multiArray[4].push(i + "分")
      multiArray2[4].push(i)
    }
    else {
      multiArray[4].push("0" + i + "分")
      multiArray2[4].push("0" + i)
    }
  }

  that.setData({
    multiArray: multiArray,
    multiArray2: multiArray2
  })
}
function bindMultiPickerChange(e, that) {
  var indexs = e.detail.value
  var multarray = that.data.multiArray2
  var mulindex = that.data.mulindex
  mulindex[0] = multarray[0][indexs[0]]
  mulindex[1] = multarray[1][indexs[1]]
  mulindex[2] = multarray[2][indexs[2]]
  mulindex[3] = multarray[3][indexs[3]]
  mulindex[4] = multarray[4][indexs[4]]
  var multime = multarray[0][indexs[0]] + "-" + multarray[1][indexs[1]] + "-" + multarray[2][indexs[2]] + " " + multarray[3][indexs[3]] + ":" + multarray[4][indexs[4]]
  that.setData({
    multimes: multime,
    pctime: multime,
    mulindex: mulindex,
  })
}
function bindMultiPickerColumnChange(e, that) {
  var col = e.detail.column
  var row = e.detail.value

  var date = new Date()
  var multarray = that.data.multiArray2
  var value = multarray[col][row]
  var mulindex = that.data.mulindex
  mulindex[col] = value

  if (mulindex[0] > date.getFullYear()) {
    gettime(1, 1, 0, 0, that)
    return
  }

  if (mulindex[1] > date.getMonth() + 1) {
    gettime(date.getMonth() + 1, 1, 0, 0, that)
    return
  }

  if (mulindex[2] > date.getDate()) {
    gettime(date.getMonth() + 1, date.getDate(), 0, 0, that)
    return
  }

  if (mulindex[3] > date.getHours()) {
    gettime(date.getMonth() + 1, date.getDate(), date.getHours(), 0, that)
    return
  }

  initetime(that)
}


module.exports = {
  initetime: initetime,
  gettime: gettime,
  bindMultiPickerChange: bindMultiPickerChange,
  bindMultiPickerColumnChange: bindMultiPickerColumnChange,
};