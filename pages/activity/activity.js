var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var vzTimer = require("../../utils/countDown.js").vzTimer;
//获取应用实例
var app = getApp()
Page({
  data: {
    showpath: false,
    currentNav: 0,
    arrayNav: ['抢优惠', '减价', '集爱心', '拼团'],
    cuts: [],
    coupons: [],
    loves: [],
    currenttab: 0,
    buyversion: 0,
    wxTimerList: [],
    isLoadData: false, //是否在加载数据中
    pageIndex: 1, //页码
    PageSize: 10,
    windowHeight: undefined,
    havemore: true,
    // 同城卡相关
    cityCardList: null,
    //拼团
    groupList: [],
    type: 'coupon'
  },
  click_nav: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index
    that.setData({
      currentNav: index
    })
    that.setData({
      cuts: [],
      coupons: [],
      loves: [],
      cityCardList: null,
      group: [],
      pageIndex: 1
    })
    switch (index) {
      case 0:
        that.setData({
          type: 'coupon'
        })
        break;
      case 1:
        that.setData({
          type: 'cut'
        })
        break;
      case 2:
        that.setData({
          type: 'love'
        })
        break;
      case 3:
        that.setData({
          type: 'group'
        })
        break;
    }
    if (index == 3) {
      this.setData({
        groupList: []
      })
      that.getGroupList()
    } else {
      that.loadmore();
    }
  },
  onLoad: function (options) {
    var that = this
    var t = options.type
    app.getUserInfo(function () {
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true
        })
      }
      switch (t) {
        case 'coupon':
          that.setData({
            currentNav: 0,
            type: 'coupon'
          })
          break;
        case 'cut':
          that.setData({
            currentNav: 1,
            type: 'cut'
          })
          break;
        case 'love':
          that.setData({
            currentNav: 2,
            type: 'love'
          })
          break;
        case 'group':
          that.setData({
            currentNav: 3,
            type: 'group'
          })
          break;
      }
      wx.setNavigationBarTitle({
        title: app.globalData.cityName
      })
      that.setData({
        "windowHeight": app.globalData.windowHeight,
        buyversion: app.globalData.buyVersion
      })
      that.loadMainData();
      that.getRecomLocation()
    }, 1)

  },
  onShareAppMessage: function (res) {
    var path = addr.getCurrentPageUrlWithArgs()
    return {
      title: app.globalData.cityName,
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  loadMainData: function () {
    var that = this
    that.loadmore()
  },
  onReachBottom: function () {
    var that = this
    if (this.data.currentNav == 3) {
      that.getGroupList()
      return;
    }
    that.loadmore()
  },
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      cuts: [],
      coupons: [],
      loves: [],
      cityCardList: null,
      groupList: [],
      pageIndex: 1
    })

    if (that.data.currentNav == 3) {
      that.getGroupList()
    } else {
      that.loadmore();
    }
  },
  loadmore: function () {
    console.log('ddd')
    var that = this
    var pidx = that.data.pageIndex
    var param = {
      cityid: app.globalData.cityInfoId,
      pageindex: pidx
    }
    var currentNav = that.data.currentNav
    //默认抢优惠
    var url = addr.Address.GetStoresCoupon
    if (currentNav == 1) //砍价
    {
      url = addr.Address.GetStoreCuts
      param = {
        cityid: app.globalData.cityInfoId,
        pageIndex: pidx,
        pageSize: that.data.PageSize
      }
    } else if (currentNav == 2) //集爱心
    {
      url = addr.Address.GetLoveList
      param = {
        cityid: app.globalData.cityInfoId,
        pageIndex: pidx,
        pageSize: that.data.PageSize
      }
    } else if (currentNav == 3) {
      that.getGroupList()
      return
    }
    if (!that.data.isLoadData) {
      that.setData({
        isLoadData: true
      });
      util.showNavigationBarLoading()
      wx.request({
        url: url,
        data: param,
        success: function (res) {
          if ("" != res.data) {
            if (currentNav == 0) //优惠
            {
              var list = that.data.coupons;
              var coupons = res.data;
              that.setData({
                havemore: coupons.length == that.data.PageSize
              });

              list = list.concat(coupons)
              let timeArr = [];

              list.forEach(function (v, idx) {
                v.IsEnd = that.validateTimeEnd(v.ValidDateEnd)
                v.IsStart = that.validateTimeStart(v.ValidDateStart)

                //已经开始，还没结束,以endate进行倒计时
                if (v.IsStart == true && v.IsEnd == false && v.RemainNum > 0 && '' != v.ValidDateEnd) {
                  timeArr.push(v.ValidDateEnd.replace("/Date(", "").replace(")/", ""))
                } //还没开始
                else if (v.IsStart == false && '' != v.ValidDateStart) {
                  timeArr.push(v.ValidDateStart.replace("/Date(", "").replace(")/", ""))
                }
              });
              console.log(timeArr)
              // timeArr = ['1565253900000']
              vzTimer(timeArr, that);
              that.setData({
                coupons: list
              });
            } else if (currentNav == 1) //砍价
            {
              var pagecutlist = that.data.cuts
              var cuts = res.data
              that.setData({
                havemore: cuts.length == that.data.PageSize
              });
              let timeArr = [];
              pagecutlist = pagecutlist.concat(cuts);
              pagecutlist.forEach(function (v, idx) {
                v.ValidDateEnd = that.validateTimeEnd(v.EndDate)
                v.ValidDateStart = that.validateTimeStart(v.StartDate)
                //已经开始，还没结束,以endate进行倒计时
                if (v.ValidDateStart == true && v.ValidDateEnd == false && v.RemainNum > 0 && '' != v.EndDate) {
                  timeArr.push(v.EndDate.replace("/Date(", "").replace(")/", ""))
                } //还没开始
                else if (v.ValidDateStart == false && '' != v.StartDate) {
                  var startdate = v.StartDate.replace("/Date(", "").replace(")/", "")
                  if (startdate < 0) {
                    startdate * -1
                  }
                  timeArr.push(startdate)
                }
              })
              vzTimer(timeArr, that);
              that.setData({
                cuts: pagecutlist
              });
            } else if (currentNav == 2) { // 爱心价
              var pagelovelist = that.data.loves
              var loves = res.data.Data.lovelist
              that.setData({
                havemore: loves.length == that.data.PageSize
              });
              let timeArr = [];
              pagelovelist = pagelovelist.concat(loves);

              pagelovelist.forEach(function (v, idx) {
                v.ValidDateEnd = that.validateTimeEnd(v.EndDate)
                v.ValidDateStart = that.validateTimeStart(v.StartDate)
                //已经开始，还没结束,以endate进行倒计时
                if (v.ValidDateStart == true && v.ValidDateEnd == false && v.RemainNum > 0 && '' != v.EndDate) {
                  timeArr.push(v.EndDate.replace("/Date(", "").replace(")/", ""))
                } //还没开始
                else if (v.ValidDateStart == false && '' != v.StartDate) {

                  var startdate = v.StartDate.replace("/Date(", "").replace(")/", "")
                  if (startdate < 0) {
                    startdate * -1
                  }
                  timeArr.push(startdate)
                }
              })

              vzTimer(timeArr, that);
              that.setData({
                loves: pagelovelist
              });
            }
          } else if (currentNav == 3) {
            that.getGroupList()
          }
          pidx++;
          that.setData({
            pageIndex: pidx
          });
          that.setData({
            isLoadData: false
          });
        },
        complete: function () {
          util.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
        }
      })
    }
  },
  getRecomLocation: function () {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        that.setData({
          'lat': res.latitude,
          'lng': res.longitude
        })
        app.globalData.userlat = res.latitude
        app.globalData.userlng = res.longitude
      }
    })
  },
  validateTimeEnd: function (vTimeSpan) {
    return new Date() > new Date(parseInt(vTimeSpan.replace("/Date(", "").replace(")/", ""), 10))
  },
  validateTimeStart: function (vTimeSpan) {
    return new Date() > new Date(parseInt(vTimeSpan.replace("/Date(", "").replace(")/", ""), 10))
  },
  clickToCouponDetail: function (e) {
    var id = e.currentTarget.dataset.id
    var storeId = e.currentTarget.dataset.sid
    wx.navigateTo({
      url: '../youhui_detail/youhui_detail?couponid=' + id + '&sid=' + storeId
    })
  },
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url + '?type=' + this.data.type
    wx.reLaunch({
      url: path,
    })
  },
  tocutdetail: function (e) {
    var cutid = e.currentTarget.dataset.cutid

    var url = '../cutPriceTake/cutPriceTake?cutid=' + cutid + '&sid=' + e.currentTarget.dataset.sid
    wx.navigateTo({
      url: url,
    })
  },
  tolovedetail: function (e) {
    var loveid = e.currentTarget.dataset.loveid
    var storeid = e.currentTarget.dataset.storeid
    var url = '../activity_jiaixin/activity_jiaixin_detail?loveid=' + loveid + '&sid=' + storeid
    wx.navigateTo({
      url: url
    })
  },
  // 同城卡相关事件
  toCityCardDetail(e) {
    util.vzNavigateTo({
      url: "/pages/cityCard/cityCardList",
      query: {
        typeid: e.currentTarget.dataset.typeid
      }
    })
  },
  //去拼团详情页
  goGroupDtl(e) {
    const {
      gid,
      storeid
    } = {
      ...e.currentTarget.dataset
    }
    util.vzNavigateTo({
      url: "/pages/group_purchase/group_purchase/group_purchase",
      query: {
        gid: gid,
        sid: storeid
      }
    })
  },
  // 获取同城卡列表 
  getHalfCardList() {
    let that = this
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.getHalfCardList,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId
      },
      success(res) {
        that.setData({
          cityCardList: res.data.Data.listhalfcard
        })
      },
      complete() {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  //团购
  getGroupList() {
    let that = this
    let {
      pageIndex,
      groupList,
      lat,
      lng
    } = {
      ...that.data
    }
    let pidx = pageIndex
    util.showNavigationBarLoading()
    let param = {
      cityid: app.globalData.cityInfoId,
      searchtype: -1,
      pageindex: pidx,
      storetype: 0,
      sorttype: '',
      pointX: lat,
      pointY: lng,
      pagesize: 10,
      newSearchType: 0,
      isativity: 0
    }
    var start, end
    wx.request({
      url: addr.Address.GetGroupList,
      data: param,
      success(res) {

        if (res.data.Success) {
          let group = res.data.Data.data
          if (1 != pidx && 0 == group.length) {
            that.setData({
              "showbottomtip": true
            });
          } else if (1 == pidx && 0 == group.length) {
            that.setData({
              "showallbottomtip": true
            });
          }
          groupList = groupList.concat(group)
          let timeArr = [];
          groupList.forEach(function (v, idx) {
            v.IsEnd = that.validateTimeEnd(v.ValidDateEnd)
            v.IsStart = that.validateTimeStart(v.ValidDateStart)

            //已经开始，还没结束,以endate进行倒计时
            if (v.IsStart == true && v.IsEnd == false && v.RemainNum > 0 && '' != v.ValidDateEnd) {
              timeArr.push(v.ValidDateEnd.replace("/Date(", "").replace(")/", ""))
            } //还没开始
            else if (v.IsStart == false && '' != v.ValidDateStart) {
              var startdate = v.ValidDateStart.replace("/Date(", "").replace(")/", "")
              if (startdate < 0) {
                startdate * -1
              }
              timeArr.push(startdate);
            }
          });

          vzTimer(timeArr, that, );
          pidx++;
          that.setData({
            groupList,
            pageIndex: pidx,
            isLoadData: false
          });
        }
      },
      complete() {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  }
})