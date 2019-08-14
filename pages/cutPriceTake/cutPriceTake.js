var app = getApp()
var util = require("../../utils/util.js");
var WxParse = require('../../utils/wxParse/wxParse.js');
var addr = require("../../utils/addr.js");
const regeneratorRuntime = require('../../utils/runtime');
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
    fromuid: 0,
    renderpage: 0,
    showpath: false,
    notstart: 0,
    buid: 0,
    helpers: [],
    cutid: 0,
    cityname: "",
    hasFollow: -1,
    hastake: 0,
    UserName: '',
    Phone: '',
    ranks: [],
    isloadData: false, //是否在加载数据中
    pageIndex: 1, //页码
    PageSize: 10,
    loadall: 0, //是否已经完成页面拼装
    takeform: 0,
    countdown: '',
    countTimer: null,
    mainmodel: {
      bname: ''
    },
    companyInfo: null,
    cityphone: '',
    cityqrcode: '',
    currentype: 'type01',
    tel_tk: true,
    pay_tk: true,
    close: false,
    current: '',
    showbottomtip: false, //是否已经到底
    showallbottomtip: false,
    showcitytelwin: 0,
    // 红包相关参数
    ruid: 0,
    isShareSuccess: false,
    // 音频
    audioSrc: '',
    // 视频
    videoParams: {
      convertFilePath: '',
      videoPosterPath: ''
    },
    voucher: null
  },
  onShow: function () {
    this.poster = this.selectComponent("#poster");
  },
  onLoad: function (options) {
    var that = this
    this.storeid = options.sid
    var cutid = options.cutid
    var ruid = options.ruid
    var r = !!options.r ? options.r : 0
    //从海报进来

    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        cutid = addr.getsceneparam("cutid", scene)
        ruid = addr.getsceneparam("ruid", scene)
        if (0 == r)
          r = addr.getsceneparam("r", scene)
      }
    }
    if (null != ruid && undefined != ruid) {
      that.setData({
        ruid: ruid
      })
    }

    that.setData({
      cutid: cutid
    })
    app.getUserInfo(function () {
      that.checkStore()
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true,

        })
      }
      that.setData({
        fromuid: r,
        renderpage: 1
      })
      that.loadmain()

      that.setData({
        Phone: app.globalData.userInfo.TelePhone,
        UserName: app.globalData.userInfo.nickName,
        cityphone: app.globalData.cityphone,
        cityqrcode: app.globalData.cityqrcode,
        cityname: app.globalData.cityName
      })
      that.loadmoreranks()
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
  // 红包获取分享参数
  getDeliverParams(e) {
    this.setData({
      rid: e.detail.rid
    })
    console.log(e.detail.rid);
  },
  onShareAppMessage: function (res) {
    var that = this
    app.commonshare(that.data.cutid, "bargain")

    var path = addr.getCurrentPageUrlWithArgs()
    let {
      isfx,
      fxitemid,
      storeid
    } = {
      ...that.data.shareposterparams
    }

    if (1 == isfx) {
      path += '&r=100' + app.globalData.userInfo.Id
    }
    if (that.data.rid) {
      path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
    }

    var title = that.data.mainmodel.bname
    if ('' == title) {
      title = app.globalData.cityName
    }
    try {
      if (1 == isfx) {
        util.BindFxOrigin({
          cityid: app.globalData.cityInfoId,
          openid: app.globalData.userInfo.openId,
          storeid: storeid,
          fxitemid: fxitemid,
          fxtype: 5
        });
      }
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    return {
      title: title,
      path: path,
      success: function (res) {
        // 分享成功
        console.log(res)
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
  //下拉刷新
  startCut: function () {
    var that = this

    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      var that = this
      that.setData({
        takeform: 1
      })
    }
  },
  onPullDownRefresh: function () {
    var that = this
    that.loadmain()
    that.countdown()
    that.setData({
      Phone: app.globalData.userInfo.TelePhone,
      UserName: app.globalData.userInfo.nickName,
      cityphone: app.globalData.cityphone,
      cityqrcode: app.globalData.cityqrcode,
      cityname: app.globalData.cityName
    })
    that.loadmoreranks()
  },
  onReachBottom: function () {
    var that = this
    that.loadmoreranks()
  },
  //倒计时
  countdown: function () {
    var that = this
    setInterval(function () {
      if (that.data.mainmodel != null) {
        var countdown = "";
        var now = new Date().getTime();
        var startTime = util.GetDateTime(that.data.mainmodel.startdate)
        var endTime = util.GetDateTime(that.data.mainmodel.enddate)
        var state = that.data.mainmodel.state
        var remainnum = that.data.mainmodel.remainnum
        if (-1 == state) {
          countdown = "活动已被删除"
          that.setData({
            countdown: countdown
          });
        } else {
          if (startTime > now) {
            countdown = "距活动开始时间"
            that.lefttime(that.data.mainmodel.startdate)
            that.setData({
              countdown: countdown,
              notstart: 1
            });
          } else if (endTime < now || remainnum <= 0) {
            countdown = "活动已抢光或结束"
            that.setData({
              countdown: countdown
            });
          } else {
            countdown = "距活动结束时间"
            that.lefttime(that.data.mainmodel.enddate)
            that.setData({
              countdown: countdown
            });
            if (that.data.notstart == 1) {
              that.setData({
                notstart: 0
              })
              console.log('sss')
              setTimeout(() => {
                that.loadmain()
              }, 2000)
            }

          }
        }
      }
    }, 1000)
  },
  loadmain: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetCutMainSelf,
      data: {
        bid: that.data.cutid,
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
        r: that.data.fromuid,

      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.Success) {
          let videoAttachmentList = res.data.Data.VideoAttachmentList[0] || {};
          var m = res.data.Data.maininfo
          if (false == that.data.showpath) //店主也可以查看路径
          {
            var shopownerphone = m.shopownerphone
            if (app.globalData.userInfo.TelePhone == shopownerphone) {
              that.setData({
                showpath: true,
              })
            }
          }
          that.setData({
            mainmodel: m,
            companyInfo: res.data.Data.companyInfo,
            hastake: m.hastake,
            hasFollow: m.hasconcern == 1 ? 1 : -1,
            loadall: 1,
            voucher: res.data.Data.CutVoucher,
            // 红包相关参数
            redPackageParams: {
              itemId: that.data.cutid,
              redtype: 3,
              storeid: res.data.Data.companyInfo.Id,
              cityid: app.globalData.cityInfoId,
              openId: app.globalData.userInfo.openId,
              userlat: app.globalData.userlat,
              userlng: app.globalData.userlng,
              ruid: that.data.ruid, // 从分享进来得参数
              uid: app.globalData.userInfo.Id // 从分享进来得参数
            },
            // 音频
            audioSrc: res.data.Data.AudioAttachmentList || '',
            'videoParams.convertFilePath': videoAttachmentList.convertFilePath || '',
            'videoParams.videoPosterPath': videoAttachmentList.videoPosterPath || ''
          })
          var formater = "yyyy-MM-dd hh:mm";
          console.log(m)
          let canvasShowMember = m.MemberPriceState == 1 ? true : false //2019/7/2
          var temp = {
            introduceimg: m.introduceimg,
            title: m.bname,
            originalprice: m.originalprice,
            floorprice: m.floorprice,
            memberPrice: m.MemberPrice,
            remainnum: m.remainnum,
            enddate: that.dateFormat(new Date(util.GetDateTime(m.enddate))) || '',
            startdate: that.dateFormat(new Date(util.GetDateTime(m.startdate))) || '',
            openid: app.globalData.userInfo.openId,
            appid: app.globalData.appid,
            loginuserid: app.globalData.userInfo.Id,
            isfx: m.IsFx,
            fxitemtype: 5,
            fxitemid: m.Id,
            storeid: m.StoreId,
            fxearns: m.ExpectEarns,
            canvasShowMember: canvasShowMember
          }
          that.setData({
            shareposterparams: temp
          })
          if (undefined != res.data.Data.helpers) {
            helpers: res.data.Data.helpers
          }
          WxParse.wxParse('Description', 'html', res.data.Data.maininfo.desc, that)
        } else {
          app.ShowMsg(res.data.Message)
        }
        that.countdown()
      },
      fail: function (e) {
        app.ShowMsg('网络比较慢，请重新试试')
      },
      complete: function () {
        util.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    })
  },
  //格式化时间
  dateFormat: function (time) {
    var formater = "yyyy-MM-dd hh:mm";
    return util.dateFormat(formater, time)
  },
  actiontype: function (e) {
    var type = e.currentTarget.dataset.type //$(obj).data('type') data-type-action  - typeAction  data-typeAction  --typeaction
    this.setData({
      currentype: type
    });
  },
  xiangxi: function () {
    this.setData({
      xiangxi: this.data.xiangxi == false
    });
  },
  aixinjia_bt: function () {
    this.setData({
      tel_tk: false
    });
  },
  close_tk: function () {
    this.setData({
      tel_tk: true,
      pay_tk: true
    });
  },
  pay_bt: function () {
    this.setData({
      pay_tk: false
    });
  },
  follow: function () {
    var that = this
    if (null == that.data.companyInfo) {
      app.ShowMsg('网络比较慢，请重新试试')
    } else {
      var shopid = that.data.companyInfo.Id
      wx.request({
        url: addr.Address.ConcernShop,
        data: {
          openid: app.globalData.userInfo.openId,
          shopid: shopid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.hideLoading()
          if (res.data.Success) {
            var operType = res.data.Data.opertype
            wx.showToast({
              title: res.data.Message,
              icon: 'success',
              duration: 2000
            })
            that.setData({
              hasFollow: operType
            })
          } else {
            var msg = res.data.Message
            app.ShowMsg(msg)
          }
        }
      })

    }
  },

  viewDetail: function () {
    var detail = !this.data.detail;
    this.setData({
      detail: detail
    })
  },
  viewDeatailGoods: function (e) {
    var id = parseInt(e.target.dataset.id)
  },
  close: function () {
    this.setData({
      close: true
    })
  },
  //计算剩余时间 (天,时,分,秒)
  lefttime: function (timespan) {
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
  PrefixInteger: function (num, n) {
    return (Array(n).join(0) + num).slice(-n);
  }, //前往我的砍价
  gotocutdetail: function (e) {
    var buid = e.currentTarget.dataset.buid
    var bid = e.currentTarget.dataset.bid
    var url = '/pages/cutPrice/cutPrice?buid=' + buid + "&bid=" + bid
    wx.reLaunch({
      url: url
    })
  },
  loadmoreranks: function () {
    var that = this
    var pidx = that.data.pageIndex
    if (!that.data.isloadData) {
      that.setData({
        "isloadData": true
      });
      // 显示加载中
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 70000
      });
      wx.request({
        url: addr.Address.GetCutRanking,
        data: {
          bid: that.data.cutid,
          pageIndex: that.data.pageIndex,
          pageSize: that.data.PageSize
        },
        success: function (res) {
          var list = that.data.ranks
          var resultList = res.data
          if (1 != pidx && 0 == resultList.length) {
            that.setData({
              "showbottomtip": true
            });
          } else if (1 == pidx && 0 == resultList.length) {
            that.setData({
              "showallbottomtip": true
            });
          }
          if ("" != resultList) {
            list = list.concat(resultList);
            that.setData({
              "ranks": list
            });
            pidx++;
            that.setData({
              "pageIndex": pidx,
              "isloadData": false
            });

          }
        },
        complete: function () {
          wx.hideToast();
          wx.stopPullDownRefresh()
        }
      });
    }
  },
  addparticipant: function () {
    var that = this
    if ('' == that.data.UserName) {
      app.ShowMsg('请填写姓名')
      return
    }
    if ('' == that.data.Phone) {
      app.ShowMsg('请填写手机号码')
      return
    }
    if (that.data.Phone.length != 11) {
      app.ShowMsg('输入电话号码不对')
      return
    }
    wx.showLoading({
      title: '提交数据中',
    })
    wx.request({
      url: addr.Address.AddBargainUser,
      data: {
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
        bid: that.data.cutid,
        name: that.data.UserName,
        phone: that.data.Phone
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading()
        that.setData({
          takeform: 0
        })
        if (res.data.Success) {
          wx.showToast({
            title: '报名成功！',
            icon: 'success',
            duration: 2000
          })
          var buid = res.data.Data.buid
          //去详细页
          var url = '/pages/cutPrice/cutPrice?bid=' + that.data.cutid + "&buid=" + buid
          setTimeout(function () {
            wx.redirectTo({
              url: url
            })
          }, 2000)
        } else {
          var msg = res.data.Message
          app.ShowMsg(msg)
        }
      }
    })
  },
  //店主姓名
  inputusername: function (e) {
    var value = e.detail.value
    this.data.UserName = value
  }, //手机号输入
  inputphone: function (e) {
    var value = e.detail.value
    this.data.Phone = value
  },
  closeformwin: function (e) {
    this.setData({
      takeform: 0
    })
  }, //进店逛逛
  gotoshopdetail: function (e) {
    var that = this
    var storeid = that.data.companyInfo.Id
    var url = '/pages/business_detail/business_detail?storeid=' + storeid
    wx.reLaunch({
      url: url,
    })
  },
  closecitytelwin: function () {
    var that = this
    that.setData({
      showcitytelwin: 0
    })
  },
  opencitytelwin: function () {
    var that = this
    that.setData({
      showcitytelwin: 1
    })
  },
  callphone: function (e) {
    var phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  gotomore: function () {
    var that = this
    var url = '/pages/activity/activity?type=cut'
    wx.redirectTo({
      url: url,
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  createposter: function () {
    var that = this
    that.poster.createposter()
  },
  makephone: function (e) {
    var phone = e.currentTarget.dataset.phone
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  goToActivity() {
    wx.navigateTo({
      url: '/pages/activity/activity?type=cut'
    })
  },
  goToMyCutPrice() {
    wx.navigateTo({
      url: '/pages/cutlist/cutlist?type=cut'
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