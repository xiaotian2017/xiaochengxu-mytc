var addr = require("../../utils/addr.js");
var _host = addr.HOST;
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
const app = getApp();
// 获取轮播图数据
let get114Banner = (bannerParmas) => httpClient({ host: _host, addr: 'IBaseData/GetBannerAjax', data: bannerParmas });
let getPayConfig = (cityid) => httpClient({ host: _host, addr: 'IBaseData/GetPayConfig', data: { cityid, paytype: 409 } });

// 新114
let getCompanyTopLine = (cityid) => httpClient({ host: _host, addr: 'IBaseData/GetCompanyTopLine', data: { cityid } });
let getAllCompanyTypeList = (cityid) => httpClient({ host: _host, addr: 'IBaseData/GetAllCompanyTypeList', data: { cityid } });

// 获取列表数据
let getIndexList = ({
  pageIndex,
  cityid,
  type,
  isall,
  order,
  name,
  areaid
}
) => httpClient({
  host: _host,
  addr: 'IBaseData/GetIndexList',
  data: { pageIndex, cityid, type, name, isall, order, areaid }
});
let cityid;
let areaCode;
let cityCode;
let pageIndex;
let _indexList; // 右侧列表数据
let isLimitLoadMoer; // 限制更多
let _payList;
Page({
  data: {
    showpath: false,
    payList: [],
    openid: '',
    payIdx: 0,
    ruzhuId: '',
    isShowPay: false,
    bannerUrls: [], // 轮播数据
    indexList: [], // 右侧列表数据

    // 右侧区域数据参数 有时间写到外面去
    paramsOfindexList: {
      pageIndex: 0,
      cityid: 0,
      type: 0,
      isall: 0,
      order: 0,
      name: '',
      areaid: 0
    },
    // 用于做添加动态类名
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    qrUrl: '',
    isShowQr: false,
    sValue: '',
    // 新的114
    tabIdx: 1,
    companyCategory: [],
    companyList: [],
    allCompanyCategory: [],
    newAllCompanyCategory: [],
    customName: '',
    isIos: false
  },
  onLoad(options) {
    var that = this;
    app.getUserInfo(() => {
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true
        })
      }
      pageIndex = 1;
      _indexList = []; // 右侧列表数据
      isLimitLoadMoer = false; // 限制更多
      that.setData({
        openid: app.globalData.userInfo.openId,
        'paramsOfindexList.cityid': app.globalData.cityInfoId,
        'paramsOfindexList.pageIndex': 1,
        customName: app.globalData.CCityConfig.TN,
        isIos: app.globalData.isIos
      })
      wx.setNavigationBarTitle({
        title: that.data.customName
      })
      cityid = app.globalData.cityInfoId;
      areaCode = app.globalData.areaCode;
      cityCode = app.globalData.citycode;
      setTimeout(() => {
        that.getPayConfig()
      }, 500)
      that.get114Banner(cityid);
      that.getIndexList(that.data.paramsOfindexList);
      that.getAllCompanyTypeList(cityid)
      that.getCompanyTopLine(cityid)
    },1)
  },

  // 获取行业
  async getAllCompanyTypeList(cityid) {
    let resp = await getAllCompanyTypeList(cityid)
    let _allCompanyCategory = resp.Data.AllCompanyCategory
    let newAllCompanyCategory = []
    for (let item of _allCompanyCategory) {
      if (item.SecondCompanyCategoryList.length < 5) {
        newAllCompanyCategory.push({ name: item.Name, id: item.Id, showMore: false, secondCompanyCategoryList: item.SecondCompanyCategoryList })
      } else {
        newAllCompanyCategory.push({ name: item.Name, id: item.Id, showMore: true, secondCompanyCategoryList: item.SecondCompanyCategoryList.slice(0, 4) })
      }
    }
    this.setData({
      allCompanyCategory: resp.Data.AllCompanyCategory,
      newAllCompanyCategory: newAllCompanyCategory
    })
  },
  showMore(e) {
    let idx = e.currentTarget.dataset.idx    
    let _newAllCompanyCategory = this.data.newAllCompanyCategory    
    if (_newAllCompanyCategory[idx].secondCompanyCategoryList.length < 5) {
      _newAllCompanyCategory[idx].secondCompanyCategoryList = this.data.allCompanyCategory[idx].SecondCompanyCategoryList
    } else {
      _newAllCompanyCategory[idx].secondCompanyCategoryList = this.data.allCompanyCategory[idx].SecondCompanyCategoryList.slice(0, 4)
    }
    this.setData({
      newAllCompanyCategory: _newAllCompanyCategory,
    })
  },
  async getCompanyTopLine(cityid) {
    let resp = await getCompanyTopLine(cityid)
    let companyCategoryArr = []
    let companyListArr = []
    let num = resp.Data.CompanyCategory.length / 5
    let _num = resp.Data.CompanyList.length / 2
    for (let i = 0; i < Math.ceil(num); i++) {

      companyCategoryArr.push(resp.Data.CompanyCategory.slice(i * 5, i * 5 + 5))
    }

    for (let i = 0; i < Math.ceil(_num); i++) {
      companyListArr.push(resp.Data.CompanyList.slice(i * 2, i * 2 + 2))
    }
    this.setData({
      companyCategory: companyCategoryArr,
      companyList: companyListArr
    })
  },
  onShareAppMessage: function (res) {
    var that = this
    var path = addr.getCurrentPageUrlWithArgs()
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    return {
      title: "114首页",
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  async getPayConfig() {
    let resp = await getPayConfig(cityid);
    let _resp = [];
    _payList = resp.Data.listpayconfig; // 保存未原始数据

    for (let item of resp.Data.listpayconfig) {
      _resp.push(item.Price * 1000 / 100000 + '元/' + item.ShowNote)
    }

    this.setData({
      payList: _resp
    })
  },

  // 获取轮播数据
  async get114Banner(cityid) {
    let bannerUrls = (await get114Banner({
      cityid,
      typeid: 111,
      defaulturl: 'https://j.vzan.cc/content/city/city114/images/tc-yh-76.jpg'
    })).Data.bannerlist;

    this.setData({
      bannerUrls
    })
  },


  toIndex() {
    app.gotohomepage()
  },

  toRuZhu() {
    vzNavigateTo({
      url: '/pages/city114/city114ruzhu',
      query: {
        ruzhuId: 0
      }
    })
  },

  toMine() {
    vzNavigateTo({
      url: '/pages/city114/city114Mine',
      query: {
        ruZhuType: 1
      }
    })

  },

  // 获取右侧列表数据
  async getIndexList(_paramsOfindexList) {
    wx.showLoading({
      title: '加载中...'
    })
    let resp = await getIndexList(_paramsOfindexList);
    wx.hideLoading();

    this.setData({
      indexList: [...this.data.indexList, ...resp.Data.listcompany]
    })
  },

  // 导航去详情页
  toDetail(e) {
    let { cpid, detaildata } = e.currentTarget.dataset;
    detaildata.storeInfo = null
    detaildata.Introduce = null
    vzNavigateTo({
      url: '/pages/city114/city114Detail',
      query: {
        cpid,
        detaildata: JSON.stringify(detaildata)
      }
    })
  },
  // 置顶
  buyIt() {
    this.setData({
      isShowPay: false
    })
    let refun = (param, state) => {
      if (state == 0) {
        wx.showToast({
          title: '您已取消付款!',
          icon: 'faile',
          duration: 1000
        })
        return;
      }
      else if (state == 1) {
        wx.showToast({
          title: '支付成功!',
          icon: 'success',
          duration: 1000
        })
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/city114/city114'
          })
        }, 1000)
      }
    }
    let param = {
      itemid: this.data.ruzhuId,
      paytype: 409,
      extype: _payList[this.data.payIdx].ExtendType,
      extime: 1,
      quantity: 1,
      openId: app.globalData.userInfo.openId,
      remark: _payList[this.data.payIdx].Remark,
      areacode: app.globalData.areaCode,
    }

    util.AddOrder(param, refun)
  },
  payChange(e) {
    this.setData({
      payIdx: e.detail.value
    })
  },
  toTop(e) {
    this.setData({
      isShowPay: true,
      ruzhuId: e.target.dataset.id
    })
  },
  closeBtn() {
    this.setData({
      isShowPay: false
    })
  },
  // 打开二维码 
  openQr(e) {
    this.setData({
      isShowQr: true,
      qrUrl: e.target.dataset.qr
    })
  },

  // 关闭二维码 
  closeQr() {
    this.setData({
      isShowQr: false
    });
  },

  makePhone(e) {
    let telnum = e.currentTarget.dataset.telnum;
    let telNum2 = e.currentTarget.dataset.telnum2;

    let list = []
    if (telnum) {
      list.push(telnum)
    }

    if (telNum2) {
      list.push(telNum2)
    }
  

    wx.showActionSheet({
      itemList: list,
      success(res) {
        try {
          wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.makePhoneCall({
          phoneNumber: list[res.tapIndex]
        })
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })

  },

  onPageScroll(e) {
    if (e.scrollTop >= this.data.topDistance) {
      this.setData({
        isScrollView: true,
        isTopTabFixed: true
      })
    } else {
      this.setData({
        isScrollView: false,
        isTopTabFixed: false
      })
    }
  },

  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },

  // 新114
  getHotOrNew(e) {
    if (e.currentTarget.dataset.idx == this.data.tabIdx) { return }
    _indexList = [];
    this.setData({
      indexList: [],
      'paramsOfindexList.order': e.currentTarget.dataset.idx == 2 ? 1 : 0,
      'paramsOfindexList.pageIndex': 1
    });

    this.getIndexList(this.data.paramsOfindexList);
    this.setData({
      tabIdx: e.currentTarget.dataset.idx
    })
  },
  onReachBottom() {
    this.setData({
      'paramsOfindexList.pageIndex': ++this.data.paramsOfindexList.pageIndex,
    });

    this.getIndexList(this.data.paramsOfindexList);
  },
  getCat() {
    this.setData({
      tabIdx: 0
    })
  },
  toStore(e) {
    vzNavigateTo({
      url: '/pages/business_detail/business_detail',
      query: {
        storeid: e.currentTarget.dataset.sid
      }
    })
  },
  to114List(e) {
    console.log(e)
    vzNavigateTo({
      url: '/pages/city114/city114Search',
      query: {
        catid: e.currentTarget.dataset.catid,
        maincatidx: e.currentTarget.dataset.maincatidx,
        subid: e.currentTarget.dataset.subid
      }
    })
  }
})