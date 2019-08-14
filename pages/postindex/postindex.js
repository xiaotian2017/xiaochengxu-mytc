var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp();
var cell;
var c_enum;
//下拉刷新
var currentX = 0;
Page({
  data: {
    advid:"",
    advopen:true,
   
    buyversion: 1,
    showallbtns: {},
    showpath: false,
    topViewHeight: 0, //下拉刷新
    scrolling: { toppx: 0, showBack: false },
    imgUrls: [], //轮播图
    typeitems: [], //类目
    newposts: [], //最新推荐帖子
    showcallbtn: 1,
    contentH: [],//内容的高度
    sousuovalue: '', //搜索输入
    havemore: true, //加载更多
    sliderHeight: 600, //高度
    isLoadData: false, //是否在加载数据中
    pageIndex: 1, //页码
    PageSize: 10,
    swiperCurrent: 0,
    swiperTypeCurrent: 0,
    imgresouces: "https://j.vzan.cc/content/city/images/tongcheng-new-02.png",
    tongcheng_new_02: "",
    tc_icon: app.imgresouces.tc_icon,
    icon04: app.imgresouces.icon04,
    tongcheng_01: "",
    rowcount: 4,
    pagerows: 2,
    sharetitle: app.globalData.cityname,
    city_kefu_hidden: true, //客服弹窗显示开关
    QrCodeUrl: '', //同城客服二维码
    cityphone: '', //同城客服电话
    // 红包相关参数
    ruid: 0,
    isShareSuccess: false
  },
  onShareAppMessage: function (res) {
    var path = addr.getCurrentPageUrlWithArgs()
    if (this.data.rid) {
      path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
    }
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) { }
    return {
      title: app.globalData.cityName,
      path: path,
      success() {
        // 红包分享成功
        if (that.data.rid) {
          that.setData({
            isShareSuccess: true
          })
        }
      }
    }
  },
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url
    wx.reLaunch({
      url: path,
    })
  },
  //获取首页
  GetHomeInfoData: function (areacode) {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetHomeInfoData,
      data: {
        areacode: areacode,
        defaulturl: 'https://i.vzan.cc/image/jpg/2017/3/1/1638295271cc80d3cc4c73890c16f606a4d050.jpg', //默认轮播图地址
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        var data = res.data
        if (res.data.isok == 1) {
          that.setData({
            imgUrls: data.AnnoucementList,
            typeitems: data.recommentinfo,
            rowcount: data.rowcount,
            pagerows: data.pagerows,
            sharetitle: data.sharetitle,
            QrCodeUrl: data.KeFuQrCode,
          });
        }
      },
      complete: function () {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取最新推荐
  getpushpost: function (areacode, pageIndex, value = '') {
    var that = this;
    var PageSize = that.data.PageSize
    var contentH = that.data.contentH
    util.showNavigationBarLoading()
    //最新推荐
    wx.request({
      url: addr.Address.getpushpost,
      data: {
        areacode: areacode,
        PageIndex: pageIndex,
        PageSize: PageSize,
        value: value,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        if (res.data.isok == 1) {
          var postlist = res.data.postlist
          if (!!postlist&&postlist.length!=0) {
          
            that.setData({
              newposts: postlist,
           
            })
            setTimeout(() => {
              that.getAllRects()
            }, 120)
            pageIndex++
            that.setData({ pageIndex: pageIndex})
          } else {
            that.setData({
              havemore: false
            })
          }
        } else {
          that.setData({
            havemore: false
          })
        }
      },
      complete: function () {
        that.setData({
          isLoadData: false
        })
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  onLoad: function (options) {
    var that = this
    app.getUserInfo(function () {
      if (app.globalData.userInfo.iscityowner >0) {
        that.setData({
          showpath: true,
        })
      }
      wx.setNavigationBarTitle({
        title: app.globalData.cityName
      })
      app.GetAdv(602,function(advid){
        that.setData({ advid: advid,})
      })
      that.setData({
        
     
        buyversion: app.globalData.buyVersion,
        tongcheng_new_02: app.imgresouces.tongcheng_new_02,
        tongcheng_01: app.imgresouces.tongcheng_01
      })
      that.setData({
        // 红包相关参数
        redPackageParams: {
          itemId: 0,
          redtype: 6,
          storeid: app.globalData.cityInfoId,
          cityid: app.globalData.cityInfoId,
          openId: app.globalData.userInfo.openId,
          userlat: app.globalData.userlat,
          userlng: app.globalData.userlng,
          ruid: options.ruid && options.ruid,  // 从分享进来得参数
          uid: app.globalData.userInfo.Id 
        }
      })   
      that.inite()
    },1)
  },
  // 获取分享红包参数
  getDeliverParams(e) {
    this.setData({
      rid: e.detail.rid
    })
    console.log(e.detail.rid);
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  //初始化
  inite: function () {
   
    c_enum = app.C_Enum
    // 页面显示
    var that = this
    //获取系统信息。
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderHeight: res.windowHeight,
        });
      }
    });
    that.setData({
      imgUrls: [], //轮播图
      typeitems: [], //类目
      newposts: [], //最新推荐帖子
      sousuovalue: '', //搜索输入
      havemore: true, //加载更多
      cityphone: app.globalData.cityphone,
    })
    var names = app.globalData.content;
    //首页
    that.GetHomeInfoData(app.globalData.areaCode)
    //最新推荐
    that.getpushpost(app.globalData.areaCode, 1)
  
   
  
  },

  toast: function (e) {
    var url = '../choose_city/choose_city'
    app.goNewPage(url)

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
  //点击进详情
  bottomItemClick: function (params) {
    var id = params.currentTarget.dataset.id
    var typename = params.currentTarget.dataset.type
    var url = '../detail/detail?id=' + id + "&typename=" + typename
    app.goNewPage(url)
  },
  callpeple: function (e) {
    var phone = e.currentTarget.dataset.phone
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) { }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  showall(e) {
    let that = this;
    let { index, domname } = { ...e.currentTarget.dataset }
    let { contentH, showallbtns } = { ...that.data }
    that.setData({
      [showallbtns[`${domname}`].open]: !showallbtns[`${domname}`].open,
      [`contentH[${index}]`]: !contentH[index]
    });
  },

  bindKeyInput: function (e) {
    this.data.sousuovalue = e.detail.value
  },
  //点击放大图片
  pictureTap: function (e) {
    var id = e.currentTarget.dataset.id;
    var url = e.currentTarget.dataset.src;
    var postlist = this.data.newposts
    if (postlist.length > 0 && id > 0) {
      var item = postlist.filter(f => f.Id == id)
      if (item != undefined && item.length > 0 && item[0].ImgList.length > 0) {
        var urls = item[0].ImgList.map(m => m.FileFullUrl)
        app.pictureTaps(url, urls)
      }
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    app.globalData.userInfo = {
      IsValidTelePhone: 0
    }
    //获取用户信息
    app.getUserInfo(function () {
      that.inite()
      wx.stopPullDownRefresh()
    })
  },
  //上拉加载更多
  onReachBottom_scroll: function (e) {
    var that = this
    if (!that.data.isLoadData && that.data.havemore) {
      that.setData({
        isLoadData: true
      })
      that.getpushpost(app.globalData.areaCode, that.data.pageIndex , that.data.sousuovalue)
    }
  },
  //板块跳转
  itemclick: function (e) {
    var typename = e.currentTarget.dataset.typename
    var typeid = e.currentTarget.dataset.typeid
    var url = '/pages/post/postlist?typeid=' + typeid //+ '&typename=' + typename
    app.goNewPage(url)
  },
  //滚动事件
  scrollEvent(e) {
    let that = this
    let { showBack } = { ...that.data.scrolling }
    const { scrollTop } = { ...e.detail }
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
  backTop() {
    this.setData({
      'scrolling.toppx': 0
    })
  },
  closeadv(){
    this.setData({
      advopen: false
    })
  },
  toaddpage: function (e) {
    wx.navigateTo({
      url: '../addpost/addenter'
    })
  },
  //获取内容高度
  getAllRects() {
    let that = this
    let { contentH } = { ...that.data }
    wx.createSelectorQuery().selectAll('.hd_c_center').boundingClientRect((res) => {
      res.forEach((key, index) => {
        if (key.height > 40) {
          contentH[index] = true
        }
      });
      that.setData({
        contentH
      })
    }).exec()
  },
  goToMyOrder(){
    wx.navigateTo({
      url: '/pages/cutlist/cutlist'
    })
  }
})