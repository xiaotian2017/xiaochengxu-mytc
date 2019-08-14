var util = require("../../utils/util");
var addr = require("../../utils/addr");
var app = getApp();
var temporaryStorageInput = '';
Page({
  data: {
    showpath: false,
    remindBean: {
      message: ''
    },
    storeId: 0,
    type: 0
  },
  //评论输入了
  reportinput: function (e) {
    temporaryStorageInput = e.detail.value

  },
  reportBtnDidClick: function () {

    if (temporaryStorageInput == '') {
      this.data.remindBean.message = '你输入的为空'
      util.showToast(this)
      return
    }
    var requstUrl = addr.Address.AddStoreComplaints
    if (this.data.type == 1) {
      requstUrl = addr.Address.addcomplaints
    }
    //请求接口
    var that = this
    wx.request({
      url: requstUrl,
      data: {
        AreaCode: app.globalData.areaCode,
        storeId: that.data.storeId, //帖子ID或者storeid
        Content: temporaryStorageInput, //:评论内容
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
      },
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        setTimeout(function () {
          wx.hideToast()
        }, 500)
        if (res.data.Success || res.data.isok == 1) {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 1500
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        } else {
          that.data.remindBean.message = !!res.data.Message ? res.data.Message : res.data.msg
          util.showToast(that)
        }
      }
    })
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    if (app.globalData.userInfo.openId == undefined) {
      app.getUserInfo(function () {
        if (app.globalData.userInfo.iscityowner == 1) {
          that.setData({
            showpath: true
          })
        }
      })
    } else {
      if (app.globalData.userInfo.iscityowner == 1) {
        this.setData({
          showpath: true
        })
      }
    }
    this.setData({
      storeId: options.storeId || options.postId,
      type: options.t,
      typeid: options.typeid //好像用不上，不知道以后会不会用到，依旧把这个参数带过来
    })
  }
})