const host = require("../../utils/addr.js").HOST;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
const app = getApp();
let pageIndex = 1;
let params = {
  openid: '',
  pageIndex:1,
  lid: 0,
  state:-99
}
let mainparams = {
  openid: '',
  cityid:0,
  lid: 0
}
let getBuyHistoryMain = (mainparams) => httpClient(
  { host, addr: 'IBaseData/LoveParticipantRecordMain', data: mainparams }
);

let getBuyHistory = (params) => httpClient(
  { host, addr: 'IBaseData/GetLoveParticipant', data: params }
);


Page({
  data: {
    currentype:-99,
    historyList: [],
    isAll:false,
    creatnum:0,
    sellnum:0,
    usecount:0,
    totalincome:0,
    totalamount:0,
    payrate:0,
    nopaycount:0,
    outdatecount: 0,
    paycount: 0,
    totalcount: 0,
    usecount: 0,
  },
  onLoad: function (options) {
    let { loveid } = options;
  
    app.getUserInfo(() => {
      params.openid = app.globalData.userInfo.openId;
      params.lid = loveid;
      mainparams.openid = app.globalData.userInfo.openId;
      mainparams.cityid = app.globalData.cityInfoId;
      mainparams.lid = loveid;
      this.getBuyHistoryMain(mainparams);
      this.getBuyHistory(params);
    })
  },

  async getBuyHistory() {
    let resp = await getBuyHistory(params);
    if (!resp.Data.loveparticipantlist.length) {
      this.setData({
        isAll: true
      })
    }
    let _resp = [];
    for (let item of resp.Data.loveparticipantlist) {
      _resp.push(item);
    }

    this.setData({
      historyList: _resp
    })
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
        payrate: mainmodel.payrate,
        nopaycount: mainmodel.nopaycount,
        outdatecount: mainmodel.outdatecount,
        paycount: mainmodel.paycount,
        totalcount: mainmodel.totalcount,
        usecount: mainmodel.usecount,
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
      url: '../bill/bill',
    })
  },
  typetabswitch: function (e) {
    var that=this
    var typeid = e.currentTarget.dataset.type
    that.setData({ currentype: typeid, historyList: [], isAll: false})
    params.pageIndex = 1
    params.state = typeid
    that.getBuyHistory(params)
  }
})