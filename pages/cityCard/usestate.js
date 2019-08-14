var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
Page({
  data: {
    hsid: 0,
    hguid: 0,
    loadall: 0,
    reason: '',
    success: true
  },

  onLoad: function (options) {
    var that = this
    var scene = options.scene
    if (undefined != scene || null != scene) {
      var hsid = that.data.hsid
      var hguid = that.data.halfserviceguid
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        hguid = addr.getsceneparam("halfserviceguid", scene)
        hsid = addr.getsceneparam("hsid", scene)
      }
      app.getUserInfo(function () {
        that.setData({
          hguid: hguid,
          hsid: hsid
        })
        that.init()
      })
    }
    else{
      app.ShowMsg('参数错误')
    }

  },
  init: function () {
    var that = this
    var url = addr.Address.AdminUseHalfCard
    var param = {
      hguid: that.data.hguid,
      hsid: that.data.hsid,
      openid: app.globalData.userInfo.openId,
      cityid: app.globalData.cityInfoId
    }
    wx.request({
      url: url,
      data: param,
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            success: true,
            loadall: 1,
            reason: res.data.Message
          })

        }
        else {
          that.setData({
            success: false,
            loadall: 1,
            reason: res.data.Message
          })
        }
      }
    })
  }

})
