var util = require("../../utils/util.js");
const {
  vzNavigateTo,
  httpClient
} = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
const GetMyFx = (fxparam) => httpClient({
  addr: addr.Address.GetMyFx,
  data: fxparam
});
const ApplyCityFx = (fxparam) => httpClient({
  addr: addr.Address.AddCitySub,
  data: fxparam
});
Page({
  data: {
    showDistribution: false,
    fxlist: [],
    isLoadAll: false,
    fxratelay: 0,
    fxrateconfig: {},
    surelay: 0,
    opencityfx: false,
    applyclick: 0,
    hasopen: 0,
    isFxer: false
  },
  onLoad() {
    var that = this
    wx.setNavigationBarTitle({
      title: '我的分销'
    })
    app.getUserInfo(function () {
      that.Init()
    })


  },
  showDistribution() {
    var newVal = !this.data.showDistribution
    this.setData({
      showDistribution: newVal
    })
  },
  async buy() {
    let that = this
    wx.showNavigationBarLoading(); // 可以放httpClient的
    let resp = await ApplyCityFx({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,

    });
    wx.stopPullDownRefresh();
    if (resp.Success) {
      var subid = resp.Data.citysubid
      var noneedpay = resp.Data.noneedpay
      if (subid > 0 && 0 == noneedpay) {
        wx.request({
          url: addr.Address.CityFxPay,
          data: {
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            appid: app.globalData.appid,
            subcityid: subid
          },
          success(res) {
            if (res.data.Success) {
              var orderid = res.data.Data.orderid
              if (orderid > 0) {
                var param = {}
                param.openId = app.globalData.userInfo.openId
                util.PayOrder(orderid, param, {
                  failed: function (res) {
                    setTimeout(function () {
                      wx.hideToast()
                    }, 500)
                    wx.hideNavigationBarLoading()
                    that.refun(0)
                  },
                  success: function (res) {
                    if (res == "wxpay") {
                      //发起支付
                      wx.hideNavigationBarLoading()
                      setTimeout(function () {
                        wx.hideToast()
                      }, 100)
                    } else if (res == "success") {
                      that.refun(1)
                    }
                  }
                })
              } else {
                app.ShowMsg("订单出错，系统错误")
                return
              }
            }
          }
        })

      } else {
        wx.redirectTo({
          url: "/pages/distribution/myDistribution"
        })

      }
    } else {
      app.ShowMsg(resp.msg)

    }
    wx.hideNavigationBarLoading();

  },
  async Init() {
    let that = this
    if (this.data.isLoadAll) return;
    wx.showNavigationBarLoading(); // 可以放httpClient的
    let resp = await GetMyFx({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
    });
    wx.stopPullDownRefresh();
    if (resp.Success) {
      var resultList = resp.Data.list

      for (let i = 0; i < resultList.length; i++) {
        if (resultList[i].FxType < 3) {
          if (resultList[i].State != 2 || resultList[i].State != -1) {
            that.setData({
              isFxer: true,
            })
            break
          }
        }
      }

      if (!!resp.Data.hasopen) {
        that.setData({
          hasopen: resp.Data.hasopen,
        })
      }
      if (!!resp.Data.opencityfx) {
        that.setData({
          payprice: resp.Data.payprice,
          opencityfx: resp.Data.opencityfx
        })
      }
      if (!!resp.Data.fxrateconfig) {
        that.setData({
          fxrateconfig: resp.Data.fxrateconfig,
        })
      }
      if (!resultList || resultList.length < 10) {
        this.setData({
          isLoadAll: true,
          fxlist: resultList
        })

      } else if (!!resultList) {
        this.setData({

          fxlist: resultList
        })
        console.log(resultList)
      }


    } else {
      app.ShowMsg(resp.msg)

    }
    wx.hideNavigationBarLoading();

  },
  seeearns: function (e) {
    var itemtype = e.currentTarget.dataset.itemtype
    var itemid = e.currentTarget.dataset.itemid
    var subcityid = 0
    if (0 == itemtype && 0 == itemid) {
      subcityid = e.currentTarget.dataset.subcityid
    }
    var url = "/pages/distribution/fxshouyi?itemid=" + itemid + "&itemtype=" + itemtype + "&subcityid=" + subcityid;
    wx.navigateTo({
      url: url,
    })

  },
  turnfxrate: function () {
    let that = this
    var oldVal = that.data.fxratelay
    let newVal = oldVal == 0 ? 1 : 0
    this.setData({
      fxratelay: newVal
    })
  },
  applycityfx: function () {
    if (this.data.isFxer) {
      return
    }
    let that = this
    var oldVal = that.data.surelay
    let newVal = oldVal == 0 ? 1 : 0
    this.setData({
      surelay: newVal
    })
  },
  sureapply: function () {
    var that = this
    if (0 == that.data.applyclick) {
      that.setData({
        applyclick: 1

      })
      that.buy()
    }

  },
  //付款成功后回调
  refun: function (state) {
    if (state == 0) {
      app.ShowMsg("已取消付款")
    } else if (state == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000
      })
      wx.redirectTo({
        url: "/pages/distribution/myDistribution"
      })
    }

  },
  toGoodsDetail(e) {
    const itemType = e.currentTarget.dataset.goodtype //商品活动类型
    const goodid = e.currentTarget.dataset.gid //商品id
    console.log(itemType, goodid)
    switch (itemType) {
      case 1: //普通商品
        wx.navigateTo({
          url: '/pages/goods/goods_detail/goods_detail?gid=' + goodid
        })
        break;
      case 2: //抢优惠
        wx.navigateTo({
          url: '/pages/youhui_detail/youhui_detail?csid=' + goodid
        })
        break;
      case 3: //爱心价
        wx.navigateTo({
          url: '/pages/activity_jiaixin/activity_jiaixin_detail?luid=0&loveid=' + goodid
        })
        break;
      case 4: //拼团
        wx.navigateTo({
          url: '/pages/group_purchase/group_purchase/group_purchase?gid=' + goodid
        })
        break;
      case 5: //减价
        wx.navigateTo({
          url: '/pages/cutPriceTake/cutPriceTake?bid=' + goodid
        })
        break;
      default: //
    }

  }
})