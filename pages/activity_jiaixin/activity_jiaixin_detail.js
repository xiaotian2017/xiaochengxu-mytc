var app = getApp()
var util = require("../../utils/util.js");
var WxParse = require('../../utils/wxParse/wxParse.js');
var addr = require("../../utils/addr.js");
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
let getStoreVoucherList = (p) => util.httpClient({
  host,
  addr: 'IBaseData/GetStoreVoucherList',
  data: p
});
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
      appid: ""
    },
    fromuid: 0,
    renderpage: 0,
    selfpage: true,
    postpayItem: null,
    click_aixin: false,
    showpath: false,
    ismycut: 0,
    cutsuccesstip: 0,
    cutprice: 0,
    helpers: [],
    lid: 0,
    luid: 0,
    cityname: app.globalData.cityName,
    hasFollow: -1,
    hastake: 0,
    UserName: '',
    Phone: '',
    ranks: [],
    isloadData: false, //是否在加载数据中
    pageIndex: 1, //页码
    PageSize: 5,
    loadall: 0, //是否已经完成页面拼装
    takeform: 0,
    countdown: '',
    countTimer: null,
    mainmodel: {
      lovename: ''
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
    showpaywin: 0,
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
    hasVoucher: false,
    uservoucherlist: [],
    payMoney: '',
    voucherIdx: '',
    voucherMoney: 0,
    voucher: null,
    listvoucher: []
  },
  onShow: function () {
    this.poster = this.selectComponent("#poster");
  },
  onLoad: function (options) {
    var that = this
    this.storeid = options.sid
    var loveid = options.loveid
    var luid = options.luid
    var r = !!options.r ? options.r : 0
    console.log(loveid, luid)
    //从海报进来
    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        loveid = addr.getsceneparam("loveid", scene)
        luid = addr.getsceneparam("luid", scene)
        if (0 == r)
          r = addr.getsceneparam("r", scene)
      }
    }

    if (undefined != loveid)

      that.setData({
        lid: loveid
      })
    if (undefined != luid)
      that.setData({
        luid: luid,
        selfpage: false,
        ruid: options.ruid && options.ruid
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
        cityqrcode: app.globalData.cityqrcode
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
  onshow() {
    let animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
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
    var path = addr.getCurrentPageUrlWithArgs()
    console.log(path)
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
    if (this.data.rid) {
      path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
    }
    if (that.data.selfpage) {
      path += "&luid=" + that.data.mainmodel.luid
    }
    app.commonshare(this.data.lid, "like")
    var title = that.data.mainmodel.lovename
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
          fxtype: 3
        });
      }
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    return {
      title: title,
      path: path,
      success: function (res) {
        // 红包添加领取次数
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
  startCut: function () {
    var that = this
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      that.setData({
        takeform: 1
      })
    }
  },
  onPullDownRefresh: function () {
    var that = this
    that.loadmain()
    that.setData({
      Phone: app.globalData.userInfo.TelePhone,
      UserName: app.globalData.userInfo.nickName,
      cityphone: app.globalData.cityphone,
      cityqrcode: app.globalData.cityqrcode
    })
    that.loadmoreranks()
    wx.stopPullDownRefresh()
  },
  //倒计时
  countdown: function () {
    var that = this
    setInterval(function () {
      if (that.data.mainmodel != null) {
        var countdown = "";
        var now = new Date();
        var startTime = util.GetDateTime(that.data.mainmodel.startdate)
        var endTime = util.GetDateTime(that.data.mainmodel.enddate)
        var state = that.data.mainmodel.state
        var remainnum = that.data.mainmodel.remainnum
        if (-1 == state) {
          countdown = "活动已被删除"
        } else {
          if (startTime > now) {
            countdown = "距离活动开始还剩"
            that.lefttime(that.data.mainmodel.startdate)
            that.setData({
              countdown: countdown,

            });
          } else if (endTime < now || remainnum <= 0) {
            countdown = "活动已抢光或结束"
          } else {
            countdown = "活动剩余时间"
            that.lefttime(that.data.mainmodel.enddate)
          }
        }

        that.setData({
          countdown: countdown
        });
      }
    }, 1000)
  },
  loadmain: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetLoveMain,
      data: {
        luid: that.data.luid,
        lid: that.data.lid,
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
        r: that.data.fromuid,

      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      async success(res) {
        console.log('hshfasdhffffffffffffffffffffffffffff')
        console.log(that.data.lid, that.data.luid)
        if (res.data.Success) {
          if (false == that.data.showpath) //店主也可以查看路径
          {
            var shopownerphone = res.data.Data.maininfo.shopownerphone
            if (app.globalData.userInfo.TelePhone == shopownerphone) {
              that.setData({
                showpath: true,
              })
            }
          }
          var m = res.data.Data.maininfo
          // var videoAttachmentList = res.data.Data.VideoAttachmentList;
          that.setData({
            // 红包相关参数
            // redPackageParams: {
            //   itemId: that.data.lid,
            //   redtype: 4,
            //   storeid: res.data.Data.companyInfo.Id,
            //   cityid: app.globalData.cityInfoId,
            //   openId: app.globalData.userInfo.openId,
            //   userlat: app.globalData.userlat,
            //   userlng: app.globalData.userlng,
            //   ruid: that.data.ruid,  // 从分享进来得参数
            //   uid: app.globalData.userInfo.Id
            // },
            audioSrc: res.data.Data.AudioAttachmentList || '',
            // 'videoParams.convertFilePath': videoAttachmentList.convertFilePath,
            // 'videoParams.videoPosterPath': videoAttachmentList.videoPosterPath
          })


          that.setData({
            mainmodel: m,
            companyInfo: res.data.Data.companyInfo,
            hastake: m.hastake,
            hasFollow: m.hasconcern == 1 ? 1 : -1,
            luid: m.luid,
            loadall: 1,
            click_aixin: m.iscut,
            voucher: res.data.Data.voucher
          })
          if (undefined != res.data.Data.helpers) {
            that.setData({
              helpers: res.data.Data.helpers,
            })
          }
          WxParse.wxParse('Description', 'html', m.desc, that)
          var formater = "yyyy-MM-dd hh:mm";
          let canvasShowMember = (m.MemberPriceState && m.MemberPrice > 0 && m.MemberPrice < m.BuyPrice) ? true : false //2019/7/1
          var temp = {
            introduceimg: m.introduceimg,
            title: m.lovename,
            originalprice: m.originalprice,
            floorprice: m.minprice,
            // floorprice: (m.MemberPriceState && m.MemberPrice > 0 && m.MemberPrice <m.BuyPrice)  ? m.MemberPrice:m.BuyPrice,  //2019/7/1
            remainnum: m.remainnum,
            enddate: that.dateFormat(new Date(util.GetDateTime(m.enddate))) || '',
            startdate: that.dateFormat(new Date(util.GetDateTime(m.startdate))) || '',
            openid: app.globalData.userInfo.openId,
            appid: app.globalData.appid,
            loginuserid: app.globalData.userInfo.Id,
            isfx: m.IsFx,
            fxitemtype: 3,
            fxitemid: m.Id,
            storeid: m.StoreId,
            fxearns: m.ExpectEarns
          }
          that.setData({
            shareposterparams: temp
          })
          that.countdown()

          let resp = await getStoreVoucherList({
            openid: app.globalData.userInfo.openId,
            cityid: app.globalData.cityInfoId,
            storeid: res.data.Data.companyInfo.Id,
            pageIndex: 1
          })

          that.setData({
            listvoucher: resp.Data.listvoucher
          })
        } else {
          app.ShowMsg(res.data.Message)
          //跳首页
          setTimeout(function () {
            app.gotohomepage()
          }, 2000)
        }
      },
      fail: function (e) {
        app.showMsg('网络故障，请重新刷新试试')

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
  xiangxi: function () {
    this.setData({
      xiangxi: this.data.xiangxi == false
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
            app.showMsg(msg)
          }
        }
      })

    }
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
      })
      wx.request({
        url: addr.Address.GetLoveRank,
        data: {
          lid: that.data.lid,
          pageIndex: that.data.pageIndex,
          pageSize: that.data.PageSize
        },
        success: function (res) {
          var list = that.data.ranks
          var resultList = res.data.data
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
        fail: function () {
          // fail
        },
        complete: function () {
          wx.hideToast();
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
      url: addr.Address.AddLoveUser,
      data: {
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
        LId: that.data.lid,
        LTitle: that.data.mainmodel.lovename,
        UserId: that.data.mainmodel.loginerid,
        Name: that.data.UserName,
        TelePhone: that.data.Phone,
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
            title: '报名成功',
            icon: 'success',
            duration: 2000
          })
          //去详细页
          var url = '/pages/activity_jiaixin/activity_jiaixin_detail?loveid=' + that.data.lid + '&luid=' + res.data.Data.luid
          setTimeout(function () {
            wx.redirectTo({
              url: url,
            })
          }, 2000)
        } else {
          console.log("ffff")
          console.log(res.data)
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
  gotoshop: function (e) {
    var that = this
    var storeid = that.data.companyInfo.Id
    var url = '/pages/business_detail/business_detail?storeid=' + storeid
    wx.redirectTo({
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
  //去支付页
  clickToBalance: function () {
    var that = this
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      var mainmodel = that.data.mainmodel
      if (mainmodel.buserstate != 0) {
        app.ShowMsg("活动状态有误，您是不是已经购买了呀")
        return
      }
      if (!that.validateTimeStart(mainmodel.startdate)) {
        app.ShowMsg("该活动还未开始，请刷新后重试")
        return
      }
      if (!that.validateTimeEnd(mainmodel.startdate)) {
        app.ShowMsg("该活动已结束，请查看其它减价活动商品")
        return
      }
      if (mainmodel.remainnum <= 0) {
        app.ShowMsg("该活动商品库存已不足，请查看其它减价活动商品")
        return
      }
      if (0 == that.data.buid) {
        app.ShowMsg("参数错误，用户ID不存在")
        return
      }
      if (mainmodel.currentprice <= 0) {
        app.ShowMsg("参数错误，购买金额不对")
        return
      }
      wx.request({
        url: addr.Address.CutPay,
        data: {
          openid: app.globalData.userInfo.openId,
          appid: app.globalData.appid,
          cityid: app.globalData.cityInfoId,
          buid: that.data.buid
        },
        method: 'POST',
        header: {
          // 'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          if (1 == res.data.code) {
            var orderid = res.data.orderid
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
          } else {
            app.ShowMsg(res.data.msg)
            return
          }
        }
      })
    }
  },
  openpaywin: function () { // 打开支付弹窗
    var that = this
    that.setData({
      showpaywin: 1
    })
  },
  closepaywin: function () { // 关闭支付弹窗
    var that = this
    that.setData({
      showpaywin: 0
    })
  },
  validateTimeEnd: function (vTimeSpan) {
    return new Date() > new Date(parseInt(vTimeSpan.replace("/Date(", "").replace(")/", ""), 10));;
  },
  validateTimeStart: function (vTimeSpan) {
    return new Date() > new Date(parseInt(vTimeSpan.replace("/Date(", "").replace(")/", ""), 10));;
  },
  //付款成功后回调
  refun: function (state) {
    if (state == 0) {
      app.showMsg("已取消付款")
    } else if (state == 1) {
      // wx.showToast({
      //   title: '支付成功 !',
      //   icon: 'success',
      //   duration: 2000
      // })
      wx.redirectTo({
        url: "../cutlist/cutlist?type=cut"
      })
    }
  },
  closecutsucesstip: function () {
    var that = this
    that.setData({
      cutsuccesstip: 0
    })
  },
  gotomore: function () {
    var that = this
    var url = '/pages/activity/activity?type=cut'
    wx.redirectTo({
      url: url,
    })
  },
  gotouse: function (e) {
    var bid = e.currentTarget.dataset.bid
    var buid = e.currentTarget.dataset.buid
    var url = '../cutuse/cutuse?loveid=' + bid + '&luid=' + buid
    wx.navigateTo({
      url: url,
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
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
  gotoshopdetail: function (e) {
    var storeid = e.currentTarget.dataset.storeid
    var url = '/pages/business_detail/business_detail?storeid=' + storeid
    wx.redirectTo({
      url: url,
    })
  },
  getlove: function (e) {
    var that = this
    var config = e.currentTarget.dataset.config
    that.setData({
      showpaywin: 1
    })
    that.setData({
      postpayItem: config
    })
  },
  gotolovepage: function (e) {
    var that = this
    var url = "/pages/activity_jiaixin/activity_jiaixin_detail?loveid=" + that.data.lid
    wx.redirectTo({
      url: url,
    })
  },
  click_aixin: function (e) {
    var that = this
    if (that.data.click_aixin) {
      return
    }
    // 显示加载中
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 60000
    })
    if (that.data.loveid == 0 || that.data.luid == 0) {
      app.ShowMsg("参数有误")
      return
    }
    wx.request({
      url: addr.Address.HelpLikeUser,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        LId: that.data.lid,
        LUId: that.data.luid
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            click_aixin: true
          })
          wx.showToast({
            title: '成功点亮爱心',
            duration: 2000
          })
          that.loadmain();
          // //页面reload
          // var url = "/" + addr.getCurrentPageUrlWithArgs()
          // wx.showToast({
          //   title: '页面刷新中',
          //   icon: 'loading',
          //   duration: 3000
          // });
          // setTimeout(function () {
          //   wx.redirectTo({
          //     url: url,
          //   })
          // }, 2000)
        } else {
          app.ShowMsg(res.data.msg)
        }
      },
      fail: function () {
        // fail
      },
      complete: function () {
        wx.hideToast();
      }
    });
  },
  //去支付页
  PostPay: function (e) {
    var that = this
    var configid = e.currentTarget.dataset.configid
    var mainmodel = that.data.mainmodel
    if (mainmodel.luserstate != 0) {
      app.ShowMsg("活动状态有误，您是不是已经购买了呀")
      return
    }
    if (!that.validateTimeStart(mainmodel.startdate)) {
      app.ShowMsg("该活动还未开始，请刷新后重试")
      return
    }
    if (that.validateTimeEnd(mainmodel.enddate)) {
      app.ShowMsg("该活动已结束，请查看其它集爱心活动商品")
      return
    }
    if (mainmodel.remainnum <= 0 && mainmodel.stockmode == 0) {
      app.ShowMsg("该活动商品库存已不足，请查看其集爱心活动商品")
      return
    }
    if (0 == that.data.luid) {
      app.ShowMsg("参数错误，用户ID不存在")
      return
    }
    wx.request({
      url: addr.Address.AddLoveOrder,
      data: {
        lid: that.data.lid,
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        confid: configid,
        luid: that.data.luid,
        uvId: this.data.voucherIdx !== '' ? this.data.listvoucher[this.data.voucherIdx].Id : ''
      },
      method: 'POST',
      header: {
        // 'content-type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function (res) {
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
          } else { //免费的
            wx.showToast({
              title: '领取成功 !',
              icon: 'success',
              duration: 2000
            })
            setTimeout(function () {
              wx.redirectTo({
                url: "../cutlist/cutlist?type=love"
              })
            }, 500);
          }

        } else {
          app.ShowMsg(res.data.Message)
          return
        }
      }
    })

  },
  //付款成功后回调
  refun: function (state) {
    if (state == 0) {
      app.showMsg("已取消付款")
    } else if (state == 1) {
      // wx.showToast({
      //   title: '支付成功 !',
      //   icon: 'success',
      //   duration: 2000
      // })
      wx.redirectTo({
        url: "/pages/payTransfer/payTransfer?type=love"
      })
    }
  },
  createposter: function () {
    var that = this
    that.poster.createposter()
  },
  //更多活动
  goToActivity() {
    wx.navigateTo({
      url: '/pages/activity/activity?type=love'
    })
  },
  //我的爱心价
  goToMyLove() {
    wx.navigateTo({
      url: '/pages/cutlist/cutlist?type=love'
    })
  },
  showVoucher() {
    this.setData({
      hasVoucher: !this.data.hasVoucher
      // payMoney: this.data.coupon.BuyPrice
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
    let voucher = this.data.listvoucher[idx]
    let voucherMoney = voucher.Money
    if (voucher.Voucher.Deducting > 0) {
      if (this.data.postpayItem.BuyPrice < voucher.Voucher.Deducting * 100) {
        app.ShowMsg('购买金额不足满减金额，该代金券不可用')
      } else {
        if (voucherMoney * 100 >= this.data.postpayItem.BuyPrice) {
          app.ShowMsg('购买金额小于减免金额，该代金券不可用')
        } else {
          this.setData({
            hasVoucher: false,
            voucherMoney: voucherMoney * 100
          })
        }
      }
    } else {
      if (voucherMoney * 100 >= this.data.postpayItem.BuyPrice) {
        app.ShowMsg('购买金额小于减免金额，该代金券不可用')
      } else {
        this.setData({
          hasVoucher: false,
          voucherMoney: voucherMoney * 100
        })
      }
    }
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