// pages/index/login.js
var app = getApp();
var addr = require("../../utils/addr.js");
Page({
  data:{
    reurl:"",
    headimg:""
  },
  onLoad: function (options) {
    var that=this    
    var rrurl = decodeURIComponent(options.rurl)
    console.log(options.rrurl)
    that.setData({ reurl: "/" + rrurl }) 
    //获取小程序头像
    wx.request({
      url: addr.Address.GetXcxHeadImg,
      data: {
        appid: app.globalData.appid
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (1==res.data.isok) {
        
          that.setData({
            headimg: res.data.headimgurl
          });
        }
      }
    })
  },
  handle: function (e)
  {
    var that = this
    var detail = e.detail
    if (undefined != detail.signature) {
      wx.login({
        success: function (res) {        
          app.login(res.code, detail.encryptedData, detail.signature, detail.iv, function () {      
            console.log(that.data.reurl)   
            wx.redirectTo({
              url: that.data.reurl,
            })
          });
        },
      })
    }     

  
  }

})