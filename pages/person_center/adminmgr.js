var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
const app = getApp();
let getmgrlist = (params) => httpClient({ addr: addr.Address.GetXcxMgrList, data: params });

Page({
  data: {
   listmgr:[],
   invitekey: '',
   timestamp: '',
 
  },
  onLoad(options) {
    var that=this
    app.getUserInfo((userInfo) => {
      that.cityid = app.globalData.cityInfoId
      that.openid = app.globalData.userInfo.openId
      that.getmain()
    })
  }, onShareAppMessage: function (res) {
    var that = this
    var path = "/pages/person_center/admininvite?invitekey=" + that.data.invitekey + "&timestamp=" + that.data.timestamp + "&uid=" + app.globalData.userInfo.Id
    console.log(path)
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    return {
      title: app.globalData.userInfo.nickName + "邀请你成为其同城副管理员",
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    that.setData({ listmgr:[]})
    that.getmain()
  },
 
  async getmain() {
    wx.showLoading({
      title: '加载中...'
    })
    var that = this
    let resp = await getmgrlist({
      cityid: that.cityid,
      openid: that.openid,
    })
    wx.hideLoading();
    if (resp.Success)
    {
      that.setData({
        listmgr: resp.Data.listmgr,
        invitekey: resp.Data.InviteKey,
        timestamp: resp.Data.TimeTicks
      })
    }
    else{
      app.ShowMsg(resp.msg)
    } 
    
  },
    deladmin(e){
    var that=this
     const {
       roleid, index
        } = {
         ...e.currentTarget.dataset
       }
     wx.showModal({
       title: '提示',
       content: '确定要删除副管理员吗?删除后不可恢复，请谨慎操作',
       success: function (res) {
         if (res.confirm) {
           wx.showLoading({
             title: '加载中...'
           })
           wx.request({
             url: addr.Address.RemoveAdmin,
             data: {
               cityid: that.cityid,
               openid: that.openid,
               roleid: roleid
             },
             method: "GET",
             header: {
               'content-type': "application/json"
             },
             success: function (res) {
               wx.hideLoading();
               if (res.data.Success) {
                 var listmgr = that.data.listmgr
                 listmgr.splice(index, 1)
                 that.setData({ listmgr: listmgr })
                 app.ShowMsg(res.msg)
               }
               else{
                 app.ShowMsg(res.data.msg)
               }
             }
           })
         } else if (res.cancel) {
         }
       }
     })
  }
})