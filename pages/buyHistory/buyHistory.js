const host = require("../../utils/addr.js").HOST;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime.js');
const app = getApp();

let pageIndex = 1;
let params = {
  openid: '',
  pageIndex,
  scid: 0
}

let getBuyHistory = (params) => httpClient(
  { host, addr: 'IBaseData/GetCouponBuyRecord', data: params }
);

Page({

  data: {
    historyList: [],
    isAll: false
  },

  onLoad: function (options) {
    let { scid } = options;
    app.getUserInfo(() => {
      params.openid = app.globalData.userInfo.openId;
      params.scid = scid;
      this.getBuyHistory(params);
    })
  },

  async getBuyHistory() {
    let resp = await getBuyHistory(params);
    if (!resp.Data.couponbuylist.length) {
      this.setData({
        isAll: true
      })
    }
    let _resp = [];
    for (let item of resp.Data.couponbuylist) {
      _resp.push(item);
    }

    this.setData({
      historyList: _resp
    })
  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {
    params.pageIndex = ++pageIndex;
    this.getBuyHistory(params);
  },


})