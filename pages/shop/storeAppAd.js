var addr = require("../../utils/addr.js");
var util = require("../../utils/util.js");
//获取应用实例
var app = getApp()
Page({
    data: {
        qrSrc: "",
        cityphone:''
    },
    onLoad() {        
        app.getUserInfo( () => {
            this.setData({
                cityphone:app.globalData.cityphone    
            })     
          })
        // this.setData({
        //     qrSrc: wx.getStorageSync('qrSrc')
        // })
    },
    onShareAppMessage: function (res) {
        let that = this;
        var path = addr.getCurrentPageUrlWithArgs()
        try {
          wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        return {
          title:'开通店铺小程序',
          path: path,
          success: function (res) {
          
          }
        }
      },
      makePhone() {
        wx.makePhoneCall({
            phoneNumber: this.data.cityphone
        })
      }
})