var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    currenttab: 0,
    redbaglist: [],
    havemore: true,//加载更多
    isLoadData: true, //是否正在加载数据
    redtype:2,
    pageindex:0,
    storeid:0,
    showstateselbar:0,
    selloadstate:0
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "店铺赏金"
    })
    var that=this
    var storeid= options.storeid
    that.setData({ storeid: storeid})
    app.getUserInfo(function (userInfo) {
      that.getmymgrredbag()
    })

  },
  onPullDownRefresh: function () {
    var that=this
    wx.stopPullDownRefresh()
    that.setData({ pageindex: 1, redbaglist:[]})
    that.getmymgrredbag()
  },
 
  getmymgrredbag: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetMgrRedpackList,
      data: {
        rpsourcetype:0,
        state: that.data.selloadstate,
        redtype:that.data.redtype,
        sid: that.data.storeid,
        pageindex: that.data.pageindex,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          var data = that.data.redbaglist
          data = data.concat(res.data.Data.rplist)
          that.setData({
            redbaglist: data,
            havemore: res.data.Data.rplist.Count == 10,
            pageindex: that.data.pageindex + 1
          });
        } else {
          that.setData({ havemore: false });
          wx.showToast({
            title: res.data.Message
          })
        }
      },
      complete: function () {
        that.setData({ isLoadData: false });
        util.hideNavigationBarLoading()
      }
    })
  },
  //上拉加载更多
  onReachBottom: function () {
    var that=this
    if (!that.data.isLoadData && that.data.havemore) {
      that.getmymgrredbag()
    }
  },
  clickToDetail: function (e) {
    var id = e.currentTarget.dataset.id
    var csid = e.currentTarget.dataset.csid
    var url = '../my_coupon/mycoupon_detail?id=' + id + '&csid=' + csid
    wx.navigateTo({
      url: url,
    })
  },
  selredbagstate:function(e)
  {
    var that=this
    var state = e.currentTarget.dataset.state
    that.setData({ showstateselbar: state})
  },
  setredbagstate:function(e)
  {
    var that = this
    var state = e.currentTarget.dataset.state
    that.setData({ selloadstate: state, showstateselbar: 0, pageindex: 1, redbaglist:[]})
    that.getmymgrredbag()
  },
  gotoadd: function (e) {
    var that = this
    var url ="../redpackmgr/redpackedit?storeid="+that.data.storeid
    wx.navigateTo({
      url: url,
    })
  },
  editmodel: function (e) {
    var that = this
    var redbagid = e.currentTarget.dataset.redbagid
    var url = "../redpackmgr/redpackedit?storeid=" + that.data.storeid + "&redbagid=" + redbagid
    wx.navigateTo({
      url: url,
    })
  },
  seerecords: function (e) {
     var that = this
    // var redbagid = e.currentTarget.dataset.redbagid
    // var url = "../redpackmgr/records?redbagid=" + redbagid
    // wx.navigateTo({
    //   url: url,
    // })
    var redbagid = e.currentTarget.dataset.redbagid
    var totalcount = e.currentTarget.dataset.totalcount
    var totalamount = e.currentTarget.dataset.totalamount
    util.vzNavigateTo({
      url: "/pages/redPackageRecord/redPackageRecord",
      query: {
        rid: redbagid,
        totalCount: totalcount,
        displayAmount: totalamount
      }
    })
  }
})
