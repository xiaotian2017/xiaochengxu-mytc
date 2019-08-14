var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
const app = getApp();
let getconfiglist = (params) => httpClient({ addr: addr.Address.GetChargeTypeInfoList, data: params });

Page({

  data: {
    needpay:0,
    configlist:[],
    selExtendType:0,
    postid:0
  },

  onLoad: function (options) {
    var that = this
    var postid = options.postid
    
    app.getUserInfo((userInfo) => {
      that.cityid = app.globalData.cityInfoId
      that.openid = app.globalData.userInfo.openId
      that.getmain()
      that.setData({ postid: postid})
    })
  },

  async getmain() {
    wx.showLoading({
      title: '加载中...'
    })
    var that = this
    let resp = await getconfiglist({
      cityid: that.cityid,
      openid: that.openid,
    })
    wx.hideLoading();
    if (resp.Success) {
      that.setData({
        configlist: resp.Data.ChargeTypeList
      })
    }
    else {
      app.ShowMsg(resp.msg)
    }

  },
  configChange(e) {
    var that = this
    var selVal = e.detail.value
    that.setData({
      selExtendType: selVal
    })
  
    var Text = that.data.configlist.find(x => x.id == selVal).name;
    var selText = Text.split('/')[0]
    var price = selText.replace(/[^0-9.]/ig, "");
    that.setData({ needpay: price })
  },
   sure()
   {
     var that = this
     if (0 == that.data.selExtendType)
     {
       app.ShowMsg('请先选择购买套餐')
       return
     }
   
     var param = {
       itemid: that.data.postid,
       paytype: 300300,
       extype: that.data.selExtendType,
       extime: 1,
       openId: app.globalData.userInfo.openId,
       remark: '查看帖子联系方式',
       areacode: app.globalData.areaCode,
       usenew:true,
       cityid: that.cityid
     }
     util.AddOrder(param, that.refun)
  },
  //付款成功后回调
  refun: function (param, state) {
    if (state == 0) {
      app.ShowMsg("您已取消付款")
      return
    }
    else if (state == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000
      })
      app.gotohomepage()
    }
  }

})