var app = getApp()
var addr = require("./utils/addr.js");
var C_Enum = require("./public/C_Enum.js");
var imgresouces = require("./utils/imgresouces.js");
const mtjwxsdk = require("./utils/mtj-wx-sdk.js");
App({
  onLaunch: function (options) {
    var that = this
    //第三方平台配置
    var exconfig = wx.getExtConfigSync()
    if (exconfig != undefined) {
      that.globalData.appid = exconfig.appId
      that.globalData.curversion = exconfig.curversion
    }
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.windowWidth = res.windowWidth;
        that.globalData.windowHeight = res.windowHeight;
        that.globalData.isIos = res.system.indexOf('iOS') > -1 ? true : false
      }
    });
    wx.setStorageSync('needloadcustpage', true) //测试数据，发布记得改为true
  },
  onShow: function (options) {
    var that = this
    wx.request({
      url: addr.Address.checkCityExpired, //仅为示例，并非真实的接口地址
      data: {
        appid: that.globalData.appid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.errcode == '-67' || res.data.errcode == '-66') {
          that.globalData.cityname = res.data.cityInfoName
          that.globalData.cityExpired = 1
          wx.redirectTo({
            url: '/pages/expirePage/expirePage',
          })
        } else {
          that.globalData.cityExpired = 0
        }
      }
    })


    var that = this
    var shareoper = options.query.shareoper //是否从转发进来\
    var scene = options.scene
    var hasconcernpage = wx.getStorageSync('hasconcernpage') == '' ? false : true //是否有关注的页面
    var needloadcustpage = wx.getStorageSync('needloadcustpage') == '' ? false : true //控制上传图片，打开地图,转发 页面隐藏导致的跳转
    if (needloadcustpage && hasconcernpage && 1 != shareoper && 1011 != scene && 1047 != scene && 1035 != scene && 1012 != scene && 1058 != scene && 1048 != scene) //退出了主界面重新进入并有设关注页面的。重新加载从而跳到关注的店铺页
    {
      wx.reLaunch({

        url: "/pages/a_selbuyversion/a_selbuyversion",
        fail: function () { //安卓机不能从backgroud调用此方法,需要兼容
          wx.redirectTo({
            url: '/pages/a_selbuyversion/a_selbuyversion',
          })
        }
      })
    }
    //选择完图片，选择完地图，转发，恢复跳转功能
    try {
      wx.setStorageSync('needloadcustpage', true)
    } catch (e) {}
  },
  globalData: {
    citycode: 0,
    EntrancePage: 0,
    token: '',
    appid: '',
    curversion: '',
    buyVersion: 0,
    cityType: 0,
    cityInfoId: 0,
    cityNanm: '',
    cityqr: '',
    cityphone: '',
    areaCode: '',
    userInfo: null,
    openid: '',
    uid: '',
    windowWidth: undefined,
    windowHeight: undefined,
    userlat: 0,
    userlng: 0,
    CCityConfig: null,
    isIos: true,
    cityLogo: ''
  },

  imgresouces,
  C_Enum,
  ShowMsg: function (msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
    })
  },
  ShowMsgAndUrl: function (msg, url, mtype = 0) {
    var that = this
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: msg,
      success: function (res) {
        if (res.confirm) {
          if (mtype == 0) {
            that.goNewPage(url)
          } else if (mtype == 1) {
            that.goBackPage(1)
          }
        }
      }
    })
  },
  getUserInfo: function (cb, force = 0, isPerson = 0) {
    var that = this
    if (null != that.globalData.userInfo && !!that.globalData.userInfo.openId && 0 == force) {
      typeof cb == "function" && cb(that.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (res) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (data) {

              that.login(res.code, data.encryptedData, data.signature, data.iv, cb, isPerson);

              // if (1 == force) {
              //   typeof cb == "function" && cb(that.globalData.userInfo)
              // }
            },
            fail: function (e) {
              var rurl = addr.getCurrentPageUrlWithArgs()
              rurl = encodeURIComponent(rurl)
              wx.redirectTo({
                url: '/pages/index/login?rurl=' + rurl,
              })
            }
          })
        },
      })
    }
  },
  //登录
  login: function (code, encryptedData, signature, iv, cb, isPerson) {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    var that = this;
    wx.request({
      url: addr.Address.loginByThirdPlatform,
      data: {
        code: code,
        data: encryptedData,
        signature: signature,
        iv: iv,
        appid: that.globalData.appid,

      },
      method: "Get",
      success: function (data) {
        wx.hideToast()
        console.log(data)

        if (data.data.result) {
          var json = data.data.obj
          that.globalData.userInfo = {
            Id: json.Id,
            avatarUrl: json.avatarUrl,
            city: json.city,
            country: json.country,
            gender: json.gender,
            language: json.language,
            nickName: json.nickName,
            headImgUrl: json.headimg,
            openId: json.openId,
            // openId: 'o2ZAR0ZbxPpvTejOwcCr5bouoWWE',
            province: json.province,
            sessionId: json.sessionId,
            unionId: json.unionId,
            TelePhone: (json.tel == null || json.tel == '' ? "" : json.tel),
            IsValidTelePhone: json.IsValidTelePhone,
            // IsValidTelePhone: 1,  
            iscityowner: json.iscityowner,
            // iscityowner: 1,
          };
          that.globalData.EntrancePage = json.EntrancePage
          that.globalData.token = json.token
          that.globalData.cityqrcode = json.cityqr
          that.globalData.cityphone = json.cityphone
          that.globalData.citycode = json.RegionCode
          that.globalData.buyVersion = json.CityBuyVersion
          that.globalData.CCityConfig = json.CCityConfig
          that.globalData.areaCode = json.AreaCode
          that.globalData.cityInfoId = json.CityInfoId
          that.globalData.cityName = json.CityName
          //底部导航自定义数据
          that.globalData.indexnav = data.data.Data.indexconfig
          that.globalData.postnav = data.data.Data.postconfig
          that.globalData.storenav = data.data.Data.storeconfig
          that.globalData.addnav = data.data.Data.addconfig
          that.globalData.minenav = data.data.Data.mineconfig
          that.globalData.memberinfo = data.data.Data.memberinfo
          that.globalData.cityLogo = json.CityLogo
          that.globalData.ShowAllEntrance = json.ShowAllEntrance == 1 ? true : false

          typeof cb == "function" && cb(that.globalData.userInfo)

          if (data.data.Data.cityStateInfo.errcode == '-67' || data.data.Data.cityStateInfo.errcode == '-66') {
            that.globalData.cityname = data.data.Data.cityStateInfo.cityInfoName
            that.globalData.cityExpired = 1
            if (!isPerson) {
              wx.redirectTo({
                url: '/pages/expirePage/expirePage',
              })
            }
          } else {
            if (that.globalData.cityExpired == 1) {
              that.globalData.cityExpired = 0
              that.gotohomepageclearstack()
            }
          }
        } else {
          wx.showModal({
            title: '提示',
            content: data.data.msg,
          })
        }


      }
    })
  },
  checkphonewithurl: function (reurl) {

    if (this.globalData.userInfo.IsValidTelePhone == 0) {
      wx: wx.showModal({
        title: '提示',
        content: '为了保障您数据的安全，请先进行手机号验证',
        success: function (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/bind_mobile/bind_mobile?reurl=' + encodeURIComponent(reurl),
            })
          }
        },
      })
    }
    else {
      return true
    }
    return false
  },
  showToast: function (msg) {
    wx.showToast({
      title: msg,
    })
  },
  //跳转新页面
  goNewPage: function (url) {
    wx.navigateTo({
      url: url,
    })
  },
  //返回上几页
  goBackPage: function (delta) {
    wx.navigateBack({
      delta: delta
    })
  },
  pictureTaps: function (url, urls) {
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    wx.previewImage({
      current: url,
      urls: urls,
    })
  },
  // 跳转首页
  gotohomepage: function () {
    var that = this
    var url = that.globalData.buyVersion == 3 ? "/pages/index/index" : that.globalData.buyVersion == 2 ? "/pages/shopindex/shopindex" : "/pages/postindex/postindex"
    wx.redirectTo({
      url: url,
    })

  },
  // 跳转首页
  gotohomepageclearstack: function () {
    var that = this
    var url = that.globalData.buyVersion == 3 ? "/pages/index/index" : that.globalData.buyVersion == 2 ? "/pages/shopindex/shopindex" : "/pages/postindex/postindex"
    wx.reLaunch({
      url: url,
    })
  },
  //刷新页面
  reloadpagebyurl: function (param = '', url = '') {
    var pages = getCurrentPages()
    if (pages.length > 0) {
      for (var i in pages) {
        var page = pages[i]
        if (page.route == url) {
          page.onLoad(param)
          break
        }
      }
    }
  },
  reload: function () {
    var pages = getCurrentPages() //获取加载的页面
    var currentPage = pages[pages.length - 1] //获取当前页面的对象
    var url = currentPage.route //当前页面url
    var options = currentPage.options //如果要获取url中所带的参数可以查看options
    var urlWithArgs = url
    var count = 0
    for (var key in options) {
      count++
      if (1 == count) {
        urlWithArgs += "?"
      }
      var value = options[key]
      urlWithArgs += key + '=' + value + '&'
    }
    if (count > 0) {
      urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
    }

    wx.redirectTo({
      url: "/" + urlWithArgs,
    })
  },
  //登录
  commonshare: function (itemid, itemtype) {

    var that = this;
    wx.request({
      url: addr.Address.addshareitem,
      data: {
        itemid: itemid,
        itemtype: itemtype
      },
      success: function (data) {
        console.log(data)
      }
    })
  },
  GetAdv: function (itemtype, cb) {
    var that = this;
    wx.request({
      url: addr.Address.GetWechatAdv,
      data: {
        cityid: that.globalData.cityInfoId,
        itemtype: itemtype
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        if (res.data.Success) {
          typeof cb == "function" && cb(res.data.Message)
        }
      }
    })
  }
})