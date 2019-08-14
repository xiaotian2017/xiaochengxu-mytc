let {
  httpClient
} = require("../../../utils/util.js");
let addr = require("../../../utils/addr.js");
let util = require("../../../utils/util.js");
let {
  HOST
} = require("../../../utils/addr");
let host = HOST;
const regeneratorRuntime = require('../../../utils/runtime');
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
let checkStore = (p) => util.httpClient({
  addr: addr.Address.checkStoreStatus,
  data: p
});
//获取商铺Id
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
  return getGoodsNum(getGoods(function () {
    return getStore(arr, storeId)
  }, Id))
}

let app = getApp();

Page({
  data: {
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
    UserCartCount: 0,
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
      isfx: 0
    }
  },
  onLoad(options) {
    let that = this
    var gid = options.gid //商品id  2019/6/29添加注释
    this.storeid = options.sid
    var r = !!options.r ? options.r : 0
    //从海报进来
    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        gid = addr.getsceneparam("gid", scene)
        if (0 == r)
          r = addr.getsceneparam("r", scene)
      }
    }

    app.getUserInfo((userInfo) => {
      that.checkStore()
      let param = {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        gid: gid,
        r: r,
      }
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true
        })
      }
      that.setData({
        param

      })
      that.loadData(param)
      //海报
    })
  },

  onHide() {
    this.setData({
      navigatorShow: false,
      showLayer: '',
      slide: ''
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
  onShow: function () {
    this.poster = this.selectComponent("#poster");
  },
  //转发
  onShareAppMessage: function () {
    let that = this;
    var path = addr.getCurrentPageUrlWithArgs();
    let {
      isfx,
      fxitemid
    } = {
      ...that.data.shareposterparams
    }
    let title = that.data.GoodsName
    if (1 == isfx) {
      path += '&r=100' + app.globalData.userInfo.Id
    }
    try {
      wx.setStorageSync('needloadcustpage', false)
      if (1 == isfx) {
        util.BindFxOrigin({
          cityid: app.globalData.cityInfoId,
          openid: app.globalData.userInfo.openId,
          storeid: that.data.mainmodel.mainmodel.Store.Id,
          fxitemid: fxitemid,
          fxtype: 1
        });
      }
    } catch (e) {
      console.log(e)
    }
    return {
      title,
      path: path,
      success(res) {
        // 红包分享成功
        if (that.data.rid) {
          that.setData({
            isShareSuccess: true
          })
        }

      }
    }
  },
  // 红包获取分享参数
  getDeliverParams(e) {
    this.setData({
      rid: e.detail.rid
    })
  },
  //初始化请求
  async loadRequest(param) {
    let data = await getList({
      addr: 'IBaseData/GetGoodDetail',
      data: param
    })
    if (data.Success) {
      return data.Data
    }
  },
  loadData(param) {
    let that = this;
    that.loadRequest(param).then((data) => {
      var formater = "yyyy-MM-dd hh:mm";

      let canvasShowMember = data.OpenMemberPrice && data.mainmodel.MemberPrice > 0 ? true : false //2019/7/2
      var temp = {
        introduceimg: data.mainmodel.ImgUrl,
        title: data.mainmodel.GoodsName,
        originalprice: data.mainmodel.OriginalPrice,
        floorprice: data.mainmodel.Price,
        memberPrice: data.mainmodel.MemberPrice,
        remainnum: data.mainmodel.Stock,
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        isfx: data.mainmodel.IsFx,
        loginuserid: app.globalData.userInfo.Id,
        fxitemtype: 1,
        fxitemid: data.mainmodel.Id,
        storeid: data.mainmodel.StoreId,
        fxearns: data.mainmodel.ExpectEarns,
        canvasShowMember: canvasShowMember
      }
      that.setData({
        mainmodel: data,
        init: true,
        UserPayCount: data.UserPayCount,
        UserCartCount: data.UserCartCount,
        shareposterparams: temp

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
  //下拉刷新页面
  onPullDownRefresh: function () {
    let that = this;
    let {
      param
    } = {
      ...that.data
    }
    that.loadData(param)
    wx.stopPullDownRefresh()
  },
  //去店铺详情页
  goToStore(e) {
    const {
      storeid
    } = {
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/business_detail/business_detail?storeid=' + storeid
    })
  },
  //开通同城卡
  goToOpenCityCard(e) {
    const {
      hctid
    } = {
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/cityCard/cityCardPurchase?curCityCardId=' + hctid + '&type=goods'
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
  // async getMyCart(mainmodel) {
  //     let that = this;
  //     let data = await getMyCart({
  //         cityid: app.globalData.cityInfoId,
  //         openid: app.globalData.userInfo.openId,
  //         pageIndex: 1,
  //         pageSize: 20
  //     });
  //     if(data.Success){
  //         let {Id,StoreId} = {...mainmodel};
  //         let goodsCart = data.Data.listgoodscart;
  //         console.log(goodsCart)
  //         if(goodsCart.length > 0){
  //             let num = goodsNum(goodsCart,StoreId,Id);             
  //             that.setData({
  //                 leftLimit:!!num?num:0
  //             })                   
  //         }
  //     }
  // },
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
  //客服二维码
  openMask() {
    let that = this;
    let {
      TelePhone,
      Qrcode_Url
    } = {
      ...that.data.mainmodel.mainmodel.Store
    };
    let contactInfo = {
      phone: TelePhone,
      qrcode: Qrcode_Url,
      tip: '截图扫码，微信访问'
    }
    that.setData({
      contactInfo,
      openMask: true,
      hideMask: true
    })
  },

  //去我的购物车
  goToMyCar() {
    wx.navigateTo({
      url: '/pages/goods/goods_car/goods_car'
    })
  },
  //加入购物车
  addToGoodsCar() {
    let that = this;
    that.showLayer();
    that.setData({
      layerType: 'addGoodsCar'
    })
  },
  //立即购买
  goToPay() {
    let that = this;
    if (that.data.mainmodel.mainmodel.LimitNum > 0 && that.data.UserPayCount == that.data.mainmodel.mainmodel.LimitNum) {
      app.ShowMsg("每人限购" + that.data.mainmodel.mainmodel.LimitNum + "份，你已购买" + that.data.UserPayCount + "份")
      return

    }

    that.showLayer();
    that.setData({
      layerType: 'pay'
    })
  },
  //我的订单
  goToMyOrder() {
    wx.navigateTo({
      url: '/pages/cutlist/cutlist?type=goods&state=1'
    })
  },
  //更多商品
  moreGoods() {
    wx.redirectTo({
      url: '/pages/goods/goods_list/goods_list'
    })
  },
  showNavigator() {
    let navigatorShow = this.data.navigatorShow;
    this.setData({
      navigatorShow: !navigatorShow
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
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