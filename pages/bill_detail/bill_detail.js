// pages/bill_detail/bill_detail.js
var addr = require("../../utils/addr.js");
var util = require("../../utils/util.js");
//获取应用实例
var app = getApp()
Page({
  data: {
      loadall:0,
      subname:"",
      cashtype:0,
      amount:"",
      tranoitem:"",
      tranobject: "",
      shopname:"",
      trandetail:"",
      trantime:""
  },
  onLoad: function (options) {
    var that = this
    var cid=options.cid
    app.getUserInfo(function () {
      that.loadMainData(cid)
    })
  },
  loadMainData: function (cid) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetIncomeDetail,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        cid: cid,
      },
      success: function (res) {
        if (res.data.Success) {
          var pagemodel = res.data.Data.pagemodel
          that.setData({
            loadall: 1,
            subname: pagemodel.subname,
            cashtype: pagemodel.cashtype,
            amount: pagemodel.amount,
            tranoitem: pagemodel.tranoitem,
            tranobject: pagemodel.tranobject,
            shopname: pagemodel.shopname,
            trandetail: pagemodel.trandetail,
            trantime: pagemodel.trantime
          });
        }
        else {
          app.ShowMsg(res.data.Message)
        }
        wx.hideLoading()
      }
    })
  }
  
})