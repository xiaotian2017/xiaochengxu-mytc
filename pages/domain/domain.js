var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp();
Page({
      data: {
        showpage: '',
        store: {
          Status:'',
          CityInfoId:'',
          CityCode:'',
          UnionId:'',
          baiduarea_id:'',
          storeId: '',
          storeName: '',
          userName: '',
          userId: '',
          phone: '',
          description: ''
        },
        hasBindPhone:0,
        cityInfoId: 0,
        typeIndex: 0,
        storeTypes: [], //套餐种类
        multiIndex: [0, 0],
        storeMultiIndex: [0, 0],
        charegeType: '',
        paymentDurArr: '', //套餐时间
        paymentNumArr: '' //支付金额
      },
      onLoad: function (options) {
        var store = JSON.parse(options.store);        
        var that = this;
        if ((store.Id === '' || store.Id === undefined) && store.Status !== 1) return false;
        wx.setNavigationBarTitle({
          title: '店铺认领'
        })
        this.setData({
          'store.Status':store.Status,
          'store.CityInfoId':store.CityInfoId,
          'store.CityCode':store.CityCode,
          'store.UnionId':store.UnionId,
          'store.baiduarea_id':store.baiduarea_id,
          'store.storeId':store.Id
        })
        if (undefined === store.Id) {
           this.setData({
             'store.storeId':0
           })
        }
        app.getUserInfo(function (storeId) {
          that.init(store.Id)
        })
      },
      init: function (storeId) {
        var that = this;
        that.loadshop(storeId);
        that.getStoreChargeDur()
      },
      //初始加载   
      loadshop: function (storeId) {
        var that = this;
        wx.showLoading({
          title: '加载中'
        })
        wx.request({
          url: addr.Address.GetAddOrEditStore,
          data: {
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            appid: app.globalData.appid,
            storeid: storeId
          },
          success: function (res) {
            if (res.data.Success) {
              var resultStoreTypeFirst = res.data.Data.CStoreTypeFirstList;
              var resultStoreTypeSecond = res.data.Data.CStoreTypeSecondList
              that.setData({
                storeTypes: [resultStoreTypeFirst, resultStoreTypeSecond]
              });
              that.setData({
                "showpage": 1,
                "store.storeName": res.data.Data.Store.SName
              })
            } else {
              app.ShowMsg(res.data.Message)
            }
            wx.hideLoading();
          }
        })
      },
      //店铺名   
      getStoreName: function (e) {
        var value = e.detail.value;
        this.setData({
          'store.storeName': value
        })
      },
      //用户名   
      getUserName: function (e) {
        var value = e.detail.value;
        this.setData({
          'store.userName': value
        })
      },
      //电话号码
      getPhone: function (e) {
        var value = e.detail.value;
        this.setData({
          'store.phone': value
        })
      },
      //店铺介绍
      getStoreDecri: function (e) {
        var value = e.detail.value.trim();
        this.setData({
          'store.description': value
        })
      },
      //行业选择      
      chooseStoreType: function (e) {
        this.setData({
          storeMultiIndex: e.detail.value
        })
      },
      paymentChange: function (e) {
        this.setData({
          typeIndex: e.detail.value
        })
      },
      //店铺类型更改   
      storeTypeColumnChange: function (e) {
        var that = this;
        if (e.detail.column === 0) {
          var code = that.data.storeTypes[0][e.detail.value].id
          var multiIndex = that.data.storeMultiIndex
          wx.request({
            url: addr.Address.GetSubStoreTypeFormat,
            data: {
              pId: code,
              cityInfoId: app.globalData.cityInfoId
            },
            method: "GET",
            header: {
              'content-type': "application/json"
            },
            success: function (res) {
              if (res.data.Success) {
                multiIndex[1] = 0
                var storeTypes = that.data.storeTypes;
                storeTypes[1] = res.data.Data.StoreTypeList
                that.setData({
                  storeTypes: storeTypes,
                  multiIndex: multiIndex
                });
              }
            },
            fail: function (e) {
              wx.showToast({
                title: '获取同城行业信息出错'
              })
            }
          })
        }
      },
      //收费套餐
      getStoreChargeDur: function () {
        var that = this;
        wx.request({
          url: addr.Address.GetStoreChargeType,
          data: {
            cityInfoId: app.globalData.cityInfoId,
            OpenId: app.globalData.userInfo.openId,
            appid: app.globalData.appid
          },
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            if (res.data.Success) {
              that.setData({
                paymentDurArr: [res.data.Data.ChargeTypeList],
                paymentNumArr: [res.data.Data.PriceStr]
              })
            }
          },
          fail: function (e) {
            console.log(e);
            console.log("获取同城店铺认领收费项出错")
            wx.showToast({
              title: '获取同城店铺认领收费项出错'
            })
          }
        })
      },
      //提交代码
      submit: function () {
        let that = this
        let {store} = {...this.data}
        if (store.storeName.trim() === '') {
          app.ShowMsg('请输入店铺名称');
          return
        }
        if (/[@#\$%\^&\*]+/g.test(store.storeName)) {
          app.ShowMsg('店铺名称有误')
          return
        }
        if (store.userName === '' || null === store.userName) {
          app.ShowMsg('请输入店主姓名')
          return
        }
        if (store.phone.trim() === '') {
          app.ShowMsg('请输入电话号码')
          return
        }
        if (!/^1[3|4|5|7|8][0-9]{9}$/.test(store.phone)) {
          app.ShowMsg('电话号码输入有误')
          return
        }
        if (store.description === '') {
          app.ShowMsg('请输入店铺介绍')
          return
        }
        if (store.description.replace(/[^\x00-\xff]/g, "01").length < 0) {
          app.ShowMsg('店铺介绍不能少于10个字')
          return
        }

        var storeTypeId,storeTypeSubId,storeTypes;
        storeTypes = that.data.storeTypes[0][that.data.storeMultiIndex[0]].name + ';'
        storeTypeSubId = that.data.storeTypes[1][that.data.storeMultiIndex[1]];

        if(that.data.storeTypes[1].length > 0){
          storeTypeId = that.data.storeTypes[1][that.data.storeMultiIndex[1]].id
          if (null != storeTypeSubId && undefined!= storeTypeSubId){
            storeTypes += storeTypeSubId.name
          }  
        }else{
          storeTypeId = that.data.storeTypes[0][that.data.storeMultiIndex[0]].id
        }
        var storeParam = {
          SName: store.storeName, //店铺名称
          baiduarea_id:store.baiduarea_id,
          CityCode:store.CityCode,
          tag:storeTypes, //店铺类别名称
          typeid:storeTypeId, //店铺类别Id
          storeId:store.storeId, //店铺Id
          linkMan:store.userName, // 店主名
          linkPhone:store.phone, //店铺电话
          Description:store.description,//
          OpenId: app.globalData.userInfo.openId, // openid
          UnionId:store.UnionId,
          CityInfoId:store.CityInfoId
        }
        
        wx.request({
            url: addr.Address.AddClaim,
            data: storeParam,
            method: "GET",
            header: {
              'content-type': "application/json"
            },
            success:function(res){
              if(res.data.Success){
                var price = that.data.paymentNumArr[0][that.data.typeIndex]
                if (price == 0) {
                  app.ShowMsg('恭喜亲，认领成功啦')
                  setTimeout(function () {
                    wx.redirectTo({
                      url: '/pages/shop/shop',
                    })
                  }, 2000)
                }
                else {
                  var storeId = res.data.Data.claiminfo.Id;
                  var param = {
                    itemid: storeId,
                    paytype: 209,
                    extype: that.data.paymentDurArr[0][that.data.typeIndex].id,
                    extime: 1,
                    quantity: 1,
                    openId: app.globalData.userInfo.openId,
                    remark: '店铺认领',
                    areacode: app.globalData.areaCode
                  }
                  util.AddOrder(param, that.refun)
                }
              }
            },
            fail:function(){
              wx.showToast({
                title:'店铺认领出错'
              })
            }
          })

      },
        //付款成功后回调
      refun: function(param, state) {
          if (state == 0) {
            wx.showToast({
              title: '您已取消付款 !',
              duration: 2000
            })
          }else if (state == 1) {
            wx.showToast({
              title: '支付成功 !',
              icon: 'success',
              duration: 2000
            })
            var url = "../shop/shop"
            app.goNewPage(url)
          }
      }
    })