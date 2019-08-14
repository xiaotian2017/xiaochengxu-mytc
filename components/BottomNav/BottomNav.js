let app = getApp()
var addr = require("../../utils/addr.js");
Component({

  properties: {
    curTab: {
      type: Number,
    }
  },

  data: {
    currenttab: 1,
    buyversion: 3,

  },
  attached: function () {
    var that = this

    that.setData({

      indexconfig: app.globalData.indexnav,
      postconfig: app.globalData.postnav,
      storeconfig: app.globalData.storenav,
      addconfig: app.globalData.addnav,
      mineconfig: app.globalData.minenav,
      buyversion: app.globalData.buyVersion
    })

  },
  ready() {
    var that = this

    that.setData({
      currenttab: that.data.curTab,

    })
  },
  methods: {
    bottomnavswitch: function (e) {
      let tab = e.currentTarget.dataset.tab
      if (tab != 6) {
        if (app.globalData.cityExpired) {
          wx.reLaunch({
            url: '/pages/expirePage/expirePage',
          })
          return
        }
      }

      var path = e.currentTarget.dataset.url
      wx.reLaunch({
        url: path,
      })
      // wx.request({
      //   url: addr.Address.checkCityExpired,
      //   data: {
      //     appid: app.globalData.appid
      //   },
      //   header: {
      //     'content-type': 'application/json' // 默认值
      //   },
      //   success(res) {
      //     if (!res.data.result) {
      //       if (res.data.errcode == '-67') {
      //         wx.reLaunch({
      //           url: '/pages/expirePage/expirePage',
      //         })
      //       }
      //     } else {

      //     }
      //   }
      // })
      // cityExpired
      // var path = e.currentTarget.dataset.url
      // wx.reLaunch({
      //   url: path,
      // })
    }
  }
})
