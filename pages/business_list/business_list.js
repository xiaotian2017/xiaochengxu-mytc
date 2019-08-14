var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");

var app = getApp()

Page({
  data: {
    showpath: false,
    currentphone: '',//非小程序店铺弹窗提醒电话
    currentshopqrcode: '',//非小程序店铺弹窗提醒二维码
    currentshoptip: '',//非小程序店铺弹窗提醒文字
    types: [],
    stores: [],
    selectId: 24,
    isloadData: false,//是否在加载数据中
    pageIndex: 1,//页码
    PageSize: 10,
    windowHeight: undefined,
    showbottomtip: false,//是否已经到底
    showallbottomtip: false,
    keyword: '',
    loadmoretype: 0, //是否是搜索loadmore
    focus: false,
    isLoaded: false
  },
 
  onLoad: function (options) {
    var that = this;
    app.getUserInfo(function () {
      if (app.globalData.userInfo.iscityowner == 1) {
        that.setData({
          showpath: true
        })
      }
      var typeid = options.typeid;
      that.setData({ "windowHeight": app.globalData.windowHeight });
      that.setData({ "selectId": typeid });
      that.loadMainData(typeid);
      var source = options.source;
      var focus = source == 'index'
      that.setData({ focus: focus });
    })
  
    wx.setNavigationBarTitle({
      title: '店铺列表'
    })
  
  }, onShareAppMessage: function (res) {
    var that = this
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
  onPullDownRefresh: function () {
    this.loadMainData(this.data.selectId);
    wx.stopPullDownRefresh()
  },
  loadMainData: function (typeid) {
    if (app.globalData.userlat == 0 || app.globalData.userlng == 0) {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          app.globalData.userlat = res.latitude;
          app.globalData.userlng = res.longitude;
        },
        fail: function () {
          alert('获取定位失败 , 请开启定位后重新进入')
        }
      })
    }
    var loadAll = 0;
    var that = this;
    //获取店铺分类
    wx.request({
      url: addr.Address.GetSubStoreTypes,
      data: { pid: app.globalData.cityType, cityInfoId: app.globalData.cityInfoId },
      header: { 'content-type': 'json' }, // 设置请求的 header
      success: function (res) {
        that.setData({ "types": res.data.Data.StoreTypeList });
      },
      fail: function () {
        //fail
      },
      complete: function () {
        loadAll++;
        if (2 == loadAll)
          wx.hideToast();
      }
    });

    that.loadmore(typeid, 1);
  },

  //分类跳转
  turntab: function (event) {
    var that = this;
    var id = event.currentTarget.dataset.id;
    if (id != that.data.selectId) {
      that.setData({ "isloadData": false });
      that.setData({ "loadmoretype": 0 });
      that.setData({ "selectId": id });
      that.setData({ "pageIndex": 1 });
      that.setData({ "stores": [] });
      that.setData({ "showbottomtip": false });
      that.setData({ "showallbottomtip": false });
      that.loadmore(id, 1);
    }
  },//搜索
  search: function (event) {
    var that = this;
    var keyword = that.data.keyword;
    if ('' != keyword) {
      that.setData({ "isloadData": false });
      that.setData({ "loadmoretype": 1 });
      that.setData({ "pageIndex": 1 });
      that.setData({ "stores": [] });
      that.setData({ "showbottomtip": false });
      that.setData({ "showallbottomtip": false });
      that.searchmore(that.data.selectId, 1);
    }

  },
  handleLower: function () {
    var that = this;
    var typid = that.data.selectId;
    var pidx = that.data.pageIndex;
    var loadmoretype = that.data.loadmoretype;
    if (1 == loadmoretype)
      that.searchmore(typid, pidx);
    else
      that.loadmore(typid, pidx);
  },
  loadmore: function (typeid, pidx) {
    var that = this;
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
        url: addr.Address.GetStoresByType,
        data: {
          cityid: app.globalData.cityInfoId,
          typeid: typeid,
          pageindex: pidx,
          userlat: app.globalData.userlat,
          userlng: app.globalData.userlng
        },
        success: function (res) {
          var list = that.data.stores;
          console.log(res.data.length);
          that.setData({
            isLoaded: true
          })
          if (1 != pidx && 0 == res.data.length) {
            that.setData({ "showbottomtip": true });
          }
          else if (1 == pidx && 0 == res.data.length) {
            that.setData({ "showallbottomtip": true });
          }
          if ("" != res.data) {
          
            list = list.concat(res.data);
    
            that.setData({ "stores": list });
            pidx++;
            that.setData({ "pageIndex": pidx });
            that.setData({ "isloadData": false });
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
  bindKeyInput: function (e) {
    this.data.keyword = e.detail.value
  },
  searchmore: function (typeid, pidx) {
    var that = this
    var keyword = this.data.keyword

    // 显示加载中
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 70000
    });
    wx.request({
      url: addr.Address.GetStoresByTypeSearch,
      data: {
        cityid: app.globalData.cityInfoId,
        wd: keyword,
        pageindex: pidx,
        typeid: typeid
      },
      success: function (res) {

        if (undefined != res.data.response) {
          var stores = res.data.response.docs;
          if (1 != pidx && 0 == stores.length) {
            that.setData({ "showbottomtip": true });
          }
          else if (1 == pidx && 0 == stores.length) {
            that.setData({ "showallbottomtip": true });
          }
          if (stores.length > 0) {
            var viewStores = [];
            stores.forEach(function (v) {
              var temp = {};
              temp.Id = v.id;
              temp.LogoUrl = v.LogoUrl;
              temp.SName = v.sname;
              temp.Tag = v.tag;
              temp.ViewCount = v.checkin_num;
              temp.Distance = 0;
              viewStores.push(temp);
            });
            var list = that.data.stores;
            list = list.concat(viewStores);
        
            that.setData({ "stores": list });
            pidx++;
            that.setData({ "pageIndex": pidx });
            that.setData({ "isloadData": false });
          }

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

  clickToDetail: function (e) {
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
      currentshopqrcode: '',
      tip:''
    })
  },
  callphone: function (e) {
    var phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  toaddshop: function (e) {
    wx.navigateTo({
      url: '/pages/addpost/addenter'
    })
  },
  backIndex(){
    app.gotohomepage()
  }
})