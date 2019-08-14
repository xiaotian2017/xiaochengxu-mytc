var addr = require("../../utils/addr.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    logineropenid:'',
    shopmgrs:[],
    clerks: [],
    invitekey:'',
    timestamp:'',
    inviteuserid:0,
    shopname:'',
    storeid:0
  },
  onLoad: function (options) {
    var that = this
    var storeId = options.storeid
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.loadMainData(storeId)
      that.setData({ storeid: storeId, logineropenid: app.globalData.userInfo.openId})
    })
  }, onShareAppMessage: function (res) {
    var that = this
    var path = "/pages/shop/clerkinvite?storeid=" + that.data.storeid + "&invitekey=" + that.data.invitekey + "&timestamp=" + that.data.timestamp + "&uid=" + that.data.inviteuserid + "&uid=" + that.data.inviteuserid 
    console.log(path)
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    return {
      title: app.globalData.userInfo.nickName + "邀请你成为店铺" + that.data.shopname+"店员",
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  loadMainData: function (storeid) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetStoreClerk,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        storeid: storeid
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({ clerks: res.data.Data.listclerks.filter(x => x.UserRole.RoleId == 3), shopmgrs: res.data.Data.listclerks.filter(x => x.UserRole.RoleId == 0), invitekey: res.data.Data.invitekey, timestamp: res.data.Data.timestamp, inviteuserid: res.data.Data.inviteuserid, shopname: res.data.Data.shopname});
        }
        else {
          app.ShowMsg(res.data.Message)
        }
        wx.hideLoading()
      }
    })
  },
  delclerk:function(e)
  {
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

  }
})