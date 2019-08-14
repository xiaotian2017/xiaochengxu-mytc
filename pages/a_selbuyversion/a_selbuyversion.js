var addr = require("../../utils/addr.js");
var app = getApp();
Page({
  data: {
    imgurl:''
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      wx.setNavigationBarTitle({
        title: app.globalData.cityName
     })
      //检查是否收藏了页面，跳到用户收藏的页面
      wx.request({
        url: addr.Address.GetConcernPagePath,
        data: {
          openId: app.globalData.userInfo.openId,
          appid: app.globalData.appid
        },
        method: "GET",
        header: {
          'content-type': "application/json"
        },
        success: function (res) {
          var hasredirect=0
          var time=0;
          if (res.data.Success) {
            // 首页霸屏图
            var url = "";
            var params = res.data.Data.IndexImage;
            params.forEach(function (v) {
              if (v.Param == "img") {
                url = v.Value
                that.setData({
                  imgurl: url
                })
              }
            });
            if ('' != url)
              time=2000
            var storeid = res.data.Data.StoreId
            if(storeid>0)
            {
              hasredirect=1
              wx.setStorageSync('hasconcernpage', true)
              setTimeout(function(){
                wx.redirectTo({
                  url: '../business_detail/business_detail?storeid=' + storeid
                })
              }, time)
              
            }

          }
        setTimeout(function(){

            if (0 == hasredirect) {

              if (1 == app.globalData.EntrancePage) {

                wx.redirectTo({
                  url: '../postindex/postindex'
                })
              }
              else {
                var ver = app.globalData.buyVersion
                if (1 == ver)// 分类信息
                {
                  wx.redirectTo({
                    url: '../postindex/postindex'
                  })
                }
                else if (2 == ver) {//好店

                  wx.redirectTo({
                    url: '../shopindex/shopindex'
                  })
                }
                else if (3 == ver) {//混合版
                  console.log('dfsf')
                  wx.redirectTo({
                    url: '../index/index'
                  })
                }

              }

            }

          },time)
         
        },
        complete: function () {
          wx.hideNavigationBarLoading()
        }
      })
    })
  }
})
