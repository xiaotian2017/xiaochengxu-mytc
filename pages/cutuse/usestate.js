var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
Page({
  data: {
     bid:0,
     bguid:0,
     loadall:0,    
     reason:'',
     success:true
   }, 

  onLoad: function (options) {
    var scene =options.scene
    if (undefined == scene || null == scene)
    {
      app.ShowMsg('scene参数错误')
    }
    scene = decodeURIComponent(scene).split(":")
    var bid = scene[0]
    var bguid = scene[1]
    var that = this
    app.getUserInfo(function () {
      that.setData({
        bid: bid,
        bguid: bguid
      })
      that.init()
    })
  },
  init: function () {
      var that = this
      var url = addr.Address.StoreCutUse
      var param = {
          BargainGuid: that.data.bguid,
          BId: that.data.bid,
          openid: app.globalData.userInfo.openId
      }
      wx.request({
        url: url,
        data: param,
        success: function (res) {
          if (res.data.Success)
          {
            that.setData({
              success: true,
              loadall: 1,
              reason: res.data.Message
            })
        
          }
          else{
            that.setData({
              success:false,
              loadall:1,
              reason: res.data.Message
            })
          }
        }
      })
  }
 
})
