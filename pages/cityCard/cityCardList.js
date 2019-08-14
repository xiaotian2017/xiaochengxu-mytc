const l = console.log;
var util = require("../../utils/util.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();

// 获取同城卡店铺优惠服务列表
const getHalfServices = (halfServicesParmas) => httpClient({ addr: addr.Address.getHalfServices, data: halfServicesParmas });
// 获取区域
const getArea = ({ cityid, panyId }) => httpClient({ addr: addr.Address.getArea, data: { cityid, panyId } });
// 获取同城卡列表
const getHalfCardList = ({ cityid, openid }) => httpClient({ addr: addr.Address.getHalfCardList, data: { cityid, openid } });
// 是否开通同城卡
const getMyHalfCardMain = ({ cityid, openid, typeid }) => httpClient({ addr: addr.Address.getMyHalfCardMain, data: { cityid, openid, typeid } });
// 兑换码开卡
const useCodeGetHalfCard = (params) => httpClient({ addr: addr.Address.useCodeGetHalfCard, data: params });
// 城主是否设置了购买项
const getHalfCardBuyMain = (params) => httpClient({ addr: addr.Address.halfCardBuyMain, data: params });
let tempHalfServiceList;
const getDateStr = (addDayCount) => {
  let dd = new Date();
  dd.setDate(dd.getDate() + addDayCount);
  let y = dd.getFullYear();
  let m = dd.getMonth() + 1;
  let d = dd.getDate();
  return d;
}

const getWeekStr = (addDayCount) => {
  let dd = new Date();
  dd.setDate(dd.getDate() + addDayCount);
  let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
  let w = show_day[dd.getDay()];
  return w;
}

const dateList = (day) => {
  let dateArr = [{
    dateStr: getDateStr(0),
    dayStr: '今天'
  }];
  for (let i = 1; i < day; i++) {
    dateArr.push({
      dateStr: getDateStr(i),
      dayStr: getWeekStr(i)
    })
  }
  return dateArr;
}

Page({
  data: {
    showpath: false,
    dateArr: [], // 日期数组
    currentNav: 3,
    isDateActiveIdx: 'all', // 
    areaArray: [], // 区域数组
    areaArrayIndex: 0,
    areaCode: 0,
    cardArray: [], // 同城卡列表    
    isShowExchange: true,
    cardArrayIdx: 0,
    curCityCard: null, // 当前同城卡
    isOpenCityCard: false,
    isLoadAll: false,
    isCanBuyCityCard: false, // 城主是否设置了同城卡购买项
    nickName: '',
    halfServiceParams: {
      openid: '',
      cityid: '',
      typeid: '',
      areacode: '',
      date: '',
      pageindex: 1
    },
    halfServiceList: [], // 店铺优惠列表
    arrayNav: [
      { title: '抢优惠', flag: 'coupon' },
      { title: '减价', flag: 'cut' },
      { title: '集爱心', flag: 'love' },
      { title: '同城卡', flag: 'cityCard' }
    ],
    validCode: '',
    curMonth: (new Date()).getMonth()+1
  },

  onLoad(options) {
    tempHalfServiceList = [];
    this.setData({
      dateArr: dateList(30)
    });
    var typeid = options.typeid
    app.getUserInfo(() => {
      if (app.globalData.userInfo.iscityowner > 0) {
        this.setData({
          showpath: true
        })
      }
      this.setData({
        'halfServiceParams.openid': app.globalData.userInfo.openId,
        'halfServiceParams.cityid': app.globalData.cityInfoId,
        'halfServiceParams.typeid':typeid ,
        'halfServiceParams.areacode': app.globalData.areaCode, // 区域改变
        'halfServiceParams.date': 0,  // 日期改变
        nickName: app.globalData.userInfo.nickName
      })

      this.getArea();
      this.getHalfServices();
      this.getHalfCardList(options.typeid);
      this.getMyHalfCardMain(options.typeid);
      this.getHalfCardBuyMain(options.typeid);
    })

  },

  onReachBottom() {
    this.setData({
      'halfServiceParams.pageindex': ++this.data.halfServiceParams.pageindex
    })

    this.getHalfServices();
  },
  // 获取同城卡购买项目 
  async getHalfCardBuyMain(typeid) {
    let resp = await getHalfCardBuyMain({
      cityid: app.globalData.cityInfoId,
      typeId: typeid
    });

    if (resp.Data.mainmodel.HalfCCs.length) {
      this.setData({
        isCanBuyCityCard: true
      })
    } else {
      this.setData({
        isCanBuyCityCard: false
      })
    }
  },

  // 获取店铺优惠服务列表
  async getHalfServices() {
    if (this.data.isLoadAll) return;
    wx.showNavigationBarLoading(); // 可以放httpClient的
    let resp = await getHalfServices(this.data.halfServiceParams);
    wx.stopPullDownRefresh();
    if (!resp.Data.listhalfservices.ChalfServiceList.length) {
      this.setData({
        isLoadAll: true
      })
    }
    tempHalfServiceList = [...tempHalfServiceList, ...resp.Data.listhalfservices.ChalfServiceList];
    wx.hideNavigationBarLoading();

    this.setData({
      halfServiceList: tempHalfServiceList
    })
  },
  // 是否开通同城卡
  async getMyHalfCardMain(typeid) {
    let resp = await getMyHalfCardMain({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      typeid: typeid
    })
    // mainmodel 为null 未开通
    this.setData({
      isOpenCityCard: resp.Data.mainmodel && resp.Data.mainmodel.EndDateStr || false,
    })
    l(resp);
  },
  // 获取同城卡列表
  async getHalfCardList(typeid) {
    let resp = await getHalfCardList({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId
    });

    let lgh = resp.Data.listhalfcard.length;
    for (let i = 0; i < lgh; i++) {
      if (resp.Data.listhalfcard[i].Id == typeid) {
        this.setData({
          cardArrayIdx: i
        })
        break;
      }
    }

    this.setData({
      cardArray: resp.Data.listhalfcard,
      curCityCard: resp.Data.listhalfcard[this.data.cardArrayIdx]
    })
  },
  // 获取区域
  async getArea() {
    let resp = await getArea({
      cityid: app.globalData.cityInfoId,
      panyId: 0
    });

    let AreaJsonObj = JSON.parse(resp.Data.list.AreaJsonStr);
    AreaJsonObj.unshift({
      Name: '全部区域',
      Code: app.globalData.areaCode
    })

    this.setData({
      areaArray: AreaJsonObj
    })
  },

  // 导航切换
  click_nav(e) {
    let idx = e.currentTarget.dataset.idx
    wx.redirectTo({
      url: '/pages/activity/activity?type=' + this.data.arrayNav[idx].flag
    })
  },
  // 获取选择日期
  getDate(e) {
    let { idx, date, day } = e.target.dataset;
    let dataStr;
    if (day == '今天') {
      dataStr = date + '|' + getWeekStr(0);
    } else if (idx == 'all') {
      dataStr = 0;
    } else {
      dataStr = date + '|' + day
    }
    this.setData({
      isDateActiveIdx: idx,
      'halfServiceParams.date': dataStr,
      'halfServiceParams.pageindex': 1,
      halfServiceList: [],
      isLoadAll: false
    })
    tempHalfServiceList = [];
    this.getHalfServices();
  },
  // 选中区域改变
  bindPickerAreaChange(e) {
    this.setData({
      'halfServiceParams.areacode': this.data.areaArray[e.detail.value].Code,
      areaArrayIndex: e.detail.value,
      'halfServiceParams.pageindex': 1,
      halfServiceList: [],
      isLoadAll: false
    });
    tempHalfServiceList = [];
    this.getHalfServices();
  },
  // 选中同城卡改变
  bindPickerCardChange(e) {
    this.setData({
      cardArrayIdx: e.detail.value,
      'halfServiceParams.typeid': this.data.cardArray[e.detail.value].Id,  // 卡类型改变
      'halfServiceParams.pageindex': 1,
      halfServiceList: [],
      isLoadAll: false,
      curCityCard: this.data.cardArray[e.detail.value]
    })
    this.getMyHalfCardMain(this.data.cardArray[e.detail.value].Id);
    tempHalfServiceList = [];
    this.getHalfServices();
    this.getHalfCardBuyMain(this.data.cardArray[e.detail.value].Id);
    l(this.data.isCanBuyCityCard);
  },
  // 兑换码开卡 
  buyByExchangeCode() {
    this.setData({
      isShowExchange: false
    })
  },
  // 关闭兑换码开卡弹层
  closeExchangeCodeLayer() {
    this.setData({
      isShowExchange: true
    })
  },
  getValidCode(e) {
    this.setData({
      validCode: e.detail.value.trim()
    })

  },
  onPullDownRefresh() {
    tempHalfServiceList = [];
    this.setData({
      halfServiceList: [],
      isLoadAll: false,
      'halfServiceParams.pageindex': 1,
    })
    this.getHalfServices();
  },
  onShareAppMessage() {
    var path = addr.getCurrentPageUrlWithArgs()
    console.log(path);
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
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
  // 验证开卡
  async validExchangeCode() {

    if (!this.data.validCode) {
      wx.showModal({
        title: '提示',
        content: '亲，兑换码不能为空！！',
        showCancel: false
      })
      return;
    }
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      let resp = await useCodeGetHalfCard({
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        typeid: this.data.halfServiceParams.typeid,
        code: this.data.validCode
      })

      this.setData({
        validCode: ''
      })

      if (!resp.code) {
        wx.showModal({
          title: '提示',
          content: resp.msg,
          showCancel: false
        })
        return;
      }

      wx.showToast({
        title: resp.Message
      })

      setTimeout(() => {
        this.setData({
          isShowExchange: true
        });
        this.getMyHalfCardMain(this.data.halfServiceParams.typeid);
      }, 1000)
    }

  

  },
  // 转到购买页
  toPurchasePage(e) {
    let { typeid } = e.currentTarget.dataset;
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      vzNavigateTo({
        url: '/pages/cityCard/cityCardPurchase',
        query: {
          curCityCardId: typeid
        }
      })
    }
 
  },
  toCityCardService(e) {

    let { hid, typeid, gid } = e.currentTarget.dataset;
    if (gid>0)
    {
      vzNavigateTo({
        url: '/pages/goods/goods_detail/goods_detail',
        query: {
          gid,
         
        }
      })

    }
    else{
      vzNavigateTo({
        url: '/pages/cityCard/cityCardService',
        query: {
          hid,
          typeid
        }
      })

    }

  },
  toIndex() {
    app.gotohomepage()
  },

  toCutlist() {
    vzNavigateTo({
      url: '/pages/cutlist/cutlist',
      query: {
        type: 'coupon'
      }
    })
  },

  toMine() {
    wx.redirectTo({
      url: '/pages/person_center/person_center'
    })

  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  }
})



