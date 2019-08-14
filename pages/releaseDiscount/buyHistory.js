const host = require("../../utils/addr.js").HOST;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
const app = getApp();
let pageIndex = 1;
let params = {
  openid: '',
  pageIndex,
  scid: 0
}
let mainparams = {
  openid: '',
  cityid:0,
  scid: 0
}
let getBuyHistoryMain = (mainparams) => httpClient(
  { host, addr: 'IBaseData/StoreCouponBuyRecordMain', data: mainparams }
);

let getBuyHistory = (params) => httpClient(
   { host, addr: 'IBaseData/GetCouponBuyRecord', data: params }
);

Page({
  data: {
    historyList: [],
    isAll:false,
    creatnum:0,
    sellnum:0,
    usecount:0,
    totalincome:0,
    totalamount:0,
    payrate:0
  },
  onLoad: function (options) {
    let { scid } = options;
    
    app.getUserInfo(() => {
      params.pageIndex = 1
      params.openid = app.globalData.userInfo.openId;
      params.scid = scid;
      mainparams.openid = app.globalData.userInfo.openId;
      mainparams.cityid = app.globalData.cityInfoId;
      mainparams.scid = scid;
      this.getBuyHistoryMain(mainparams);
      this.getBuyHistory(params);
    })
  },

  async getBuyHistory() {
    let resp = await getBuyHistory(params);
    if(!resp.Data.couponbuylist.length) {
      this.setData({
        isAll: true
      })
    } else {
      this.setData({
        historyList: [...this.data.historyList, ...resp.Data.couponbuylist]
      }) 
      // for (let item of resp.Data.couponbuylist) {
      //   _resp.push(item);
      // }
    }
    // let _resp = [];
  

  
  },
  async getBuyHistoryMain() {
    var that=this
    let resp = await getBuyHistoryMain(mainparams);
    if (resp.Success) {
      var mainmodel = resp.Data.mainmodel
      that.setData({
        creatnum: mainmodel.creatnum,
        sellnum: mainmodel.sellnum,
        usecount: mainmodel.usecount,
        totalincome: mainmodel.totalincome,
        totalamount: mainmodel.totalamount,
        payrate: mainmodel.payrate
        })
    }
    else{
      app.ShowMsg(resp.Message)
    }
  },
  onReachBottom: function () {
    params.pageIndex = ++pageIndex;
    this.getBuyHistory(params);
  },
  callpeple: function (e) {
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
  gotobill()
  {
    wx.navigateTo({
      url: 'pages/bill/bill',
    })
  }
})