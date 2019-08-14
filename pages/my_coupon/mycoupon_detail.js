var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var WxParse = require('../../utils/wxParse/wxParse.js');
var htmljson = require('../../utils/wxParse/html2json.js');
var app = getApp()
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');

let getVoucherDraw = (p) => util.httpClient({ host, addr: 'IBaseData/GetVoucherDraw', data: p });


//获取应用实例
var app = getApp()
var interval = undefined
Page({
  data: {
    csid: 0,
    cuid: 0,
    coupon: {},
    UserCoupon: {},
    CouponState: -1,
    useqrcode: "",
    voucher: null,
    showVoucher: false
  },
  onLoad: function (options) {
    var csid = options.csid
    var cuid = options.id
    this.setData({ csid: csid, cuid: cuid })
    this.GetMyCouponDetail()
  },
  onUnload: function () {
    clearInterval(interval);
  },
  onPullDownRefresh: function () {
    this.GetMyCouponDetail()
    wx.stopPullDownRefresh()
  },
  GetMyCouponDetail: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetMyCouponDetail,
      data: {
        openId: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        areacode: app.globalData.areaCode,
        cuid: that.data.cuid,
        csid: that.data.csid
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.returnCoupon = res.data.Data.Coupon
          var returnCoupon = res.data.Data.Coupon
          var formater = "yyyy-MM-dd hh:mm";
          returnCoupon.ValidTimeStart = util.dateFormat(formater, new Date(util.GetDateTime(returnCoupon.UseDateStart)))
          returnCoupon.ValidTimeEnd = util.dateFormat(formater, new Date(util.GetDateTime(returnCoupon.UseDateEnd)))
          var count = 0
          let qrlink = addr.Address.GetCouponQrCode + "?scid=" + returnCoupon.Id + "&openid=" + app.globalData.userInfo.openId + "&ucid=" + that.data.cuid + "&appid=" + app.globalData.appid;
          that.setData({
            coupon: returnCoupon,
            UserCoupon: res.data.Data.UserCoupon,
            CouponState: returnCoupon.CouponState,
            useqrcode: qrlink
          });
          WxParse.wxParse('Description', 'html', returnCoupon.Description, that);
          var timer = setInterval(function () {
            that.checkuse()
            count++
            if (120 == count) {
              clearInterval(timer)
            }
          }, 1000)

        } else {
          wx.showToast({
            title: res.data.Message
          })
        }
      },
      fail: function (e) {
        console.log("获取优惠详情出错")
        wx.showToast({
          title: '获取优惠详情出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  checkuse() {        
    var that = this
    var url = addr.Address.CheckCouponUse
    var param = {
      ucid: that.data.cuid,
    }
    wx.request({
      url: url,
      data: param,
     async success(res) {
        if (res.data.Success) {
          let resp = await getVoucherDraw({
            openid: app.globalData.userInfo.openId,
            cityid: app.globalData.cityInfoId,
            itemid:  that.returnCoupon.Id,            
            itemtype: 1
          })
      
          if (resp.code==1) {
            that.setData({
              voucher: resp.Data.Voucher,
              showVoucher: true      
            })
          }  
          app.ShowMsg("恭喜你，优惠订单核销成功")     
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
  },
  gotoshopdetail: function (e) {
    var storeid = e.currentTarget.dataset.storeid
    var url = '../business_detail/business_detail?storeid=' + storeid
    wx.navigateTo({
      url: url,
    })
  },
  gotodetail: function (e) {

    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    var couponid = e.currentTarget.dataset.couponid
    var storeid = e.currentTarget.dataset.storeid
    var url = '../youhui_detail/youhui_detail?couponid=' + couponid +"&storeid=" + storeid
    wx.navigateTo({
      url: url,
    })
  }
})