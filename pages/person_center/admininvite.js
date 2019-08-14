var addr = require("../../utils/addr.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    result: 0,
    reason: "",
    uid: 0,
    timestamp: "",
    invitekey: "",
    showbindphone:0,
    phone: '',
    code: '',
    
    sendtime: 60,//验证码发送计时时间，单位秒
    timer: 0,//计时器对象
  
    ltimer: 0,//计时器对象
    content: '获取验证码',
  },
  onLoad: function (options) {
    var that = this
    var uid = options.uid
    var invitekey = options.invitekey
    var timestamp = options.timestamp
    that.setData({
      invitekey: invitekey,
      timestamp: timestamp,
      uid: uid
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.loadMainData( uid, invitekey, timestamp)
      that.setData({ result: 1 })
      if (app.globalData.userInfo.IsValidTelePhone == 0)
      {
        that.setData({ showbindphone:1});
      }   
    })
    wx.setNavigationBarTitle({
      title: "副管理员邀请"
    })
  },
  loadMainData: function ( uid, invitekey, timestamp) {

    console.log( uid, invitekey, timestamp)
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetAdminInviteMain,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        uid: uid,
        timestamp: timestamp,
        invitekey: invitekey
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({ result: 1 })
        }
        else {
          that.setData({ result: -1, reason: res.data.Message })
        }
        wx.hideLoading()
      }
    })
  },
 
  agree: function (e) {
    var that = this
    var phone = that.data.phone
    var code = that.data.code
    var openId = app.globalData.userInfo.openId

    if (phone.trim() == '' && 1 == that.data.showbindphone) {
      app.ShowMsg('请输入手机号码')
      return
    }
    if (code.trim() == '' && 1 == that.data.showbindphone) {
      app.ShowMsg('请输入验证码')
      return
    }
    wx.request({
      url: addr.Address.AcceptAdminInvite,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        uid: that.data.uid,
        timestamp: that.data.timestamp,
        invitekey: that.data.invitekey,
      
        tel: phone,
        authCode: code,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          app.ShowMsg(res.data.Message)
          setTimeout(function(){
            app.gotohomepage()
          },2000)
        }
        else {
          app.ShowMsg(res.data.Message)
        }
      }
    })
  },
  gotodetail()
  {
    app.gotohomepage()
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
  },//手机号输入
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
    var that = this
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
          that.setData({ showbindphone: 0, phone: res.data.Msg,code:"xcxapiget"})
        }

      }
    })
  }
})