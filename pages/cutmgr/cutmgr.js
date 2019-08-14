// pages/business_detail/order.js
var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    storeid:0,
    cuts: [],
    tabsecond:0,
    clickId: 1,
    currenttab: 0,
    buyversion: app.globalData.buyVersion,
    isloadData: false,//是否在加载数据中
    pageIndex: 1,//页码
    PageSize: 10,
    windowHeight: undefined,
    showbottomtip: false,//是否已经到底
    showallbottomtip: false,
  },
  onLoad: function (options) {
    var that = this
    var storeid=options.storeid
 
    if(undefined==storeid||null==storeid)
    {
      app.ShowMsg("参数有误")
      return
    }
    wx.setNavigationBarTitle({
      title: "减价管理"
    })
    that.setData({ "windowHeight": app.globalData.windowHeight, storeid: storeid })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.loadmore()
    })
  },
   click_navsecond: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index
    that.setData({tabsecond: index })
    that.setData({
      cuts: [],
      pageIndex: 1,
      showbottomtip: false,
      showallbottomtip: false
    })
    that.loadmore()
  },//下拉刷新
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      cuts: [],
      pageIndex: 1,
      showbottomtip: false,
      showallbottomtip: false
    })
    that.loadmore()
  },
  onReachBottom: function () {
    var that = this
    that.loadmore()
  },
  loadmore: function () {
    var that = this
    var statussecond = that.data.tabsecond
    var pidx = that.data.pageIndex
    var state = statussecond
    if (1== statussecond) {
      state =-2
    }
    if (2== statussecond)
    {
      state=1
    }
    else if (3 == statussecond)
    {
      state = -1
    }
    var param = {
      openid: app.globalData.userInfo.openId,
      storeid: that.data.storeid,
      pageindex: pidx,
      state: state
    }
    var url = addr.Address.GetMyMgrStoreCut 
    if (!that.data.isloadData) {
      that.setData({
        "isloadData": true
      });
      util.showNavigationBarLoading()
      wx.request({
        url: url,
        data: param,
        success: function (res) {
          if (res.data.Success) {
              var pagecutlist = that.data.cuts;
              var cuts = res.data.Data.cutlist;
              if (1 != pidx && 0 == cuts.length) {
                that.setData({showbottomtip: true });
              }
              else if (1 == pidx && 0 == cuts.length) {
                that.setData({showallbottomtip: true });
              }
              if (cuts.length>0)
              {
                cuts.forEach(function(v){
                  if (v.State==0)
                  {
                    v.statetext ="待审核"
                  }
                  else if (v.State == 1 && !that.validateTimeStart(v.StartDate)) {
                    v.statetext = "未开始"
                  }
                  else if (v.State == 1 && !that.validateTimeStart(v.EndDate)) {
                    v.statetext = "进行中"
                  }
                  else {
                    v.statetext = "已结束"
                  }
                })
                pagecutlist = pagecutlist.concat(cuts);
                that.setData({ cuts: pagecutlist });
              }
           
            }
            else
            {
              app.ShowMsg(res.data.Message)
            }
       
          pidx++;
          that.setData({ "pageIndex": pidx });
          that.setData({ "isloadData": false });
        },
        complete: function () {
          util.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
        }
      })
    }
  },

  validateTimeStart: function (vTimeSpan) {
    return new Date() > new Date(parseInt(vTimeSpan.replace("/Date(", "").replace(")/", ""), 10));;
  },
  gotoadd: function (e) {
    var storeid = e.currentTarget.dataset.storeid
    var path = "../publish_cutprice/publish_cutprice?storeid=" + storeid;
    wx.navigateTo({
      url: path,
    })
  },
  tocutdetail: function (e) {
    var cutid = e.currentTarget.dataset.cutid
    var url = '../cutPrice/cutPrice?cutid=' + cutid
    wx.navigateTo({
      url: url,
    })
  },//查看帮友
  gotohelps:function(e)
  {
    var buid = e.currentTarget.dataset.buid
    var typeid = e.currentTarget.dataset.type
    var url = '../activity_record/activity_record?buid=' + buid + "&t=" + typeid
    wx.navigateTo({
      url: url,
    })
  },
  gotucutdetail:function(e)
  {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    var bid = e.currentTarget.dataset.bid
    var url = '../cutPriceTake/cutPriceTake?cutid=' + bid
    wx.navigateTo({
      url: url,
    })
  },
  delitem:function(e)
  {
    var that=this
    var bid = e.currentTarget.dataset.bid
    var index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '你确定要删除该减价活动吗?',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: addr.Address.DelStoreCut,
            data: {
              openid: app.globalData.userInfo.openId,
              bid: bid
            },
            method: "GET",
            header: {
              'content-type': "application/json"
            },
            success: function (res) {
              if (res.data.Success) {
                var newcut = that.data.cuts
                newcut.splice(index, 1)
                that.setData({ cuts: newcut})
                app.showToast(res.data.Message);
              }
            },
            fail: function (e) {
              app.ShowMsg("异步请求错误")
            }
          })
        } else if (res.cancel) {
         
        }
      }
    })
    
  },
  editeitem: function(e)
  {
    var that=this
    var bid = e.currentTarget.dataset.bid
    var url = '/pages/publish_cutprice/publish_cutprice?cutid=' + bid + "&storeid=" + that.data.storeid
    wx.navigateTo({
      url: url,
    })
  }
})
