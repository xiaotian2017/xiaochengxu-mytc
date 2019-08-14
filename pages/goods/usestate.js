var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
Page({
  data: {
    oid: 0,
    loadall: 0,
    reason: '',
    success: true
  },

  onLoad: function (options) {
    var that = this
    var oid=0
    //从海报进来
    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        oid = addr.getsceneparam("oid", scene)
      }
    }
    app.getUserInfo(function () {
      that.setData({
      oid: oid,
      })
      that.init()
    })
  },
  init: function () {
    var that = this
    var url = addr.Address.StoreGoodUse
    var param = {
      oid: that.data.oid,
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId
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
