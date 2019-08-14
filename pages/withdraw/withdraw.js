var addr = require("../../utils/addr.js");
var util = require("../../utils/util.js");
//获取应用实例
var app = getApp()
Page({

  data: {
    loadall:0,
    username:"",
    userimg:"",
    usercandraw:"",
    applyamount:0
  },
  onLoad: function (options) {
    var that = this
    app.getUserInfo(function () {
      that.loadMainData()
      that.setData({
        username: app.globalData.userInfo.nickName,
        userimg: app.globalData.userInfo.headImgUrl,
      });
    })

  }
  ,
  loadMainData: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetWalletPage,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            loadall: 1,
            usercandraw: res.data.Data.walletmain.CanDrawMoney,
          })
        }
        else {
          app.ShowMsg(res.data.Message)
        }
        wx.hideLoading()
      }
    })
  },
  submitdrawrequest:function()
  {
    var that=this
    var applyamount = that.data.applyamount
    if (!/^[0-9]+(.[0-9]{0,2})?$/.test(applyamount)) {
      app.ShowMsg("请输入正确的提现金额,最多2位小数")
      return
    }
    if (applyamount<=0) {
      app.ShowMsg("提现金额必须大于0")
      return
    }
  
    if (parseInt(applyamount * 100) > parseInt(that.data.usercandraw))
    {
      app.ShowMsg("提现金额不能大于可提现余额")
      return

    }
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.DrawCash,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        fee: applyamount*100,
      },
      success: function (res) {
        if (res.data.Success) {
          app.ShowMsg(res.data.Message)
          setTimeout(function(){
            wx.navigateTo({
              url: '/pages/bill/bill',
            })
          },2000)
         
        }
        else {
          app.ShowMsg(res.data.Message)
        }
        wx.hideLoading()
      }
    })
  }, //手机号输入
  inputamount: function (e) {
    var value = e.detail.value
    this.data.applyamount = value

  }

})