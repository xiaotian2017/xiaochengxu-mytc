var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
let addCouponOrder = (p) => util.httpClient({ host, method: 'POST', addr: 'IBaseData/AddCouponOrder', data: p });
Page({
  data: {
    isloadall: 0,
    coupon: null,
    buyNum: 1,
    maxNum: false,
    telePhone: "",
    remark: "",
    hasVoucher: false,
    uservoucherlist: [],
    payMoney: '',
    voucherIdx: '',
    voucherMoney: 0,
    sname: ''
  },
  onLoad: function (options) {
    var that = this
    wx.setNavigationBarTitle({
      title: "购买店铺优惠"
    })
    that.setData({
      sname: options.sname
    })
    app.getUserInfo(function () {
      var storeId = options.storeid
      var couponId = options.couponid
      that.GetOrderDetail(205, couponId);
    })
  },
  //获取优惠券详情
  GetOrderDetail: function (type, itemId) {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetOrderDetail,
      data: {
        type: type,
        itemId: itemId,
        openid: app.globalData.userInfo.openId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        console.log(res.data.Data.returnObj.MemberPrice)
        console.log(app.globalData.memberinfo.RightsCount > 0)
        if (res.data.Success) {
          let isMemberPrice = app.globalData.CCityConfig.CityMember && res.data.Data.returnObj.MemberPriceState == 1 && app.globalData.memberinfo.RightsCount > 0
          res.data.Data.returnObj.BuyPrice = isMemberPrice && res.data.Data.returnObj.MemberPrice || res.data.Data.returnObj.BuyPrice
          that.setData({
            coupon: res.data.Data.returnObj,
            isloadall: 1,
            uservoucherlist: res.data.Data.uservoucherlist,
            payMoney: isMemberPrice && res.data.Data.returnObj.MemberPrice || res.data.Data.returnObj.BuyPrice,
            limitNum: res.data.Data.returnObj.LimitNum,
            RemainNum: res.data.Data.returnObj.RemainNum
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
  getBuyNum(e) {
    let that = this
    let _num = parseInt(e.detail.value)
    if (!_num) {
      that.setData({
        voucherIdx: '',
        voucherMoney: 0
      })
    }
    if (this.data.limitNum > 0) {
      if (_num > this.data.limitNum) {
        if (this.data.RemainNum >= this.data.limitNum) {
          this.setData({
            buyNum: this.data.limitNum
          })
          app.ShowMsg('已达到最大购买数量！')
        } else {
          this.setData({
            buyNum: this.data.RemainNum
          })
          app.ShowMsg('已达到最大购买数量！')
        }
      } else {
        this.setData({
          buyNum: _num
        })
      }
    } else {
      if (_num > this.data.RemainNum) {
        this.setData({
          buyNum: this.data.RemainNum
        })
        app.ShowMsg('已达到最大购买数量！')
      } else {
        this.setData({
          buyNum: _num
        })
      }
    }

    if (that.data.payMoney * that.data.buyNum <= (that.data.voucherMoney * 100)) {
      that.setData({
        voucherIdx: '',
        voucherMoney: 0
      })
    }
    if (that.data.voucherIdx != '') {
      if (that.data.uservoucherlist[that.data.voucherIdx].Voucher.Deducting > 0) {
        if (that.data.payMoney * that.data.buyNum <= that.data.uservoucherlist[that.data.voucherIdx].Voucher.Deducting * 100) {
          that.setData({
            voucherIdx: '',
            voucherMoney: 0
          })
        }
      }
    }
  },
  //改变购买数量
  changeBuyNum: function (e) {
    var that = this
    var range = parseInt(e.currentTarget.dataset.range)
    var buyNum = that.data.buyNum + range
    buyNum = that.checkAccordNum(buyNum, range)

    that.setData({
      buyNum: buyNum
    });

    if (that.data.payMoney * that.data.buyNum <= (that.data.voucherMoney * 100)) {
      that.setData({
        voucherIdx: '',
        voucherMoney: 0
      })
    }

    if (that.data.voucherIdx != '') {
      if (that.data.uservoucherlist[that.data.voucherIdx].Voucher.Deducting > 0) {
        if (that.data.payMoney * that.data.buyNum <= that.data.uservoucherlist[that.data.voucherIdx].Voucher.Deducting * 100) {
          that.setData({
            voucherIdx: '',
            voucherMoney: 0
          })
        }
      }
    }

  },
  //检查优惠券数量
  checkAccordNum: function (num, range) {
    var maxNum = false;
    var coupon = this.data.coupon

    if (num < 1 && range <= 0 || num > coupon.RemainNum || (num > coupon.LimitNum && 0 != coupon.LimitNum)) {
      maxNum = true;
      num = num - range;
    }
    if (num == 1 && range <= 0) {
      maxNum = false;
    }
    if (num == coupon.LimitNum) {
      maxNum = true;
    }
    this.setData({
      maxNum: maxNum
    });
    return num;
  },
  //联系电话
  telePhoneInput: function (e) {
    this.setData({
      telePhone: e.detail.value
    })
  },
  //备注
  remarkInput: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },
  async clickToPay() {
    //如果是免费的
    var that = this
    var buyprice = that.data.coupon.BuyPrice
    if (0 == buyprice) {
      var url = addr.Address.BuyFreeCoupon
      util.showNavigationBarLoading()
      wx.request({
        url: url,
        data: {
          openId: app.globalData.userInfo.openId,
          scid: that.data.coupon.Id
        },
        method: "GET",
        header: {
          'content-type': "application/json"
        },
        success: function (res) {
          if (res.data.code == 1) {
            app.ShowMsg(res.data.msg)

            setTimeout(function () {
              wx.redirectTo({
                url: "../my_coupon/my_coupon"
              })
            }, 2000)
          } else {
            app.ShowMsg(res.data.msg)

          }
        },
        fail: function (e) {

        },
        complete: function () {
          util.hideNavigationBarLoading()
        }
      })
    }
    else {
      let resp = await addCouponOrder({
        areacode: app.globalData.areaCode,
        openid: app.globalData.userInfo.openId,
        cid: this.data.coupon.Id,
        quantity: this.data.buyNum,
        appid: app.globalData.appid,
        uvId: this.data.voucherIdx !== '' ? this.data.uservoucherlist[this.data.voucherIdx].Id : ''
      })

      if (resp.code == 1) {
        if (resp.orderid && resp.orderid > 0) {
          util.PayOrder(resp.orderid, { openId: app.globalData.userInfo.openId }, {
            failed: function (res) {
              wx.hideLoading();
              that.refun(0)
            },
            success: function (res) {
              wx.hideLoading();
              if (res == "wxpay") {
                // 发起支付        
              } else if (res == "success") {
                that.refun(1)
              }
            }
          })
        }
      } else {
        app.ShowMsg(resp.msg)
      }
    }
  },
  //付款成功后回调
  refun: function (state) {
    if (state == 0) {
      wx.showToast({
        title: '已取消付款',
        duration: 2000
      })
    }
    else if (state == 1) {
      // wx.showToast({
      //   title: '支付成功 !',
      //   icon: 'success',
      //   duration: 2000
      // })
      app.globalData.memberinfo.RightsCount = app.globalData.memberinfo.RightsCount-1
      wx.redirectTo({
        url: "/pages/payTransfer/payTransfer?type=coupon"
      })
    }

  },
  showVoucher() {
    this.setData({
      hasVoucher: !this.data.hasVoucher,
      payMoney: this.data.coupon.BuyPrice
    })
  },
  hideVoucher() {
    this.setData({
      hasVoucher: false,
      voucherIdx: '',
      voucherMoney: 0
    })
  },
  chooseVoucher(e) {
    let idx = e.currentTarget.dataset.idx
    this.setData({
      voucherIdx: idx
    })
    let voucher = this.data.uservoucherlist[idx]
    let voucherMoney = voucher.Money
    if (voucher.Voucher.Deducting > 0) {
      if (this.data.coupon.BuyPrice * this.data.buyNum < voucher.Voucher.Deducting * 100) {
        app.ShowMsg('购买金额不足满减金额，该代金券不可用')
      } else {
        if (this.data.coupon.BuyPrice * this.data.buyNum <= voucherMoney * 100) {
          app.ShowMsg('购买金额小于减免金额，该代金券不可用')
        } else {
          this.setData({
            payMoney: this.data.coupon.BuyPrice,
            hasVoucher: false,
            voucherMoney: voucherMoney
          })
        }
      }
    } else {
      if (this.data.coupon.BuyPrice * this.data.buyNum <= voucherMoney * 100) {
        app.ShowMsg('购买金额小于减免金额，该代金券不可用')
      } else {
        this.setData({
          payMoney: this.data.coupon.BuyPrice,
          hasVoucher: false,
          voucherMoney: voucherMoney
        })
      }
    }
  }
})