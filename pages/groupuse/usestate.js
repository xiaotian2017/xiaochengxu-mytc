var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
Page({
  data: {
    gid: 0,
    guid: 0,
    loadall: 0,
    reason: '',
    success: true
  },
  onLoad: function (options) {
    var that = this
    var scene = options.scene
    if (undefined != scene || null != scene) {
      var gid = that.data.gid
      var guid = that.data.guid
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        guid = addr.getsceneparam("guid", scene)
        gid = addr.getsceneparam("gid", scene)
      }
      app.getUserInfo(function () {
        that.setData({
          guid: guid,
          gid: gid
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
    var url = addr.Address.UseGroup
    var param = {
      guid: that.data.guid,
      gid: that.data.gid,
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
