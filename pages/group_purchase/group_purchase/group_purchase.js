let addr = require("../../../utils/addr.js");
const host = addr.HOST;
const util = require("../../../utils/util.js")
let {
  httpClient
} = require("../../../utils/util.js");
const regeneratorRuntime = require('../../../utils/runtime');
let getList = (url, param) => httpClient({
  host,
  addr: url,
  data: param
})
let WxParse = require('../../../utils/wxParse/wxParse.js');
let app = getApp()
let checkStore = (p) => util.httpClient({
  addr: addr.Address.checkStoreStatus,
  data: p
});
//修正时间
let modifyTime = (time) => {
  let modifyTime = /\((\d+)\)/.exec(time)
  return parseInt(modifyTime[1])
}
//补0
let prefixTime = (num) => {
  return num >= 10 ? num : '0' + num
}
//计算剩余时间 (天,时,分,秒)
let leftTime = (timespan) => {
  let leftTime = (timespan - (new Date().getTime())) / 1000 //剩余时间
  if (leftTime < 0) {
    return false
  } else {
    let days = prefixTime(parseInt(leftTime / 60 / 60 / 24, 10))
    let hours = prefixTime(parseInt(leftTime / 60 / 60 % 24, 10))
    let minutes = prefixTime(parseInt(leftTime / 60 % 60, 10))
    let seconds = prefixTime(parseInt(leftTime % 60, 10))
    return {
      days,
      hours,
      minutes,
      seconds
    }
  }
}
//
let formatDate = (time) => {
  let date = new Date(modifyTime(time))
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute
}
//修正价格
let prefixPrice = (price) => {
  return price * 10000 / 1000000
}

let getStoreVoucherList = (p) => util.httpClient({
  host,
  addr: 'IBaseData/GetStoreVoucherList',
  data: p
})
Page({
  data: {
    shareposterparams: {
      introduceimg: "",
      title: "",
      originalprice: 0,
      floorprice: 0,
      remainnum: 0,
      enddate: "",
      receiveend: "",
      openid: "",
      appid: ""
    },
    UserName: '',
    Phone: '',
    cityid: 0,
    init: false, //是否初始化成功
    timeList: [], //定时器数组
    storeInfo: { //商家信息
      currentphone: '',
      currentshopqrcode: '',
      currentshoptip: ''
    },
    loadRecommand: false,
    recommandList: [], //推荐列表
    openLayer: false,
    payNum: 1,
    // 红包相关参数
    ruid: 0,
    isShareSuccess: false,
    videoParams: {
      convertFilePath: '',
      videoPosterPath: ''
    },
    shouldpay: 0,
    showpath: false,
    hasVoucher: false,
    uservoucherlist: [],
    payMoney: '',
    voucherIdx: '',
    voucherMoney: 0,
    renderpage: 0,
    listvoucher: [],
    voucher: null,
    fromuid: 0,
    renderpage: 0

  },
  onShow: function () {
    this.poster = this.selectComponent("#poster");
  },
  onLoad(options) {
    this.storeid = options.sid
    let that = this
    var gid = options.gid
    var ruid = options.ruid
    var r = !!options.r ? options.r : 0
    //从海报进来
    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        gid = addr.getsceneparam("gid", scene)
        ruid = addr.getsceneparam("ruid", scene)
        if (0 == r)
          r = addr.getsceneparam("r", scene)
      }
    }
    if (undefined != ruid && null != ruid) {
      that.setData({
        ruid: ruid
      })
    }
    that.setData({
      fromuid: r
    })

    app.getUserInfo(function (userInfo) {
      that.checkStore()
      that.setData({
        Phone: app.globalData.userInfo.TelePhone,
        UserName: app.globalData.userInfo.nickName,
        openid: userInfo.openId,
        cityid: app.globalData.cityInfoId,
        gid: gid,
        renderpage: 1
      })
      that.initData().then(() => {
        that.setData({
          init: true
        })
      })
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true
        })
      }
      wx.setNavigationBarTitle({
        title: app.globalData.cityName
      })
    })
  },
  async checkStore() {
    let resp = await checkStore({
      cityInfoId: app.globalData.cityInfoId,
      storeId: this.storeid
      //    storeId: 8678321

    })
    if (resp.Status == '-3') {
      wx.redirectTo({
        url: '/pages/storeExpirePage/storeExpirePage',
      })
    }
  },
  // 红包获取分享参数
  getDeliverParams(e) {
    this.setData({
      rid: e.detail.rid
    })
    console.log(e.detail.rid);
  },
  //转发分享
  onShareAppMessage(res) {
    let that = this,
      path = addr.getCurrentPageUrlWithArgs()
    let {
      isfx,
      fxitemid,
      storeid
    } = {
      ...that.data.shareposterparams
    }
    if (1 == isfx) {
      path += '&r=100' + app.globalData.userInfo.Id
    }
    if (this.data.rid) {
      path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
    }
    const {
      GroupName
    } = {
      ...that.data.mainmodel
    }
    try {
      if (1 == isfx) {
        util.BindFxOrigin({
          cityid: app.globalData.cityInfoId,
          openid: app.globalData.userInfo.openId,
          storeid: storeid,
          fxitemid: fxitemid,
          fxtype: 4
        });
      }
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {
      console.log(e)
    }
    return {
      title: GroupName,
      path: path,
      fail(res) {},
      success() {
        // 红包添加领取次数
        if (that.data.rid) {
          that.setData({
            isShareSuccess: true
          })
        }

      }
    }
  },
  // 初始化
  async initRequest() {
    let that = this
    let {
      cityid,
      openid,
      gid
    } = {
      ...that.data
    }
    wx.showLoading({
      title: '加载中',
      duration: 10000,
    })
    let data = await getList(
      'IBaseData/GetGroupMain', {
        openid,
        cityid,
        gid,
        r: that.data.fromuid
      }
    )
    if (data.Success) {
      this.setData({
        voucher: data.Data.GroupVoucher
      })
      let videoAttachmentList = data.Data.VideoAttachmentList[0] || {};
      let mainmodel = data.Data.mainmodel
      delete mainmodel.CityInfo
      Object.keys(mainmodel).forEach((key) => {
        if (mainmodel[key] == null) {
          delete mainmodel[key]
        }
      })
      mainmodel.OriginalPrice = prefixPrice(parseFloat(mainmodel.OriginalPrice))
      mainmodel.ShowOpenNewPrice = mainmodel.DiscountPrice - mainmodel.HeadDeduct
      let useEnd = formatDate(mainmodel.UserDateEnd)
      mainmodel.UserDateEnd = useEnd
      if (mainmodel.IsEnd != 1) {
        mainmodel.GroupSponsorList.forEach((key, index) => {
          key.EndDate = modifyTime(key.EndDate)
          if (key.NeedNum != 0) {
            that.changeDate(key.EndDate, index + 1)
          }
        })
      }
      this.setData({
        'videoParams.convertFilePath': videoAttachmentList.convertFilePath || '',
        'videoParams.videoPosterPath': videoAttachmentList.videoPosterPath || ''
      })
      return mainmodel
    } else {
      app.ShowMsg(data.Message)
    }
  },
  async initData() {
    let that = this
    that.initRequest().then((data) => {
      if (data.Description != null && data.Description != undefined) {
        WxParse.wxParse('Description', 'html', data.Description, that)
      }

      that.setData({
        mainmodel: data,

      })
      var m = data
      var formater = "yyyy-MM-dd hh:mm"
      var introduceimg = "http://i.vzan.cc/image/jpg/2018/2/1/19522108e3918acb16440093b233445639ffdf.jpg"
      if (null != m.ImgList && m.ImgList.length > 0) {
        introduceimg = m.ImgList[0].filepath
      }
      var temp = {
        introduceimg: introduceimg,
        title: m.GroupName,
        originalprice: m.OriginalPrice * 100,
        floorprice: m.DiscountPrice,
        remainnum: m.RemainNum,
        enddate: that.dateFormat(new Date(util.GetDateTime(m.ValidDateEnd))) || '',
        startdate: that.dateFormat(new Date(util.GetDateTime(m.ValidDateStart))) || '',
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        loginuserid: app.globalData.userInfo.Id,
        isfx: m.IsFx,
        fxitemtype: 4,
        fxitemid: m.Id,
        storeid: m.StoreId,
        fxearns: m.ExpectEarns
      }
      that.setData({
        shareposterparams: temp
      })

      that.getStoreVoucherList(data.Store.Id)
    }).then(() => {
      wx.hideLoading()
      that.countdown()
    })
  },
  //格式化时间
  dateFormat: function (time) {
    var formater = "yyyy-MM-dd hh:mm";
    return util.dateFormat(formater, time)
  },
  async getStoreVoucherList(storeid) {
    let resp = await getStoreVoucherList({
      openid: app.globalData.userInfo.openId,
      cityid: app.globalData.cityInfoId,
      storeid,
      pageIndex: 1
    })

    this.setData({
      listvoucher: resp.Data.listvoucher
    })
  },
  //预览轮播图
  viewFullPic(e) {
    let that = this,
      urls
    const {
      filepath,
      type
    } = {
      ...e.currentTarget.dataset
    }
    const {
      ImgList,
      DescImgList
    } = {
      ...that.data.mainmodel
    }
    if (type === 'sliderShow') {
      urls = ImgList.map(item => item.filepath)
    }
    if (type == 'desc') {
      console.log(DescImgList)
      urls = DescImgList.map(item => item.filepath)
    }
    app.pictureTaps(filepath, urls)
  },
  //倒计时
  countdown() {
    let currentTime, startTime, endTime, restTime, countInfo
    let that = this
    let {
      mainmodel
    } = {
      ...that.data
    }
    let {
      ValidDateStart,
      ValidDateEnd,
      remainNum,
      state
    } = {
      ...mainmodel
    }
    state = mainmodel.state
    //修正时间
    currentTime = new Date().getTime()
    startTime = modifyTime(ValidDateStart)
    endTime = modifyTime(ValidDateEnd)
    restTime = endTime - startTime

    if (state == -1) {
      that.setData({
        countInfo: "活动已被删除"
      })
      return
    }
    if (endTime <= currentTime || remainNum <= 0) {
      that.setData({
        over: true
      })
    } else if (startTime <= currentTime && currentTime < endTime) {
      that.changeDate(endTime, 0)
    } else {
      that.setData({
        nostart: true
      })
      that.changeDate(startTime, 0)
    }
  },
  changeDate(restTime, index) {
    let that = this,
      countTime, days, hours, minutes, seconds
    countTime = leftTime(restTime)
    that.setData({
      [`timeList[${index}]`]: [countTime.days, countTime.hours, countTime.minutes, countTime.seconds]
    })
    let timer = setInterval(() => {
      countTime = leftTime(restTime);
      ({
        days,
        hours,
        minutes,
        seconds
      } = {
        ...countTime
      })
      if (countTime) {
        if (hours == '00' && minutes == '00' && seconds == '00') {
          that.setData({
            [`timeList[${index}]`]: [days, hours, minutes, seconds]
          })
        } else if (minutes == '00' && seconds == '00') {
          that.setData({
            [`timeList[${index}][1]`]: hours,
            [`timeList[${index}][2]`]: minutes,
            [`timeList[${index}][3]`]: seconds
          })
        } else if (seconds == '00') {
          that.setData({
            [`timeList[${index}][2]`]: minutes,
            [`timeList[${index}][3]`]: seconds
          })
        } else {
          that.setData({
            [`timeList[${index}][3]`]: seconds
          })
        }
      } else {
        clearInterval(timer)
        if (nostart) {
          that.setData({
            nostart: 0
          })
          that.countdown()
        } else {
          return
        }
      }
    }, 1000)
  },
  //拼团玩法
  groupRules() {
    wx.navigateTo({
      url: '/pages/group_purchase/group_explanation/group_explanation?type=' + 1
    })
  },
  //去参团
  goToOpenGroup(e) {
    const {
      id
    } = {
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/group_purchase/group_subPurchase/group_subPurchase?gsid=' + id
    })
  },
  //显示地图
  getLocation() {
    let that = this
    const {
      lat,
      lng
    } = {
      ...that.data.mainmodel.Store
    }
    try {
      wx.setStorageSync('needloadcustpage', false)
      wx.openLocation({
        latitude: lat,
        longitude: lng
      })
    } catch (e) {
      app.ShowMsg('获取地理位置信息出错')
      console.log(e)
    }
  },
  //拨打电话
  call(e) {
    const {
      phone
    } = {
      ...e.currentTarget.dataset
    }
    if (phone == '') {
      app.ShowMsg('该商铺未填写电话号码')
    } else {
      try {
        wx.setStorageSync('needloadcustpage', false)
      } catch (e) {
        console.log(e)
      }
      wx.makePhoneCall({
        phoneNumber: phone
      })
    }
  },
  //跳去店铺详情页
  goStoreDtl() {

    let that = this

    let {
      Store
    } = {
      ...that.data.mainmodel
    }
    const {
      Id

    } = {
      ...Store
    }

    wx.navigateTo({
      url: '/pages/business_detail/business_detail?storeid=' + Id
    })

  },
  //关闭弹层
  closeqrcode: function () {
    let that = this
    that.setData({
      'storeInfo.currentphone': '',
      'storeInfo.currentshopqrcode': ''
    })
  },
  gotoshop: function (e) {
    let storeid = e.currentTarget.dataset.storeid
    wx.navigateTo({
      url: '/pages/business_detail/business_detail?storeid=' + storeid
    })

  },
  //推荐
  async recommandRequest() {
    let recommandList = []
    let data = await getList(
      'IBaseData/GetRecommendGroup', {
        cityid: app.globalData.cityInfoId
      }
    )
    if (data.Success) {
      if (data.length != 0 && data != undefined) {
        let listgroup = data.Data.listgroup
        listgroup.forEach((key, index) => {
          Object.keys(key).forEach((obj) => {
            if (key[obj] == null) {
              delete key[obj]
            }
          })
          key.DiscountPrice = prefixPrice(parseFloat(key.DiscountPrice))
          key.OriginalPrice = prefixPrice(parseFloat(key.OriginalPrice))
          recommandList[index] = key
        })
      }
      return recommandList
    }
  },
  recommand() {
    let that = this
    that.recommandRequest().then((data) => {
      that.setData({
        recommandList: data,
        loadRecommand: true
      })
    })
  },
  getRecommand(e) {
    let that = this
    const {
      loadPosition,
      recommandList,
      loadRecommand
    } = {
      ...that.data
    }
    const {
      scrollTop
    } = {
      ...e.detail
    }
    if (scrollTop >= 20) {
      if (!loadRecommand && recommandList.length == 0) {
        that.recommand()
        that.setData({
          loadRecommand: true
        })
      }
    }
  },
  //推荐详情页
  goGroupDtl(e) {
    const {
      id
    } = {
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/group_purchase/group_purchase/group_purchase?gid=' + id
    })
  },
  //去列表页
  goGroupList() {
    wx.navigateTo({
      url: '/pages/activity/activity?type=' + 'group'
    })
  },
  async groupPurchase(e) {
    let that = this,
      param
    let {
      cityid,
      openid,
      mainmodel,
      groupPurchase,
      payNum
    } = {
      ...that.data
    }
    let {
      Id,
      isGHead,
      gsid
    } = {
      ...mainmodel
    }
    gsid = Object.is(gsid, undefined) ? 0 : gsid

    param = {
      cityid,
      openid: openid,
      appid: app.globalData.appid,
      gid: Id,
      num: payNum,
      isGroup: groupPurchase,
      isGHead: 1,
      gsid: gsid,
      uvId: this.data.voucherIdx !== '' ? this.data.listvoucher[this.data.voucherIdx].Id : ''
    }

    let data = await getList(
      'IBaseData/AddGroupOrder',
      param
    )
    return data
  },
  //支付回调
  payRefun(state = false, gsid) {
    let url
    let {
      groupPurchase
    } = {
      ...this.data
    }
    if (!state) {
      wx.showToast({
        title: '已取消付款',
        duration: 2000
      })
      return;
    }

    //单买
    if (groupPurchase == 0) {
      //不跳转
      url = "/pages/payTransfer/payTransfer?type=group"
    }
    //组团
    if (groupPurchase == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 1000
      })
      url = "/pages/group_purchase/group_subPurchase/group_subPurchase?gsid=" + gsid
    }
    setTimeout(() => {
      wx.redirectTo({
        url: url
      })
    }, 1000)
  },
  //支付
  finishPay() {
    let that = this
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      that.groupPurchase().then((data) => {
        console.log(data)
        let param = {
          openId: that.data.openid
        }
        if (data.Success) {
          wx.showLoading();
          util.PayOrder(data.Data.orderid, param, {
            failed(res) {
              wx.hideLoading();
              that.payRefun()
            },
            success(res) {
              wx.hideLoading();
              if (res == "wxpay") {} else if (res == "success") {
                that.payRefun(1, data.Data.gsid)
              }
            }
          })
        } else {
          app.ShowMsg(data.Message)
        }
      })
    }
  },
  //打开支付Layer
  openPay(e) {
    let that = this
    const {
      index
    } = {
      ...e.currentTarget.dataset
    }
    this.setData({
      openLayer: true,
      groupPurchase: parseInt(index),
      shouldpay: index == 1 ? that.data.mainmodel.ShowOpenNewPrice * 1 : that.data.mainmodel.UnitPrice,
      voucherMoney: 0,
      voucherIdx: ''
    })

  },
  //关闭支付Layer
  cancle() {
    let that = this
    that.setData({
      payNum: 1,
      openLayer: false
    })
  },
  //add
  add() {
    let that = this
    let {
      payNum,
      mainmodel,
      groupPurchase
    } = {
      ...that.data
    }
    if (!mainmodel.LimitNum) {
      if (payNum >= mainmodel.RemainNum) {
        return
      }
    } else {
      if (payNum >= mainmodel.LimitNum) {
        return
      }
    }


    if (mainmodel.LimitNum == 0) {
      payNum += 1
    }
    if (mainmodel.LimitNum >= 1) {
      payNum += 1

    }
    that.setData({
      payNum: payNum,
      shouldpay: groupPurchase == 1 ? mainmodel.DiscountPrice * payNum - mainmodel.HeadDeduct : mainmodel.UnitPrice * payNum
    })
  },
  //minus
  minus() {
    let that = this
    let {
      payNum,
      mainmodel,
      groupPurchase
    } = {
      ...that.data
    }
    payNum -= 1
    if (payNum < 1) {
      return
    } else {
      that.setData({
        payNum: payNum,
        shouldpay: groupPurchase == 1 ? mainmodel.DiscountPrice * payNum : mainmodel.UnitPrice * payNum
      })

      if (this.data.shouldpay <= (this.data.voucherMoney * 100)) {
        this.setData({
          voucherIdx: '',
          voucherMoney: 0
        })
      }
      if (this.data.voucherIdx != '') {
        if (this.data.listvoucher[this.data.voucherIdx].Voucher.Deducting > 0) {
          if (this.data.shouldpay <= this.data.listvoucher[this.data.voucherIdx].Voucher.Deducting * 100) {
            this.setData({
              voucherIdx: '',
              voucherMoney: 0
            })
          }
        }
      }
    }
  },
  //返回首页
  backHome() {
    app.gotohomepage()
  },
  //去我的团购
  goMyGroup() {
    wx.navigateTo({
      url: '/pages/cutlist/cutlist?type=group'
    })
  },
  createposter: function () {
    var that = this
    that.poster.createposter()
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  showVoucher() {
    this.setData({
      hasVoucher: !this.data.hasVoucher
      // payMoney: this.data.coupon.BuyPrice
    })
  },
  hideVoucher() {
    this.setData({
      hasVoucher: false,
      voucherIdx: '',
      voucherMoney: 0
    })
  },
  chooseVoucher(e) {

    let idx = e.currentTarget.dataset.idx
    this.setData({
      voucherIdx: idx
    })
    let voucher = this.data.listvoucher[idx]
    let voucherMoney = voucher.Money
    if (voucher.Voucher.Deducting > 0) {
      if ((this.data.groupPurchase == 1 ? this.data.mainmodel.DiscountPrice * this.data.payNum : this.data.mainmodel.UnitPrice * this.data.payNum) < voucher.Voucher.Deducting * 100) {

        app.ShowMsg('购买金额不足满减金额，该代金券不可用')
      } else {
        if (voucherMoney * 100 >= (this.data.groupPurchase == 1 ? this.data.mainmodel.DiscountPrice * this.data.payNum : this.data.mainmodel.UnitPrice * this.data.payNum)) {

          app.ShowMsg('购买金额小于减免金额，该代金券不可用')
        } else {
          this.setData({
            hasVoucher: false,
            voucherMoney: voucherMoney
          })
        }
      }
    } else {
      if (voucherMoney * 100 >= (this.data.groupPurchase == 1 ? this.data.mainmodel.DiscountPrice * this.data.payNum : this.data.mainmodel.UnitPrice * this.data.payNum)) {
        app.ShowMsg('购买金额小于减免金额，该代金券不可用')
      } else {
        this.setData({
          hasVoucher: false,
          voucherMoney: voucherMoney
        })
      }
    }
  },
  sharePoster(e) {
    var that = this
    var fromfxbtn = e.currentTarget.dataset.fx
    if ('' == that.data.shareposterparams.introduceimg) {
      app.ShowMsg("不支持没有主图的商品生成海报")
      return
    } else if (fromfxbtn == 0) {
      that.setData({
        "shareposterparams.isfx": 0
      })
      that.poster.createposter(0)
    } else if (fromfxbtn == 1) {
      that.setData({
        "shareposterparams.isfx": 1
      })
      that.poster.createposter(1)
    }

  },
})