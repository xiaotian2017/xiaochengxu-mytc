var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp();
Page({
  data: {
      isSubmit:false,
      cityCode:"",
      currentid:-1,
      tabshow:0,
      storeid:0,
      showpagesel:0,
      payrate:0,
      redbagid:0,
      redPacket :{},
      redPacketShare:{},
       aclist: []
   
  },
  onLoad: function (options) {
    var that = this
    var storeid = options.storeid
    var redbagid = options.redbagid
    if (undefined == storeid || null == storeid) {
      app.ShowMsg("参数错误!")
    }
    that.setData({ storeid: storeid})
    if (undefined != redbagid && null != redbagid) {
      that.setData({ redbagid: redbagid })
    }
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function () {
      that.setData({ cityCode: app.globalData.citycode })
      that.loadredbag()
    })
    wx.setNavigationBarTitle({
      title: '红包编辑'
    })
  },

  inputamount:function(e)
  {
    var value = e.detail.value.replace(/\D/g, '')
    this.setData({ 'redPacket.DisplayAmount': value, 'redPacket.Amount': value})
 
  },
  inputaddcount: function (e) {
    var value = e.detail.value.replace(/\D/g, '')
    this.setData({ 'redPacket.TotalCount': value })
  
  },
  inputbonuscount: function (e) {
    var value = e.detail.value.replace(/\D/g, '')
    this.setData({ 'redPacket.MaxDrawCount': value })
   
  },
  inputshareinterval: function (e) {
    var value = e.detail.value.replace(/\D/g, '')
    this.setData({ 'redPacket.ShareTime': value })
  
  },
  inputdistance: function (e) {
    var value = e.detail.value
    this.data.redPacket.Distance = value
  },
  changedrawtype: function (e) {
    var value = e.detail.value
    this.data.redPacket.DrawType = value
  },
  loadredbag: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetAddOrEditRedpack,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        storeid: that.data.storeid,
        redpacketid: that.data.redbagid
      },
      success: function (res) {
        if (res.data.Success) {
          var returnredbag = res.data.Data.redpackmain
          var returnredbagshare = res.data.Data.redbagsharemain
          that.setData({ redPacket: returnredbag, redPacketShare: returnredbagshare, payrate: returnredbag.PayRate })
        }
        else {
          app.ShowMsg()
        }
        wx.hideLoading(res.data.Message)
      }
    })
  },
  getactivity: function (e) {
    var typeid = e.currentTarget.dataset.tab
    var that = this
    that.setData({ tabshow: typeid})
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetActivity,
      data: {
        storeid: that.data.storeid,
        typeid: typeid,
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({ aclist: res.data.Data.listactivity})
       
        }
        else {
          app.ShowMsg(res.data.Message)
        }
        wx.hideLoading()
      }
    })
  },
  selectsubtab:function(e)
  {
    var thisVue=this
    var itemname = e.currentTarget.dataset.itemname
    var itemid = e.currentTarget.dataset.itemid
    var stype = e.currentTarget.dataset.stype
    thisVue.setData({ currentid: itemid})
    if (itemid == 0) {
      thisVue.data.redPacketShare.ShareType = 0;
      thisVue.data.redPacketShare.ShareLink = "/pages/business_detail/business_detail?storeid=" + thisVue.data.storeid;
      thisVue.data.redPacketShare.ShareItemId = 0;
      thisVue.data.redPacketShare.ShareItemTitle = "首页";
    } else {
    
      thisVue.data.redPacketShare.ShareType = stype;
      thisVue.data.redPacketShare.ShareItemId = itemid;
      thisVue.data.redPacketShare.ShareItemTitle = itemname;
      switch (stype) {
        case '1'://抢优惠
          thisVue.data.redPacketShare.ShareLink = "/pages/youhui_detail/youhui_detail?couponid=" + itemid + "&storeid=" + thisVue.data.storeid
          break;
        case '2'://拼团
          thisVue.data.redPacketShare.ShareLink = "/pages/group_purchase/group_purchase/group_purchase?gid=" + itemid;
          break;
        case '3'://减价
          thisVue.data.redPacketShare.ShareLink = "/pages/cutPriceTake/cutPriceTake?cutid=" + itemid;
          break;
        case '4'://爱心价
          thisVue.data.redPacketShare.ShareLink = "/pages/activity_jiaixin/activity_jiaixin_detail?loveid=" + itemid;
          break;
        default:
          break;
      }
    }
    thisVue.setData({ redPacketShare: thisVue.data.redPacketShare})
  },
  openselectpage:function(e)
  {
    var that=this
    var val = e.currentTarget.dataset.val
    that.setData({ showpagesel: val})
  },
  editredpack:function(e)
  {
    var thisVue = this;
    if (!thisVue.data.isSubmit) {
      if (thisVue.data.redPacketShare.ShareItemTitle == "点击选择分享页面") {
        app.ShowMsg("请选择分享页面");
        return;
      }
      if (thisVue.data.redPacket.DisplayAmount == "" || thisVue.data.redPacket.DisplayAmount <= 0) {
        app.ShowMsg("请输入红包金额");
        return;
      }
      if (thisVue.data.redPacket.DisplayAmount > 99999) {
        app.ShowMsg("红包金额最高 99999 元");
        return;
      }
      if (thisVue.data.redPacket.TotalCount == "" || thisVue.data.redPacket.TotalCount <= 0) {
        app.ShowMsg("请输入红包个数");
        return;
      }
      if (thisVue.data.redPacket.TotalCount > 999999) {
        app.ShowMsg("红包个数最高为 9999999 个");
        return;
      }
      if (thisVue.data.redPacket.Distance > 0 && thisVue.data.redPacket.Latitude == 0 && thisVue.data.redPacket.Longitude == 0) {
        app.ShowMsg("请获取位置");
        return;
      }
      if (Number(thisVue.data.redPacket.MaxDrawCount) > Number(thisVue.data.redPacket.TotalCount)) {
        app.ShowMsg("奖励红包最多领取数不能大于红包个数");
        return;
      }
     
      var url = addr.Address.EditRedpacket
      var price = thisVue.data.redPacket.DisplayAmount 
      var param = {
        cityid: app.globalData.cityInfoId,
        cityCode: thisVue.data.cityCode,
        openid: app.globalData.userInfo.openId,
        Id: thisVue.data.redPacket.Id,
        Amount: price,
        TotalCount: thisVue.data.redPacket.TotalCount,
        Latitude: thisVue.data.redPacket.Latitude,
        Longitude: thisVue.data.redPacket.Longitude,
        Laction: thisVue.data.redPacket.Laction,
        IsSendMsg: thisVue.data.redPacket.IsSendMsg,
        ItemId: thisVue.data.storeid,
        Distance: thisVue.data.redPacket.Distance,
        MaxDrawCount: thisVue.data.redPacket.MaxDrawCount,
        ShareTime: thisVue.data.redPacket.ShareTime,
        DrawType: thisVue.data.redPacket.DrawType,
        storeId: thisVue.data.storeid,
        changeShare: thisVue.data.redPacketShare.changeShare,
        ShareType: thisVue.data.redPacketShare.ShareType,
        ShareLink: thisVue.data.redPacketShare.ShareLink,
        ShareItemId: thisVue.data.redPacketShare.ShareItemId,
        ShareItemTitle: thisVue.data.redPacketShare.ShareItemTitle,
      }
      wx.request({
        url: url,
        data: param,
        method: "GET",
        header: {
          'content-type': "application/json"
        },
        success: function (res) {
          if (res.data.Success) {
            thisVue.data.isSubmit = true
            price=parseFloat(price)
            if (!price) {
              price = 0;
            }
            var v_price = (price).toFixed(2).toString();
            v_price = v_price.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
            v_price = v_price.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
            v_price = v_price.replace(/^(\-)*(\d+)\.(\d)(\d).*$/, '$1$2.$3$4');
            v_price = (v_price * (1 + thisVue.data.payrate * 0.01)).toFixed(2);
            if (0 == thisVue.data.redPacket.Id)//新增
            {
              var redpackid = res.data.Data.redpackid
              var param = {
                quantity:1,
                extime:'',
                itemid: redpackid,
                paytype: 401,
                extype: v_price*100,//价格
                openId: app.globalData.userInfo.openId,
                remark: '发红包支付',
                areacode: app.globalData.areaCode,
              }
              util.AddOrder(param, thisVue.refun)
            }
            else{
              wx.showToast({
                title: '修改成功 !',
                icon: 'success',
                duration: 2000
              })
              var url = "../redpackmgr/redpacklist"//红包列表
              setTimeout(function(){
                wx.reLaunch({
                  url: url
                })
              },1000)

            }
          
          }
          else {
            app.ShowMsg(res.data.Message)
          }
        }
      })
    }

  },
  //导航
  getLocation: function () {
    var thisVue = this;
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    wx.chooseLocation({
      success: function (res) {
        thisVue.data.redPacket.Laction = res.address;
        thisVue.data.redPacket.Latitude = res.latitude;
        thisVue.data.redPacket.Longitude = res.longitude;
        thisVue.setData({
          redPacket: thisVue.data.redPacket
        })
      }
    })
  },
  //付款成功后回调
  refun: function (param, state) {
    var that=this
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
    
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/redpackmgr/redpacklist?storeid=' + that.data.storeid
        })
      }, 1000);
    }
  }
})