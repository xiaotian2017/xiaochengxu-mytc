var addr = require("../../utils/addr.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    currenttab: 0,
    buyversion: 1,
    HeadImg:'',
    UserId:0,
    UserNickName:'',
    stores: [],
    isloadData: false,//是否在加载数据中
    pageIndex: 1,//页码
    PageSize: 10,
    windowHeight: undefined,
    watchstate:1,
    showbottomtip: false,//是否已经到底
    showallbottomtip: false,
    cityid: 0
  },
  onLoad:function(){
    wx.setNavigationBarTitle({
      title: "商家中心"
    })
    var that = this;
    that.setData({ 
      "windowHeight": app.globalData.windowHeight,
     buyversion: app.globalData.buyVersion ,
     cityid: app.globalData.cityInfoId,
     });
  
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function () {
      //更新数据
      that.setData({
        HeadImg: app.globalData.userInfo.headImgUrl,
        UserId: app.globalData.userInfo.Id,
        UserNickName: app.globalData.userInfo.nickName
      })
      that.loadMainData();
    })
  },
  shop_admin:function(e)
  {
    var storeid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../shop/shop_admin?storeid=' + storeid,
    })
  }
  ,
  onPullDownRefresh: function () {
    var that = this;
    that.setData({ pageIndex: 1, stores: [], "windowHeight": app.globalData.windowHeight, isloadData: false });
    that.loadMainData();
    wx.stopPullDownRefresh()
  },
  loadMainData: function () {
    var that = this;
    that.loadmore();
  },
  onReachBottom: function () {
   
  },
  loadmore: function () {
    var that = this;
    if (!that.data.isloadData) {
      that.setData({
        "isloadData": true
      });
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: addr.Address.GetMyStores,
        data: {
          cityid: app.globalData.cityInfoId,
          pageindex: that.data.pageIndex,
          openid: app.globalData.userInfo.openId,
          appid: app.globalData.appid,
          status: that.data.watchstate
        },
        success: function (res) {
          var pidx = that.data.pageIndex;
          var list = that.data.stores;
          if (1 != pidx && 0 == res.data.length) {
            that.setData({ "showbottomtip": true });
          }
          else if (1 == pidx && 0 == res.data.length) {
            that.setData({ "showallbottomtip": true });
          }
          if ("" != res.data) {
          
            var result = res.data;
            list = list.concat(result);
            that.setData({ "stores": list });
            pidx++;
            that.setData({ "pageIndex": pidx });
            that.setData({ "isloadData": false });
          }
          wx.hideLoading()
        }
      })
    }
  },
  chooseType:function(e)
  {
    var status = e.currentTarget.dataset.type
    var that = this
    that.setData({ pageIndex: 1, stores: [], "windowHeight": app.globalData.windowHeight, isloadData: false, watchstate:status}    )
    that.loadmore();
  },
  continupay:function(e)
  {
    var storeid = e.currentTarget.dataset.storeid
    wx.navigateTo({
      url: '../business_continupay/business_continupay?storeid=' + storeid
    })    
  },
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url
    wx.reLaunch({
      url: path,
    })
  }
  
})