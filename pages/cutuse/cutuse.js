var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
let getVoucherDraw = (p) => util.httpClient({ host, addr: 'IBaseData/GetVoucherDraw', data: p });
Page({
  data: {
    loadall:0,
    useqrcode:'',
    buid:0,
    bid:0,
    luid: 0,
    lid: 0,
    mainmodel:{},
    voucher: null,
    showVoucher: false
   }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var buid = options.buid
    var bid = options.bid
    if(undefined!=buid)
    {
      that.setData({ buid: buid, bid: bid  })
    }
     var luid = options.luid
    var lid = options.loveid
    if (undefined != luid) {
      that.setData({ luid: luid, lid: lid })
    }
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.loadmain()
    })
  },
  loadmain: function () {
      var that = this
      var buid = that.data.buid
      var url = addr.Address.UseCut
      var param = {
        cityid: app.globalData.cityInfoId,
        buid: buid,
        bid: that.data.bid,
        openid: app.globalData.userInfo.openId
      }
      var luid = that.data.luid
      if (luid > 0) {
        url = addr.Address.UseLove
        param = {
          cityid: app.globalData.cityInfoId,
          luid: luid,
          lid: that.data.lid,
          openid: app.globalData.userInfo.openId
        }
      }
      util.showNavigationBarLoading()
      wx.request({
        url: url,
        data: param,
        success:function(res) {
          if (res.data.Success)
          {
         

            if (0 == luid)//减价
            {
              var count = 0
              let qrlink = addr.Address.GetCutQrcodeNew + "?BId=" + that.data.bid + "&openid=" + app.globalData.userInfo.openId + "&Buid=" + buid + "&appid=" + app.globalData.appid;
              that.setData({ mainmodel: res.data.Data.mainmodel, loadall: 1, useqrcode: qrlink })
              var timer = setInterval(function () {
                that.checkuse(1)
                count++
                if (120 == count) {
                  clearInterval(timer)
                }
              }, 1000)
            }
            else if (luid>0)//集爱心
            {
              var count = 0
              let qrlink = addr.Address.GetLoveQrcode + "?lid=" + that.data.lid + "&openid=" + app.globalData.userInfo.openId + "&luid=" + luid + "&appid=" + app.globalData.appid;
              that.setData({ mainmodel: res.data.Data.mainmodel, loadall: 1, useqrcode: qrlink })
              var timer = setInterval(function () {
                that.checkuse(2)
                count++
                if (120 == count) {
                  clearInterval(timer)
                }
              }, 1000)

            }
          }
          else{
            app.ShowMsg(res.data.Message)
          }
        },
        complete: function () {
          util.hideNavigationBarLoading()
        }
      })
  },
  callphone: function (e) {
    var phone = e.currentTarget.dataset.phone
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  gotocutdetail: function () {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    var that = this
    var bid = that.data.bid
    var lid = that.data.lid
    if (bid > 0) {
      var buid = that.data.buid
      var url = '../cutPrice/cutPrice?buid=' + buid + "&bid=" + bid
      wx.navigateTo({
        url: url,
      })
    }
    else if (lid > 0) {
      var luid = that.data.luid
      var url = '../activity_jiaixin/activity_jiaixin_detail?luid=' + luid + "&loveid=" + lid
      wx.navigateTo({
        url: url,
      })
    }

  },
  gotoshopdetail:function(e)
  {
    var storeid = e.currentTarget.dataset.storeid
    var url = '../business_detail/business_detail?storeid=' + storeid
    wx.navigateTo({
      url: url,
    })
  },
 checkuse (t=1) {
 
    var that = this
    var url = addr.Address.CheckStoreCutUse
    var param = {
      bargainGuid:that.data.buid,
    }
    if(2==t)
    {
      url = addr.Address.CheckStoreLoveUse
      param = {
        luid: that.data.luid,
      }
    }
    wx.request({
      url: url,
      data: param,
     async success (res) {
        if (res.data.Success) {
          let resp = await getVoucherDraw({
            openid: app.globalData.userInfo.openId,
            cityid: app.globalData.cityInfoId,
            itemid: t == 1 ? that.data.bid : that.data.lid,            
            itemtype: t==1?4:3
          })
      
          if (resp.code==1) {
            that.setData({
              voucher: resp.Data.Voucher,
              showVoucher: true      
            })
          }      

          app.ShowMsg("恭喜你，订单核销成功")
        }
        else {

        }
      }
    })
  },
  tomyVoucher() {
    wx.redirectTo({
      url: '/pages/myVoucher/myVoucher' 
    })
  },
  closeVoucher() {
    this.setData({
      showVoucher: false
    })
  }
})
