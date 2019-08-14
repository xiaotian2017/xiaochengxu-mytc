var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");

var app = getApp()
Page({
  data: {
    typeid:0,//区别集爱心还是砍价
    buid:0,
    cuthelpers:[],
    lovehelpers: [],
    isloadData: false,//是否在加载数据中
    pageIndex: 1,//页码
    windowHeight: undefined,
    showbottomtip: false,//是否已经到底
    showallbottomtip: false,
  },
  onLoad: function (options) {
    var that=this
    var buid=options.buid
    var typeid = options.t
    that.setData({ buid: buid, typeid: typeid})
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
      var url = addr.Address.GetHelpers
      var param = {
        buid: that.data.buid,
        pageIndex: pidx,
        openid: app.globalData.userInfo.openId
      }
      if (that.data.typeid == 1)//jiaixin 
      {
        url = addr.Address.GetLoveRecord
        param = {
          luid: that.data.buid,
          pageIndex: pidx,
          openid: app.globalData.userInfo.openId
        }
      }
      wx.request({
        url: url,
        data: param,
        success: function (res) {
      
          if(0==that.data.typeid)//jianjia 
          {
            if (1 != pidx && 0 == res.data.length) {
              that.setData({ "showbottomtip": true });
            }
            else if (1 == pidx && 0 == res.data.length) {
              that.setData({ "showallbottomtip": true });
            }
            if ("" != res.data) {
              var cuthelplist = that.data.cuthelpers;
              //添加倒计时
              var helpers = res.data;
              cuthelplist = cuthelplist.concat(helpers);
              that.setData({ cuthelpers: cuthelplist });
              pidx++;
              that.setData({ "pageIndex": pidx });
              that.setData({ "isloadData": false });
            }
          }
          else if (1== that.data.typeid) //jiaixin
          {
            if (1 != pidx && 0 == res.data.data.length) {
              that.setData({ "showbottomtip": true });
            }
            else if (1 == pidx && 0 == res.data.data.length) {
              that.setData({ "showallbottomtip": true });
            }
            if ("" != res.data) {
              var lovehelplist = that.data.lovehelpers;
              //添加倒计时
              var helpers = res.data.data;
              lovehelplist = lovehelplist.concat(helpers);
              that.setData({ lovehelpers: lovehelplist });
              pidx++;
              that.setData({ "pageIndex": pidx });
              that.setData({ "isloadData": false });
            }
          }
        },
        complete: function () {
          util.hideNavigationBarLoading()
        }
      })
    }
  }
})