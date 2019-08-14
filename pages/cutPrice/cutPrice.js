var app = getApp()
var util = require("../../utils/util.js");
var WxParse = require('../../utils/wxParse/wxParse.js');
var addr = require("../../utils/addr.js");
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
let getStoreVoucherList = (p) => util.httpClient({ host, addr: 'IBaseData/GetStoreVoucherList', data: p });
const GetUserMember = (params) =>util.httpClient({ host, addr: 'IBaseData/GetUserMember', data: params });
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
    showpath: false,
    ismycut: 0,
    cutsuccesstip: 0,
    cutprice: 0,
    helpers: [],
    bid: 0,
    buid: 0,
    cityname: "",
    hasFollow: -1,
    hastake: 0,
    UserName: '',
    Phone: '',
    ranks: [],
    isloadData: false,//是否在加载数据中
    pageIndex: 1,//页码
    PageSize: 5,
    loadall: 0,//是否已经完成页面拼装
    takeform: 0,
    countdown: '',
    countTimer: null,
    mainmodel: { bname: '' },
    companyInfo: null,
    cityphone: '',
    cityqrcode: '',
    currentype: 'type01',
    tel_tk: true,
    pay_tk: true,
    close: false,
    current: '',
    showbottomtip: false,//是否已经到底
    showallbottomtip: false,
    showcitytelwin: 0,
    showpaywin: 0,
    hasVoucher: false,
    uservoucherlist: [],
    payMoney: '',
    voucherIdx: '',
    voucherMoney: 0,
    voucher: null,
    listvoucher: [],
    voucher:null,
    isself:0,
    memberuser: false
  },
  onReady: function () {
    this.poster = this.selectComponent("#poster");
  },
  onLoad: function (options) {
    var that = this
    var buid = options.buid
    var bid = options.bid
    //从海报进来
    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        buid = addr.getsceneparam("buid", scene)
        bid = addr.getsceneparam("bid", scene)
      }
    }
    that.setData({ buid: buid, bid: bid })
    app.getUserInfo(function () {
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true,
        })
      }
      that.setData({
        isMember: app.globalData.CCityConfig.CityMember
      })
      that.loadmain()
      that.setData({ Phone: app.globalData.userInfo.TelePhone, UserName: app.globalData.userInfo.nickName, cityphone: app.globalData.cityphone, cityqrcode: app.globalData.cityqrcode, cityname: app.globalData.cityName })
      that.loadmoreranks()
    })
  }, onShareAppMessage: function (res) {
    var that = this
    var path = addr.getCurrentPageUrlWithArgs()
    var title = that.data.mainmodel.bname
    if ('' == title) {
      title = app.globalData.cityName
    }
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    return {
      title: title,
      path: path,
      success: function (res) {
        // 转发成功
        app.commonshare(that.data.cutid, "bargain")
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onPullDownRefresh() {
    let that = this
    that.loadmain()
    that.countdown()
    that.setData({ Phone: app.globalData.userInfo.TelePhone, UserName: app.globalData.userInfo.nickName, cityphone: app.globalData.cityphone, cityqrcode: app.globalData.cityqrcode, cityname: app.globalData.cityName })
    that.loadmoreranks()
  },
  onReachBottom: function () {
    var that = this
    that.loadmoreranks()

  },
  startCut: function () {
    var that = this
    that.setData({ takeform: 1 })
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
        }
        else {
          if (startTime > now) {
            countdown = "距离活动开始还剩"
            that.lefttime(that.data.mainmodel.enddate)
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
      url: addr.Address.GetCutMain,     
      data: {
        buid: that.data.buid,
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
     async success (res) {
        if (res.data.Success) {
          var data = res.data.Data
          var m = data.maininfo        
          that.setData({
            mainmodel: m,
            companyInfo: data.companyInfo,
            hastake: m.hastake,
            hasFollow: m.hasconcern == 1 ? 1 : -1,
            loadall: 1,
            voucher: data.CutVoucher,
            isself: m.isself
          })
          if (undefined != res.data.Data.helpers) {
            that.setData({ helpers: res.data.Data.helpers, })
          }
          WxParse.wxParse('Description', 'html', m.desc, that)
          var formater = "yyyy-MM-dd hh:mm";
          var temp = {
            introduceimg: m.introduceimg.replace("i2.vzan", 'i2cut.vzan'),
            title: m.bname,
            originalprice: m.originalprice,
            floorprice: m.floorprice,
            remainnum: m.remainnum,
            enddate: util.dateFormat(formater, new Date(util.GetDateTime(m.enddate))),
            receiveend: m.receiveend,
            openid: app.globalData.userInfo.openId,
            appid: app.globalData.appid,
          }
          that.setData({
            shareposterparams: temp
          })
          
          let resp = await getStoreVoucherList({
            openid: app.globalData.userInfo.openId,
            cityid: app.globalData.cityInfoId,
            storeid: res.data.Data.companyInfo.Id,
            pageIndex: 1
          })

          that.setData({
            listvoucher: resp.Data.listvoucher
          })



        }
        else {
          app.ShowMsg(res.data.Message)
          setTimeout(function (
          ) {
            app.gotohomepage()
          }, 2000)

        }
        that.countdown()
      },
      fail: function (e) {
        app.showMsg('网络故障，请重新刷新试试')

      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  actiontype: function (e) {
    var type = e.currentTarget.dataset.type
    this.setData({ currentype: type });
  },
  xiangxi: function () {
    this.setData({ xiangxi: this.data.xiangxi == false });
  },
  aixinjia_bt: function () {
    this.setData({ tel_tk: false });
  },
  close_tk: function () {
    this.setData({ tel_tk: true, pay_tk: true });
  },
  pay_bt: function () {
    this.setData({ pay_tk: false });
  },
  follow: function () {
    var that = this
    if (null == that.data.companyInfo) {
      app.ShowMsg('网络比较慢，请重新试试')
    }
    else {
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
            that.setData({ hasFollow: operType })
          }
          else {
            var msg = res.data.Message
            app.showMsg(msg)
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
    var leftTime = date - (new Date()); //计算剩余的毫秒数 
    var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
    var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
    var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
    var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 
    days = that.PrefixInteger(days, 2);
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
  },//前往我的砍价
  gotocutdetail: function (e) {
    var that=this
    if (that.data.isself==1)
    {
      app.reload();
    }
    else{
      var buid = e.currentTarget.dataset.buid
      var url = '/pages/cutPrice/cutPrice?buid=' + buid
      wx.redirectTo({
        url: url
      })

    }
   
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
          bid: that.data.bid,
          pageIndex: that.data.pageIndex,
          pageSize: that.data.PageSize
        },
        success: function (res) {
          var list = that.data.ranks
          var resultList = res.data
          if (1 != pidx && 0 == resultList.length) {
            that.setData({ "showbottomtip": true });
          }
          else if (1 == pidx && 0 == resultList.length) {
            that.setData({ "showallbottomtip": true });
          }
          if ("" != resultList) {
            list = list.concat(resultList);
            that.setData({ "ranks": list });
            pidx++;
            that.setData({ "pageIndex": pidx, "isloadData": false });
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
      url: addr.Address.AddBargainUser,
      data: {
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
        bid: that.data.bid,
        name: that.data.UserName,
        phone: that.data.Phone
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading()
        wx.setData({ takeform: 0 })
        if (res.data.Success) {
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 2000
          })
          //去详细页
          var url = ''
          setTimeout(function () {
            wx.redirectTo({
              url: url,
            })
          }, 2000)
        }
        else {
          var msg = res.data.Message
          app.showMsg(msg)
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
  },//进店逛逛
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
    that.setData({ showcitytelwin: 0 })
  }
  ,
  opencitytelwin: function () {
    var that = this
    that.setData({ showcitytelwin: 1 })
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
    var mainmodel = that.data.mainmodel
    if (mainmodel.buserstate != 0) {
      app.ShowMsg("活动状态有误，您是不是已经购买了呀")
      return
    }
    if (!that.validateTimeStart(mainmodel.startdate)) {
      app.ShowMsg("该活动还未开始，请刷新后重试")
      return
    }
    if (that.validateTimeEnd(mainmodel.enddate)) {
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
    if (mainmodel.currentprice < 0) {
      app.ShowMsg("参数错误，购买金额不对")
      return
    }
    if (0 == mainmodel.currentprice) {
      wx.request({
        url: addr.Address.BuyFreeCut,
        data: {
          openid: app.globalData.userInfo.openId,
          buid: that.data.buid
        },
        method: 'POST',
        header: {
          // 'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          if (1 == res.data.code) {
            app.ShowMsg(res.data.Message)
            setTimeout(function () {
              wx.redirectTo({
                url: "../cutlist/cutlist?type=cut"
              })
            }, 2000)

          } else {
            app.ShowMsg(res.data.Message)
            return
          }
        }
      })
    }
    else {
      wx.request({
        url: addr.Address.CutPay,
        data: {
          openid: app.globalData.userInfo.openId,
          appid: app.globalData.appid,
          cityid: app.globalData.cityInfoId,
          buid: that.data.buid,
          uvId: this.data.voucherIdx !== '' ? this.data.listvoucher[this.data.voucherIdx].Id : ''
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
            }
            else {
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
  openpaywin: function () {// 打开支付弹窗
    var that = this
    this.GetUserMember()
    that.setData({ showpaywin: 1 })
  },
  closepaywin: function () {// 关闭支付弹窗
    var that = this
    that.setData({ showpaywin: 0 })
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
      app.ShowMsg("已取消付款")
    }
    else if (state == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000
      })
      wx.redirectTo({
        url: "/pages/payTransfer/payTransfer?type=cut"
      })
    }

  },
  tomybuycuts: function () {
    wx.reLaunch({
      url: "../cutlist/cutlist?type=cut"
    })
  },
  closecutsucesstip: function () {
    var that = this
    that.setData({ cutsuccesstip: 0 })
  },
  gotoplay: function () {
    var that = this
    var cutid = that.data.bid
    wx.reLaunch({
      url: "../cutPriceTake/cutPriceTake?cutid=" + cutid
    })
  }
  , selfcut: function () {
    var that = this
    var helpers = that.data.helpers
    // 显示加载中
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 70000
    });
    wx.request({
      url: addr.Address.CutPrice,
      data: {
        buid: that.data.buid,
        openid: app.globalData.userInfo.openId
      },
      success: function (res) {
        if (res.data.code == 1) {
          var mainmodel = that.data.mainmodel
          mainmodel.currentprice = res.data.price
          mainmodel.surpportcount = res.data.num
          var cutprice = res.data.cutprice * 1000 / 100000
          var ismycut = res.data.ismycut
          helpers.push(res.data.record)
          that.setData({ cutprice: cutprice, cutsuccesstip: 1, mainmodel: mainmodel, ismycut: ismycut, helpers })
        }
        else {
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
    var url = '../cutuse/cutuse?bid=' + bid + '&buid=' + buid
    wx.navigateTo({
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
  }
  ,
  makephone: function (e) {
    var phone = e.currentTarget.dataset.phone
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    wx.makePhoneCall({
      phoneNumber: phone
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

    let _currentprice= this.data.memberuser?this.data.mainmodel.currentprice-(this.data.mainmodel.MemberPriceState&&this.data.mainmodel.MemberPrice>0?this.data.mainmodel.MemberPrice:0) :this.data.mainmodel.currentprice
    let voucher = this.data.listvoucher[idx]
    let voucherMoney = voucher.Money
    if (voucher.Voucher.Deducting > 0) {
      if (_currentprice < voucher.Voucher.Deducting * 100) {
        app.ShowMsg('购买金额不足满减金额，该代金券不可用')
      } else {
        if (voucherMoney * 100 >= _currentprice) {
          app.ShowMsg('购买金额小于减免金额，该代金券不可用')
        } else {
          this.setData({
            hasVoucher: false,
            voucherMoney: voucherMoney * 100
          })
        }
      }
    } else {
      if (voucherMoney * 100 >= _currentprice) {
        app.ShowMsg('购买金额小于减免金额，该代金券不可用')
      } else {
        this.setData({
          hasVoucher: false,
          voucherMoney: voucherMoney * 100
        })
      }
    }
  },
  goToActivity(){
    wx.navigateTo({
      url: '/pages/activity/activity?type=cut'
    })
  },
  goToMyCutPrice(){
    wx.navigateTo({
      url: '/pages/cutlist/cutlist?type=cut'
    })
  },
  async GetUserMember() {

    let resp = await GetUserMember({
        OpenId:app.globalData.userInfo.openId,
        CityInfoId:app.globalData.cityInfoId
    })
    if (resp.code) {
        this.setData({
            memberuser: resp.data
        })
    } else {
        this.setData({
            showTips: true,
            content: resp.msg
        })
    }
},
})
