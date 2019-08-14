var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
let { HOST } = require("../../utils/addr");
const regeneratorRuntime = require('..//../utils/runtime');
let { httpClient } = require("../../utils/util.js");
const drawVoucher = (params) => httpClient({ addr: HOST + '/IBaseData/DrawVoucher', data: params, method: 'POST' });
Page({
  data: {
    store: null,
    storeId: 0,
    cash: 0,
    miniCouponList: [],
    hasget: [],
    isShowCouponBot: false,
    amount: "",
    showcc: true,
    isShowCouponAot: false,
    needpay: 0.0,
    drawCurrent: 90000,
    userVoucher: null,
    MemberState: 0,
    MemberDisCount: 0,
    CanPayMember: 0,
    payprice: 0,
    discountmoney: "",
    OpenMemberPrice: false
  },
  onLoad: function (options) {
    var that = this
    var storeId = options.storeid
    that.setData({      
      storeId: storeId
    })
    app.getUserInfo(function () {
      that.init()
    })
  },
  init: function () {
    var that = this
    that.setData({ CanPayMember: app.globalData.CCityConfig.CityMember ? 1 : 0 })    
    // that.setData({ CanPayMember: 0 })   
    that.GetCoupons()
  },
  //我拥有的劵和可领取的劵
  GetCoupons: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.gsvlist,
      data: {
        storeId: that.data.storeId,
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        getstoreconfig: 1
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) { 
          that.setData({
            miniCouponList: res.data.Data.list,
            hasget: res.data.Data.userVouList,      
            store: res.data.Data.Store,
            OpenMemberPrice: res.data.Data.OpenMemberPrice,
            MemberState: res.data.Data.payonlineconfig.state,
            MemberDisCount: res.data.Data.payonlineconfig.discount/10,       
            discountDays:res.data.Data.payonlineconfig.discountDays && res.data.Data.payonlineconfig.discountDays.split('|').join(' ')
          });
        } else {
          app.ShowMsg(res.data.Message)
        }
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  cashInputEvent: function (e) {
    var cash = util.GetDecimal(e.detail.value, 2)
    this.setData({
      cash: cash
    })
  },
  async drawVoucher(e) {
    var that = this
    var idx = e.currentTarget.dataset.idx
    let data = await drawVoucher({
      openid: app.globalData.userInfo.openId,
      cityid: app.globalData.cityInfoId,
      vid: e.currentTarget.dataset.vid,
      areacode: app.globalData.areaCode
    })
    if (data.Data.result) {
      this.setData({
        showTips: true,
        content: '领取成功,刷新页面',
      })
      var updatekey = `miniCouponList[${idx}].IsHaving`
      that.setData({ [updatekey]: 1 })
      setTimeout(function () { app.reload() }, 2500)


    } else {
      this.setData({
        showTips: true,
        content: data.Message == '请求成功' ? '系统错误' : data.Message
      })
    }
  },
  clickToPay: function () {
    var that = this;
    if (that.data.needpay <= 0) {
      app.ShowMsg("消费金额必须大于0")
      return
    }
    if (!/^[0-9]+(.[0-9]{1,2})?$/.test(that.data.needpay)) {
      app.ShowMsg("请输入正确的消费金额,最多二位小数")
      return
    }
    var amount = parseFloat(that.data.amount)
    var isCityMember = 0;
    var mermber = app.globalData.memberinfo
    if (that.MemberState == 1 && null != mermber && mermber.RightsCount > 0 && that.CanPayMember > 0) {
      amount = amount * (that.MemberDisCount * 100 / 10000); isCityMember = 1;

    } var uvid = 0;
    if (that.data.userVoucher != null) {
      if (that.data.amount <= (that.data.userVoucher.Money)) {
        that.setData({ userVoucher: null })
        app.ShowMsg("支付金额小于代金券金额")

        return false;
      }
      uvid = that.data.userVoucher.Id;
    }

    var param = {
      StoreId: that.data.storeId,
      CityInfoId: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      Appid: app.globalData.appid,
      Amount: that.data.amount*100, 
      Uvid: uvid, 
      Buyuserid: isCityMember, 
      Money: that.data.amount*100
    }

    wx.request({
      url: addr.Address.StorePayOnline,
      data: param,
      method: 'post',
      success: function (res) {
        console.log(res)
        if (res.data.code == 1) {
          var orderid = res.data.data.orderid
          if (orderid > 0) {
            var paramorder = {}
            paramorder.openId = app.globalData.userInfo.openId       
            util.PayOrder(orderid, paramorder, {
              failed: function (res) {
                setTimeout(function () {
                  wx.hideToast()
                }, 500)
                wx.hideNavigationBarLoading()
                that.refun(0)
              },
              success: function (res) {
                console.log(res)
                if (res == "wxpay") {
                  //发起支付      
                } else if (res == "success") {
                  that.refun(1)
                }
              }
            })
          }
          else {
            app.ShowMsg("订单出错，系统错误")
            return
          }
        } else {
          app.ShowMsg(res.data.msg)
        }
      }
    })
  },
  changePayAmount: function () {
    var thisVue = this;
    var oldprice = thisVue.data.amount;
    var mermber = app.globalData.memberinfo 
    
    if(!thisVue.data.hasget.length) {
      if (thisVue.data.MemberState == 1 && thisVue.data.CanPayMember > 0 && thisVue.data.OpenMemberPrice ) {
        oldprice = (oldprice * (thisVue.data.MemberDisCount * 100 / 1000));   
        oldprice =  (oldprice<0.01&& oldprice!=0?0.01:oldprice).toFixed(2)
      }
    } 
    thisVue.setData({ needpay: oldprice });      
  },
  caculate(e) {
    var thisVue = this
    var amount = thisVue.data.amount   
    var number = e.currentTarget.dataset.num
    if (number != undefined) {
      amount = amount + number; 
      amount = amount.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符     
      amount = amount.replace(/^\./g, ""); //验证第一个字符是数字
      amount = amount.replace(/\.{2,}/g, ".") //只保留第一个, 清除多余的
      amount = amount.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".")
      amount = amount.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') //只能输入两个小数
      amount = amount.length > 6 ? amount.substring(0, 6) : amount
      if (amount != "") {
        thisVue.setData({ amount })
        var isUseVoucher = false;       
        thisVue.changePayAmount();        
        for (var i = 0; i < thisVue.data.hasget.length; i++) {
          if (!isUseVoucher) {
            isUseVoucher = thisVue.CheckItem(thisVue.data.hasget[i], i, false);
          } else {
            break;
          }
        }
      }
    }
  },
  CheckItem: function (item, index, showtip) {//选择代金券
    var thisVue = this  
    var mermber = app.globalData.memberinfo       
    var _oldprice = thisVue.data.amount;   
    if (thisVue.data.MemberState == 1 && thisVue.data.CanPayMember > 0 && thisVue.data.OpenMemberPrice ) {
      _oldprice = (_oldprice * (thisVue.data.MemberDisCount * 100 / 1000));    
      _oldprice =  _oldprice<0.01&& _oldprice!=0?0.01:_oldprice
    }   
    thisVue.setData({ needpay: parseFloat(_oldprice).toFixed(2)});   
    
    if (item.Voucher.IsDiscount > 0) {
      var money = thisVue.data.amount * (item.Voucher.Discount * 100 / 10000);   
      if (thisVue.data.MemberState == 1 && thisVue.data.CanPayMember > 0 && thisVue.data.OpenMemberPrice ) {
        money = money * (thisVue.data.MemberDisCount * 100 / 1000);                 
      }
      if (money <= 0) {
        if (showtip)
          app.ShowMsg('支付金额必须大于抵扣金额')
        return false;
      } else {
        thisVue.setData({ userVoucher: item })
        thisVue.data.drawCurrent = index;
        var total = parseFloat(money).toFixed(2) == 0 ? 0.01 : parseFloat(money).toFixed(2);
        thisVue.setData({ needpay: total })        
      }
    } else {
      if (thisVue.data.amount >= item.Voucher.Deducting) {
        var money = thisVue.data.amount - (item.Voucher.VoucherMoney)      
        if (thisVue.data.MemberState == 1 && thisVue.data.CanPayMember > 0 && thisVue.data.OpenMemberPrice ) {
          money = money * (thisVue.data.MemberDisCount * 100 / 1000);                 
        }
        if (money <= 0) {
          if (showtip)
            app.ShowMsg('支付金额必须大于抵扣金额')
          return false;
        } else {
          thisVue.setData({ userVoucher: item })
          thisVue.data.drawCurrent = index;
          var total = parseFloat(money).toFixed(2);
          thisVue.setData({ needpay: total })          
        }
      } else {
        thisVue.setData({          
          userVoucher: null,    
        })
        return false;
      } 
    }
  },
  emptypage: function () {
    this.setData({
      amount: '',
      userVoucher: null,
      needpay: 0
    })
  },
  clearnum: function (e) {
    var thisVue = this
    var amount = thisVue.data.amount

    // if (amount.length <= 1) {
    //   amount = ''
    // } else {
      amount = amount.substring(0, amount.length - 1)
    // }
    if(amount=='0.'||!amount.length) {
      amount= ''
    }   

    if (amount == null || amount == '') {
      thisVue.emptypage();
      var isUseVoucher = false;
    } else {
      setTimeout(function () {
        thisVue.changePayAmount();
        for (var i = 0; i < thisVue.data.hasget.length; i++) {
          if (!isUseVoucher) {
            isUseVoucher = thisVue.CheckItem(thisVue.data.hasget[i], i, false);
          } else {
            break;
          }
        }
      }, 500);
    }
 
    thisVue.setData({ amount })
  }, gotostore(e) {
    var storeid = e.currentTarget.dataset.storeid
    wx.redirectTo({
      url: '/pages/business_detail/business_detail?storeid=' + storeid
    })
  },
  mycouponuse(e) {
    var thisVue = this
    var item = e.currentTarget.dataset.target
    var index = e.currentTarget.dataset.idx
    if (item.Voucher.IsDiscount > 0) {
      var money = thisVue.data.amount * (item.Voucher.Discount * 100 / 10000);
      if (money <= 0) {
        // if (showtip)
        app.ShowMsg(支付金额必须大于抵扣金额)
        return false;
      } else {
        thisVue.setData({ userVoucher: item })
        thisVue.data.drawCurrent = index;
        var total = parseFloat(money).toFixed(2);
        thisVue.setData({ needpay: total })
      }
    } else {
      if (thisVue.data.amount >= item.Voucher.Deducting) {
        var money = thisVue.data.amount - (item.Voucher.VoucherMoney)
        if (money <= 0) {
          // if (showtip)
          app.ShowMsg('支付金额必须大于抵扣金额')
          return false;
        } else {
          thisVue.setData({ userVoucher: item })
          thisVue.data.drawCurrent = index;
          var total = parseFloat(money).toFixed(2);
          thisVue.setData({ needpay: total })
        }
      } else {
        // if (showtip)
        app.ShowMsg('支付金额必须大于抵扣金额')
        return false;
      }
    }
  },
  showCouponList() {
    this.setData({
      isShowCouponBot: !this.data.isShowCouponBot
    })
  },
  showmycoupon() {
    var that = this
    if (that.data.hasget.length === 0)
      return
    this.setData({
      isShowCouponAot: !this.data.isShowCouponAot
    })
  },
  showcaculate(e) {

    this.setData({
      showcc: true
    })
  },
  closecaculate() {
    this.setData({
      showcc: false
    })
  },
  //付款成功后回调
  refun: function (state) {
    console.log(state)
    var that = this
    if (state == 0) {
      var msg = '您已取消付款'
      app.ShowMsg(msg)
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })

      }, 500)
    }
    else if (state == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000,
      })
      wx.redirectTo({
        url: "/pages/payTransfer/payTransfer?type=payonline&storeid=" + that.data.storeId
      })
    }
  },
  toGetMember() {
    wx.redirectTo({
      url: '/pages/cityCard/cityCardPurchase'
    })
  }
})
