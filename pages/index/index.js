var util = require("../../utils/util.js");
import marqueeFun from "../../utils/marquee.js";
var addr = require("../../utils/addr.js");
var _host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
var qqmapsdk;
//获取应用实例
let app = getApp()
let getAnnoucement = (param) => util.httpClient({
  host: _host,
  addr: 'IBaseData/GetNotice',
  data: param
})
let getEntranceQrCode = (param) => util.httpClient({
  host: _host,
  addr: 'IBaseData/GetEntranceQrCode',
  data: param
})

Page({
  data: {
    subcityid: 0,
    fromuserid: 0,

    shopcount: 0,
    postcount: 0,
    viewcount: 0,
    advid: "",
    advopen: true,
    marquee: {
      text: ''
    },
    imgUrls: [], //轮播图
    showpath: false,
    currentshopqrcode: '', //非小程序店铺弹窗提醒二维码
    currentshoptip: '', //非小程序店铺弹窗提醒文字
    currenttab: 1, //推荐店铺与分类信息两个tab
    buyversion: 0,
    tongcheng_new_02: "",
    tongcheng_01: "",
    autoplay: false,
    interval: 2000,
    duration: 500,
    breakNewsList: [], //头条
    indexItemList: [], //图标集合
    lat: 0,
    lng: 0,
    showcallbtn: 1,
    showallbtns: {},
    city_kefu_hidden: true, //客服弹窗显示开关
    QrCodeUrl: '', //同城客服二维码
    cityphone: '', //同城客服电话
    // 红包相关参数
    ruid: 0,
    isShareSuccess: false,
    // 导航
    indexItem: [],
    isShowGreetingIcon: false,
    isScroll: false,
    currentNav: 0, //当前导航
    //是否转发成功
    repost: false,
    isShowCityQrCode: false,
    wxQrCodeUrl: '',
    isShowAuthBtn: false
  },
  onLoad: function (options) {
    var that = this
    var r = !!options.r ? options.r : 0
    var subcityid = !!options.subcityid ? options.subcityid : 0
    app.getUserInfo((userInfo) => {
      wx.setNavigationBarTitle({
        title: app.globalData.cityName
      })
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true
        })
      }
      app.GetAdv(601, function (advid) {
        that.setData({
          advid: advid,
        })
      })
      that.setData({
        fromuserid: r,
        subcityid: subcityid,
        buyversion: app.globalData.buyVersion,
        tongcheng_new_02: app.imgresouces.tongcheng_new_02,
        tongcheng_01: app.imgresouces.tongcheng_01,
        //nav-content
        cityphone: app.globalData.cityphone,
        // 红包相关参数
        redPackageParams: {
          itemId: 0,
          redtype: 5,
          storeid: app.globalData.cityInfoId,
          cityid: app.globalData.cityInfoId,
          openId: app.globalData.userInfo.openId,
          userlat: app.globalData.userlat,
          userlng: app.globalData.userlng,
          ruid: options.ruid && options.ruid, // 从分享进来得参数
          uid: app.globalData.userInfo.Id
        }
      }, () => {
        that.GetLocation()
        that.init()
      })
      this.getEntranceQrCode()
    }, 1)
  },
  onReady() {
    let that = this;
    setTimeout(() => {
      try {
        wx.createSelectorQuery().select('#tabnav').boundingClientRect(function (rect) {
          that.scrollTop = rect.top
        }).exec()

      } catch (err) {

      }

    }, 1000)


    this.navComponent = this.selectComponent("#tabnav");
  },
  // 红包获取分享参数
  getDeliverParams(e) {
    this.setData({
      rid: e.detail.rid
    })
  },
  onShareAppMessage: function (res) {
    let that = this,
      title, convenientinfo;
    var path = addr.getCurrentPageUrlWithArgs()
    if (this.data.rid) {
      title = app.globalData.cityName
      path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
      console.log(title)
    }
    if (0 != that.data.subcityid) {
      path += '&r=100' + app.globalData.userInfo.Id + "&subcityid=" + that.data.subcityid
    }
    console.log('fff')
    console.log(path)
    if (!Object.is(res.target, undefined)) {
      convenientinfo = res.target.dataset.convenientinfo;
      var {
        id,
        linkman,
        pname
      } = {
        ...res.target.dataset
      };
      if (!!convenientinfo) {
        title = linkman + '的' + pname;
        path = '/pages/detail/detail?shareoper=1&id=' + id + '&typename=undefined';
      }
      console.log(title)
    }
    try {

      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}

    return {
      title,
      path: path,
      success: function (res) {
        // 红包分享成功
        if (that.data.rid) {
          that.setData({
            isShareSuccess: true
          })
        }
        // 转发成功
        if (!!convenientinfo) {
          let param = {
            itemtype: 'post',
            itemid: id
          }
          that.convenientInfoRepost(param, that)
        }
      },
      fail(res) {}
    }
  },
  //便民信息转发
  convenientInfoRepost(param, obj) {
    wx.request({
      url: _host + 'IBaseData/addshareitem',
      data: param,
      method: 'POST',
      success(res) {
        if (res.data.code == 1) {
          obj.setData({
            repost: true
          }, () => {
            obj.setData({
              content: '转发成功',
              showTips: true
            })
          })
        } else {
          obj.setData({
            content: '转发失败',
            showTips: true
          })
        }
      },
    })
  },
  //下拉刷新
  init: function () {
    this.GetBanner()
    this.getAnnoucement()
    this.GetIndexData()
    this.getBreakNews()
    setTimeout(() => {
      this.GetQrCodeUrl()
    }, 2000)
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
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url
    wx.reLaunch({
      url: path,
    })
  },
  GetIndexData: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetIndexData,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        r: that.data.fromuserid,
        subcityid: that.data.subcityid
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          if (!!res.data.Data.citysubid) {
            that.setData({
              subcityid: res.data.Data.citysubid
            });
          }
          that.setData({
            indexItemList: res.data.Data.indexItem,
            isShowGreetingIcon: res.data.Data.hasCardFun || false
          });
          that.iconBanner = that.selectComponent("#iconbanner");
          that.iconBanner.init();
        }
      },
      complete: function () {
        util.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    })
  },

  GetLocation: function () {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.setData({
          lat: res.latitude,
          lng: res.longitude
        })
        app.globalData.userlat = res.latitude;
        app.globalData.userlng = res.longitude;
      }
    })
  },
  GetBanner: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetBanner,
      data: {
        cityid: app.globalData.cityInfoId,
        typeid: 212,
        defaulturl: '',
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            imgUrls: res.data.Data.bannerlist
          });

        }
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  async getAnnoucement() {
    var that = this
    let resp = await getAnnoucement({
      cityInfoId: app.globalData.cityInfoId
    })
    if (resp.Success) {
      that.setData({
        shopcount: resp.Data.StoreCount,
        postcount: resp.Data.PostCount,
        viewcount: resp.Data.BrownCount
      })
      var nt = resp.Data.Notices
      if (nt.length > 0) {
        //var textArr=[]
        var m_marquee = {};
        m_marquee.text = '';
        nt.forEach(function (v) {
          //textArr.push(v.Announcement)
          m_marquee.text += v.Announcement + '    ';
        })
        const str = m_marquee.text;
        const width = marqueeFun.getWidth(str);
        m_marquee.width = width;
        that.setData({
          marquee: m_marquee,
          [`${'marquee'}.width`]: width,
        });
      }
    }
  },
  callphone: function (e) {
    var phone = e.currentTarget.dataset.phone
    util.g_callphone(phone)
  },
  // 显示客服弹窗
  bindtap_showkefuwin: function (e) {
    this.setData({
      city_kefu_hidden: false
    })
  },
  // 关闭客服弹窗
  bindtap_close: function (e) {
    this.setData({
      city_kefu_hidden: true
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  // 2018-1-9 新加头条功能
  getBreakNews() {
    let that = this,
      listheadline, breakNewsList = [],
      len, mid
    wx.request({
      url: addr.Address.GetTopHeadLine,
      data: {
        cityid: app.globalData.cityInfoId
      },
      method: 'GET',
      success(res) {
        if (res.data.Success) {
          listheadline = res.data.Data.listheadline
          // if (!!listheadline) {
          //   len = listheadline.length
          //   let integer = len % 2 == 0 ? 1 : 0
          //   mid = integer ? (len / 2) : ~~(len / 2)
          //   for (var i = 0; i < mid; i++) {
          //     breakNewsList.push([])
          //     breakNewsList[i][0] = listheadline[2 * i].Announcement
          //     breakNewsList[i][1] = listheadline[2 * i + 1].Announcement
          //   }
          //   if (!integer) {
          //     breakNewsList.push([listheadline[len - 1].Announcement])
          //   }

          // }
          that.setData({
            breakNewsList: listheadline
          })
        }
      },
      fail(e) {
        app.ShowMsg('获取头条动态失败')
      },
    })
  },
  //去头条列表页
  goToNewsCenter() {
    wx.navigateTo({
      url: '../news_center/news_center'
    })
  },
  // 转到发贺卡
  toSendGreetingCard() {
    wx.navigateTo({
      url: '/pages/greetIngCard/greetIngCardSend'
    })
  },
  getNavArr(e) {
    let that = this
    const {
      TabData,
      indexItem
    } = {
      ...e.detail.cityNavList
    }
    that.setData({
      cityNavList: TabData, //导航
      currentType: TabData[0].Type, // 导航类型
      indexItem: indexItem // 营销活动
    })
  },
  ListenerNavChange(e) { //监听导航栏变化
    let that = this
    const {
      beforeNav,
      currentNav,
      currentType
    } = {
      ...e.detail
    }
    that.setData({
      beforeNav, //前一个
      currentNav,
      currentType
    })
  },
  //提示
  showTips(e) {
    const {
      content,
      showTips
    } = {
      ...e.detail
    }
    this.setData({
      content,
      showTips
    })
  },
  goToMyPublish() {
    wx.navigateTo({
      url: '/pages/mypublish/mypublish'
    })
  },
  goToMyOrder() {
    wx.navigateTo({
      url: '/pages/cutlist/cutlist'
    })
  },
  onPageScroll(e) {
    let that = this;

    if (e.scrollTop >= Math.floor(that.scrollTop)) {
      if (!that.data.isScroll) {
        that.setData({
          isScroll: true
        })
      }
    } else {
      if (that.data.isScroll) {
        that.setData({
          isScroll: false
        })
      }
    }
  },
  stopMove() {
    return
  },
  showCityQrCode() {
    this.setData({
      isShowCityQrCode: !this.data.isShowCityQrCode
    })
  },

  saveToPhoneAblum() {
    let that = this
    that.path = ''
    wx.getImageInfo({
      src: this.data.wxQrCodeUrl, //服务器返回的带参数的小程序码地址
      success: function (res) {
        that.path = res.path
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success() {
            wx.showModal({
              title: '提示',
              content: '图片保存成功，可到手机系统相册查看',
              showCancel: false,
              success() {
                that.setData({
                  isShowCityQrCode: false
                })
              }
            })
          },
          fail(err) {
            if (err.errMsg != 'saveImageToPhotosAlbum:fail auth deny') return
            wx.showModal({
              title: '提示',
              content: '要保存至相册需要您的授权哦',
              showCancel: false,
              success(res) {
                if (!res.confirm) return
                that.setData({
                  isShowAuthBtn: true
                })
              }
            })
          }
        })
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  async getEntranceQrCode() {
    let resp = await getEntranceQrCode({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId
    })
    var introimgurl = resp.Data.qrcodeurl && resp.Data.qrcodeurl.replace(/http[s]?/g, 'https') || ''
    this.setData({
      wxQrCodeUrl: introimgurl
    })
  },
  settingCb(e) {
    let that = this
    if (e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.saveImageToPhotosAlbum({
        filePath: that.path,
        success() {
          wx.showModal({
            title: '提示',
            content: '图片保存成功，可到手机系统相册查看',
            showCancel: false,
            success() {
              that.setData({
                isShowAuthBtn: false
              })
            }
          })
        },
        fail(e) {
          console.log(e)
        }
      })
    }
  },
  closeadv() {
    this.setData({
      advopen: false
    })
  },
  onPullDownRefresh() {
    wx.setStorageSync('isFresh', 1)
    this.navComponent.initNav()
    this.getAnnoucement()
  }
})