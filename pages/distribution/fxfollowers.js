var util = require("../../utils/util.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
const GetFxFollowersMain = (fxparam) => httpClient({ addr: addr.Address.GetFxFollowersMain, data: fxparam });
const GetFxFollowers = (fxcashparam) => httpClient({ addr: addr.Address.GetFxFollowers, data: fxcashparam });
Page({
  data: {
    SubCount: 0,
    SubPrice:0,
    listfollower: [],
    isLoadAll: false,
    followerpageidx: 1
  },
  onLoad(options) {
    var that = this
    var itemid = options.itemid
    var itemtype = options.itemtype
    var subcityid = options.subcityid
    wx.setNavigationBarTitle({
      title: '分销下属'
    })
    app.getUserInfo(function () {
      that.Init(itemid, itemtype, subcityid)
      that.GetFollowerList(itemid, itemtype, subcityid)
    })


  },
  showDistribution() {
    this.setData({
      showDistribution: !this.data.showDistribution
    })
  }
  , async Init(itemid, itemtype, subcityid ) {
    var that = this
    wx.showNavigationBarLoading(); // 可以放httpClient的
    let resp = await GetFxFollowersMain({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      itemId: itemid,
      itemType: itemtype,
      subcityid: subcityid
    });
    wx.stopPullDownRefresh();
    if (resp.Success) {
      var SubCount = resp.Data.SubCount
      var SubPrice = resp.Data.SubPrice
      that.setData({ SubCount: SubCount, SubPrice: SubPrice })
    }
    else {
      app.ShowMsg(resp.msg)
    }
    wx.hideNavigationBarLoading();
  }, async GetFollowerList(itemid, itemtype, subcityid ) {
    var that = this
    if (this.data.isLoadAll) return;
    wx.showNavigationBarLoading(); // 可以放httpClient的
    let resp = await GetFxFollowers({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      pageIndex: that.data.cashpageidx,
      itemId: itemid,
      itemType: itemtype,
      subcityid:subcityid
    });
    wx.stopPullDownRefresh();
    if (resp.Success) {
      var resultList = resp.Data.listfollower
      if (!resultList || resultList.length < 10) {
        this.setData({
          isLoadAll: true,
          listfollower: resultList
        })

      }
      else if (!!resultList) {
        var addpageidx = that.data.cashpageidx + 1
        this.setData({
          cashpageidx: addpageidx,
          listfollower: resultList
        })
      }


    }
    else {
      app.ShowMsg(resp.msg)

    }
    wx.hideNavigationBarLoading();

  }
})