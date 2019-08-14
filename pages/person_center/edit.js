var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var uploadimg = require("../../utils/uploadImgenew.js");
//获取应用实例
var app = getApp()
var that
var intervalid
Page({
  data: {
    userInfo: {},
    isReducetime: false,
    phone: '',
    IsValidTelePhone: false,
    name: '',
    Reciprocal: '',
    reducetime: 60,
    xingbie: true,
    code: '',
    items: [{
      content: {
        maxImageCount: 1,
        currentmaxImageCount: 1,
        images_full: false,
        imghidden: true,
        imageList: [],
        imageUrlList: [],
        imageIdList: [],
        imageAddUrlList: [],
        icon: 'http://j.vzan.cc/content/city/xcx/images/tc-yh-07.png',
        row: 0,
        textfocus: false,
        imghidden: true,
      }
    }],
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {

    that = this
    wx.setNavigationBarTitle({
      title: '编辑个人信息'
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        xingbie: userInfo.gender == 1,
        phone: userInfo.TelePhone,
        name: userInfo.nickName,
        IsValidTelePhone: userInfo.IsValidTelePhone == 1,
        buyversion: app.globalData.buyVersion
      })
    })
  },
  getcode: function () {
    var that = this
    var isReducetime = this.data.isReducetime
    if (isReducetime) return false;
    var phone = this.data.phone
    if (phone == '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机号码',
        showCancel: false
      })
      return false;
    }


    wx.request({
      url: addr.Address.Senduserauth,
      data: {
        areacode: app.globalData.areaCode,
        tel: phone,
        openId: app.globalData.userInfo.openId,
        sendType: 8,
        appid: app.globalData.appid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.isok) {
          // 获取验证码动作
          intervalid = setInterval(function () {
            if (that.data.reducetime == 1) {
              clearInterval(intervalid);
              that.data.reducetime = 60;
              that.setData({ Reciprocal: '' })
              that.setData({ isReducetime: false })
              return false;
            }
            if (that.data.reducetime > 60) {
              that.setData({ isReducetime: false })
            }
            else {
              that.setData({ isReducetime: true })
            }
            that.data.reducetime--;
            that.setData({ Reciprocal: that.data.reducetime + 's' })
          }, 1000)
          that.data.checkTelphone = phone
          that.data.checkCode = res.data.dataObj
        }
        app.ShowMsg(res.data.Msg)
      }
    })
  },
  //图片上传
  chooseImage: function (parmas) {
    uploadimg.chooseImage(parmas, this);
  },

  phoneinput: function (e) {
    that.data.phone = e.detail.value;
    that.setData({ IsValidTelePhone: false })
  },
  nameinput: function (e) {
    that.data.name = e.detail.value;
  },
  codeinput: function (e) {
    that.data.code = e.detail.value;
  },

  xingbie: function (e) {
    var value = e.currentTarget.dataset.gender
    this.setData({ xingbie: value == "1" })
  },

  save: function () {
    var data = this.data
    var userInfo = this.data.userInfo
    if (this.data.name.trim() == '') {
      app.ShowMsg('请输入姓名')
      return
    }
    if (!(data.IsValidTelePhone == 1 && userInfo.TelePhone == data.phone)) {
      if (data.phone.trim() == '' || data.phone == '未绑定') {
        app.ShowMsg('请输入手机号码')
        return
      }
      if (data.phone.length < 11) {
        app.ShowMsg('输入手机号码有误')
        return
      }
      if (data.code.trim() == '') {
        app.ShowMsg('请输入验证码')
        return
      }
      if (data.checkTelphone.trim() == '') {
        app.ShowMsg('验证码不对')
        return
      }
    }
    this.savaUserInfo()
  },
  savaUserInfo: function () {
    var data = this.data
    var userstr = {
      HeadImgUrl: data.items[0].content.imageList.length > 0 ? data.items[0].content.imageList[0] : data.userInfo.avatarUrl,
      NickName: data.name,
      Sex: data.xingbie ? 1 : 0,
      TelePhone: data.phone,
      openId: data.userInfo.openId
    }
    userstr = JSON.stringify(userstr)
    wx.request({
      url: addr.Address.UpdateUserInfo,
      data: {
        userstr: userstr,
        validTelePhone: data.code,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.isok) {
          // app.getUserInfo(function () {
            wx.navigateTo({
              url: "/pages/person_center/person_center"
            })
          // }, 1)
        }
        else {
          app.ShowMsg(res.data.msg)
        }
      }
    })
  },
  clickToMyAddress() {
    wx.navigateTo({
      url: '/pages/goods/goodsAddressList'
    })
  }
})
