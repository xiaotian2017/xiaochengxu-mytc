var addr = require("../../utils/addr.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    result:0,
    reason:"",
    mainmodel:null,
    storeid: 0,
    uid: 0,
    timestamp: "",
    invitekey: ""
  },
  onLoad: function (options) {
    var that = this
    var uid = options.uid
    var storeid = options.storeid
    var invitekey = options.invitekey
    var timestamp = options.timestamp
  
    that.setData({
      storeid: storeid,
      invitekey: invitekey,
      timestamp: timestamp,
      uid: uid
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.loadMainData(storeid, uid, invitekey,timestamp)
    })
    wx.setNavigationBarTitle({
      title:"核销员邀请"
    })
  },
  loadMainData: function (storeid, uid, invitekey,timestamp) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetClerkInvitedMain,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        storeid: storeid,
        uid: uid,
        timestamp:timestamp,
        invitekey:invitekey
      },
      success: function (res) {
     
        if (res.data.Success) {
          that.setData({ result: 1, mainmodel: res.data.Data.mainmodel})
        }
        else {
          that.setData({ result: -1, reason: res.data.Message })
         
        }
        wx.hideLoading()
      }
    })
  },
  delclerk: function (e) {
    var that = this
    var roleid = e.currentTarget.dataset.roleid
    var index = e.currentTarget.dataset.idx
    wx.showModal({
      title: '提示',
      content: '确定要删除店员吗?删除后不可恢复，请谨慎操作',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: addr.Address.CancelClerk,
            data: {
              roleid: roleid
            },
            method: "GET",
            header: {
              'content-type': "application/json"
            },
            success: function (res) {
              if (res.data.Success) {
                var clerks = that.data.clerks
                clerks.splice(index, 1)
                that.setData({ clerks: clerks })
                app.showToast(res.data.Message);
              }
            }
          })
        } else if (res.cancel) {

        }
      }
    })
  },
  agree:function(e)
  {
    var that=this
    wx.request({
      url: addr.Address.AcceptClerkInvite,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        storeid: that.data.storeid,
        uid: that.data.uid,
        timestamp: that.data.timestamp,
        invitekey: that.data.invitekey
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
         //前往我的店铺
          var url = '/pages/shop/shop'
          wx.redirectTo({
            url: url
          })
        }
        else{
          app.ShowMsg(res.data.Message)
        }
      }
    })
  },
  gotodetail: function () {
    var that = this
    var url = '/pages/business_detail/business_detail?storeid=' + that.data.storeid
    wx.navigateTo({
      url: url
    })
  }
})