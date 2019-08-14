var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
Page({
  data: {
    lid: 0,
    luid: 0,
    loadall: 0,
    reason: '',
    success: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var scene = options.scene
    console.log(scene)
    if (undefined == scene || null == scene) {
      app.ShowMsg('scene参数错误')
    }
    scene = decodeURIComponent(scene).split(":")

    var lid = scene[0]
    var luid = scene[1]
    var that = this
    app.getUserInfo(function () {
      that.setData({
        lid: lid,
        luid: luid
      })
      that.init()
    })
  },
  init: function () {
    var that = this
    var url = addr.Address.AdminUseLike
    var param = {
      luid: that.data.luid,
      lid: that.data.lid,
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
