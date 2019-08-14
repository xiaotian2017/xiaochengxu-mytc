//index.js
var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    store:{},
    ctIndex: 0,
    ruzhuxiangArray:[]
  },
  onLoad: function (options) {
   var that = this
   var storeId = options.storeid
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function () {
      that.init(storeId);
    })
 
  },
  init: function (storeId) {
  
    var that = this;
    that.loadshop(storeId);
    that.GetStoreChargeType();
  },
  bindruzhuxiangchange: function (e) {
    this.setData({
      ctIndex: e.detail.value
    })
  },
  //获取同城店铺入驻收费项
  GetStoreChargeType: function () {
    var that = this;
    wx.request({
      url: addr.Address.GetStoreChargeType,
      data: {
        cityInfoId: app.globalData.cityInfoId,
        OpenId: app.globalData.userInfo.openId ,
        appId: app.globalData.appid,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            ruzhuxiangArray: [res.data.Data.ChargeTypeList],
            moneyChoseArray: [res.data.Data.PriceStr]
          });
        }
      },
      fail: function (e) {
        app.showMsg("获取同城店铺入驻收费项出错")
      }
    })
  },
 
  //点击提交
  SubmitSettled: function () {
    var that = this
    //店铺名称与店主姓名
    var store=that.data.store
    var param = {
      itemid: store.Id,
      paytype: 6207,
      extype: that.data.ruzhuxiangArray[0][that.data.ctIndex].id,
      extime: 1,
      quantity: 1,
      openId: app.globalData.userInfo.openId,
      remark: '店铺续费',
      areacode: app.globalData.areaCode,
    }
    util.AddOrder(param, that.refun)
   
  },
  //付款成功后回调
  refun: function (param, state) {
    if (state == 0) {
      wx.showToast({
        title: '您已取消付款 !',
        icon: 'faile',
        duration: 2000
      })
      return
    }
    else if (state == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000
      })
      var url = "../person_center/person_center"
      wx.navigateTo({
          url: url
      })
     
    }
  },
  loadshop: function (storeid) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetAddOrEditStore,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        storeid: storeid
      },
      success: function (res) {
        if (0 == res.data.ResultCode) {
          var restultStore = res.data.Data.Store
          that.setData({ "store": restultStore })
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
  }
})
