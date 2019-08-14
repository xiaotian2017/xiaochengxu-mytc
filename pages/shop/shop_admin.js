var addr = require("../../utils/addr.js");
var util = require("../../utils/util.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    showqrcode: true,
    maskhide: true,
    canvahide: false,
    storeid: 0,
    store: {},
    gongzhonghao_tk: 'none',
    IsShowOwner: 0,
    OpenPayOnLine: true,
    RoleMgr: {
      business: false,
      clerkManage: false,
      commodity: false,
      marketing: false,
      order: false,
      select: false,
      write: false
    },
    hascreate: 0,
    canheight: 0,
    showStoreTip: true,
    ruzhuPayArray: [],
    isIos: false
  },
  onLoad: function (options) {
    wx.hideShareMenu()
    var that = this
    var storeId = this.storeId = options.storeid
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.loadMainData(storeId)
      that.getStoreChargeType()
      that.setData({ storeid: storeId, isIos: app.globalData.isIos })
    })
  },
  onShow() {
    if (wx.getStorageSync('isFromSetTop') == 1) {
      this.loadMainData(this.storeId)
      wx.setStorageSync('isFromSetTop', 2)
    }
  },
  gongzhonghao: function () {
    this.setData({ gongzhonghao_tk: '' })
  },
  iknow_bt: function () {
    this.setData({ gongzhonghao_tk: 'none' })
  },
  redirecto: function (e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },
  gotodetail: function () {

    if(app.globalData.cityExpired==1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    if(this.data.store.Status==-3) {
      wx.redirectTo({
        url: '/pages/storeExpirePage/storeExpirePage',
      })
      return
    }
    var that = this
    var url = '/pages/business_detail/business_detail?storeid=' + that.data.storeid
    wx.navigateTo({
      url: url
    })
  },
  turnpayonline: function () {
    var that = this
    wx.showLoading({
      title: '系统处理中',
    })
    wx.request({
      url: addr.Address.TurnPayOnline,
      data: {
        storeid: that.data.storeid
      },
      success: function (res) {
        if (res.data.Success) {
          app.ShowMsg(res.data.Message)
          that.setData({ OpenPayOnLine: (that.data.OpenPayOnLine ? false : true) })

        }
      },
      complete: function () {
        wx.hideLoading()
      }

    })
  },
  loadMainData: function (storeid) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetMyStore,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        storeid: storeid
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({ store: res.data.Data.Store, IsShowOwner: res.data.Data.IsShowOwner, RoleMgr: res.data.Data.RoleMgr, OpenPayOnLine: res.data.Data.OpenPayOnLine });
          wx.setNavigationBarTitle({
            title: res.data.Data.Store.SName
          })
        }
        else {
          wx.showToast({
            title: res.data.Message,
            icon: 'fail',
            duration: 2000
          })

        }
        wx.hideLoading()
      }
    })
  },
  closemsk: function () {
    this.setData({ maskhide: true, canvahide: true })
  },
  savetophone: function () {
    var that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: function () {
              wx.saveImageToPhotosAlbum({
                filePath: that.data.canvaimg,
                success(res) {
                  //保存成功，不做处理

                  wx.showModal({
                    title: '提示',
                    content: '图片保存成功，可到手机系统相册查看',
                    showCancel: false,
                  })
                }
              })
            }
          })
        }
        else {

          wx.saveImageToPhotosAlbum({
            filePath: that.data.canvaimg,
            success: function (res) {

              wx.showModal({
                title: '提示',
                content: '图片保存成功，可到手机系统相册查看',
                showCancel: false,
              })
            },
            fail: function (res) {
            }
          })

        }
      }
    })
  },
  closeshopqrcode: function () {
    var that = this
    that.setData({ showqrcode: true })
  },
  createposter: function () {
    var that = this
    var vipVer = that.data.store.XcxVipVer
    if (1 != vipVer) {
      that.setData({ showqrcode: false })
      return
    }
    var hascreate = that.data.hascreate
    if (1 == hascreate) {
      that.setData({ maskhide: false, canvahide: false })
      return
    }
    wx.showLoading({
      title: '生成海报中',
    })
    var path = 'pages/business_detail/business_detail'
    var scene = addr.getCurrentPageUrlWithScene()
    if (scene == '') {
      scene = 0
    }
    var windowWidth = wx.getSystemInfoSync().windowWidth * 0.85 //画布宽度 以px为单位
    var windowHeight = wx.getSystemInfoSync().windowHeight * 0.55 //画布高度 以px为单位
    that.setData({ canwidth: windowWidth, canheight: windowHeight })
    var param = "?openid=" + app.globalData.userInfo.openId + "&appid=" + app.globalData.appid + "&path=" + path + "&scene=" + encodeURIComponent(scene)
    // 下载大图
    wx.downloadFile({
      url: addr.Address.GetSharePosterQrCode + param, //下载二维码图片
      success: function (res) {
        var bgimg = "/images/kuangkuangbg.png"
        var qrcode = res.tempFilePath
        // var mainfile = resmain.tempFilePath
        var context = wx.createCanvasContext('firstCanvas', that)
        context.setFillStyle('white')
        context.fillRect(0, 0, windowWidth, windowHeight)
        // 背景图
        context.drawImage(bgimg, 0, 0, windowWidth, windowHeight)
        var sharetitle = that.data.store.SName
        if (sharetitle.length > 6) {
          var sharetitle = sharetitle.substring(0, 6) + '...'
        }

        //标题
        context.setFontSize(23)
        context.setFillStyle('#000000')
        context.setTextAlign('center')
        context.fillText(sharetitle, windowWidth * 0.5, windowHeight * 0.15)
        //二维码
        context.drawImage(qrcode, windowWidth * 0.26, windowHeight * 0.36, windowWidth * 0.5, windowHeight * 0.5)
        context.draw(true, function () {
          wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            success: function (res) {

              that.setData({ canvaimg: res.tempFilePath })

            },
            fail: function (res) {
            }
          }, that)

        });
        wx.hideLoading()
        that.setData({ maskhide: false, hascreate: 1 })
      }
    })
  },
  hideStoreTips() {
    this.setData({
      showStoreTip: false
    })
  },
  receiveStoreApp() {
    wx.navigateTo({
      url: '/pages/shop/storeAppAd'
    })
  },
  //获取同城店铺入驻收费项
  getStoreChargeType: function () {
    var that = this;
    wx.request({
      url: addr.Address.GetStoreChargeType,
      data: {
        cityInfoId: app.globalData.cityInfoId,
        OpenId: app.globalData.userInfo.openId,
        appId: app.globalData.appid,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            ruzhuPayArray: res.data.Data.ChargeTypeList
          })
        }
      }
    })
  },
  renewChange(e) {
    var that = this
    let renewIdx = e.detail.value
    var param = {
      itemid: that.data.storeid,
      paytype: 6207,
      extype: that.data.ruzhuPayArray[renewIdx].id,
      extime: 1,
      quantity: 1,
      openId: app.globalData.userInfo.openId,
      remark: '店铺入驻',
      areacode: app.globalData.areaCode,
    }
    util.AddOrder(param, that.refun.bind(this))
  },
  //付款成功后回调
  refun: function (param, state) {
    if (state == 0) {
      app.ShowMsg("您已取消付款")
      return
    }
    else if (state == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000
      })
      this.loadMainData(this.storeId)
    }
  },
  toSetTop() {
    wx.navigateTo({
      url: '/pages/shop/payForSetTop?storeId=' + this.storeId,
    })
  },
  continupay: function (e) {    
    wx.navigateTo({
      url: '../business_continupay/business_continupay?storeid=' + this.storeId
    })
  },
  showCityRate() {
    let store = this.data.store
    wx.showModal({
      title: '提示',
      content: 
      `抢优惠${store.CityRate}% 
      商品${store.CityRate}% 
      拼团${store.CityRate}%
      减价${store.CityRate}% 
      爱心价${store.CityRate}% 
      在线买单${store.CityRate}%`,
      success (res) {      
      },
      confirmText:'知道了',
      showCancel: false
    })
  }
})