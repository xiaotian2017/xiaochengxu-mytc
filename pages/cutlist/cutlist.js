
var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");

var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showpath: false,
    voucher: null,
    showVoucher: false,
    tranparm: "coupon",
    isgrouptabsecond: 0,//拼团第二个tab跟其他的不一样，用来控制
    cuts: [],
    coupons: [],
    loves: [],
    cityCardOrderList: [],
    groups: [],
    goods: [],
    tabfirst: 0,
    tabsecond: 0,
    cuters: [],
    arrayNav: ['优惠', '减价', '集爱心', '拼团', '商品'],
    clickId: 1,
    click_state: 0,
    currenttab: 0,
    buyversion: 0,
    isloadData: false,//是否在加载数据中
    pageIndex: 1,//页码
    PageSize: 10,
    windowHeight: undefined,
    showbottomtip: false,//是否已经到底
    showallbottomtip: false,
    isScroll: false
  },
  onLoad: function (options) {
    var that = this, t = options.type

    switch (t) {
      case 'coupon':
        that.setData({ tabfirst: 0, tranparm: t, tabsecond: 1 })
        break;
      case 'cut':
        that.setData({ tabfirst: 1, tranparm: t, tabsecond: 1 })
        break;
      case 'love':
        that.setData({ tabfirst: 2, tranparm: t })
        break;
      case 'group':
        that.setData({ tabfirst: 3, tranparm: t, tabsecond: 2, isgrouptabsecond: 1 })
        break;
      case 'goods':
        that.setData({ tabfirst: 4, isgrouptabsecond: 2, tabsecond: options.state })
        break
      default: that.setData({ tabsecond: 1 })
    }
    wx.setNavigationBarTitle({
      title: "我的订单"
    })
    that.setData({ "windowHeight": app.globalData.windowHeight })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.setData({
        buyversion: app.globalData.buyVersion
      })
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true
        })
      }
      that.loadmore();
    })
  },
  onPageScroll(e) {
    if (e.scrollTop > 10) {
      if (this.isSet) { return }
      this.setData({
        isScroll: true
      })
      this.isSet = true
    } else {
      this.isSet = false
      this.setData({
        isScroll: false
      })
    }
  },
  onShow() {
    if (this.data.tabfirst == 5) {
      this.setData({
        goods: [],
        pageIndex: 1,
        showbottomtip: false,
        showallbottomtip: false
      })
      this.loadmore();
    }
  },
  click_navfirst: function (e) {

    var that = this;
    var index = e.currentTarget.dataset.index;
    var tabnavname = 'coupon';
    switch (index) {
      case 0:
        that.setData({
          tabsecond: 1,
          isgrouptabsecond: 0
        })
        break;
      case 1:
        tabnavname = 'cut'
        that.setData({
          isgrouptabsecond: 0
        })
        break;
      case 2:
        tabnavname = 'love'
        that.setData({
          isgrouptabsecond: 0
        })
        break;
      case 3:
        tabnavname = 'group'
        that.setData({
          isgrouptabsecond: 1
        })
        break;
      case 4:
        tabnavname = 'goods'
        that.setData({
          isgrouptabsecond: 2,  // 显示商品子导航
          tabsecond: 0
        })
    }
    that.setData({ tabfirst: index, tranparm: tabnavname })
    that.setData({
      groups: [],
      cuts: [],
      coupons: [],
      goods: [],
      loves: [],
      cityCardOrderList: [],
      pageIndex: 1,
      showbottomtip: false,
      showallbottomtip: false
    })
    that.loadmore();
  },
  click_navsecond: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index // 子导航标志
    that.setData({ tabsecond: index })
    that.setData({
      loves: [],
      cuts: [],
      coupons: [],
      groups: [],
      goods: [],
      cityCardOrderList: [],
      pageIndex: 1,
      showbottomtip: false,
      showallbottomtip: false
    })
    that.loadmore();
  },
  click_state: function (e) {
    var state = e.currentTarget.dataset.state
    this.setData({ click_state: state })
  },
  // loadMainData: function () {
  //   var that = this;
  //   that.loadmore();
  // },
  onReachBottom: function () {
    var that = this;
    that.loadmore();
  },
  onPullDownRefresh() {
    this.setData({
      groups: [],
      cuts: [],
      coupons: [],
      goods: [],
      loves: [],
      cityCardOrderList: [],
      pageIndex: 1,
      showbottomtip: false,
      showallbottomtip: false
    })
    this.loadmore();
  },
  loadmore: function () {

    var that = this
    var statussecond = that.data.tabsecond
    var pidx = that.data.pageIndex
    var state = statussecond
    if (1 == statussecond) {
      state = 0
    }
    if (2 == statussecond) {
      state = -1
    }
    else if (3 == statussecond) {
      state = -4
    }
    if (this.data.tabfirst == 0 && statussecond == 3) {
      state = -2;
    }

    var param = {
      openId: app.globalData.userInfo.openId,
      appid: app.globalData.appid,
      pageindex: pidx,
      state: state
    }
    var tabfirst = that.data.tabfirst
    //默认抢优惠
    var url = addr.Address.GetMyCouponUserListByUserId

    if (tabfirst == 1)//砍价
    {
      var t = statussecond
      if (3 == statussecond) {
        t = -1;
      }
      url = addr.Address.GetMyStoreCuts
      param = {
        openid: app.globalData.userInfo.openId,
        pageIndex: pidx,
        t: t
      }
    }
    else if (tabfirst == 2)//集爱心
    {
      var t = statussecond

      if (3 == statussecond) {
        t = -1;
      }
      url = addr.Address.GetMyStoreLoves
      param = {
        cityid: app.globalData.cityInfoId,
        pageIndex: pidx,
        openid: app.globalData.userInfo.openId,
        t: t
      }
    }

    else if (tabfirst == 3)//拼团
    {
      var t = statussecond
      if (3 == statussecond) {
        t = -1;
      }
      url = addr.Address.GetMyGroups
      param = {
        cityid: app.globalData.cityInfoId,
        pageindex: pidx,
        openid: app.globalData.userInfo.openId,
        t: t
      }
    }
    else if (tabfirst == 4) // 商品
    {
      let goodsState;
      switch (parseInt(statussecond)) {
        case 0:
          goodsState = 99;  // 全部
          break;
        case 1:
          goodsState = 0;  // 未付款
          break;
        case 2:
          goodsState = 3;  // 待发货
          break;
        case 3:
          goodsState = -10;  // 待收货
          break;
        case 4:
          goodsState = -2;  // 已退款      
      }

      url = addr.Address.GetGoodsOrder

      param = {
        cityid: app.globalData.cityInfoId,
        pageindex: pidx,
        openid: app.globalData.userInfo.openId,
        state: goodsState
      }

    }
    if (!that.data.isloadData) {
      that.setData({
        "isloadData": true
      });

      util.showNavigationBarLoading()
      wx.request({
        url: url,
        data: param,
        success: function (res) {
          if ("" != res.data) {
            if (tabfirst == 0) {
              var list = that.data.coupons;
              if (res.data.Success) {
                var coupons = res.data.Data.MyUserCouponList;
                if (1 != pidx && 0 == coupons.length) {
                  that.setData({ showbottomtip: true });
                }
                else if (1 == pidx && 0 == coupons.length) {
                  that.setData({ showallbottomtip: true });
                }
                list = list.concat(coupons);
                that.setData({ coupons: list });
              }
              else {
                app.ShowMsg(res.data.Message)
              }
            }
            else if (tabfirst == 1)//砍价
            {
              var pagecutlist = that.data.cuts;
              var cuts = res.data;
              if (1 != pidx && 0 == cuts.length) {
                that.setData({ showbottomtip: true });
              }
              else if (1 == pidx && 0 == cuts.length) {
                that.setData({ showallbottomtip: true });
              }
              if (cuts.length > 0) {
                cuts.forEach(function (v) {
                  if (v.State == 0) {
                    v.statetext = "未付款"
                  }
                  else if (v.State == 1 && that.validateTimeStart(v.ValidTime)) {
                    v.statetext = "可使用"
                  }
                  else if (v.State == 2 && v.ValidUserOpenId == 'SYS') {
                    v.statetext = "已过期"
                  }
                  else if (v.State == 2) {
                    v.statetext = "已使用"
                  }
                })
                pagecutlist = pagecutlist.concat(cuts);
                that.setData({ cuts: pagecutlist });
              }

            }
            else if (tabfirst == 2) {
              //集爱心
              console.log(res)
              var pagelovelist = that.data.loves
              var loves = res.data.Data.myloves
              if (1 != pidx && 0 == loves.length) {
                that.setData({ showbottomtip: true });
              }
              else if (1 == pidx && 0 == loves.length) {
                that.setData({ showallbottomtip: true });
              }
              if (loves.length > 0) {
                loves.forEach(function (v) {
                  if (v.State == 0) {
                    v.statetext = "未付款"
                  }
                  else if (v.State == 1 && v.likeModel.TimeEnd) {
                    v.statetext = "可使用"
                  }
                  else if (v.State == 2 && v.likeModel.TimeEnd) {
                    v.statetext = "已过期"
                  }
                  else if (v.State == 2 && v.likeModel.TimeEnd) {
                    v.statetext = "已使用"
                  }
                })
                pagelovelist = pagelovelist.concat(loves);
                that.setData({ loves: pagelovelist });
              }

            }
            // 拼团
            else if (tabfirst == 3) {
              var groupShowList = that.data.groups;
              var groups = res.data.Data.listgroup;
              if (1 != pidx && 0 == groups.length) {
                that.setData({ showbottomtip: true });
              }
              else if (1 == pidx && 0 == groups.length) {
                that.setData({ showallbottomtip: true });
              }
              if (groups.length > 0) {
                groups.forEach(function (v) {
                  if (v.PState == 2) {
                    v.statetext = "拼团成功"
                  }
                  else if (v.PState == 0) {
                    v.statetext = "单买商品"
                  }
                  else if (v.PState == 1) {
                    v.statetext = "组团进行中"
                  }
                  else {
                    v.statetext = "拼团失败"
                  }
                })
                groupShowList = groupShowList.concat(groups);
                that.setData({ groups: groupShowList });
              }
            }
            // 商品
            else if (tabfirst == 4) {
              var goodList = that.data.goods;
              var goods = res.data.Data.listOrder;
              if (1 != pidx && 0 == goods.length) {
                that.setData({ showbottomtip: true });
              }
              else if (1 == pidx && 0 == goods.length) {
                that.setData({ showallbottomtip: true });
              }
              goodList = goodList.concat(goods);
              that.setData({ goods: goodList });
            }
          }
          else {
            if (1 != pidx) {
              that.setData({ showbottomtip: true });
            }
            else if (1 == pidx) {
              that.setData({ showallbottomtip: true });
            }
          }
          pidx++;
          that.setData({ "pageIndex": pidx });
          that.setData({ "isloadData": false });
        },
        complete: function () {
          util.hideNavigationBarLoading()
          wx.stopPullDownRefresh();
        }
      })
    }
  },

  validateTimeStart: function (vTimeSpan) {
    return new Date() > new Date(parseInt(vTimeSpan.replace("/Date(", "").replace(")/", ""), 10));;
  },
  clickToCouponDetail: function (e) {
 

    var id = e.currentTarget.dataset.id
    var csid = e.currentTarget.dataset.csid
    var url = '../my_coupon/mycoupon_detail?id=' + id + '&csid=' + csid
    wx.navigateTo({
      url: url,
    })
  },
  bottomnavswitch: function (e) {
    let path = e.currentTarget.dataset.url
    let idx = e.currentTarget.dataset.idx
    if (idx == 1 || idx == 2) {
      if (app.globalData.cityExpired == 1) {
        wx.redirectTo({
          url: '/pages/expirePage/expirePage',
        })
        return
      }
    }
    if (this.data.tabfirst == 5) {
      wx.reLaunch({
        url: '/pages/goods/goods_list/goods_list'
      })
      return;
    }
    wx.reLaunch({
      url: path,
    })
  },
  tocutdetail: function (e) {
    var cutid = e.currentTarget.dataset.cutid
    var url = '../cutPrice/cutPrice?cutid=' + cutid
    wx.navigateTo({
      url: url,
    })
  },
  gotusubgroupdetail: function (e) {

    var gsid = e.currentTarget.dataset.gsid
    var url = '../group_purchase/group_subPurchase/group_subPurchase?gsid=' + gsid
    wx.navigateTo({
      url: url,
    })
  },
  gotugroupdetail: function (e) {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    var gid = e.currentTarget.dataset.gid
    var url = '../group_purchase/group_purchase/group_purchase?gid=' + gid
    wx.navigateTo({
      url: url,
    })
  }
  ,//查看帮友
  gotohelps: function (e) {
    var buid = e.currentTarget.dataset.buid
    var typeid = e.currentTarget.dataset.type
    var url = '../activity_record/activity_record?buid=' + buid + "&t=" + typeid
    wx.navigateTo({
      url: url,
    })
  },
  gotucutdetail: function (e) {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    var bid = e.currentTarget.dataset.bid
    var buid = e.currentTarget.dataset.buid
    var url = '../cutPrice/cutPrice?buid=' + buid + "&bid=" + bid
    wx.navigateTo({
      url: url,
    })
  },
  gotolovedetail: function (e) {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    var lid = e.currentTarget.dataset.loveid
    var luid = e.currentTarget.dataset.luid
    var url = '../activity_jiaixin/activity_jiaixin_detail?luid=' + luid + "&loveid=" + lid
    wx.navigateTo({
      url: url,
    })
  },
  gotouse: function (e) {  
    var bid = e.currentTarget.dataset.bid
    var buid = e.currentTarget.dataset.buid
    var url = '../cutuse/cutuse?bid=' + bid + '&buid=' + buid
    wx.navigateTo({
      url: url,
    })

  },
  lovegotouse: function (e) {
    var loveid = e.currentTarget.dataset.loveid
    var luid = e.currentTarget.dataset.luid
    var url = '../cutuse/cutuse?loveid=' + loveid + '&luid=' + luid
    wx.navigateTo({
      url: url,
    })
  },
  toCityCardService(e) {
    util.vzNavigateTo({
      url: '/pages/cityCard/cityCardVerification',
      query: {
        hsid: e.currentTarget.dataset.hsid,
        halfserviceguid: e.currentTarget.dataset.halfserviceguid,
        id: e.currentTarget.dataset.id
      }
    })
  },
  gotousegroup(e) {
    util.vzNavigateTo({
      url: '/pages/groupuse/groupuse',
      query: {
        gid: e.currentTarget.dataset.gid,
        guid: e.currentTarget.dataset.guid
      }
    })
  },
  //付款
  goPay(e) {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    let that = this
    var url = ""
    let { buid, atype, bid } = { ...e.currentTarget.dataset }
    if (atype == 0) {//减价
      var url = '../cutPrice/cutPrice?buid=' + buid + "&bid=" + bid
    } else if (atype == 1) {
      var url = '../activity_jiaixin/activity_jiaixin_detail?luid=' + buid + "&loveid=" + bid
    }
    util.vzNavigateTo({
      url: url

    })
  },
  // 商品付款   等剑锋下单功能做完再调试
  goodsPay(e) {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    let that = this;
    //付款成功后回调
    let payRefun = (state = false) => {
      if (!state) {
        wx.showToast({
          title: '已取消付款',
          duration: 2000
        })
        return;
      }
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 1000
      })
      setTimeout(() => {
        console.log("支付成功")
        // 转到贺卡
        that.setData({
          goods: [],
          pageIndex: 1,
          showbottomtip: false,
          showallbottomtip: false
        })
        that.loadmore();
      }, 1000)
    }

    wx.request({
      url: addr.Address.RefleshOrderNo,
      data: {
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
        orderId: e.currentTarget.dataset.id,
        goid: e.currentTarget.dataset.goid
      },
      success(res) {
        if (res.data.code == 1) {
          util.PayOrder(res.data.Data.orderid, { openId: app.globalData.userInfo.openId }, {
            failed: function (res) {
              wx.hideLoading();
              payRefun();
            },
            success: function (res) {
              wx.hideLoading();
              if (res == "wxpay") {
              } else if (res == "success") {
                payRefun(1)
              }
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  // 商品取消订单
  cancelOrder(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否确定取消订单?',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: addr.Address.CancelGoodOrder,
            data: {
              openid: app.globalData.userInfo.openId,
              cityid: app.globalData.cityInfoId,
              oid: e.currentTarget.dataset.id
            },
            success(res) {
              if (res.data.code == 1) {
                wx.showToast({
                  title: res.data.msg
                })
                setTimeout(() => {
                  that.setData({
                    goods: [],
                    pageIndex: 1,
                    showbottomtip: false,
                    showallbottomtip: false
                  })
                  that.loadmore();
                })
              } else {
                wx.showToast({
                  title: res.data.msg
                })
              }
              setTimeout(() => {
                that.setData({
                  goods: [],
                  pageIndex: 1,
                  showbottomtip: false,
                  showallbottomtip: false
                })
                that.loadmore();
              })
            }
          })
        }
      }
    })
  },
  // 商品确认收货  等剑锋下单功能做完再调试
  confirmAccept(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认收货 ? 如商品有质量问题 , 请在三天内联系商家协商 ! 商家联系电话 : ' + e.currentTarget.dataset.tel,
      success(res) {
        if (res.confirm) {
          wx.request({
            url: addr.Address.ConfirmAccept,
            data: {
              openid: app.globalData.userInfo.openId,
              cityid: app.globalData.cityInfoId,
              orderid: e.currentTarget.dataset.id
            },
            success(res) {
              if (res.data.code == 1) {
                var uservoucher = res.data.Data.uservoucher
                if (null != uservoucher && undefined != uservoucher) {
                  that.setData({
                    voucher: res.data.Data.uservoucher,
                    showVoucher: true
                  })
                }
                wx.showToast({
                  title: res.data.msg
                })
                setTimeout(() => {
                  that.setData({
                    goods: [],
                    pageIndex: 1,
                    showbottomtip: false,
                    showallbottomtip: false
                  })
                  that.loadmore();
                })
              } else {
                wx.showToast({
                  title: res.data.msg
                })
              }
            }
          })
        }
      }
    })
  },
  // 去商品订单详细页
  toOrderDetail(e) {

    util.vzNavigateTo({
      url: '/pages/goods/goodsOrderDetail',
      query: {
        oid: e.currentTarget.dataset.id
      }
    })
  },
  // 去店铺
  toStore(e) {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    util.vzNavigateTo({
      url: '/pages/business_detail/business_detail',
      query: {
        storeid: e.currentTarget.dataset.sid
      }
    })
  },
  refundCoupon(e) {
    var scid = e.currentTarget.dataset.scid
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认是否要退款此优惠',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: addr.Address.RefundCoupon,
            data: {
              openid: app.globalData.userInfo.openId,
              cityid: app.globalData.cityInfoId,
              scid: scid
            },
            success(res) {
              if (res.data.Success) {
                app.ShowMsg(res.data.msg)
                setTimeout(() => {
                  that.setData({
                    coupons: [],
                    pageIndex: 1,
                    showbottomtip: false,
                    showallbottomtip: false
                  })
                  that.loadmore();
                })
              } else {
                app.ShowMsg(res.data.msg)
              }
            }
          })
        }
      }
    })
  },
  refundGroup(e) {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    var guid = e.currentTarget.dataset.guid
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认是否要退款此拼团',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: addr.Address.RefundGroup,
            data: {
              openid: app.globalData.userInfo.openId,
              cityid: app.globalData.cityInfoId,
              guid: guid
            },
            success(res) {
              if (res.data.Success) {
                app.ShowMsg(res.data.msg)
                setTimeout(() => {
                  that.setData({
                    groups: [],
                    pageIndex: 1,
                    showbottomtip: false,
                    showallbottomtip: false
                  })
                  that.loadmore();
                })
              } else {
                app.ShowMsg(res.data.msg)
              }
            }
          })
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
  hiddenTips: function () {
    var that = this
    var path = addr.getCurrentPageUrlWithArgs()
    path += "&type=" + that.data.tranparm
    util.ShowPath(path)
  }
})
