var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");

//获取应用实例
var app = getApp()
Page({
  data: {
    advid: "",
    advopen: true,
    scrolling: { toppx: 0, showBack: false },
    showpath: false,
    currentphone: '',//非小程序店铺弹窗提醒电话
    currentshopqrcode: '',//非小程序店铺弹窗提醒二维码
    currentshoptip: '',//非小程序店铺弹窗提醒文字
    currenttab: 2,
    buyversion: 2,
    userInfo: {},
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 500,
    storeTypeList: [],//图标集合
    notices: [],//公告集合
    banners: [],//轮播图集合
    recommendStores: [],//推荐商家集合
    havemore: true,//加载更多
    pageIndex: 1,//页码
    pageSize: 10,
    isLoadData: false, //是否正在加载数据
    city_kefu_hidden: true,//客服弹窗显示开关
    QrCodeUrl: '',//同城客服二维码
    cityphone: '',//同城客服电话
    // 红包相关参数
    ruid: 0,
    isShareSuccess: false,
    indexItem: []
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: app.globalData.cityName
    })
    var that = this
    that.setData({ currenttab: app.globalData.buyVersion == 2 ? 1 : 2, buyversion: app.globalData.buyVersion, tongcheng_new_02: app.imgresouces.tongcheng_new_02, tongcheng_01: app.imgresouces.tongcheng_01 })


    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      app.GetAdv(603, function (advid) {
        that.setData({ advid: advid, })
      })
      //更新数据      
      that.setData({
        userInfo: userInfo,
        // 红包相关参数
        redPackageParams: {
          itemId: 0,
          redtype: 7,
          storeid: app.globalData.cityInfoId,
          cityid: app.globalData.cityInfoId,
          openId: app.globalData.userInfo.openId,
          userlat: app.globalData.userlat,
          userlng: app.globalData.userlng,
          ruid: options.ruid && options.ruid,  // 从分享进来得参数
          uid: app.globalData.userInfo.Id
        }
      })
      if (app.globalData.userInfo.iscityowner >0) {
        that.setData({
          showpath: true
        })
      }
      console.log('ddd')
      that.init();   
    },1)

  },
  // 获取分享红包参数
  getDeliverParams(e) {
    this.setData({
      rid: e.detail.rid
    })
    console.log(e.detail.rid);
  },
  onShareAppMessage: function (res) {
    var path = addr.getCurrentPageUrlWithArgs();
    var that = this;
    if (this.data.rid) {
      path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
    }
    return {
      title: app.globalData.cityName,
      path: path,
      success: function (res) {
        // 红包分享成功
        if (that.data.rid) {
          that.setData({
            isShareSuccess: true
          })
        }
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url
    wx.reLaunch({
      url: path,
    })
  },
  onPullDownRefresh: function () {
    this.setData({ pageIndex: 1, recommendStores: [], banners: [], notices: [], storeTypeList: [] })
    this.init()
    wx.stopPullDownRefresh()
  },
  //轮播图预览
  clickToPreview: function (e) {
    var that = this
    var currentUrl = e.target.dataset.src
    wx.previewImage({
      current: currentUrl,
      urls: that.data.banners.map(m => m.ImageUrl)
    })
  },

  //上拉加载更多
  onReachBottom: function () {
    var that = this
    if (!that.data.isLoadData && that.data.havemore) {
      that.setData({ isLoadData: true })
      this.GetRecommendStore(this.data.pageIndex)
    }
  },
  init: function () {
    var that = this;
    that.setData({ cityphone: app.globalData.cityphone })
    that.GetSubStoreType();
    that.GetNotice();
    that.GetBanner();
    that.GetRecommendStore(that.data.pageIndex);
    that.GetQrCodeUrl();
    that.getNavData();
  },
  //获取客服二维码
  GetQrCodeUrl: function () {
    var that = this;
    wx.request({
      url: addr.Address.GetQrCodeUrl,
      data: {
        areaCode: app.globalData.areaCode
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            QrCodeUrl: res.data.Data.QrCodeUrl
          });
        } else {
          wx.showToast({
            title: res.data.Message
          })
        }
      }
    })
  },
  GetSubStoreType: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetSubStoreType,
      data: {
        pId: app.globalData.cityType,
        cityInfoId: app.globalData.cityInfoId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            storeTypeList:res.data.Data.StoreTypeList
          });
         that.iconBanner = that.selectComponent("#iconbanner");
         that.iconBanner.init();
        }
      },
      fail: function (e) {
        console.log("获取首页出错")
        wx.showToast({
          title: '获取首页出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  GetNotice: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetNotice,
      data: {
        cityInfoId: app.globalData.cityInfoId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            notices: res.data.Data.Notices
          });

        }
      },
      fail: function (e) {
        console.log("获取首页公告出错")
        wx.showToast({
          title: '获取首页公告出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  // 显示客服弹窗
  bindtap_showkefuwin: function (e) {
    this.setData({ city_kefu_hidden: false })
  },
  // 关闭客服弹窗
  bindtap_close: function (e) {
    this.setData({ city_kefu_hidden: true })
  },
  GetBanner: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetBanner,
      data: {
        cityid: app.globalData.cityInfoId,
        typeid: 214,
        defaulturl: '',
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            banners: res.data.Data.bannerlist
          });

        }
      },
      fail: function (e) {
        console.log("获取首页公告出错")
        wx.showToast({
          title: '获取首页公告出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  GetRecommendStore: function (pageIndex) {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetRecommendStore,
      data: {
        cityInfoId: app.globalData.cityInfoId,
        PageIndex: pageIndex,
        sortType: 'default',
        pointX: app.globalData.latitude,
        pointY: app.globalData.longitude
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          var data = that.data.recommendStores
          data = data.concat(res.data.Data.StoreList)
          that.setData({
            recommendStores: data,
            havemore: res.data.Data.Count == that.data.pageSize,
            pageIndex: pageIndex + 1
          });

        } else {
          that.setData({ havemore: false });
        }
      },
      complete: function () {
        that.setData({ isLoadData: false })
      }
    })
  },
  ItemClick: function (e) {
    var that = this
    var id = e.currentTarget.dataset.id
    var vip = e.currentTarget.dataset.vip
    if (0 == vip)// 未开通vip店铺
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
    }
    else {
      wx.navigateTo({
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
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  getNavData() {
    let that = this;
    wx.request({
      url: addr.Address.GetSaleItemData,
      data: {
        cityid: app.globalData.cityInfoId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            indexItem: res.data.Data.indexItem
          })
        } else {
          wx.showToast({
            title: res.data.Message
          })
        }
      }
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  onPageScroll(e){
      let that = this
      let { showBack } = { ...that.data.scrolling }
      const { scrollTop } = { ...e}
      if (scrollTop > 500) {
        if(!showBack){
            that.setData({
              'scrolling.showBack': true
            })
        }
      } else {
        if (showBack) {
          that.setData({
            'scrolling.showBack': false
          })
        }
      }
  },
  //返回顶部
  backTop(){
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 600
      })
  },
  toaddshop: function (e) {
    wx.navigateTo({
      url: '/pages/addpost/addenter'
    })
  },
  goToMyOrder(){
    wx.navigateTo({
      url: '/pages/cutlist/cutlist'
    })
  },
  closeadv() {
    this.setData({
      advopen: false
    })
  },
  addEnter() {
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      wx.navigateTo({
        url: '../business_ruzhu/business_ruzhu'
      })
    }
  }
})