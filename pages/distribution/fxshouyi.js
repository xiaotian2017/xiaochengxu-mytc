var util = require("../../utils/util.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
const GetMyFxMain = (fxparam) => httpClient({ addr: addr.Address.GetMyFxMain, data: fxparam });
const GetCashList = (fxcashparam) => httpClient({ addr: addr.Address.GetCashList, data: fxcashparam });
Page({
  data: {
    itemid:0,
    itemtype:0,
    mainmodel:null,
    showDistribution: false,
    listcash:[],
    isLoadAll: false,
    cashpageidx:1,
    fxratelay: 0, 
    fxrateconfig:null,
  },
  onLoad(options) {
    var that = this
    var itemid = options.itemid
    var itemtype = options.itemtype
    var subcityid = options.subcityid
    wx.setNavigationBarTitle({
      title: '我的分销'
    })
    app.getUserInfo(function () {
      that.setData({ itemid: itemid, itemtype: itemtype})
      that.Init(itemid, itemtype)
      that.GetCashList(itemid, itemtype, subcityid)
    })


  },
  showDistribution(e) {
    this.setData({
      showDistribution: !this.data.showDistribution
    })
  },
  lookfollowers(e){
    var itemid = e.currentTarget.dataset.itemid
    var itemtype = e.currentTarget.dataset.itemtype
    var subcityid = e.currentTarget.dataset.subcityid
    var url = "/pages/distribution/fxfollowers?itemid=" + itemid + "&itemtype=" + itemtype + "&subcityid=" + subcityid;
    wx.navigateTo({
      url: url,
    })
  }
  , async Init(itemid, itemtype) {
    var that=this
    wx.showNavigationBarLoading(); // 可以放httpClient的
    let resp = await GetMyFxMain({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      itemId: itemid,
      itemType: itemtype
    });
    wx.stopPullDownRefresh();
    if (resp.Success) {
      var result= resp.Data.mainmodel
      that.setData({ mainmodel: result})
      if (!!resp.Data.fxrateconfig) {
        that.setData({
          fxrateconfig: resp.Data.fxrateconfig,
        })
      } 
    }
    else {
      app.ShowMsg(resp.msg)
    }
    wx.hideNavigationBarLoading();
  }, async GetCashList(itemid, itemtype, subcityid) {
    var that=this
    if (this.data.isLoadAll) return;
    wx.showNavigationBarLoading(); // 可以放httpClient的
    let resp = await GetCashList({
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      pageIndex: that.data.cashpageidx,
      itemId: itemid,
      itemType: itemtype,
      subcityid: subcityid
    });
    wx.stopPullDownRefresh();
    if (resp.Success) {
      var resultList = resp.Data.listcash
      if (!resultList || resultList.length < 10) {
        this.setData({
          isLoadAll: true,
          listcash: resultList
        })

      }
      else if (!!resultList) {
        var addpageidx=that.data.cashpageidx+1
        this.setData({
          cashpageidx:addpageidx,
          listcash: resultList
        })
      }
    }
    else {
      app.ShowMsg(resp.msg)
    }
    wx.hideNavigationBarLoading();
  },
  turnfxrate: function () {
    let that = this
    var oldVal = that.data.fxratelay
    let newVal = oldVal == 0 ? 1 : 0
    this.setData({
      fxratelay: newVal
    })
  }
})