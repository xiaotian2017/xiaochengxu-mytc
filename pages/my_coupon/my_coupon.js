var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    currenttab: 0,
    buyversion: app.globalData.buyVersion,
    currentOrderType: '-99', //当前类别
    couponList: [],
    currrentIndex: 1,
    havemore: true,//加载更多
    isLoadData: false, //是否正在加载数据
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: "我的优惠"
    })
    this.GetMyCouponUserListByUserId()
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.GetMyCouponUserListByUserId()
  },
  //获取优惠券列表
  GetMyCouponUserListByUserId: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetMyCouponUserListByUserId,
      data: {
        openId: app.globalData.userInfo.openId,
        appId: app.globalData.appid,
        state: that.data.currentOrderType,
        pageindex: that.data.currrentIndex,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          var data = that.data.couponList
          data = data.concat(res.data.Data.MyUserCouponList)
          that.setData({
            couponList: data,
            havemore: res.data.Data.Count == 10,
            currrentIndex: that.data.currrentIndex + 1
          });
        } else {
          that.setData({ havemore: false });
          wx.showToast({
            title: res.data.Message
          })
        }
      },
      fail: function (e) {
        that.setData({ havemore: false });
        console.log("获取优惠券出错")
        wx.showToast({
          title: '获取优惠券出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //上拉加载更多
  onReachBottom: function () {
    if (!this.data.isLoadData && this.data.havemore) {
      this.data.isLoadData = true
      this.GetMyCouponUserListByUserId()
      this.data.isLoadData = false
    }
  },
  /*导航点击事件*/
  actionOrderType: function (e) {
    var type = e.currentTarget.dataset.type
    if (type == this.data.currentOrderType) return false;
    this.setData({ currentOrderType: type, currrentIndex: 1, couponList: [] });
    this.GetMyCouponUserListByUserId()
  },
  clickToDetail: function (e) {
    var id = e.currentTarget.dataset.id
    var csid = e.currentTarget.dataset.csid
    var url = '../my_coupon/mycoupon_detail?id='+id+'&csid='+csid
    wx.navigateTo({
      url: url,
    })
  },
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url
    wx.reLaunch({
      url: path,
    })
  }
})
