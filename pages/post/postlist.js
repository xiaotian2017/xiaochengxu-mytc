var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp();
var cell;
var c_enum;
var marginleft = 0; //距离左边
var itemwidth = 100;
var option;
var timer;
var ismove = 0;
Page({
  data: {
    currenttab: 1,
    buyversion: 0,
    showallbtns: {},
    postlist: [],
    showpath: false,
    FirstTypeList: [], //大分类
    ChileTypeList: [], //二级分类
    PostFilterList: [], //最后一级分类
    chileid: 0,
    Sort: [],
    condition: 97,
    toadd: 1,
    currentitem: '',
    typeid: 0, //选择的一级分类
    items: [], //分类
    isopen: 0, //是否开启帖子板块置顶
    sousuovalue: '', //搜索输入
    havemore: true, //加载更多   
    isloadData: false, //是否在加载数据中
    pageIndex: 1, //页码
    PageSize: 10,
    ispingche: 0, //是否是拼车信息
    SaleType: 0,
    imgresouces: "https://j.vzan.cc/content/city/images/tongcheng-new-02.png",
    tongcheng_new_02: app.imgresouces.tongcheng_new_02,
    tc_icon: app.imgresouces.tc_icon,
    icon04: app.imgresouces.icon04,
    tongcheng_01: app.imgresouces.tongcheng_01,
    typechange: 1,
    seedold: 0,
    currentSelTypeId: 0,
    sousuo: 0
  },
  //帖子列表
  GetPostList: function (areacode) {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetPostList,
      data: {
        areacode: areacode,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        if (res.data.isok == 1) {
          var items = []
          items.push()
          items = items.concat(res.data.data)
          var annoucementindex = items.indexOf(items.find(f => f.TypeId == that.data.typeid))
          that.setData({
            items: items,
            annoucementindex: annoucementindex - 2,
            activeIndex: annoucementindex,
          });
          if (timer > 0) {
            clearTimeout(timer)
            timer = 0
          }
          //最新推荐
          that.getpushpost(app.globalData.areaCode, 1, '', that.data.typeid);
        }
      },
      complete: function () {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  onShareAppMessage: function (res) {
    var that = this
    var path = addr.getCurrentPageUrl()
    path += "?typeid=" + that.data.typeid + "&ctypeid=" + that.data.chileid

    try {

      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
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
  changeCondition: function (e) {
    var index = e.currentTarget.id
    this.setData({
      condition: index
    })
  },
  setChoose: function (e) {
    var that = this
    var Sort = that.data.Sort
    this.data.typechange = 1
    this.data.seedold = 0
    var index = e.currentTarget.id
    var FirstTypeList = this.data.FirstTypeList
    Sort[0] = FirstTypeList[index].Title
    var pageindex = 1
    var typeid = e.currentTarget.dataset.type

    var condition = this.data.condition
    that.setData({
      Sort: Sort,
      typeid: typeid,
      pageIndex: pageindex,
      chileid: 0,
      SaleType: 0,
      condition: 99,
      postlist: []
    })

    this.getpushpost(app.globalData.areaCode, pageindex, this.data.sousuovalue, typeid)
    if (Sort[0] == '拼车' || Sort[0] == '同城拼车') {
      Sort.splice(1, 1)
    }

    wx.setNavigationBarTitle({
      title: FirstTypeList[index].Title
    })
    var typeid = FirstTypeList[index].Id
    this.inite0(typeid)

  },
  // 查看子分类
  setChile: function (e) {
    var that = this
    var typeid = that.data.typeid
    var Sort = that.data.Sort
    var ChileTypeList = that.data.ChileTypeList
    var index = e.currentTarget.id

    this.data.typechange = 1
    this.data.seedold = 0
    var chileid = ChileTypeList[index].Id
    Sort[1] = ChileTypeList[index].Title
    var pageindex = 1
    // var typeid = e.currentTarget.dataset.type
    var condition = this.data.condition
    this.setData({
      Sort: Sort,
      typeid: typeid,
      pageIndex: pageindex,
      condition: 99,
      chileid: chileid,
      postlist: []
    })

    this.getpushpost(app.globalData.areaCode, pageindex, this.data.sousuovalue, this.data.typeid, chileid)
  },

  cancelChoose: function () {
    this.setData({
      condition: 98
    })
  },
  //查看第三集分类
  setFilter: function (e) {

    var that = this
    var typeid = that.data.typeid
    var Sort = that.data.Sort
    this.data.typechange = 1
    this.data.seedold = 0
    var index = e.currentTarget.id
    var PostFilterList = that.data.PostFilterList
    Sort[2] = PostFilterList[index].TypeText
    var pageindex = 1
    var Filter = PostFilterList[index].TypeValue
    // var typeid = e.currentTarget.dataset.type
    var condition = this.data.condition
    this.saletype = ''
    this.setData({
      Sort: Sort,
      typeid: typeid,
      pageIndex: pageindex,
      condition: 99,
      SaleType: Filter,
      postlist: []
    })
    this.getpushpost(app.globalData.areaCode, pageindex, this.data.sousuovalue, this.data.typeid, this.data.chileid, Filter)

  },

  cancelChoose: function () {
    this.setData({
      condition: 98
    })
  },
  //获取帖子
  getpushpost: function (areacode, pageIndex, value = '', FirstTypeId = 0, ChileTypeId = 0, SaleType = 0) {
    var that = this;
    var currentData = this.data
    var PageSize = that.data.PageSize
    util.showNavigationBarLoading()
    var ispingche = 0
    var url = addr.Address.getpushpost
    var seeOld = 0
    var identityType = 0
    var dt = {
      PageIndex: pageIndex,
      PageSize: PageSize,
      TypeId: that.data.chileid > 0 ? that.data.chileid : FirstTypeId,
      SaleType: this.saletype ? this.saletype : SaleType,
      seeOld: seeOld,
    };
    if (FirstTypeId == c_enum.Carpooling) {
      url = addr.Address.GetCarList
      var ispingche = 1
      dt.seeOld = this.data.seedold
      dt.SaleType = SaleType
      dt.Keyword = value
      dt.CityInfoId = app.globalData.cityInfoId
    } else if (FirstTypeId == 0) {
      url = addr.Address.getpushpost;
      dt.value = value;
      dt.areacode = areacode
    } else {
      url = addr.Address.gettplbottom;
      dt.value = value;
      dt.areacode = areacode
    }
    wx.request({
      url: url,
      data: dt,
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        that.data.typechange = 0
        //判断拼车未过期数据是否加载完
        //if (FirstTypeId == c_enum.Carpooling && that.data.seedold == 0) {
        // if (res.data.postlist == null || res.data.postlist.length <= 0 || res.data.postlist.length <= 9) {
        //   that.data.seedold = 1
        //   that.getpushpost(app.globalData.areaCode, 1, that.data.sousuovalue, FirstTypeId, that.data.chileid, SaleType)

        // }
        //  }
        if (FirstTypeId == c_enum.Carpooling) {
          if (res.data.success && res.data.data && res.data.data.length > 0) {
            var postlist = res.data.data;
            var havemore = postlist == null ? false : postlist.length == PageSize;
            that.setData({
              postlist: postlist,
              havemore: havemore,
              ispingche: ispingche,
              sousuovalue: that.data.sousuovalue,
            })
            that.data.pageIndex = pageIndex
          } else {
            that.setData({
              havemore: false,
              sousuovalue: that.data.sousuovalue,
            })
          }
        } else {
          if (res.data.isok == 1) {
            var postlist = res.data.postlist;
            var havemore = postlist == null ? false : postlist.length == PageSize;
            if (postlist != null && postlist.length > 0) {
              //类型
              that.setData({
                postlist: postlist,
                havemore: havemore,
                ispingche: ispingche,
                sousuovalue: that.data.sousuovalue,
              })
              that.data.pageIndex = pageIndex
            } else {
              that.setData({
                havemore: false,
                sousuovalue: that.data.sousuovalue,
              })
            }
          } else {
            that.setData({
              havemore: false,
              sousuovalue: that.data.sousuovalue,
            })
          }
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '获取最新推荐出错',
        })
      },
      complete: function () {
        that.setData({
          isloadData: false
        })
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  //点击进详情
  bottomItemClick: function (params) {
    var id = params.currentTarget.dataset.id
    var typename = params.currentTarget.dataset.type
    var url = '../detail/detail?id=' + id + "&typename=" + typename
    app.goNewPage(url)
  },
  onLoad: function (options) {
    var that = this
    that.typename = options.typename
    that.saletype = options.saletype

    that.setData({
      sousuo: options.sousuo
    })

    option = options
    app.getUserInfo(function () {
      that.setData({

        currenttab: app.globalData.buyVersion == 1 ? 1 : 3,
        buyversion: app.globalData.buyVersion,
      })
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true
        })
      }

      that.inite0(option.typeid)
      that.inite(options)
    })
  },
  hiddenTips: function () {
    var that = this
    var path = addr.getCurrentPageUrl()
    path += "?typeid=" + that.data.typeid + "&ctypeid=" + that.data.chileid
    util.ShowPath(path)
  },
  // 获取筛选分类
  inite0: function (typeid) {
    var that = this
    var Sort = that.data.Sort
    var AllType = that.data.AllType
    wx.request({
      url: addr.Address.get_post_select_item,
      data: {
        areacode: app.globalData.areaCode,
        typeid: typeid
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        console.log(res)
        if (res.data.code != 0) {

          Sort[0] = res.data.CurrentType
          // 判断二级分类是否为空
          if (res.data.ChileTypeList.length == 0) {
            Sort.splice(1, 1)
          } else {
            Sort[1] = res.data.ChileTypeList[0].Title
            if (that.typename && that.data.condition != 99) {
              Sort[1] = that.typename
            }
          }
          // 判断三级分类是否为空
          if (res.data.PostFilterList.length == 0) {
            Sort.splice(2, 1)
          } else {
            Sort[2] = res.data.PostFilterList[0].TypeText
            if (that.saletype == 7 && that.data.condition != 99) {
              Sort[2] = '求职'
            }
            if (that.saletype == 6 && that.data.condition != 99) {
              Sort[2] = '招聘'
            }
          }
          that.setData({
            Sort: Sort,
            FirstTypeList: res.data.FirstTypeList,
            ChileTypeList: res.data.ChileTypeList,
            PostFilterList: res.data.PostFilterList
          })
          wx.setNavigationBarTitle({
            title: res.data.CurrentType,
          })
        }
      }
    })
  },
  //初始化
  inite: function (options) {
    c_enum = app.C_Enum
    // 页面显示
    var that = this
    //获取系统信息。
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderHeight: res.windowHeight,
        });
        itemwidth = res.windowWidth / 5
      }
    })
    var typename = options.typename != undefined ? options.typename : ''
    var typeid = options.typeid != undefined ? options.typeid : 0
    var chileid = options.ctypeid != undefined ? options.ctypeid : 0
    that.setData({
      toadd: 1,
      currentitem: typename,
      typeid: typeid, //选择的类型板块
      annoucementindex: 0,
      isopen: 0, //是否开启帖子板块置顶
      sousuovalue: '', //搜索输入
      havemore: true, //加载更多
      // sliderHeight: 600,//高度
      isloadData: false, //是否在加载数据中
      pageIndex: 1, //页码
      PageSize: 10,
      activeIndex: 0,
      items: [],
      chileid: chileid

    })
    let Sort = that.data.Sort
    if ('' !== options.typename)
      Sort[1] = options.typename
    that.setData({
      Sort: Sort
    })
    //帖子列表
    that.GetPostList(app.globalData.areaCode)
  },
  toast: function (e) {
    app.goNewPage('../choose_city/choose_city')

  },
  //上拉加载更多
  onReachBottom: function (e) {
    var that = this
    if (!that.data.isloadData && that.data.havemore) {
      that.setData({
        isloadData: true
      })
      that.getpushpost(app.globalData.areaCode, that.data.pageIndex + 1, that.data.sousuovalue, that.data.typeid, that.data.chileid, that.data.SaleType)
    }

  },
  bindKeyInput: function (e) {

    this.data.sousuovalue = e.detail.value;
  },
  //点击放大图片
  pictureTap: function (e) {
    var id = e.currentTarget.dataset.id;
    var url = e.currentTarget.dataset.src;
    var postlist = this.data.postlist
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
    //app.globalData.areaCode = 110107
    this.inite(option)
    wx.stopPullDownRefresh()
  },

  //执行搜索
  runsousuoclick: function () {
    var value = this.data.sousuovalue;
    this.setData({
      postlist: []
    });
    this.getpushpost(app.globalData.areaCode, 1, value, this.data.typeid)
  },
  //清除输入文字
  clearinputvalue: function () {
    this.setData({
      sousuovalue: '',
    })
  },
  //板块选择
  tabclick: function (e) {
    var typeid = e.currentTarget.dataset.type
    var typename = e.currentTarget.dataset.name
    var index = e.currentTarget.dataset.index
    var annoucementindex = this.data.annoucementindex

    annoucementindex = index - 2
    if (annoucementindex < 0) {
      annoucementindex = 0
    }

    this.setData({
      activeIndex: index,
      typeid: typeid,
      currentitem: typename,
      pageIndex: pageindex,
      annoucementindex: annoucementindex,
    })

  },
  showall: function (params) {
    var that = this;
    var state = params.currentTarget.dataset.state;
    var btnState = (state == 1 ? true : false);
    var domname = params.currentTarget.dataset.domname;
    var btns = that.data.showallbtns;
    btns[domname] = {
      open: btnState
    };
    that.setData({
      showallbtns: btns
    });
  },
  toaddpage: function (e) {
    var url = '../addpost/addenter'
    wx.redirectTo({
      url: url,
    })
  },
  callpeple: function (e) {
    var phone = e.currentTarget.dataset.phone
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  toIndexPage() {
    app.gotohomepage();
  },
  bottomnavswitch(e) {
    var path = e.currentTarget.dataset.url
    wx.navigateTo({
      url: path
    })
  },
})