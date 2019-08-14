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
    loves: [],
    tabsecond:0,
    clickId: 1,
    currenttab: 0,
    buyversion: 1,
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
      title: "集爱心管理"
    })

    that.setData({ buyversion: app.globalData.buyVersion, "windowHeight": app.globalData.windowHeight, storeid: storeid })
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
      loves: [],
      pageIndex: 1,
      showbottomtip: false,
      showallbottomtip: false
    })
    that.loadmore()
  },//下拉刷新
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      loves: [],
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
      sid: that.data.storeid,
      pageindex: pidx,
      t: state
    }
    var url = addr.Address.GetMyMgrStoreLove 
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
            var pagelovelist = that.data.loves;
            var loves = res.data.Data.lovelist;
            if (1 != pidx && 0 == loves.length) {
                that.setData({showbottomtip: true });
              }
            else if (1 == pidx && 0 == loves.length) {
                that.setData({showallbottomtip: true });
              }
            if (loves.length>0)
              {
              loves.forEach(function(v){
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
              pagelovelist = pagelovelist.concat(loves);
                that.setData({ loves: pagelovelist });
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
    var path = "../publish_collectlove/publish_collectlove?storeid=" + storeid;
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
  delitem:function(e)
  {
    var that=this
    var lid = e.currentTarget.dataset.lid
    var index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '你确定要删除该集爱心活动吗?',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: addr.Address.DelStoreLove,
            data: {
              openid: app.globalData.userInfo.openId,
              lid: lid
            },
            method: "GET",
            header: {
              'content-type': "application/json"
            },
            success: function (res) {
              if (res.data.Success) {
                var newlove = that.data.loves
                newlove.splice(index, 1)
                that.setData({ loves: newlove})
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
    var lid = e.currentTarget.dataset.lid
    var url = '../publish_collectlove/publish_collectlove?loveid=' + lid + "&storeid=" + that.data.storeid
    wx.navigateTo({
      url: url,
    })
  },
  gotolovedetail:function(e)
  {
    var state = e.currentTarget.dataset.state
    var loveid = e.currentTarget.dataset.lid
    if(1==state)
    {
      var url = '../activity_jiaixin/activity_jiaixin_detail?loveid=' + loveid
      wx.navigateTo({
        url: url,
      })
    }
   
  },
  gotorecord:function(e)
  {
    var loveid = e.currentTarget.dataset.lid
    var url = '../lovemgr/loverecord?loveid=' + loveid
    wx.navigateTo({
      url: url,
    })
    
  },
  callpeple: function (e) {
    var phone = e.currentTarget.dataset.phone
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})
