var util = require("../../utils/util.js");
let {
  HOST
} = require("../../utils/addr");
var addr = require("../../utils/addr.js");
var WxParse = require('../../utils/wxParse/wxParse.js');
var pinglun = require("../../public/pinglun.js");
var uploadimg = require("../../utils/uploadImgenew.js");
var htmljson = require('../../utils/wxParse/html2json.js');

//获取应用实例
var app = getApp()

let {
  httpClient
} = require("../../utils/util.js");
let host = HOST;
const regeneratorRuntime = require('..//../utils/runtime');
//获取详情页
let getList = ({
  addr,
  data
}) => httpClient({
  host,
  addr,
  data
});
//获取购物车数量
const getMyCart = (paramsObj) => httpClient({
  addr: HOST + '/IBaseData/GetMyCart',
  data: paramsObj
});
//获取商铺Id
const GetStoreCityMemberVoucherRecommend = (paramsObj) => httpClient({
  addr: HOST + '/IBaseData/GetStoreCityMemberVoucherRecommend',
  data: paramsObj
});
const drawVoucher = (params) => httpClient({
  host: HOST,
  addr: 'IBaseData/UserDoDrawVoucher',
  data: params,
  method: 'POST',
  contentType: 'application/json'
});
const gsvlist = (params) => httpClient({
  addr: HOST + '/IBaseData/gsvlist',
  data: params
});


function getStore(arr, storeId) {
  return arr.find(item => {
    return item.StoreId == storeId
  })
}
//获取店铺商品
function getGoods(fn, Id) {
  var carlist = fn();
  if (!!carlist) {
    return carlist.CartList.filter(item => {
      return item.GoodsId == Id
    })
  }
}
//得到商品总数
function getGoodsNum(arr) {
  if (!!arr) {
    return arr.reduce((prev, cur) => {
      return prev + cur.BuyNum
    }, 0)
  }

}
//输出函数
let goodsNum = function (arr, storeId, Id) {
  console.log(arr)
  return getGoodsNum(getGoods(function () {
    return getStore(arr, storeId)
  }, Id))
}


Page({
  data: {
    name: '通用',
    // name: 'both',
    openPayOnline: true,
    isclaim: 1,
    showpath: false,
    //当前正在被回复的评论下标
    loginerphone: "",
    currentshopqrcode: '',
    currentshopphone: '',
    hasconcernpath: 0,
    commentingidx: 0,
    currentype: 'xinxi', // 这里做判断
    // currentype: 'preferential',   
    currentpl: '',
    currentsmallpl: '',
    currentbook: '',
    introimgs: [], //店铺介绍图
    topBanners: [], //顶部轮播图
    store: {
      SName: app.globalData.cityName,
      LogoUrl: ''
    },
    storeId: 0,
    StrategyList: [], //动态列表
    sPageIndex: 1,
    sPageSize: 5,
    havemore: true, //加载更多
    commentHavemore: true, //加载更多
    isLoadData: false,
    isCommentLoadData: false,
    CutList: [], //砍价列表
    LoveList: [], //集爱心列表
    CouponList: [], //优惠列表
    HeartList: [], //爱心价列表
    BookingList: [], //预定列表
    CommentList: [], //评论列表
    groupList: [], //团购列表
    cPageIndex: 1,
    cPageSize: 10,
    //qq表情
    qqfacehidden: true, //qq表情
    qqfacenamedata: pinglun.getqqfacenamedata(),
    imageList: [],
    annoucements: [],
    maxImageCount: 9,
    currentmaxImageCount: 9,
    images_full: false,
    items: [{
      item_status: "pinglun",
      content: {
        parentorchild: 0, //评论父级0
        comuserid: 0, //父评论用户ID
        ctype: 0, //控制调用店铺评论还是帖子评论
        contenttext: "",
        //图片上传
        maxImageCount: 9,
        currentmaxImageCount: 9,
        images_full: false,
        imghidden: true, //上传图片
        imageList: [],
        imageUrlList: [],
        imageIdList: [],
        imageAddUrlList: [],
        icon: 'http://j.vzan.cc/content/city/images/tc-yh-07.png',
        row: 0,
        textfocus: false,
        imghidden: true,
        contenttext: '',
        qqfacedata: []
      }
    }],
    BookingFreeId: 0,
    timeChose: ["00:00"],
    clickId: 0,
    daysForWeek: [],
    BookingAttrList: [],
    BookingList: [],
    BookingDateIndex: 0,
    BookingDateWeek: new Date().getDay() == 0 ? 7 : new Date().getDay(),
    BookingAttrIndex: 0,
    BookingNum: 0,
    SelectedBooking: [], //已选中的优惠
    SelectedBookingAttr: [], //已选中的优惠规格,
    cityCardList: [],
    // 红包相关参数
    ruid: 0,
    isShareSuccess: false,
    //商品列表页商品
    goodsList: [],
    goodsPageIndex: 1,
    // 商家tabIdx
    businessIdx: 0,
    goodsCate: [],
    cateIdx: 0,
    storeAlbum: [],
    picArr: [],
    // 自定义颜色
    customBg: '',
    customBotBg: '',
    customBtnColor: '',
    customTabColor: '',
    deepTextColor: '#fffefe', // 白一点
    deepMoreTextColor: '#b8c2e0', // 稍微灰
    normalTextColor: '#111', // 默认 
    isDeepColor: false, // 深色开关
    labelObj: null,
    navigationList: [],
    videoAttachmentList: null,
    navigatorShow: false,
    showpath: false,
    // 添加商品弹层
    showLayer: '', //弹层开关
    slide: '',
    layerType: 'addGoodsCar',
    goodsSizeActive: '', //选中的尺寸
    goodsNum: 1, //选中的数量
    leftLimit: 0, //限购剩余数量
    UserPayCount: 0,
    CartCount: 0,
    UserCartCount: 0,
    CityMemberVoucher: null,
    miniCouponList: [],
    isShowCouponBot: false,
    renderpage: 0,
    openMemberPrice: false
  },
  onLoad: function (options) {
    // // 默认
    this.setData({
      customBg: '#fff', // 背景颜色
      customBotBg: '#f0f0f0', // 底色  
      customBtnColor: '#fe3d49', // 按钮等高亮颜色
      customTabColor: '#333' // 底部tab颜色
    })
    var storeId = options.storeid

    var that = this
    //从海报进来
    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        storeId = addr.getsceneparam("storeid", scene)
      }
    }
    app.getUserInfo(function () {
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true,
          loginerphone: app.globalData.userInfo.TelePhone,
          storeId: storeId
        })
      }
      let param = {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        gid: options.gid
      }
      that.setData({
        renderpage: 1,
        param,
        storeId: storeId,
        // 红包相关参数
        redPackageParams: {
          itemId: 0,
          redtype: 0,
          storeid: storeId,
          cityid: app.globalData.cityInfoId,
          openId: app.globalData.userInfo.openId,
          userlat: app.globalData.userlat,
          userlng: app.globalData.userlng,
          ruid: options.ruid, // 从分享进来得参数
          uid: app.globalData.userInfo.Id
        }
      })
      that.init()
    }, 1)

  },
  // 获取分享红包参数
  getDeliverParams(e) {
    this.setData({
      rid: e.detail.rid
    })
  },
  onShareAppMessage: function (res) {
    var that = this
    var path = addr.getCurrentPageUrlWithArgs()
    if (this.data.rid) {
      path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
    }
    var title = that.data.store.SName
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    return {
      title: title,
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

  onPullDownRefresh: function () {
    var that = this
    that.init()
    that.GetCommentList()
  },
  //轮播图预览
  clickToPreview: function (e) {
    var that = this
    var currentUrl = e.target.dataset.src
    app.pictureTaps(currentUrl, that.data.topBanners.map(m => m.filepath))
  },
  //轮播图预览
  clickIntroToPreview: function (e) {
    var that = this
    var currentUrl = e.target.dataset.src
    app.pictureTaps(currentUrl, that.data.introimgs.map(m => m.filepath))
  },
  //动态详情图预览
  clickToPreviewStrategy: function (e) {
    var that = this
    var currentUrl = e.target.dataset.src
    var index = e.target.dataset.index
    var strategy = that.data.StrategyList[index]
    app.pictureTaps(currentUrl, strategy.DescImgList.map(m => m.filepath))

  },
  //评论图预览
  clickToPreviewComment: function (e) {
    var that = this
    var currentUrl = e.target.dataset.src
    var index = e.target.dataset.index
    var comment = that.data.CommentList[index]
    app.pictureTaps(currentUrl, comment.ImagUrls)
  },
  init: function () {
    var that = this;
    that.GetStoreAnnoucement();
    that.GetStoreDetail();
    that.GetStrategyList(that.data.sPageIndex);
    that.GetCouponList();
    that.GetCutList();
    that.GetLoveList();
    // that.GetBookingList(0, 0)
    that.GetCommentList();
    that.getCityCardList();
    that.getGroupList();
    that.getGoodsCate();
    that.getAlbumList();
    this.getPicShow();
    this.getDetailConfig();
    this.GetStoreCityMemberVoucherRecommend()
    this.gsvlist()
    this.getStoreGoods()
    //qq表情包
    that.getqqfacedata();
    // that.GetBookingFree()
    that.setData({
      daysForWeek: util.GetDaysForWeek()
    });
  },
  //获取店铺详情
  GetStoreDetail: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetStoreDetail,
      data: {
        storeId: that.data.storeId,
        openId: app.globalData.userInfo.openId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {

        if (res.data.Data.Status == -3) {
          wx.redirectTo({
            url: '/pages/storeExpirePage/storeExpirePage',
          })
          return
        }

        if (res.data.Success) {

          if (false == that.data.showpath) //店主也可以查看路径
          {
            var shopownerphone = res.data.Data.Store.ShopOwnerPhone
            if (app.globalData.userInfo.TelePhone == shopownerphone) {
              that.setData({
                showpath: true,
              })
            }
          }
          that.setData({
            topBanners: res.data.Data.AttachmentList,
            introimgs: res.data.Data.IntroAttachmentList,
            store: res.data.Data.Store,
            hasconcernpath: res.data.Data.HasConcernPath,
            isclaim: res.data.Data.IsClaim,
            openPayOnline: res.data.Data.openPayOnline,
            videoAttachmentList: res.data.Data.VideoAttachmentList
          });

          wx.setNavigationBarTitle({
            title: that.data.store.SName
          })

          if (null != res.data.Data.Store.Description && undefined != res.data.Data.Store.Description) {
            WxParse.wxParse('Description', 'html', res.data.Data.Store.Description, that)
          }
        } else {
          wx.showToast({
            title: res.data.Message
          })
        }
      },
      fail: function (e) {
        console.log("获取店铺详情出错")
        wx.showToast({
          title: '获取店铺详情出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取店铺详情
  GetStoreAnnoucement: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetStoreScrollData,
      data: {
        storeid: that.data.storeId,
        cityid: app.globalData.cityInfoId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            annoucements: res.data.Data.listAnnoucement
          })
        } else {
          app.ShowMsg(res.data.Message)
        }
      },
      fail: function (e) {
        console.log("获取店铺详情出错")
        wx.showToast({
          title: '获取店铺详情出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取商家动态
  GetStrategyList: function (pageIndex) {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetStrategyList,
      data: {
        storeId: that.data.storeId,
        pageIndex: pageIndex,
        pageSize: that.data.sPageSize
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          var data = that.data.StrategyList
          data = data.concat(res.data.Data.StrategyList)
          that.setData({
            StrategyList: data,
            havemore: res.data.Data.Count == that.data.sPageSize,
            sPageIndex: that.data.sPageIndex + 1
          });
        }
      },
      fail: function (e) {
        console.log("获取店铺动态出错")
        wx.showToast({
          title: '获取店铺动态出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取优惠券
  GetCouponList: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetCouponList,
      data: {
        storeId: that.data.storeId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            CouponList: res.data.Data.CouponList.slice(0, 2),
            allCouponList: res.data.Data.CouponList
          });
        }
      },
      fail: function (e) {
        console.log("获取店铺优惠出错")
        wx.showToast({
          title: '获取店铺优惠出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取优惠券
  GetCutList: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetStoreCutList,
      data: {
        storeId: that.data.storeId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            CutList: res.data.Data.CutList.slice(0, 2),
            allCutList: res.data.Data.CutList
          });
        }
      },
      fail: function (e) {
        console.log("获取店铺优惠出错")
        wx.showToast({
          title: '获取店铺减价出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取集爱心
  GetLoveList: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetStoreLoveList,
      data: {
        storeId: that.data.storeId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            LoveList: res.data.Data.LoveList.slice(0, 2),
            allLoveList: res.data.Data.LoveList
          });
        }
      },
      fail: function (e) {
        console.log("获取店铺优惠出错")
        wx.showToast({
          title: '获取店铺减价出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取爱心价
  getHeartList: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetHeartList,
      data: {
        storeId: that.data.storeId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            HeartList: res.data.Data.HeartList
          });
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '获取店铺爱心价出错',
        })
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取预定列表
  GetBookingList: function (week, attrid) {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetBookingList,
      data: {
        storeId: that.data.storeId,
        week: week,
        attrid: attrid
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        week = week > 0 || that.data.BookingDateWeek == -1 ? week : that.data.BookingDateWeek
        if (res.data.Success) {
          that.setData({
            BookingList: res.data.Data.BookingList,
            BookingAttrList: res.data.Data.BookingAttrList,
            BookingNum: res.data.Data.BookingNum,
            currentype: res.data.Data.Count > 0 ? 'yuding' : 'xinxi',
          });
        }
      },
      fail: function (e) {
        console.log("获取店铺优惠出错")
        wx.showToast({
          title: '获取店铺优惠出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  //获取评论
  GetCommentList: function () {
    var that = this
    if (that.data.isCommentLoadData || !that.data.commentHavemore) {
      return
    }
    that.setData({
      isCommentLoadData: true
    });
    wx.request({
      url: addr.Address.GetCommentList,
      data: {
        storeId: that.data.storeId,
        pageIndex: that.data.cPageIndex
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        var oldData = that.data.CommentList
        if (res.data.Success) {
          var Comment = res.data.Data.CommentList
          console.log(res.data.Data)
          var cHaveMore = Comment.Count == that.data.cPageSize ? true : false
          for (var i = 0; i < Comment.length; i++) {
            var item = Comment[i]
            Comment[i].ContentHtml = htmljson.html2json(item.ContentHtml, 'commentContent' + item.Id)
            if (item.SubCommentList != null && item.SubCommentList.length > 0) {
              for (var j = 0; j < item.SubCommentList.length; j++) {
                var subitem = item.SubCommentList[j]
                item.SubCommentList[j].ContentHtml = htmljson.html2json(subitem.ContentHtml, 'commentContent' + subitem.Id)
              }
            }
          }
          oldData = oldData.concat(Comment)
          that.setData({
            CommentList: oldData,
            cPageIndex: that.data.cPageIndex + 1,
            commentHavemore: cHaveMore
          });

        }
        that.setData({
          isCommentLoadData: false
        });
      },
      fail: function (e) {
        console.log("获取店铺评论出错")
      },

      complete: function () {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()

      }
    })
  },
  //加载更多商家动态
  clickToLoadMore: function () {
    if (!this.data.isLoadData && this.data.havemore) {
      this.data.isLoadData = true
      this.GetStrategyList(this.data.sPageIndex)
      this.data.isLoadData = false
    }
  },
  //获取是否开启免费预定
  GetBookingFree: function () {
    var that = this;
    wx.request({
      url: addr.Address.GetBookingFreeList,
      data: {
        storeId: that.data.storeId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            BookingFreeId: res.data.Data.BookingFreeId,
            currentype: res.data.Data.BookingFreeId > 0 ? 'yuding' : 'xinxi',
          });
        }
      },
      fail: function (e) {
        console.log("获取店铺免费预定是否开启出错")
        wx.showToast({
          title: '获取店铺免费预定是否开启出错',
        })
        console.log(e)
      }
    })
  },
  //显示地图
  clickShowMap: function () {
    var that = this;
    var lat = that.data.store.lat
    var lng = that.data.store.lng
    try {
      wx.setStorageSync('needloadcustpage', false)
      wx.openLocation({
        latitude: lat,
        longitude: lng
      })
    } catch (e) {}

  },
  //打电话
  makePhoneCall: function () {
    var that = this;
    if (that.data.store.TelePhone == null || that.data.store.TelePhone.length == 0) {
      return app.showToast('商家未填写联系号码 !')
    }
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    wx.makePhoneCall({
      phoneNumber: that.data.store.TelePhone
    })
  },
  //qq表情数据包
  getqqfacedata: function () {
    pinglun.getqqfacedata(this)
  },
  actiontype: function (e) {
    var type = e.currentTarget.dataset.type;
    if (type === 'store-goods') {
      this.setData({
        goodsList: [],
        cateIdx: 0
      })

      this.getStoreGoods()
    }
    this.setData({
      currentype: type
    });
  },
  // 这里逻辑要优化
  getStoreGoods(e) {
    this.typeid = 0;
    if (e) {
      this.typeid = e.currentTarget.dataset.id;
      this.setData({
        goodsList: [],
        goodsPageIndex: 1
      })
      this.setData({
        cateIdx: e.currentTarget.dataset.idx
      })
    }

    let that = this;
    let {
      storeId,
      goodsPageIndex,
      loadingAll
    } = {
      ...that.data
    };
    let param = {
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      storeId,
      pageIndex: goodsPageIndex,
      pageSize: 100,
      typeid: this.typeid
    }
    // if (!loadingAll) {
    wx.request({
      url: HOST + 'IBaseData/GetStoreGoodsList',
      data: param,
      method: 'GET',
      success(res) {
        if (res.data.Success) {
          let listgoods = res.data.Data.listgoods;
          if (listgoods.length > 0) {
            if (listgoods.length < 10) {
              that.setData({
                loadingAll: true
              })
            } else {
              // ++goodsPageIndex;
              // that.setData({
              //   goodsPageIndex
              // })
            }
            let {
              goodsList
            } = {
              ...that.data
            };
            goodsList = [...goodsList, ...listgoods];
            that.setData({
              goodsList,
              cartCount: res.data.Data.CartCount

            })
          } else {
            that.setData({
              loadingAll: true
            })
          }
        }
      },
      fail(e) {
        console.log(e)
      }
    })
    // }
  },
  //去详情页
  async addGoodCar(e) {
    const {
      gid
    } = {
      ...e.currentTarget.dataset
    }
    this.setData({
      'param.gid': gid,
      goodsNum: 1
    })
    this.loadData(this.data.param)

    this.setData({
      showLayer: 'fadeIn',
      slide: 'slideFromDown'
    })
  },
  goToGoodsDetail(e) {
    const {
      gid
    } = {
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/goods/goods_detail/goods_detail?gid=' + gid + '&sid=' + this.data.storeId
    })
  },
  hideLayer() {
    this.setData({
      showLayer: 'fadeOut',
      slide: 'slideOutDown'
    }, () => {
      setTimeout(() => {
        this.setData({
          showLayer: ''
        })
      }, 380)
    })
  },
  //评论弹框
  pinglun: function (e) {
    var pltk = 'pinglun_tk'
    var items = this.data.items
    items[0].content.imageList = []
    items[0].content.imghidden = true
    this.setData({
      currentpl: pltk,
      items: items
    });
  },
  pinglunHide: function (e) {
    var pltk = ''
    this.setData({
      currentpl: pltk
    });
  },
  qqfaceHidden: function () {
    this.setData({
      qqfacehidden: !this.data.qqfacehidden
    });
  },
  //点击qq表情触发事件
  clickface: function (params) {
    pinglun.clickface(params, this)
  },
  //点击显示图片上传
  showimg: function () {
    this.data.items[0].content.textfocus = false
    pinglun.showimg(this)
  },
  clearImage: function (parmas) {
    uploadimg.clearImage(parmas, this);
  },
  //图片上传
  chooseImage: function (parmas) {
    uploadimg.chooseImage(parmas, this);
  },
  clearImage: function (parmas) {
    uploadimg.clearImage(parmas, this);
  },
  //添加评论
  addComment: function (e) {
    var contenttext = this.data.items[0].content.contenttext
    if (contenttext == undefined || contenttext.trim().length <= 0) {
      wx.showToast({
        title: '内容太少了，再写点吧',
        icon: 'loading',
      })
      return
    } {
      if (this.data.items[0].content.addcontemt == 1) {
        return
      }
      this.data.items[0].content.addcontemt = 1
      wx.showLoading({
        title: '提交中',
      })
      pinglun.AddStoreComment(e, this)
      //关闭弹窗清空数据
      this.data.items[0].content.addcontemt = 0
      var items = this.data.items
      items[0].content.contenttext = ''
      this.setData({
        currentpl: '',
        currentsmallpl: '',
        items: items,
        qqfacehidden: true,
      });
    }
  },
  //输入评论信息
  contenttextadd: function (e) {
    var value = e.detail.value
    var items = this.data.items
    items[0].content.contenttext = value
    this.setData({
      items: items
    });
  },
  //子评论弹框
  pinglun_small: function (e) {
    var parentorchild = e.currentTarget.dataset.parentorchild
    var comuserid = e.currentTarget.dataset.comuserid
    var comindex = e.currentTarget.dataset.index
    var items = this.data.items;
    items[0].content.parentorchild = parentorchild
    items[0].content.comuserid = comuserid
    var pltk_small = 'pinglunsmall_tk'
    this.setData({
      currentsmallpl: pltk_small,
      items: items,
      commentingidx: comindex
    });
  },
  pinglun_smallHide: function (e) {
    var pltk_small = ''
    this.setData({
      currentsmallpl: pltk_small
    });
  },


  //格式化时间
  dateFormat: function (time) {
    var formater = "hh:mm";
    return util.dateFormat(formater, time)
  },

  //在线买单
  clickPayOnline: function () {
    var url = "../business_detail/pay?storeid=" + this.data.storeId
    app.goNewPage(url)
  },
  //跳转优惠券详情页
  clickToCouponDetail: function (e) {
    var remainNum = e.currentTarget.dataset.remainnum
    if (remainNum == 0) return false;
    var couponid = e.currentTarget.dataset.couponid
    var url = "../youhui_detail/youhui_detail?couponid=" + couponid + '&sid=' + this.data.storeId
    app.goNewPage(url)
  },
  //点击放大图片
  pictureTap: function (e) {
    var id = e.currentTarget.dataset.id
    var url = e.currentTarget.dataset.src
    var comments = this.data.newposts
    if (postlist.length > 0 && id > 0) {
      var item = postlist.filter(f => f.Id == id)
      if (item != undefined && item.length > 0 && item[0].ImgList.length > 0) {
        var urls = item[0].ImgList.map(m => m.FileFullUrl)
        app.pictureTaps(url, urls)
      }
    }
  }, //首页
  gotonindex: function (e) {
    app.gotohomepage()
  }, //收藏页面
  click_concernpath: function (e) {
    var that = this
    var hasConcerned = that.data.hasconcernpath
    var msg = "你要收藏该页面吗 ? 收藏后下次进入小程序直接进入此页面"
    if (1 == hasConcerned) {
      msg = "你确定要取消该页面的收藏吗 ? "
    }
    wx.showModal({
      title: '温馨提示',
      content: msg,
      success: function (res) {
        if (res.confirm) {
          var storeid = e.currentTarget.dataset.storeid
          if (0 == storeid) {
            wx.showToast({
              title: '参数有误呢，请重新点击试试',
            })
            return
          }
          util.showNavigationBarLoading()
          wx.request({
            url: addr.Address.ConcernPagePath,
            data: {
              storeid: storeid,
              openId: app.globalData.userInfo.openId
            },
            method: "GET",
            header: {
              'content-type': "application/json"
            },
            success: function (res) {
              if (res.data.Success) {
                if (res.data.Message == 1) {
                  that.setData({
                    hasconcernpath: 1
                  });
                } else if (res.data.Message == 0) // 取消收藏
                {
                  that.setData({
                    hasconcernpath: 0
                  });
                } else {
                  wx.showToast({
                    title: "系统错误，请重新试试",
                  })
                  return

                }
              } else {
                wx.showToast({
                  title: res.data.Message,
                })
              }
            },
            complete: function () {
              util.hideNavigationBarLoading()
            }
          })
        } else if (res.cancel) {

        }
      }
    })

  },
  goToObtain: function (e) {
    var that = this;
    var store = that.data.store;
    delete store.Description;
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      wx.navigateTo({
        url: '/pages/domain/domain?store=' + JSON.stringify(store)
      })
    }

  },
  //前往管理我的店铺
  gotoshopmgr: function () {
    var that = this
    var url = '../shop/shop_admin?storeid=' + that.data.store.Id
    wx.navigateTo({
      url: url
    })
  },
  gotocutself: function (e) {
    var bid = e.currentTarget.dataset.bid
    var url = '/pages/cutPriceTake/cutPriceTake?cutid=' + bid + '&sid=' + this.data.storeId
    wx.navigateTo({
      url: url
    })
  },


  gotoloveself: function (e) {
    var lid = e.currentTarget.dataset.loveid
    var url = '/pages/activity_jiaixin/activity_jiaixin_detail?loveid=' + lid + '&sid=' + this.data.storeId
    wx.navigateTo({
      url: url
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  // 获取同城卡
  getCityCardList: function () {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.getStoreHalfCard,
      data: {
        storeId: that.data.storeId
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            cityCardList: res.data.Data.listhalfcard.slice(0, 2),
            allCityCardList: res.data.Data.listhalfcard
          });
        }
      },
      fail: function (e) {
        console.log("获取同城卡价出错")
        wx.showToast({
          title: '获取同城卡出错',
        })
        console.log(e)
      },
      complete: function () {
        util.hideNavigationBarLoading()
      }
    })
  },
  // 获取团购
  getGroupList: function () {
    let that = this
    wx.request({
      url: addr.Address.GetStoreGroups,
      data: {
        cityid: app.globalData.cityInfoId,
        storeid: that.data.storeId,
        pageIndex: 1,
        pageSize: 10,
        state: 1
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success(res) {
        if (res.data.Success) {
          let groupList = res.data.Data.listgroup
          groupList.forEach((key) => {
            Object.keys(key).forEach((obj) => {
              if (key[obj] == null) {
                delete key[obj]
              }
            })
            that.setData({
              groupList: groupList.slice(0, 2),
              allGroupList: groupList
            })
          })
        }
      },
      fail(e) {
        console.log(e)
      }
    })
  },
  //去团购详情页
  goGroupDtl(e) {
    const {
      gid
    } = {
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/group_purchase/group_purchase/group_purchase?gid=' + gid + '&sid=' + this.data.storeId
    })
  },
  toCityCardService(e) {
    let {
      hid,
      typeid,
      goodid
    } = e.currentTarget.dataset;

    if (goodid > 0) {

      util.vzNavigateTo({
        url: '/pages/goods/goods_detail/goods_detail',
        query: {
          gid: goodid

        }
      })
    }
    util.vzNavigateTo({
      url: '/pages/cityCard/cityCardService',
      query: {
        hid,
        typeid
      }
    })
  },
  //
  setBusinessTab(e) {
    this.setData({
      businessIdx: e.currentTarget.dataset.idx
    })
  },
  // 获取商品分类
  getGoodsCate() {

    let that = this;
    wx.request({
      url: addr.Address.Get_AddGoodTypeViewModel,
      data: {
        cityId: app.globalData.cityInfoId,
        storeid: that.data.storeId
      },
      success(res) {

        that.setData({
          goodsCate: [{
            Name: '全部',
            Id: 0
          }, ...res.data.Data.GoodsType.TypeConfigList]
        })
      }
    })
  },
  // 获取店铺相册
  getAlbumList() {
    let that = this;
    wx.request({
      url: addr.Address.GetAlbumList,
      data: {
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
        storeid: that.data.storeId
      },
      success(res) {
        that.setData({
          storeAlbum: res.data.Data.listAlbum
        })
      }
    })
  },
  // 店铺相册轮播图片
  getPicShow() {
    let that = this;
    wx.request({
      url: addr.Address.GetPicShow,
      data: {
        openid: app.globalData.userInfo.openId,
        storeid: that.data.storeId
      },
      success(res) {
        that.setData({
          picArr: res.data.Data.Pic && res.data.Data.Pic || []
        })
      }
    })
  },

  previewImg(e) {
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.picArr.map((item) => {
        return item.filepath
      })
    })
  },
  // 自定义配置
  getDetailConfig() {
    let that = this;
    wx.request({
      url: addr.Address.GetDetailConfig,
      data: {
        openid: app.globalData.userInfo.openId,
        storeid: that.data.storeId
      },
      success(res) {
        let detailConfig = res.data.Data.DetailConfig;
        let navtype = detailConfig.NavigationList[0].navtype;
        that.setData({
          labelObj: detailConfig.TagList,
          navigationList: detailConfig.NavigationList,
          currentype: navtype == 0 && 'xinxi' || navtype == 1 && 'store-goods' || navtype == 2 && 'dongtai'
        })
        switch (parseInt(detailConfig.StoreSkin)) {
          case 1:
            // // 默认
            that.setData({
              customBg: '#fff', // 背景颜色
              customBotBg: '#f0f0f0', // 底色  
              customBtnColor: '#fe3d49', // 按钮等高亮颜色
              customTabColor: '#333' // 底部tab颜色
            })
            break;
          case 2:
            // 粉色
            that.setData({
              customBg: '#ffeff7', // 背景颜色
              customBotBg: '#f7dbe7', // 底色  
              customBtnColor: '#ff006a', // 按钮等高亮颜色
              customTabColor: '#666' // 底部tab颜色
            })
            break;
          case 3:
            // 蓝色
            that.setData({
              customBg: '#eff9ff', // 背景颜色
              customBotBg: '#dfedfa', // 底色  
              customBtnColor: '#009cff', // 按钮等高亮颜色
              customTabColor: '#666' // 底部tab颜色
            })
            break;
          case 4:
            // 深色 底部tab 分割线设置
            that.setData({
              customBg: '#1e2127', // 背景颜色
              customBotBg: '#1a1c1f', // 底色  
              customBtnColor: '#39b2ff', // 按钮等高亮颜色
              customTabColor: '#666', // 底部tab颜色
              isDeepColor: true
            })
        }
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: detailConfig.StoreSkin == 1 ? that.data.customBtnColor : that.data.customBotBg
        })
      }
    })
  },

  toAlbum(e) {
    wx.navigateTo({
      url: `/pages/storeAlbum/uploadPhoto?storeid=${e.currentTarget.dataset.sid}&albumid=${e.currentTarget.dataset.id}&albumname=${e.currentTarget.dataset.name}`
    })
  },

  toAlbum2() {
    wx.navigateTo({
      url: `/pages/storeAlbum/storeAlbum?storeid=${this.data.storeId}`
    })
  },

  toReport() {
    var that = this
    //检查
    wx.request({
      url: addr.Address.CheckStoreIsComplain,
      data: {
        storeid: that.data.storeId,
        openid: app.globalData.userInfo.openId,
        cityid: app.globalData.cityInfoId,
      },
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.Success) {
          wx.navigateTo({ //2019/7/16  举报参数微改
            url: `/pages/detail/shop_report?storeId=${that.data.storeId}&t=0&typeid=''`
          })
        } else {
          app.ShowMsg(res.data.Message)
        }
      }
    })
  },

  toGoodsMgr() {
    wx.navigateTo({
      url: `/pages/goods/goodsReleaseList?storeid=${this.data.storeId}&state=0`
    })
  },

  toStoreMgr() {
    wx.navigateTo({
      url: '/pages/shop/shop_admin?storeid=' + this.data.storeId,
    })
  },
  tostrategydetail() {
    wx.navigateTo({
      url: '/pages/news_center/news_detail?t=1&hid=' + e.currentTarget.dataset.strategeid
    })

  },
  showAllCoupon() {
    this.setData({
      CouponList: this.data.allCouponList
    })
  },
  showAllGroup() {
    this.setData({
      groupList: this.data.allGroupList
    })
  },
  showAllCutList() {
    this.setData({
      CutList: this.data.allCutList
    })
  },
  showAllLoveList() {
    this.setData({
      LoveList: this.data.allLoveList
    })
  },
  showAllCityCardList() {
    this.setData({
      cityCardList: this.data.allCityCardList
    })
  },
  loadData(param) {
    let that = this;
    that.loadRequest(param).then((data) => {
      that.setData({
        mainmodel: data,
        init: true,
        UserPayCount: data.UserPayCount,
        UserCartCount: data.UserCartCount
      }, () => {
        if (data.mainmodel.LimitNum >= 1) {
          that.setData({
            leftLimit: data.mainmodel.LimitNum - that.data.UserCartCount
          })
        }
      })
    }).catch((err) => {
      console.log(err)
    })
  },
  //购物车添加弹层
  showLayer() {
    let that
    this.setData({
      showLayer: 'fadeIn',
      slide: 'slideFromDown'
    })
  },
  hideLayer() {
    this.setData({
      showLayer: 'fadeOut',
      slide: 'slideOutDown'
    }, () => {
      setTimeout(() => {
        this.setData({
          showLayer: ''
        })
      }, 380)
    })
  },
  // 选择完成
  selectDone(e) {
    let that = this;
    var reurl = addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      let {
        type
      } = {
        ...e.currentTarget.dataset
      };
      let {
        goodsNum,
        leftLimit,
        goodsSizeActive,
        mainmodel: {
          CartCount,
          mainmodel: {
            LimitNum,
            Stock,
            Id,
            StoreId,
            GoodsAttrList
          }
        }
      } = {
        ...that.data
      };
      if (!/^[0-9]+$/.test(goodsNum) && goodsNum < 1) {
        that.setData({
          goodsNum: 1
        })
      }
      if (goodsNum > Stock) {
        that.setData({
          goodsNum: Stock,
          content: '库存不足',
          showTips: true
        })
        return
      }
      if (!!GoodsAttrList && GoodsAttrList.length > 0 && goodsSizeActive === '') {
        if (!(/^[0-9]+$/.test(goodsSizeActive) && goodsSizeActive <= GoodsAttrList.length - 1)) {
          that.setData({
            content: '请选择商品的尺寸',
            showTips: true
          })
          return
        };
        if (goodsNum > GoodsAttrList[goodsSizeActive].Stock) {
          that.setData({
            goodsNum: GoodsAttrList[goodsSizeActive].Stock
          })
        }
      }
      if (type === 'addGoodsCar') {
        if (LimitNum > 0 && goodsNum > leftLimit) {
          that.setData({
            content: '购物车已有' + that.data.UserCartCount + '件该商品',
            showTips: true
          })
          return
        }
        that.addSuccess(CartCount += goodsNum)
      } else if (type === 'pay') {
        let url;
        if (GoodsAttrList.length === 0) {
          url = '/pages/goods/goodsOrder?type=1&storeId=' + StoreId + '&goodsId=' + Id + '&buyNum=' + goodsNum || 1;
        } else {
          url = '/pages/goods/goodsOrder?type=1&storeId=' + StoreId + '&goodsId=' + Id + '&buyNum=' + goodsNum + '&attrId=' + GoodsAttrList[goodsSizeActive].Id;
        }
        wx.navigateTo({
          url
        })
      }

    }
  },
  //购物车
  async getMyCart(mainmodel) {
    let that = this;
    let data = await getMyCart({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      pageIndex: 1,
      pageSize: 20
    });
    if (data.Success) {
      let {
        Id,
        StoreId
      } = {
        ...mainmodel
      };
      let goodsCart = data.Data.listgoodscart;
      if (goodsCart.length > 0) {

        let num = goodsNum(goodsCart, StoreId, Id);
        console.log(num)
        that.setData({
          leftLimit: !!num ? num : 0
        })
        console.log(this.data.leftLimit)
      }
    }
  },
  //加入购物车
  async addGoodsCar() {
    let that = this;
    let {
      goodsNum,
      goodsSizeActive,
      mainmodel: {
        mainmodel: {
          Id,
          StoreId,
          GoodsAttrList
        }
      }
    } = {
      ...that.data
    }
    let param = {
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      GoodsId: Id,
      StoreId,
      BuyNum: goodsNum
    }
    if (!!GoodsAttrList && GoodsAttrList.length > 0) {
      param.AttrId = GoodsAttrList[goodsSizeActive].Id
    } else {
      param.AttrId = ''
    }
    let data = await getList({
      addr: 'IBaseData/AddCart',
      data: param
    })
    if (data.Success) {
      return data.Data
    }
  },
  addSuccess(totalNum) {
    let that = this;
    let {
      goodsNum,
      leftLimit,
      mainmodel: {
        mainmodel: {
          LimitNum
        }
      }
    } = {
      ...that.data
    };
    that.addGoodsCar().then((data) => {
      if (!!LimitNum && LimitNum > 0) {
        leftLimit += goodsNum;
      }
      that.setData({
        'mainmodel.CartCount': totalNum,
        'goodsNum': 1,
        'goodsSizeActive': '',
        leftLimit
      }, () => {
        setTimeout(() => {
          that.setData({
            content: '添加成功',
            showTips: true
          })
        }, 140)
        that.hideLayer();
      })
    }).catch(e => {
      console.log(e)
    })
  },
  //选择尺寸
  selectCurrentSize(e) {
    const {
      index
    } = {
      ...e.currentTarget.dataset
    }
    let that = this;
    let {
      goodsSizeActive
    } = {
      ...that.data
    }
    let {
      GoodsAttrList
    } = {
      ...that.data.mainmodel.mainmodel
    }
    if (GoodsAttrList[index].Stock > 0) {
      this.setData({
        goodsSizeActive: index
      })
    }
  },
  //数量+1
  addGoods() {
    let that = this;
    let {
      goodsNum,
      goodsSizeActive,
      mainmodel: {
        mainmodel: {
          GoodsAttrList,
          LimitNum
        }
      }
    } = {
      ...that.data
    };
    if (Object.is(goodsNum, undefined)) goodsNum = 1;
    ++goodsNum;
    if (!!GoodsAttrList && GoodsAttrList.length > 0) {
      if (goodsSizeActive === '') {
        that.setData({
          content: '请选择购买商品的规格',
          showTips: true
        })
        return
      }
      if (goodsNum > GoodsAttrList[goodsSizeActive].Stock) {
        that.setData({
          content: `库存不足`,
          showTips: true
        })
        return;
      }
    }
    console.log(LimitNum, goodsNum)
    if (!!LimitNum) {
      if (goodsNum > LimitNum) {
        that.setData({
          content: `超过购买限制件数`,
          showTips: true
        })
        return;
      }
    }
    that.setData({
      goodsNum
    })
  },
  //数量-1
  minusGoods() {
    let that = this;
    let {
      goodsNum
    } = {
      ...that.data
    };
    if (goodsNum === undefined) return;
    if (goodsNum === 1) return;
    --goodsNum;
    that.setData({
      goodsNum
    })
  },
  //数量输入
  fillGoods(e) {
    const val = e.detail.value.trim();
    let that = this;
    let {
      goodsSizeActive,
      mainmodel: {
        mainmodel: {
          GoodsAttrList
        }
      }
    } = {
      ...that.data
    };
    if (!!GoodsAttrList && GoodsAttrList.length > 0) {
      if (goodsSizeActive === '') {
        that.setData({
          content: '请选择购买商品的规格',
          showTips: true
        })
        return
      }
    }
    this.setData({
      goodsNum: val
    })
  },
  //输入完成检测
  testGoods(e) {
    let that = this;
    let {
      goodsNum,
      goodsSizeActive,
      mainmodel: {
        LimitNum,
        Stock,
        mainmodel: {
          GoodsAttrList
        }
      }
    } = {
      ...that.data
    };
    if (goodsNum[0] == '0') {
      that.setData({
        goodsNum: 1,
        content: '请填写正确的购买数量',
        showTips: true
      })
      return
    }
    if (!!LimitNum) {
      if (goodsNum > LimitNum) {
        that.setData({
          goodsNum: LimitNum
        })
      }
    }
    if (!!GoodsAttrList && GoodsAttrList.length > 0) {
      if (goodsNum > GoodsAttrList[goodsSizeActive].Stock) {
        that.setData({
          content: '库存不足',
          showTips: true
        })
        return
      }
    } else {
      if (goodsNum > Stock) {
        that.setData({
          goodsNum: 1,
          content: '库存不足',
          showTips: true
        })
      }
    }
  },

  async loadRequest(param) {
    let data = await getList({
      addr: '/IBaseData/GetGoodDetail',
      data: param
    })

    if (data.Success) {
      return data.Data
    }
  },

  toGoodCar() {
    wx.navigateTo({
      url: '/pages/goods/goods_car/goods_car'
    })
  },

  async GetStoreCityMemberVoucherRecommend() {
    let resp = await GetStoreCityMemberVoucherRecommend({
      openid: app.globalData.userInfo.openId,
      cityid: app.globalData.cityInfoId,
      storeid: this.data.storeId
    })

    let exp = 60 * 60 * 24 * 1000
    if (wx.getStorageSync(this.data.storeId)) {
      if ((new Date().getTime() - wx.getStorageSync(this.data.storeId).timer) < exp) {
        return
      }
    }

    if (resp.Success) {
      this.setData({
        CityMemberVoucher: resp.Data.Model
      })
      wx.setStorageSync(this.data.storeId, {
        timer: new Date().getTime()
      })
    }
  },

  closeCouponLayer() {
    this.setData({
      CityMemberVoucher: null
    })
  },

  async drawVoucher(e) {
    let data = await drawVoucher({
      openId: app.globalData.userInfo.openId,
      cityInfoId: app.globalData.cityInfoId,
      vid: e.currentTarget.dataset.vid
    })

    if (data.data) {
      this.setData({
        showTips: true,
        content: '领取成功',
        CityMemberVoucher: null
      })
      if (e.currentTarget.dataset.layer) {
        this.setData({
          CityMemberVoucher: null
        })
      } else {
        this.gsvlist()
      }
    } else {
      this.setData({
        showTips: true,
        content: data.msg
      })
    }
  },

  async gsvlist() {
    let resp = await gsvlist({
      openid: app.globalData.userInfo.openId,
      cityid: app.globalData.cityInfoId,
      storeId: this.data.storeId,
      pageIndex: 1,
    })
    this.setData({
      miniCouponList: resp.Data.list
    })
  },

  showCouponList() {
    this.setData({
      isShowCouponBot: !this.data.isShowCouponBot
    })
  },

  toCouponDetail(e) {
    wx.navigateTo({
      url: '/pages/cityCard/memberCouponDetail?vid=' + e.currentTarget.dataset.vid,
    })
  },
})