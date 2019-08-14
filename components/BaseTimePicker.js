const date = new Date()
const years = []
const months = []
const days = []
const hours = []
const minutes = []
for (let i = 2017; i <= date.getFullYear() + 6; i++) {
    years.push(i)
}
for (let i = 1; i <= 12; i++) {
   if(i<10)
   i="0"+i
    months.push(i)
}
for (let i = 1; i <= 31; i++) {
  if (i < 10)
    i = "0" + i
    days.push(i)
}
for (let i = 0; i < 24; i++) {
    hours.push(i)
}
for (let i = 0; i < 60; i++) {
    minutes.push(i)
}

// 平润年
let isLeapYear = (year) => {
    return (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0);
}
// 大小月
let isShortMonth = (month) => {
    return [4, 6, 9, 11].indexOf(month) > -1;
}

// 不同月份天数
let getMonthEndDay = (year, month) => {
    if (isShortMonth(month)) {
        return 30;
    } else if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
    } else {
        return 31;
    }
}
Component({
    properties: {
        isTimePicker: {
            type: Boolean,
            value: false,
            observer(newVal, oldVal) {
                if(!newVal) return  // false时不改变 initValue的值                
                if(this.data.timerValueArr[this.data.timerValueArrIdx]) {
                    this.setData({                    
                        initValue: this.data.timerValueArr[this.data.timerValueArrIdx].timerIdxArr                  
                    })
                }  else {                
                    this.setData({                    
                        initValue: this._initValue           
                    })             
                }       
            }
        },
        timerValueArrIdx: { // 选择多个时间的序号
            type: Number,
            value: 0
        }
    },
    data: {
        years: years,    
        months: months,
        days: days,    
        hours: hours,
        minutes: minutes,
        initValue: [], // 初始化的pick序号
        chooseValue: [], // pick变化时保存的序号，取值用
        timerValueArr: [] // 选中的时间数组
    },
    ready() {
        let date = new Date();
        let year = date.getFullYear();
        
        let month =(date.getMonth() + 1);
      if (month<10)
        month="0"+month;
        let day =date.getDate();
      if (day < 10)
        day = "0" + day;
        let hour = date.getHours();
        let minute = date.getMinutes();
        this.setData({
            initValue: [years.indexOf(year), months.indexOf(month), days.indexOf(day), hours.indexOf(hour), minutes.indexOf(minute)]
        })
        this._initValue = this.data.initValue
    },
    methods: {
        timerPickerChangeHander(e) {
            let valueIndex = e.detail.value;
            console.log(years[valueIndex[0]], months[valueIndex[1]])
            this.setData({
                chooseValue: e.detail.value
            })
          
            console.log(days.slice(0, getMonthEndDay(years[valueIndex[0]], Number(months[valueIndex[1]]))))
            this.setData({
                days: days.slice(0, getMonthEndDay(years[valueIndex[0]], Number(months[valueIndex[1]])))
            })
        },
        cancel() {       
            this.triggerEvent('timerpickercancel') // 取消选择器
        },
        confirm(e) {
            let val = this.data.chooseValue.length > 0 ? this.data.chooseValue : this.data.initValue;
            let getDate = years[val[0]] + '-' + months[val[1]] + '-' + days[val[2]] + ' ' + hours[val[3]] + ':' + (minutes[val[4]] < 10 && '0' + minutes[val[4]] || minutes[val[4]]);
            let _timerValueArr = this.data.timerValueArr
            _timerValueArr[this.data.timerValueArrIdx] = {
                timerStr: getDate, // 选中的时间字符串
                timerIdxArr: val // 保存再次打开选择器的时间序号
            }
            this.setData({            
                timerValueArr: _timerValueArr,
                chooseValue: [] // 重置选中
            })

            this.triggerEvent('timerpickerconfirm', _timerValueArr) // 传值给父组件
           
        }
    }
})
