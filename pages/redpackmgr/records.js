var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
Page({
  data: {
    records: [],
    rid:0,
    isloadData: false,//是否在加载数据中
    pageIndex: 1,//页码
    showbottomtip: false,//是否已经到底
    showallbottomtip: false,
  },
  onLoad: function (options) {
    var that = this
    var rid = options.redbagid
    that.setData({ rid:rid })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.loadmore()
    })

  },

  onReachBottom: function () {
    var that = this;
    that.loadmore();
  },
  loadmore: function () {
    var that = this
    var pidx = that.data.pageIndex;
    if (!that.data.isloadData) {
      that.setData({
        "isloadData": true
      });
      util.showNavigationBarLoading()
      var url = addr.Address.GetRedPackDetail
      var param = {
        rid: that.data.rid,
        pageindex: pidx,
        pagesize:10
      }
      wx.request({
        url: url,
        data: param,
        success: function (res) {
            if (res.data.Success) {
              var listredbagedetial = res.data.Data.listredbagdetail
              if (1 != pidx && 0 == listredbagedetial.length) {
                that.setData({ "showbottomtip": true });
              }
              else if (1 == pidx && 0 == listredbagedetial.length) {
                that.setData({ "showallbottomtip": true });
              }
                that.setData({ records: listredbagedetial });
                pidx++;
                that.setData({ "pageIndex": pidx });
            }
          }
        ,
        complete: function () {
          util.hideNavigationBarLoading()
          that.setData({ "isloadData": false });
        }
      })
    }
  }
})