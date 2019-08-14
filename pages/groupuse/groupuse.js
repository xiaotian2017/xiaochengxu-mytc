var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp()
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
let getVoucherDraw = (p) => util.httpClient({ host, addr: 'IBaseData/GetVoucherDraw', data: p });
Page({
  data: {
    loadall:0,
    qrlink:'',
    guid:0,
    gid:0,
    mainmodel:{},
    store:{},
    voucher: null,
    showVoucher: false
   }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var guid = options.guid
    var gid = options.gid
    //从扫码进来
    var scene = options.scene
    if (undefined != scene || null != scene) {
      scene = decodeURIComponent(scene)
      if (0 != scene && "0" != scene) {
        //读取参数
        guid = addr.getsceneparam("guid", scene)
        gid = addr.getsceneparam("gid", scene)
      }
    }

    if (undefined != gid)
    {
      that.setData({ gid: gid })
    }
    if (undefined != guid) {
      that.setData({ guid: guid })
    }
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      that.loadmain()
    })
  },
  loadmain: function () {
      var that = this
      var guid = that.data.guid
      var url = addr.Address.GetUseGroupMain
      var param = {
        cityid: app.globalData.cityInfoId,
        cguid: guid,
        cgid: that.data.gid,
        openid: app.globalData.userInfo.openId
      }
     
      util.showNavigationBarLoading()
      wx.request({
        url: url,
        data: param,
        success: function (res) {
          if (res.data.Success)
          {
            var scene = addr.getCurrentPageUrlWithScene()
            if (scene == '') {
              scene = 0
            } 
          
            var count = 0
            let qrlink = addr.Address.GetGroupXcxQrCode + "?gid=" + that.data.gid + "&openid=" + app.globalData.userInfo.openId + "&guid=" + guid + "&appid=" + app.globalData.appid + "&scene=" + encodeURIComponent(scene)
            that.setData({ mainmodel: res.data.Data.mainmodel, store: res.data.Data.store, loadall: 1, qrlink: qrlink})
            var timer = setInterval(function () {
              that.checkuse()
              count++
              if (120 == count) {
                clearInterval(timer)
              }
            }, 1000)
          }
          else{
            app.ShowMsg(res.data.Message)
          }
        },
        complete: function () {
          util.hideNavigationBarLoading()
        }
      })
  },
  callphone: function (e) {
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
  gotodetail:function(e)
  {
    var gid = e.currentTarget.dataset.gid
    var url = '../group_purchase/group_purchase/group_purchase?gid=' + gid
    wx.navigateTo({
      url: url,
    })

   
  },
  gotoshopdetail:function(e)
  {
    var storeid = e.currentTarget.dataset.storeid
    var url = '../business_detail/business_detail?storeid=' + storeid
    wx.navigateTo({
      url: url,
    })
  },
  checkuse () {
    var that = this   
    var url = addr.Address.CheckStoreGroupUse
    var param = {
      guid: that.data.guid,
    }
      wx.request({
      url: url,
      data: param,
     async success (res) {
        if (res.data.Success) {
          let resp = await getVoucherDraw({
            openid: app.globalData.userInfo.openId,
            cityid: app.globalData.cityInfoId,
            itemid: that.data.gid,            
            itemtype: 2            
          })
      
          if (resp.code==1) {
            that.setData({
              voucher: resp.Data.Voucher,
              showVoucher: true      
            })
          }       
          app.ShowMsg("恭喜你，订单核销成功")
        }        
      }
    })
  },
  tomyVoucher() {
    wx.redirectTo({
      url: '/pages/myVoucher/myVoucher' 
    })
  },

  closeVoucher() {
    
    this.setData({
      showVoucher: false
    })
    console.log(this.data.showVoucher)
  }
})
