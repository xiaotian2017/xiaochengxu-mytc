var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
const regeneratorRuntime = require('../../utils/runtime');
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
var _host = addr.HOST;
const GetUserMember = (params) => httpClient({ host: _host, addr: 'IBaseData/GetUserMember', data: params });

Page({
  data: {
    cityphone: '',
    cityid: 0,
    currenttab: 6,
    userInfo: null,
    QrCodeUrl: '',
    // erweima_tk: 'none',
    city_kefu_hidden: true,
    buyversion: 1,
    dfhnum: 0,
    dfknum: 0,
    dshnum: 0,
    adminlevel: 0,
    memberuser: null
  },
  onShow() {    
    var that = this
    app.getUserInfo(function () {
      that.setData({ buyversion: app.globalData.buyVersion, cityid: app.globalData.cityInfoId, cityphone: app.globalData.cityphone, adminlevel: app.globalData.userInfo.iscityowner })
      that.inite()
      wx.hideLoading()
      wx.stopPullDownRefresh()
      that.GetUserMember()
    },1,1)
  },
  onLoad: function () {

    wx.setNavigationBarTitle({
      title: '个人中心'
    })

  },
  //初始化
  inite: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
    });
    this.GetMineMain();
  }, onShareAppMessage: function (res) {
    wx.setStorageSync('needloadcustpage', false)
    var path = addr.getCurrentPageUrlWithArgs()
    return {
      title: app.globalData.cityName,
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url
    wx.reLaunch({
      url: path,
    })
  },
  onPullDownRefresh: function () {
    var that = this
    app.getUserInfo(function () {
      that.inite(that.data.option)
      wx.hideLoading()
    })
    wx.stopPullDownRefresh()
  },
  //获取客服二维码
  GetMineMain: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetMineMain,
      data: {

        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            QrCodeUrl: res.data.Data.QrCodeUrl,
            dfhnum: res.data.Data.dfhnum,
            dfknum: res.data.Data.dfknum,
            dshnum: res.data.Data.dshnum,
            vCount: res.data.Data.vCount,
            openMemberPrice: res.data.Data.OpenMemberPrice
          });
          wx.setStorageSync('qrSrc', res.data.Data.QrCodeUrl)
        } else {
          app.ShowMsg(res.data.Message)
        }
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  clickToEdit: function () {
    wx.navigateTo({
      url: '../person_center/edit'
    })
  },
  clickToMyOrder: function () {
    wx.navigateTo({
      url: '../cutlist/cutlist'
    })
  },
  clickToMyIncome: function () {
    wx.navigateTo({
      url: '../bill/bill'
    })
  },
  myshop: function () {
    wx.navigateTo({
      url: '../shop/shop'
    })
  },
  bindtap_erweima: function (e) {
    this.setData({ city_kefu_hidden: false })
  },
  bindtap_close: function (e) {
    this.setData({ city_kefu_hidden: true })
  },
  myposts: function (e) {
    wx.navigateTo({
      url: '../mypublish/mypublish'
    })
  },
  callphone: function (e) {
    var phone = e.currentTarget.dataset.phone
    util.g_callphone(phone)
  },
  redirecto: function (e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },
  clickToMyAddress() {
    wx.navigateTo({
      url: '/pages/goods/goodsAddressList'
    })
  },
  clickToAminMgr() {
    wx.navigateTo({
      url: '/pages/person_center/adminmgr'
    })
  },
  receiveStoreApp() {
    wx.navigateTo({
      url: '/pages/shop/storeAppAd'
    })
  },
  myVoucher() {
    wx.navigateTo({
      url: '/pages/myVoucher/myVoucher',
    })
  },
  myfx() {
    wx.navigateTo({
      url: '/pages/distribution/myDistribution',
    })
  },
  toTc114() {
    wx.navigateTo({
      url: '/pages/city114/city114Mine?ruZhuType=1',
    })
  },

  async GetUserMember() {

    let resp = await GetUserMember({
      OpenId: app.globalData.userInfo.openId,
      CityInfoId: app.globalData.cityInfoId,
    })

    if (resp.code) {
      this.setData({
        memberuser: resp.data
      })
    } else {
      this.setData({
        showTips: true,
        content: resp.msg|| '系统错误'  
      })
    }
  },
  toGetCityCardIndex() {
    wx.navigateTo({
      url: '/pages/cityCard/cityCardIndex',
    })
  },
  toGetCityCardRights() {
    wx.navigateTo({
      url: '/pages/cityCard/cityCardIndex',
    })
  },
  toCouponList() {
    wx.navigateTo({
      url: '/pages/myVoucher/myVoucher',
    })
  }
})
