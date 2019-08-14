var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
Page({
  data: {
    scid: 0,
    cuid: 0,
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

    var scid = scene[0]
    var cuid = scene[1]
    var that = this
    app.getUserInfo(function () {
      that.setData({
        scid: scid,
        cuid: cuid
      })
      that.init()
    })
  },
  init: function () {
    var that = this
    var url = addr.Address.StoreCouponUse
    var param = {
      scid: that.data.scid,
      cuid: that.data.cuid,
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
