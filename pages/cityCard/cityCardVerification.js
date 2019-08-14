const l = console.log;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
const useHalfCard = (params) => httpClient({ addr: addr.Address.useHalfCard, data: params });
Page({
    data: {
        halfPR: null,
        storeInfo: null,
        halfService: null,
        qrUrl: '',
        tradeNumber: '',
        hsid:0,
        hsguid:""
    },
    onLoad(options) {
      var that=this
      let { hsid, halfserviceguid } = { ...options}
      if (null != hsid && undefined != hsid)
      {
        that.setData({ hsid: hsid})
      }
      if (null != halfserviceguid && undefined != halfserviceguid) {
        that.setData({ hsguid: halfserviceguid })
      }
        app.getUserInfo(() => {       
            this.useHalfCard(options.id);
        })
    },
  
    async useHalfCard(hprid) {
      var that=this
        wx.showNavigationBarLoading();
        let resp = await useHalfCard({
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            hprid: hprid
        });
        if (resp.Success)
        {
          wx.hideNavigationBarLoading();
          this.setData({
            halfPR: resp.Data.mainmodel.HalfPR,
            storeInfo: resp.Data.mainmodel.StoreInfo,
            halfService: resp.Data.mainmodel.HalfService,
            tradeNumber: resp.Data.mainmodel.TradeNumber
          })
          var scene = addr.getCurrentPageUrlWithScene()
          if (scene == '') {
            scene = 0
          } 
          var count = 0
          let qrlink = addr.Address.GetHalfCardUseXcxQrCode + "?hsId=" + that.data.hsid + "&openid=" + app.globalData.userInfo.openId + "&halfsGuid=" + that.data.hsguid + "&appid=" + app.globalData.appid + "&scene=" + encodeURIComponent(scene);
          that.setData({ qrUrl: qrlink })
       
          var timer = setInterval(function () {
            that.checkuse(1)
            count++
            if (120 == count) {
              clearInterval(timer)
            }
          }, 1000)
        }
        else
        {
          app.ShowMsg(resp.Message)
        }
       
    },
    openMap(e) {
        if (!e.currentTarget.dataset.lat) {
            return;
        }
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.openLocation({
            latitude: e.currentTarget.dataset.lat,
            longitude: e.currentTarget.dataset.lng,
            name: this.data.storeInfo.SName,
            address: this.data.storeInfo.Address
        })
    },
    checkuse: function () {
      var that = this
      var url = addr.Address.CheckStoreHalfCardUse
      var param = {
        hsguid: that.data.hsguid,
      }
      wx.request({
        url: url,
        data: param,
        success: function (res) {
          if (res.data.Success) {
            app.ShowMsg("恭喜你，订单核销成功")
          }

        }
      })
    }
})
