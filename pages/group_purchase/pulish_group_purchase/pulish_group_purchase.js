let uploadimg = require("../../../utils/uploadImgenew.js");
let { httpClient, vzNavigateTo } = require("../../../utils/util.js");
const addr = require("../../../utils/addr.js");
const host = addr.HOST;
const regeneratorRuntime = require('../../../utils/runtime');
let getList = (url, param, method) => httpClient({ host, addr: url, data: param,method })
let app = getApp()
let addVoucher = (p) => httpClient({ host, addr: 'IBaseData/AddVoucher', data: p });
const groupInput = [{
    "tagName": "团购名",
    "type": "text",
    "tips": "请填写团购名称"
}, {
    "tagName": "团购价格",
    "type": "digit",
    "tips": "请填写团购价格"
}, {
    "tagName": "单买价格",
    "type": "digit",
    "tips": "请填写单买价格"
}, {
    "tagName": "原价",
    "type": "digit",
    "tips": "请填写原价"
}, {
    "tagName": "团长减价",
    "type": "digit",
    "tips": "请填写团长减价价格"
}, {
    "tagName": "成团人数",
    "type": "number",
    "tips": "请填写拼团成团人数"
}, {
    "tagName": "生成数量",
    "type": "number",
    "tips": "请填写拼团的商品数量"
}]
const pickerTime = [{
    "pickerName": '购买开始的时间'
}, {
    "pickerName": '购买结束的时间'
}, {
    "pickerName": '使用截止时间'
}, {
    "pickerName": '使用开始时间'
}, {
    "pickerName": '使用结束时间'
}]
//时分补0
let formatTime = (num) => {
    return num >= 10 ? num : '0' + num
}
let modifyTimestamp = (time) => {    
    time = time.replace(/\+0800/,'')    
    let modifyTime = /\((\d+)\)/.exec(time)
    console.log(modifyTime)
    return parseInt(modifyTime[1])
}
//时间选择器
let timePicker = () => {
    let date, years = [], months = [], days = [], hours = [], minutes = []
    let time = new Date().getFullYear()
    for (let i = 0; i < 60; i++) {
        if (i < 10) {
            years[i] = time + i
        }
        if (i < 12) {
            months[i] = i + 1
        }
        if (i < 31) {
            days[i] = i + 1
        }
        if (i < 24) {
            hours[i] = i
            hours[i] = formatTime(hours[i])
        }
        minutes[i] = i
        minutes[i] = formatTime(minutes[i])
    }
    return date = [
        years,
        months,
        days,
        hours,
        minutes
    ]
}
const timePickerArr = timePicker()
// 平闰年
let isLeapYear = year => {
    return (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0)
}
// 大小月
let isShortMonth = month => {
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
//获取当前时间
let getCurrentTime = (timeStamp) => {
    let currentTime
    let year = timeStamp.getFullYear()
    let month = timeStamp.getMonth() + 1
  
    let day = timeStamp.getDate()
    let hour = timeStamp.getHours()
    let minute = timeStamp.getMinutes()
    return currentTime = [
        year,
        month,
        day,
        hour,
        minute
    ]
}
// 初始化时间
let initCurrentTime = (timeStamp) => {
    let timesMultiArr = []
    let currentTime = getCurrentTime(timeStamp)
    timePickerArr.forEach((key, index) => {
        timesMultiArr[index] = key.findIndex(val => {
            return currentTime[index] == val
        })
    })
    return timesMultiArr
}
//打印时间
let printTime = (arr, multiArr,addone=0) => {
  let year = arr[0][multiArr[0]]
  let month = arr[1][multiArr[1]] + addone
  if(month==13)
  {
    month=1
    year+=1
  }
  let day = arr[2][multiArr[2]]
  let ymd = [year, month, day].join('/')

  return ymd+ ' ' + [arr[3][multiArr[3]], arr[4][multiArr[4]]].join(':')
}
// 限制购买数量
let limit = () => {
    let arr = []
    for (let i = 0; i < 20; i++) {
        arr[i] = i + 1
    }
    arr.unshift('不限')
    let limitArr = arr
    return limitArr
}
const limitArr = limit()
//修正价格
let prefixPrice = (price) => {
    return price * 1000 / 100000
}
Page({
    data: {
      gid:0,
        groupId: 0,
        groupInput,//输入框结构
        pickerTime, //格式化时间
        limitArr,
        description: '', //商品描述
        limitIndex: 0,
        validPhone: true, //是否要验证电话号码
        uploadimgobjects: {
            "sliderShow": {// 主轮播图
                config: {
                    maxImageCount: 9,
                    images_full: false,
                    imageUpdateList: [], //编辑时新增的
                    imageList: [],
                    imageIdList: [] //用来删除图片
                }
            },
            "goodsDecri": {//商品描述
                config: {
                    maxImageCount: 9,
                    images_full: false,
                    imageUpdateList: [],//编辑时新增的
                    imageList: [],
                    imageIdList: [] //用来删除图片
                }
            }
        },
        isVoucher: false,
        voucherPrice: '',
        voucherNum: '',
        voucherScopeIdx: 1,
        fullSubtraction: '',
        voucherBeginDate: '不填视为立即可用',
        voucherBeginTime: '',
        voucherEndDate: '不填视为长期可用',
        voucherEndTime: '',
        voucherValidDay: '',
      distribution: '',
      isShowDistribution: false,    
    },
    onLoad(options) {
        let that = this
        that.initInputVal() // 初始化输入框值
        that.initTimesPicker() // 初始化时间选择器
        that.isEdit(options)  //是编辑还是发布
        app.getUserInfo((userInfo) => {
            that.setData({
                openid: userInfo.openId
            })
            let { r } = { ...that.data }
            r ? that.edit() : that.showCurrentTimes()
        })
    },
    //判断是否编辑
    isEdit(options) {
       
        let that = this
        if (Object.keys(options).length == 3) {
            that.setData({
                storeid: options.storeId,
                gid: options.gid,
                r: options.r
            })
        } else {
            that.setData({
                storeid: options.storeId
            })
        }
    },
    //上传图片
    uploadLogoImg: function (e) {
        let that = this
        let { groupid } = { ...e.currentTarget.dataset }
        wx.showLoading({
            title: '开始上传'
        })
        uploadimg.shopChooseImage(e, that);
    },
    //清除图片
    clearImage: function (e) {
        let that = this
        const { which } = { ...e.currentTarget.dataset }
        //轮播图清除
        if (which == "sliderShow" || which == 'goodsDecri') {
            uploadimg.shopclearImage(e, this);
        } else {
            let configs = that.data.uploadimgobjects
            let index = e.currentTarget.dataset.which
            let currentItem = configs[index]
            currentItem.config.imageList.splice(index, 1);
            currentItem.config.images_full = false;
            that.setData({
                "uploadimgobjects": configs
            })
        }
    },
    //初始化输入框
    initInputVal() {
        let that = this, inputVal = {}
        groupInput.forEach((key, index) => {
          var setV=''
         
          if (key.tagName=="成团人数")
          {
            setV=2
          }
          if (key.tagName == "生成数量") {
            setV = 20;
          }
          Reflect.set(inputVal, "val" + index, setV)
        })
        that.setData({
            inputVal
        })
    },
    //时间选择器赋值当前时间
    showCurrentTimes() {
        let that = this
        let { multiIndex, pickeTime } = { ...that.data }
        multiIndex.forEach((key, index) => {
            var addone=0
            if (index == 1 || index ==2)
            {
              addone=1
            }
            multiIndex[index] = initCurrentTime(new Date()) //索引
            pickeTime[index] = index < 3 ? printTime(timePickerArr, multiIndex[index], addone) : '' //打印时间
        })
        pickeTime[3] = '不填视为立即可用'
        pickeTime[4] = '不填视为长期可用'
        that.setData({
            multiIndex,
            pickeTime
        })
    },
    //初始化时间选择器
    initTimesPicker() {
        let that = this, timesMultiArr = [], multiIndex = [], pickeTime = []
        pickerTime.forEach((key, index) => {
            timesMultiArr[index] = timePickerArr
            multiIndex[index] = [0, 0, 0, 0, 0]
            pickeTime[index] = ''
        })
        that.setData({
            timesMultiArr, //时间选择器
            multiIndex, //选择器索引
            pickeTime  //选择的时间
        })
    },
    //时间选择器
    timesChange(e) {
        let that = this, chooseTime
        const { num } = { ...e.currentTarget.dataset }
        const { value } = { ...e.detail }
        //时间选择器数组 索引 格式化时间
        let { timesMultiArr, multiIndex, pickeTime } = { ...that.data }
        timesMultiArr = timesMultiArr[num] //当前第几个数组
        // 判断月份天数
        that.modifyTime(timesMultiArr[0][value[0]], timesMultiArr[1][value[1]], num).then(() => {
            //改变索引
            multiIndex[num] = value
            chooseTime = printTime(timePickerArr, multiIndex[num])
            //     if(new Date(chooseTime).getTime() < new Date().getTime()){
            //         app.ShowMsg(pickerTime[num].pickerName+`不能小于当前时间`)
            //     return 
            // }
            that.setData({
                [`multiIndex[${num}]`]: multiIndex[num],
                [`pickeTime[${num}]`]: chooseTime
            })
        })
    },
    //时间选择器变更时间
    timesColumnChange(e) {
        let that = this
        const { num } = { ...e.currentTarget.dataset }
        const { column, value } = { ...e.detail }
        let { timesMultiArr, multiIndex, pickeTime } = { ...that.data }
        timesMultiArr = timesMultiArr[num] //当前数组
        multiIndex = multiIndex[num] //当前索引
        if (column <= 1) {
            that.setData({
                [`multiIndex[${num}][${column}]`]: value
            })
            that.modifyTime(timesMultiArr[0][multiIndex[0]], timesMultiArr[1][multiIndex[1]], num)
        }
    },
    //修正日历天数
    async modifyTime(year, month, num) {
        let that = this, day = Array.from(timePickerArr[2])
        let { timesMultiArr } = { ...that.data }
        day.splice(getMonthEndDay(year, month), day.length)
        that.setData({
            [`timesMultiArr[${num}][${2}]`]: day
        })
    },
    //获得Input输入框的值
    getValue(e) {
        const { index } = { ...e.currentTarget.dataset }
        let val = e.detail.value.trim()
        let that = this, reg = /\d+(\.\d{1,2})?/g
        if (index == 5 || index == 6) {
            val = parseInt(val)
            that.setData({
                ['inputVal.val' + index]: val
            })
            return
        }
        if (index >= 1) {
            if (![...val].includes('.')) {
                val = val.replace(/^0+/, 0)
                if (val.length > 1) {
                    let numIndex = [...val].findIndex((num) => {
                        return num === '0'
                    })
                    if (numIndex === 0) {
                        val = val.substring(1)
                    }
                }
            } else {
                val = reg.exec(val)[0].replace(/\.{2,}/g, ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                val = val.split('.')
                if (val.length == 1) {
                    val = val[0]
                } else if (val.length == 2 && val[0].length == 1) {
                    val = val[0] + ['.'].concat(val[1]).join('')
                } else if (val[0].length >= 2 && [...val[0]][0] == 0 && val[1]) {
                    val = val[0].slice(1) + ['.'].concat(val[1]).join('')
                } else {
                    val = val[0] + '.' + val[1]
                }
            }
        }
        that.setData({
            ['inputVal.val' + index]: val
        })
    },
    goExplanation() {
        vzNavigateTo({
            url: '/pages/group_purchase/group_explanation/group_explanation',
            query: {
                type: 0
            }
        })
    },
    //商品描述
    getDescription(e) {
        let that = this
        const val = e.detail.value.trim()
        that.setData({
            description: val
        })
    },
    //限购
    chooseLimit(e) {
        let that = this
        const { value } = { ...e.detail }
        that.setData({
            limitIndex: value
        })
    },
    //是否需要电话号码
    radioChange() {
        let that = this
        let { validPhone } = { ...that.data }
        that.setData({
            validPhone: !validPhone
        })
    },
    //检测输入数量是否为空
    testInputVal() {
        let that = this, inputValStatus = true, validPriceArr = [1, 2, 3, 4]
        const { inputVal } = { ...that.data }
        //判断价格
        let judegePrice = (val1, val2) => {
      
            if (parseFloat(inputVal["val" + val1]) >= parseFloat(inputVal["val" + val2])) {
                app.ShowMsg(`${groupInput[val1].tagName}不能大于${groupInput[val2].tagName}`)
                return inputValStatus = false
            }
        }
        //检测值是否为空
        groupInput.forEach((key, index) => {
            if (inputVal["val" + index] === '') {
                if (4 == index)//团长减价为非必填
                {
                    return
                }
                inputValStatus = false
                app.ShowMsg(`您还没有填写${key.tagName}`)
            }
            if (inputValStatus) {
                switch (index) {
                    case 1://团购价格
                        if (inputVal["val" + 1] >= 10000) {
                            inputValStatus = false
                            app.ShowMsg(`团购价格应在0.01～9999之间`)
                        }
                        judegePrice(1, 2)
                        break;
                    case 2://单买价格
                        judegePrice(2, 3)
                        break;
                    case 4://团长减价
                        judegePrice(4, 1)
                        break;
                    case 5:
                        if (parseInt(inputVal["val" + 5]) < 2) {
                            inputValStatus = false
                            app.ShowMsg(`成团人数至少两人`)
                        }
                        break;
                    case 6:
                        if (parseInt(inputVal["val" + 6]) < 1) {
                            inputValStatus = false
                            app.ShowMsg(`商品数量至少一份`)
                        }
                        break;
                }
            }
        })
        return inputValStatus
    },
    //检测时间选择器
    testTimePicker() {
        let that = this, timesPickerStatus = true
        const { pickeTime } = { ...that.data }
        pickeTime.forEach((key, index) => {
            if (key == '' && index<3) {
                timesPickerStatus = false
                app.ShowMsg(`您还没有填写pickerTime${index}`)
            }
            switch (index) {
                // 开始时间不能小于当前时间
                case 0:
                    // if (new Date(pickeTime[0]).getTime() < new Date().getTime()) {
                    //     if (1 == index) {
                    //         return
                    //     }//不拿结束时间与当前时间进行判断
                    //     timesPickerStatus = false
                    //     app.ShowMsg(pickerTime[index].pickerName + `不能小于当前时间`)
                    // }
                    //开始和结束时间必须大于48小时
                    break;
                case 1:
                    if (new Date(pickeTime[1]).getTime() - new Date(pickeTime[0]).getTime() <= 24 * 60 * 60 * 100 * 2) {
                        timesPickerStatus = false
                        app.ShowMsg(`团购活动间隔不能小于48小时`)
                    }
                    break;
                //截止时间不能小于开始时间
                case 2:
                    if (new Date(pickeTime[2]).getTime() <= new Date(pickeTime[0]).getTime()) {
                        timesPickerStatus = false
                        app.ShowMsg(pickerTime[2].pickerName + `不能小于` + pickerTime[0].pickerName)
                    }
                    break;
            }
        })
        return timesPickerStatus
    },
    //检测上传图片是否为空
    testUpImg() {
        let that = this, imgListStatus = true, imgList = ['团购轮播图片', '团购描述图片']
        let { uploadimgobjects } = { ...that.data }
        Object.keys(uploadimgobjects).forEach((key, index) => {
          if(0==index)
         {
            if (uploadimgobjects[key].config.imageList.length == 0) {
              app.ShowMsg(`请至少上传一张` + imgList[index])
              return imgListStatus = false
            }
         }
            
        })
        return imgListStatus
    },
    checkVoucher() {
        // 验证代金券  
        if (this.data.isVoucher) {
            if (!this.data.voucherPrice) {
                app.ShowMsg('发放代金券的金额不能为0！');
                return;
            }

            if (!this.data.voucherNum) {
                app.ShowMsg('发放代金券的数量不能为0！');
                return
            }

            if (this.data.voucherScopeIdx == 2 && !this.data.fullSubtraction) {
                app.ShowMsg('发放代金券满减金额不能为0！');
                return
            }

            // if (!this.data.voucherValidDay) {
            //     app.ShowMsg('有效天数不能为0！');
            //     return
            // }

            if (this.data.pickeTime[3] != '不填视为立即可用') {
                if (this.data.pickeTime[4] == '不填视为长期可用') {
                    app.ShowMsg('请填写代金券结束时间！');
                    return
                }
            }

            if (this.data.pickeTime[4] != '不填视为长期可用') {
                if (this.data.pickeTime[3] == '不填视为立即可用') {
                    app.ShowMsg('请填写代金券开始时间！');
                    return
                }
            }

            if (new Date(this.data.pickeTime[3]).getTime() > new Date(this.data.pickeTime[4]).getTime()) {
                app.ShowMsg('代金券结束时间必须大于开始时间！')
                return
            }

            if ((new Date(this.data.pickeTime[4]).getTime() - new Date(this.data.pickeTime[3]).getTime()) / (24 * 60 * 60 * 1000) < this.data.voucherValidDay) {
                app.ShowMsg('代金券有效天数不能大于代金券使用周期');
                return
            }

            return true
        } else {
         
            return true
        }
    },
    async submit() {

        let that = this, param = {}
        let data = that.data
        const { openid, storeid,  description, inputVal, pickeTime, uploadimgobjects: { sliderShow, goodsDecri }, limitIndex, validPhone } = { ...data }
        if (description == '' && description.length < 10) {
            app.ShowMsg(`团购描述至少10个字`)
            return
      }  // 验证人人分销
      if (that.data.isShowDistribution) {

        if (!that.data.distribution || that.data.distribution == 0) {
          app.ShowMsg('分销比例不能为空且不能为0');
          return
        }
      }
        if (that.checkVoucher() && that.testInputVal() && that.testTimePicker() && that.testUpImg()) {
          
            param = {
              re:that.data.r,
                Id:that.data.gid,
                openid,
                StoreId: storeid,
                ValidDateStart: pickeTime[0],
                ValidDateEnd: pickeTime[1],
                UserDateEnd: pickeTime[2],
                ImgUrl: sliderShow.config.imageList[0],
                ImgList: sliderShow.config.imageList.join('|'),
                DescImgList: goodsDecri.config.imageList.join('|'),
                GroupName: inputVal.val0,
                DiscountPrice:inputVal.val1 * 1000/10,
                UnitPrice: inputVal.val2 * 1000 / 10,
                OriginalPrice: inputVal.val3 * 1000 / 10,
                HeadDeduct: inputVal.val4 * 1000 / 10,
                GroupSize: inputVal.val5,
                CreateNum: inputVal.val6,
                Description: description,
                NeedPhone: validPhone,
                LimitNum: limitIndex,
          } 
           param.IsFx = this.data.isShowDistribution ? 1 : 0
           param.FxRate = this.data.isShowDistribution ? this.data.distribution : ''
     
            let data = await getList(
                'IBaseData/AddGroup',
                param,
                'POST'
            )
            if (data.Success) {
                if (this.data.isVoucher) {
                    let resp = await addVoucher({
                        cityid: app.globalData.cityInfoId,
                        openid: app.globalData.userInfo.openId,
                        CreateNum: this.data.voucherNum,
                        VoucherMoney: this.data.voucherPrice,
                        Deducting: this.data.fullSubtraction,
                        UseStartDate: this.data.pickeTime[3],
                        UseEndDate: this.data.pickeTime[4],
                        ValidDays: this.data.voucherValidDay,
                        State: 0,
                        ItemId: data.Data.groupid,
                        StoreId: this.data.storeid,
                        ItemType: 2
                    })                
                }
                wx.redirectTo({
                    url: '/pages/group_purchase/group_admin/group_admin?storeid='+storeid
                  })
               
             
            } else {
                app.ShowMsg(data.msg);
            }
        }
    },
    //编辑
    async editRequest() {
        let that = this, param
        let { openid, gid, storeid, r } = { ...that.data }
        let data = await getList(
            'IBaseData/GetAddOrEditGroup',
            param = {
                cityid: app.globalData.cityInfoId,
                openid,
                storeid,
                gid,
                r
            }
        )
        if (data.Success) {
            let groupmain = data.Data.groupmain
            Object.keys(groupmain).forEach((key, index) => {
                if (groupmain[key] == null) {
                    delete groupmain[key]
                }
            })
            return groupmain
        }
    },
    edit() {
      let that = this
  
        that.editRequest().then((data) => {
            let { NeedPhone } = { ...data }
            that.setData({
                validPhone: NeedPhone
            })
          if (data.IsFx != 0) {
            that.setData({
              isShowDistribution: true,
              distribution: data.FxRate
            })
          } 
            that.editInputVal(data)  //表单输入框
            that.editImgList(data)  // 图片
            that.editTimePicker(data) //时间选择器
            that.editLimit(data) //限制数量
        })
    },
    //编辑设置Input的值
    editInputVal({ GroupName, DiscountPrice, UnitPrice, HeadDeduct, OriginalPrice, CreateNum, GroupSize, Description }) {
        let that = this
        that.setData({
            'inputVal.val0': GroupName,
            'inputVal.val1': prefixPrice(DiscountPrice),
            'inputVal.val2': prefixPrice(UnitPrice),
            'inputVal.val3': prefixPrice(OriginalPrice),
            'inputVal.val4': prefixPrice(HeadDeduct),
            'inputVal.val5': GroupSize,
            'inputVal.val6': CreateNum,
            description: Description.replace(/<[^>]+>|&nbsp;*/g, "")
        })
    },
    //编辑设置时间选择器
    editTimePicker({ UserDateEnd, ValidDateEnd, ValidDateStart }) {
        let that = this
        let { multiIndex, pickeTime, timesMultiArr } = { ...that.data }

        let arr = [ValidDateStart, ValidDateEnd, UserDateEnd].map((index) => {
            return modifyTimestamp(index)
        })
        arr.forEach((key, index) => {
            multiIndex[index] = initCurrentTime(new Date(key))
            //修正天数
            that.modifyTime(timesMultiArr[index][0][parseInt(multiIndex[index][0])], timesMultiArr[index][1][parseInt(multiIndex[index][1])], index)
            pickeTime[index] = printTime(timePickerArr, multiIndex[index])
        })
        that.setData({
            multiIndex,
            pickeTime
        })
    },
    // 编辑设置图片
    editImgList({ DescImgList, ImgList }) {
        let that = this, descArr = [], imgArr = []
        DescImgList.forEach((key, index) => {
            descArr[index] = key.filepath
        })
        ImgList.forEach((key, index) => {
            imgArr[index] = key.filepath
        })
        that.setData({
            'uploadimgobjects.sliderShow.config.imageUpdateList': imgArr, //主轮播图
            'uploadimgobjects.sliderShow.config.imageList': imgArr,
            'uploadimgobjects.sliderShow.config.imageIdList': imgArr,
            'uploadimgobjects.goodsDecri.config.imageUpdateList': descArr, //商品描述
            'uploadimgobjects.goodsDecri.config.imageList': descArr,
            'uploadimgobjects.goodsDecri.config.imageIdList': descArr
        })
    },
    //编辑设置限购
    editLimit({ LimitNum }) {
        let that = this
        that.setData({
            limitIndex: LimitNum
        })
    },
    voucherToggle(e) {
        this.setData({
            isVoucher: e.detail.value
        })
    },
    getVoucherPrice(e) {
      var tempVal = e.detail.value.replace(/[.]/g, "")
      if (this.data.voucherPrice == '')
        tempVal = tempVal.replace(/[0]/g, "")
      this.setData({
        voucherPrice: tempVal
      })

       
    },
    getVoucherNum(e) {
        this.setData({
            voucherNum: e.detail.value
        })
      
    },
    changeVoucherScope(e) {
        let idx = e.currentTarget.dataset.idx

        this.setData({
            voucherScopeIdx: idx
        })
    },
    getFullSubtraction(e) {
        this.setData({
            fullSubtraction: e.detail.value
        })
        
    },
    getValidDay(e) {
        this.setData({
            voucherValidDay: e.detail.value
        })
        
    },

    // 优惠券开始时间
    getBeginUseDate(e) {
        let d = new Date()
        this.setData({
            voucherBeginDate: e.detail.value
        })
        if (!this.data.voucherBeginTime) {
            this.setData({
                voucherBeginTime: d.getHours() + ':' + d.getMinutes()
            })
        }
    },

    getBeginUseTime(e) {
        this.setData({
            voucherBeginTime: e.detail.value
        })
    },

    // 优惠券结束时间
    getEndUseDate(e) {
        let d = new Date()
        this.setData({
            voucherEndDate: e.detail.value,
        })
        if (!this.data.voucherEndTime) {
            this.setData({
                voucherEndTime: d.getHours() + ':' + d.getMinutes()
            })
        }
    },

    getEndUseTime(e) {
        this.setData({
            voucherEndTime: e.detail.value
        })
  },
  distributionToggle(e) {
    this.setData({
      isShowDistribution: e.detail.value
    })
  },
  getDistribution(e) {
    console.log(e)
    this.setData({
      distribution: e.detail.value
    })
  }
})
