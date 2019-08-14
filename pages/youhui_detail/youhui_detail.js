var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var WxParse = require('../../utils/wxParse/wxParse.js');
const regeneratorRuntime = require('../../utils/runtime');
var app = getApp()
let checkStore = (p) => util.httpClient({
  addr: addr.Address.checkStoreStatus,
  data: p
});
Page({
  data: {
    shareposterparams: {
      introduceimg: "",
      title: "",
      originalprice: 0,
      floorprice: 0,
      remainnum: 0,
      enddate: "",
      receiveend: "",
      openid: "",
      appid: "",
    },
    loadall: 0,
    showpath: false,
    currentphone: '', //非小程序店铺弹窗提醒电话
    currentshopqrcode: '', //非小程序店铺弹窗提醒二维码
    currentshoptip: '', //非小程序店铺弹窗提醒文字
    storeId: 0,
    couponId: 0,
    coupon: null,
    headImgs: null,
    store: null,
    countdown: "",
    ValidDateStart: '',
    ValidDateEnd: '',
    UseDateStart: '',
    UseDateEnd: '',
    // 红包相关参数
    ruid: 0,
    isShareSuccess: false,
    videoParams: {
      convertFilePath: '',
      videoPosterPath: ''
    },
    countTimer: null,
    voucher: null,
    fromuid: 0,
    renderpage: 0
  },
  onShow: function () {
    this.poster = this.selectComponent("#poster");
  },
  onLoad: function (options) {
    this.storeid = options.sid
    var that = this
    var couponId = options.couponid
    var ruid = options.ruid
    var r = !!options.r ? options.r : 0

    //从海报进来
    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数

        couponId = addr.getsceneparam("couponid", scene)
        ruid = addr.getsceneparam("ruid", scene)
        if (0 == r)
          r = addr.getsceneparam("r", scene)
      }
    }

    that.setData({
      couponId: couponId,
      fromuid: r
    })

    app.getUserInfo(function () {
      that.checkStore()
      that.setData({
        renderpage: 1
      })
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true
        })
      }

      that.init()
      wx.hideLoading()
      wx.stopPullDownRefresh()

      wx.setNavigationBarTitle({
        title: app.globalData.cityName
      })
    })
  },
  async checkStore() {
    let resp = await checkStore({
      cityInfoId: app.globalData.cityInfoId,
      storeId: this.storeid
      //  storeId: 8678321

    })
    if (resp.Status == '-3') {
      wx.redirectTo({
        url: '/pages/storeExpirePage/storeExpirePage',
      })
    }
  },
  onShareAppMessage: function (res) {
    var that = this
    var path = addr.getCurrentPageUrlWithArgs()
    let {
      isfx,
      fxitemid
    } = {
      ...that.data.shareposterparams
    }
    if (1 == isfx) {
      path += '&r=100' + app.globalData.userInfo.Id
    }

    if (this.data.rid) {
      path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
    }
    s
    var sharename = app.globalData.cityName
    if ('' != that.data.store.SName) {
      sharename = that.data.store.SName
    }
    try {
      if (1 == isfx) {
        util.BindFxOrigin({
          cityid: app.globalData.cityInfoId,
          openid: app.globalData.userInfo.openId,
          storeid: that.data.storeId,
          fxitemid: fxitemid,
          fxtype: 2
        });
      }
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    return {
      title: sharename,
      path: path,
      success: function (res) {
        // 添加领取次数
        if (that.data.rid) {
          that.setData({
            isShareSuccess: true
          })
        }

      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


  //轮播图预览
  clickToPreview: function (e) {
    var that = this
    var currentUrl = e.target.dataset.src
    wx.previewImage({
      current: currentUrl,
      urls: that.data.coupon.ImgList.map(m => m.filepath)
    })
  },
  init: function () {
    var that = this;
    that.GetCouponDetail()


    that.countdown()
  },
  //倒计时
  countdown: function () {
    var that = this
    setInterval(function () {
      if (that.data.coupon != null) {
        var countdown = "";
        var now = new Date();
        var startTime = util.GetDateTime(that.data.coupon.ValidDateStart)
        var endTime = util.GetDateTime(that.data.coupon.ValidDateEnd)
        if (startTime > now) {
          countdown = "距活动开始时间"
          that.lefttime(that.data.coupon.ValidDateStart)
        } else if (that.data.coupon.RemainNum == 0 || endTime < now) {
          countdown = "活动已结束"
        } else {
          countdown = "距活动结束时间"
          that.lefttime(that.data.coupon.ValidDateEnd)
        }
        that.setData({
          countdown: countdown
        });
      }
    }, 1000)
  },
  //获取优惠券详情
  GetCouponDetail: function () {
    var that = this
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetCouponDetail,
      data: {
        csid: that.data.couponId,
        r: that.data.fromuid,
        // r: 10032887416,
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          var m = res.data.Data.Coupon
          var v = res.data.Data.VideoAttachmentList || {};
          let UseDateStart = util.GetDateTime(m.UseDateStart) <= 0 ? '' : that.dateFormat(new Date(util.GetDateTime(m.UseDateStart)))
          let UseDateEnd = util.GetDateTime(m.UseDateEnd) <= 0 ? '' : that.dateFormat(new Date(util.GetDateTime(m.UseDateEnd)))

          that.setData({
            coupon: m,
            ValidDateStart: that.dateFormat(new Date(util.GetDateTime(m.ValidDateStart))),
            ValidDateEnd: that.dateFormat(new Date(util.GetDateTime(m.ValidDateEnd))),
            UseDateStart: UseDateStart,
            UseDateEnd: UseDateEnd,
            loadall: 1,
            'videoParams.convertFilePath': v.convertFilePath || '',
            'videoParams.videoPosterPath': v.videoPosterPath || '',
            storeId: m.StoreId
          });
          if (undefined != res.data.Data.HeadImgs) {
            that.setData({
              headImgs: res.data.Data.HeadImgs,
            });
          }
          WxParse.wxParse('Description', 'html', m.Description, that);
          var introduceimg = "http://i.vzan.cc/image/jpg/2018/2/1/19522108e3918acb16440093b233445639ffdf.jpg"
          if (null != m.ImgList && m.ImgList.length > 0) {
            introduceimg = m.ImgList[0].thumbnail
          }
          //测试数据
          // m.MemberPriceState = 1
          // m.MemberPrice = 12
          let canvasShowMember = m.MemberPriceState == 1 ? true : false //2019/7/2
          var temp = {
            introduceimg: introduceimg,
            title: m.CouponName,
            originalprice: m.CouponMoney,
            floorprice: m.BuyPrice,
            floorprice: m.BuyPrice,
            memberPrice: m.MemberPrice,
            remainnum: m.RemainNum,
            enddate: that.dateFormat(new Date(util.GetDateTime(m.ValidDateEnd))) || '',
            startdate: that.dateFormat(new Date(util.GetDateTime(m.ValidDateStart))) || '',
            openid: app.globalData.userInfo.openId,
            appid: app.globalData.appid,
            loginuserid: app.globalData.userInfo.Id,
            isfx: m.IsFx,
            fxitemtype: 2,
            fxitemid: m.Id,
            storeid: m.StoreId,
            fxearns: m.ExpectEarns,
            canvasShowMember: canvasShowMember
          }
          that.setData({
            shareposterparams: temp,
            voucher: res.data.Data.CouponVoucher
          })
          if (false == that.data.showpath) //店主也可以查看路径
          {
            var shopownerphone = res.data.Data.Store.ShopOwnerPhone
            if (app.globalData.userInfo.TelePhone == shopownerphone) {
              that.setData({
                showpath: true,
              })
            }
          }
          that.setData({
            store: res.data.Data.Store
          });


        } else {
          wx.showToast({
            title: res.data.Message
          })
        }
      },
      fail: function (e) {
        console.log("获取店铺详情出错")
        wx.showToast({
          title: '获取店铺详情出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //格式化时间
  dateFormat: function (time) {
    var formater = "yyyy-MM-dd hh:mm";
    return util.dateFormat(formater, time)
  },
  //跳转店铺详情页
  clickToStoreDetail: function (e) {
    var that = this
    var id = e.currentTarget.dataset.id
    var vip = e.currentTarget.dataset.vip
    if (0 == vip) // 未开通vip店铺
    {
      var tip = '截图扫码，微信访问'
      var phone = e.currentTarget.dataset.phone
      var qrcode = e.currentTarget.dataset.qrcode
      var phone = e.currentTarget.dataset.phone
      //如果是店主，显示城主二维码

      if (phone == app.globalData.userInfo.TelePhone) {
        qrcode = app.globalData.cityqrcode
        phone = app.globalData.cityphone
        tip = '扫一扫二维码,联系同城客服升级店铺，即可在小程序访问详情'
      }
      that.setData({
        currentphone: phone,
        currentshopqrcode: qrcode,
        currentshoptip: tip
      })
    } else {
      wx.reLaunch({
        url: '../business_detail/business_detail?storeid=' + id
      })
    }
  },
  closeqrcode: function () {
    var that = this
    that.setData({
      currentphone: '',
      currentshopqrcode: ''
    })
  },
  callphone: function (e) {
    var phone = e.currentTarget.dataset.phone
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  //跳转优惠列表页
  clickToCouponList: function () {
    var url = '../activity/activity'

    wx.reLaunch({
      url: url
    })
  },
  //跳转我的优惠列表页
  clickToMyCoupon: function () {
    var url = '../my_coupon/my_coupon'
    wx.redirectTo({
      url: url
    })
  },
  //显示地图
  clickShowMap: function () {
    var that = this;
    var lat = that.data.store.lat;
    var lng = that.data.store.lng;
    try {
      wx.setStorageSync('needloadcustpage', false)
      wx.openLocation({
        latitude: lat,
        longitude: lng
      })
    } catch (e) {}
  },
  //打电话
  makePhoneCall: function () {
    var that = this;
    if (that.data.store.TelePhone == null || that.data.store.TelePhone.length == 0) {
      return app.showToast('商家未填写联系号码 !')
    }
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    wx.makePhoneCall({
      phoneNumber: that.data.store.TelePhone
    })
  },
  //去支付页
  clickToBalance: function () {
    var that = this
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      var url = '../order/order?couponid=' + that.data.couponId + '&sname=' + that.data.store.SName
      wx.navigateTo({
        url: url
      })
    }
  },

  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  createposter: function () {
    var that = this
    that.poster.createposter()
  },
  //计算剩余时间 (天,时,分,秒)
  lefttime(timespan) {
    var that = this
    var date = util.GetDateTime(timespan)
    var leftTime = date / 1000 - (new Date().getTime() / 1000); //计算剩余的毫秒数 
    var days = parseInt(leftTime / (60 * 60 * 24)); //计算剩余的天数 
    var hours = parseInt(leftTime % (60 * 60 * 24) / 3600); //计算剩余的小时 
    var minutes = parseInt(leftTime % (60 * 60 * 24) % 3600 / 60); //计算剩余的分钟 
    var seconds = parseInt(leftTime % (60 * 60 * 24) % 3600 % 60); //计算剩余的秒数 
    // days = that.PrefixInteger(days, 2);
    //前人这个PrefixInteger截取了两位，在测试三位数的天数出现bug
    days = days < 10 ? '0' + days : days
    hours = that.PrefixInteger(hours, 2);
    minutes = that.PrefixInteger(minutes, 2);
    seconds = that.PrefixInteger(seconds, 2);
    var temptimer = {
      d: days,
      h: hours,
      m: minutes,
      s: seconds
    };
    that.setData({
      countTimer: temptimer
    })
  },
  //数字前补零
  PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
  },
  moreGoods() {
    wx.navigateTo({
      url: '/pages/activity/activity?type=coupon'
    })
  },
  sharePoster(e) {
    var that = this
    var fromfxbtn = e.currentTarget.dataset.fx
    if ('' == that.data.shareposterparams.introduceimg) {
      app.ShowMsg("不支持没有主图的商品生成海报")
      return
    } else if (fromfxbtn == 0) {
      that.setData({
        "shareposterparams.isfx": 0
      })
      that.poster.createposter(0)
    } else if (fromfxbtn == 1) {
      that.setData({
        "shareposterparams.isfx": 1
      })
      that.poster.createposter(1)
    }
  },
})