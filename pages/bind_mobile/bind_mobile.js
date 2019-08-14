// pages/bind_mobile/bind_mobile.js
var util = require("../../utils/util");
var addr = require("../../utils/addr");
var app = getApp();
Page({
  data: {
    reurl:'',
    phone: '',
    code: '',
    checkCode: 0,//验证码
    sendtime: 60,//验证码发送计时时间，单位秒
    timer: 0,//计时器对象
    checkTelphone: 0,//已验证的电话
    ltimer: 0,//计时器对象
    content: '获取验证码',
  },

  onLoad: function (options) {
    var that=this
    var reurl = options.reurl
    reurl = decodeURIComponent(!!reurl ? reurl : '')
    that.setData({reurl: reurl})
      //获取用户信息
    app.getUserInfo(function () { })
    
  },
  //发送验证码
  getCode: function () {
    var that = this
    if (that.data.timer > 0) {
      return
    }
    var phone = that.data.phone
    if (phone.trim() == "") {
      app.ShowMsg('请输入电话号码')
      return
    }
    if (phone.length < 11) {
      app.ShowMsg('输入电话号码不对')
      return
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
          that.data.checkTelphone = phone
          that.data.checkCode = res.data.dataObj

          //计时器计时
          that.data.timer = setInterval(function () {
            var data = that.data
            if (data.sendtime == 0) {
              data.sendtime = 60
              data.content = '重发'
              clearInterval(that.data.timer);
              that.data.timer = 0
            }
            else {
              data.sendtime = data.sendtime - 1
              //改变发送按钮背景色和显示文字
              data.content = data.sendtime + "s"
            }
            that.setData(that.data)

          }.bind(that), 1000)
        }

        app.ShowMsg(res.data.Msg)
      }
    })
  },
  //检验验证码
  Submitauth: function () {
    var that = this
    var checkphone = that.data.checkTelphone
    var phone = that.data.phone
    var checkcode = that.data.checkCode
    var code = that.data.code
    var openId = app.globalData.userInfo.openId
    if (phone.trim() == '') {
      app.ShowMsg('请输入手机号码')
      return
    }
    if (checkcode != code || code.trim() == '') {
      app.ShowMsg('验证码不对')
      return
    }
    if (checkphone != phone) {
      app.ShowMsg('输入手机号码不对')
      return
    }

    wx.request({
      url: addr.Address.Submitauth,
      data: {
        tel: phone,
        openId: openId,
        authCode: code,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.isok) {
          app.globalData.userInfo.TelePhone = that.data.phone
          app.globalData.userInfo.IsValidTelePhone = 1
          var frompage = that.data.frompage
          var reurl = that.data.reurl
          app.getUserInfo(function () {
            if ('' != reurl) {
             
                wx.redirectTo({
                  url: reurl
                })
            }
            else {
              app.gotohomepage()
            }
          }, 1)
        
        }
      }
    })
  },
  //手机号输入
  inputphone: function (e) {
    var value = e.detail.value
    this.data.phone = value
  },
  //验证码输入
  inputcode: function (e) {
    var value = e.detail.value
    this.data.code = value
  },
  //跳转到首页
  returnhome: function () {
    app.gotohomepage()
  },
  getPhoneNumber: function (e) {
    var that=this
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      app.ShowMsg('无法获取手机号码')
      return;
    }
   
     wx.request({
      url: addr.Address.GetWechatPhone,
      data: {
        token: app.globalData.token,
        openid: app.globalData.userInfo.openId,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.isok) {
          app.globalData.userInfo.TelePhone = res.data.Msg
          app.globalData.userInfo.IsValidTelePhone = 1
          var frompage = that.data.frompage
          var reurl = that.data.reurl
          app.getUserInfo(function () {
            if ('' != reurl) {

              wx.redirectTo({
                url: reurl
              })
            }
            else {
              app.gotohomepage()
            }
          }, 1)
        }
       
      }
    })
  }
})