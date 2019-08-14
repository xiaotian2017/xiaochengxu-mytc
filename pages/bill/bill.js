var addr = require("../../utils/addr.js");
var util = require("../../utils/util.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    loadall: 0,
    toatalincome: 0,
    thirtyincome: 0,
    sevenincome: 0,
    candraw: 0,
    isloadData: false, //是否在加载数据中
    pageIndex: 1, //页码
    PageSize: 10,
    windowHeight: undefined,
    showbottomtip: false, //是否已经到底
    showallbottomtip: false,
    incomelist: []
  },
  onLoad: function (options) {
    var that = this
    app.getUserInfo(function () {
      that.loadMainData()
      that.loadmore()
    })
  },
  onPullDownRefresh() {
    this.setData({
      incomelist: [],
      pageIndex: 1
    })
    this.loadmore()
    this.loadMainData()
  },
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
            toatalincome: res.data.Data.walletmain.AllMomey,
            thirtyincome: res.data.Data.walletmain.MonthMoney,
            sevenincome: res.data.Data.walletmain.WeekMoney,
            candraw: res.data.Data.walletmain.CanDrawMoney,
          });
        } else {
          app.ShowMsg(res.data.Message)
        }
        wx.hideLoading()
      }
    })
  },
  onReachBottom: function () {
    var that = this;
    that.loadmore();
  },
  loadmore: function () {
    var that = this
    var pidx = that.data.pageIndex
    var param = {
      cityid: app.globalData.cityInfoId,
      pageIndex: pidx,
      openid: app.globalData.userInfo.openId
    }
    if (!that.data.isloadData) {
      that.setData({
        "isloadData": true
      });
      util.showNavigationBarLoading()
      wx.request({
        url: addr.Address.GetIncomeList,
        data: param,
        success: function (res) {
          if (res.data.Success) {
            var incomelist = that.data.incomelist
            var rusultlist = res.data.Data.incomlist
            if (1 != pidx && 0 == rusultlist.length) {
              that.setData({
                "showbottomtip": true
              })
              that.setData({
                isloadData: true
              })
              return
            } else if (1 == pidx && 0 == rusultlist.length) {
              that.setData({
                "showallbottomtip": true
              })
              that.setData({
                isloadData: true
              })
              return
            }
            incomelist = incomelist.concat(rusultlist)
            pidx++;
            that.setData({
              pageIndex: pidx,
              isloadData: false,
              incomelist: incomelist
            });

          }

        },
        complete: function () {
          util.hideNavigationBarLoading()
        }
      })
    }
  },
  toincomedetail: function (e) {
    var cid = e.currentTarget.dataset.cid
    wx.navigateTo({
      url: '/pages/bill_detail/bill_detail?cid=' + cid,
    })
  },
  draw: function (e) {

    wx.navigateTo({
      url: '/pages/withdraw/withdraw'
    })
  }
})