//index.js
var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var uploadimg = require("../../utils/uploadImgenew.js");
//获取应用实例
var app = getApp()
var that
var intervalid
Page({
  data: {
    QrCodeUrl: '',
    erweima_tk: 'none',
    store:{
      Id:0,
      SName:'',
      Address:'',
      baiduarea_id:0,
      StreetId: 0,
      lat:0,
      lng:0,
      LogoUrl:'http://oss.vzan.cc/image/jpg/2016/12/2/154847faf8bfa75fd445f2b990702f09abf3aa.jpg',
      Qrcode_Url:'',
      Description:'',
      TelePhone:''
    },
    uploadimgobjects: {
      //店铺头像
      "shoplogo":{
        config: {
        //图片上传
        maxImageCount: 1,
        images_full: false,
        imageUpdateList: [],//编辑时新增的
        imageList: [],
        imageIdList:[]//用来删除图片
       }
      },
      //轮播图
      "shoplunbo":{
        config: {
          //图片上传
          maxImageCount:9,
          images_full: false,
          imageUpdateList: [],//编辑时新增的
          imageList: [],
          imageIdList: []//用来删除图片
        }
      },
      //店铺二维码
      "shopqrcode": {
          config: {
            //图片上传
            maxImageCount: 1,
            images_full: false,
            imageUpdateList: [],//编辑时新增的
            imageList: [],
            imageIdList: []//用来删除图片
          }
      },
      //店铺介绍图
      "shopintroduce": {
        config: {
          //图片上传
          maxImageCount: 9,
          images_full: false,
          imageUpdateList: [],//编辑时新增的
          imageList: [],
          imageIdList: []//用来删除图片
        }
      }
    },
    hasbindphone:0,
    showpage:0,
    UserName:'',
    index: 0,
    province:[],
    stindex: 0,
    storetypes:[],
    multiIndex:[0,0],
    storeMultiIndex: [0,0],
    phone:'',
    code: '',
    checkCode: 0,//验证码
    sendtime: 60,//验证码发送计时时间，单位秒
    timer: 0,//计时器对象
    checkTelphone: 0,//已验证的电话
    content: '获取验证码',
    ctIndex: 0,
    ruzhuxiangArray: [],
    moneyChoseArray: [],
    isIos: false
  },
  onLoad: function (options) {
   var that = this
    that.setData({
      isIos: app.globalData.isIos
    })
   wx.setNavigationBarTitle({
     title: '店铺编辑'
   })
   var storeId = options.storeid
    if(undefined==storeId)
     storeId=0
  
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function () {
      that.init(storeId);
    })
  },
  init: function (storeId) {
    var that = this;
    that.loadshop(storeId);
    that.GetStoreChargeType();
    this.GetQrCodeUrl();
  },
  uploadLogoImg:function (e){
    wx.showLoading({
      title: '开始上传',
    })
    uploadimg.shopChooseImage(e,this);

  },
  bindPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindPickerColumnChange(e) {
    if (e.detail.column == 0) {
      var that = this;
      var code = that.data.province[0][e.detail.value].id
      var multiIndex = that.data.multiIndex
      wx.request({
        url: addr.Address.GetStreetList,
        data: {
          code: code
        },
        method: "GET",
        header: {
          'content-type': "application/json"
        },
        success: function (res) {
          if (res.data.Success) {
            multiIndex[1] = 0
            that.setData({
              "province[1]": res.data.Data.CAreaStreetList,
              multiIndex: multiIndex
            });
          }
        }
      })
    }
  },
  bindfirttypechange(e) {
    if (e.detail.column == 0) {
      var that = this;
      var code = that.data.storetypes[0][e.detail.value].id
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
            var storetypes = that.data.storetypes;
            storetypes[1] = res.data.Data.StoreTypeList
            that.setData({
              storetypes: storetypes,
              multiIndex: multiIndex
            });
          }
        }
      })
    }
  },
  
    bindfenleichange: function (e) {
      this.setData({
        storeMultiIndex: e.detail.value
      })
  },
  //获取同城店铺入驻收费项
 GetStoreChargeType: function () {
    var that = this;
    wx.request({
      url: addr.Address.GetStoreChargeType,
      data: {
        cityInfoId: app.globalData.cityInfoId,
        OpenId: app.globalData.userInfo.openId,
        appId: app.globalData.appid,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            ruzhuxiangArray: [res.data.Data.ChargeTypeList],
            moneyChoseArray: [res.data.Data.PriceStr]
          })
        }
      }
    })
  },
  bindruzhuxiangchange: function (e) {
    this.setData({
      ctIndex: e.detail.value
    })
  },
  //导航
  getLocation:function(){
    var that = this;
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: function () {
              wx.chooseLocation({
                success: function (res) {
                  var store = that.data.store
                  store.Address = res.address
                  store.lat = res.latitude
                  store.lng = res.longitude
                  that.setData({
                    store: store
                  })
                }
              })
            },
            fail: function (r) {
              console.log(r)
            }
          })
        }
        else {
          wx.chooseLocation({
            success: function (res) {
              var store = that.data.store
              store.Address = res.address
              store.lat = res.latitude
              store.lng = res.longitude
              that.setData({
                store: store
              })
            }
          })
        }
      }
    })

  },
  //发送验证码
  getcode:function(){
    var that = this
    if (that.data.timer > 0) {
      return
    }
    var phone = that.data.phone
    if (phone.trim() == "") {
      app.ShowMsg('请输入电话号码')
      return
    }
    if (phone.length != 11) {
      app.ShowMsg('输入电话号码不对')
      return
    }
    wx.request({
      url: addr.Address.Senduserauth,
      data: {
        areacode: app.globalData.areaCode,
        tel: phone,
        openId: app.globalData.userInfo.openId,
        sendType: 8,
        appid: app.globalData.appid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.isok) {
          that.data.checkTelphone = phone
          that.data.checkCode = res.data.dataObj
          //计时器计时
          that.data.timer = setInterval(function () {
            var data = that.data
            if (data.sendtime == 0) {
              data.sendtime = 60
              data.content = '重发'
              clearInterval(that.data.timer);
              that.data.timer = 0
            }
            else {
              data.sendtime = data.sendtime - 1
              //改变发送按钮背景色和显示文字
              data.content = data.sendtime + "s"
            }
        

          }.bind(that), 1000)
        }

        app.ShowMsg(res.data.Msg)
      }
    })
  },
  clearImage: function (e) {
    var that=this
    //轮播图清除
    if (e.currentTarget.dataset.which == 'shoplunbo' || e.currentTarget.dataset.which == 'shopintroduce')
    {
      uploadimg.shopclearImage(e, this);
    }
    else{
      var configs = that.data.uploadimgobjects
      var index = e.currentTarget.dataset.which
      var currentItem = configs[index]
      currentItem.config.imageList.splice(index, 1);
      currentItem.config.images_full = false;
      that.setData({
        "uploadimgobjects": configs
      })
    }
    
  },
  //点击提交
  SubmitSettled: function () {
    var that = this
    //店铺名称与店主姓名
    var store=that.data.store
    var SName = store.SName
    if (SName.trim() == '') {
      app.ShowMsg('请输入店铺名称')
      return
    }
    var UserName = that.data.UserName
    if (UserName == '' || null == UserName) {
      app.ShowMsg('请输入店主姓名')
      return
    }
    var address = store.Address
    if (address == null || address.trim() == '') {
      app.ShowMsg('请点击定位选择详细地址')
      return
    }
    var phone = that.data.phone
    var storeparam = {
      Id: store.Id,
      CityInfoId: app.globalData.cityInfoId,
      SName: SName,
      OwnerName: UserName,
      Address: that.data.store.Address,
      lat: store.lat,
      lng: store.lng,
      baiduarea_id: that.data.province[0][that.data.multiIndex[0]].id,
      StreetId: that.data.province[1][that.data.multiIndex[1]].id,
      CityCode: app.globalData.areaCode,
      appid: app.globalData.appid,
      OpenId: app.globalData.userInfo.openId,
      LogoUrl: store.LogoUrl,
      Qrcode_Url: store.Qrcode_Url,
      Description: store.Description == null ? '' : store.Description,
      imgs:'',
      TelePhone:phone
    }
    if(0==that.data.store.Id)
    {
  
      var typeid = 0;
      if (that.data.storetypes[1].length > 0) {
        typeid = that.data.storetypes[1][that.data.storeMultiIndex[1]].id
      }
      else {
        typeid = that.data.storetypes[0][that.data.storeMultiIndex[0]].id
      }
      storeparam.typeid=typeid
      storeparam.tag=that.data.storetypes[0][that.data.storeMultiIndex[0]].name + ';'
      var typesecond = that.data.storetypes[1][that.data.storeMultiIndex[1]];
      console.log(typesecond)
      if (null != typesecond && undefined!= typesecond)
storeparam.tag=typesecond.name
    }
    else{
      storeparam.typeid=that.data.store.typeid
      storeparam.tag = that.data.store.tag
    }
    if(store.Id>0)//编辑完善信息
    {
      var logoImgs = that.data.uploadimgobjects['shoplogo'].config.imageList
      storeparam.LogoUrl = logoImgs.length > 0 ? logoImgs[0]:'';
      var shopqrImgs = that.data.uploadimgobjects['shopqrcode'].config.imageList
      storeparam.Qrcode_Url = shopqrImgs.length > 0 ? shopqrImgs[0] : '';
      var shoplunboImgs = that.data.uploadimgobjects['shoplunbo'].config.imageUpdateList
      if (shoplunboImgs.length > 0) {
        storeparam.imgs = shoplunboImgs.join(",");
      }
      var shopintroduceImgs = that.data.uploadimgobjects['shopintroduce'].config.imageUpdateList
      if (shopintroduceImgs.length > 0) {
        storeparam.introimgs = shopintroduceImgs.join(",");
      }
     
    }
 
    if (0 == that.data.hasbindphone)
    {
      //手机号与验证码
      var checkphone = that.data.checkTelphone
     
      var checkcode = that.data.checkCode
      var code = that.data.code
      if (phone.trim() == '') {
        app.ShowMsg('请输入手机号码')
        return
      }
      if (code.trim() == '') {
        app.ShowMsg('验证码不能为空')
        return
      }
      if (checkcode != code) {
        app.ShowMsg('输入的验证码不对，请检查')
        return
      }
      if (checkphone != phone) {
        app.ShowMsg('输入手机号码不对')
        return
      }
      storeparam.invitationCode=code
      storeparam.TelePhone= phone
      //验证码检验
      wx.request({
        url: addr.Address.Submitauth,
        data: {
          tel: phone,
          openId: app.globalData.userInfo.openId,
          authCode: code,
          verType: 1
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.isok) {
            app.globalData.userInfo.TelePhone = that.data.phone
            app.globalData.userInfo.IsValidTelePhone = 1
            //店铺入驻
            wx.request({
              url: addr.Address.AddStore,
              data: storeparam,
              method: "GET",
              header: {
                'content-type': "application/json"
              },
              success: function (res) {
                if (res.data.Success) {
                  var storeid = res.data.Data.dataObj
                  //修改
                  if ("update" == storeid) {
                    app.ShowMsg('修改成功')
                   
                    setTimeout(function () {
                      wx.navigateBack({
                        delta: 1
                      })
                    }, 2000)
                  }
                  else {
                    
                    var price = that.data.moneyChoseArray[0][that.data.ctIndex]
                    console.log(price)
                    if (price==0)
                    {
                      setTimeout(function () {
                        wx.redirectTo({
                          url: '/pages/shop/shop'
                        })
                      }, 2000)
                    }
                    else{
                      var param = {
                        itemid: storeid,
                        paytype: 6207,
                        extype: that.data.ruzhuxiangArray[0][that.data.ctIndex].id,
                        extime: 1,
                        quantity: 1,
                        openId: app.globalData.userInfo.openId,
                        remark: '店铺入驻',
                        areacode: app.globalData.areaCode,
                      }
                      util.AddOrder(param, that.refun)
                    }
                  }
                }
                else
                {
                  app.ShowMsg(res.data.Message)
                }
              }
            })
          }
          else {

            app.ShowMsg(res.data.Message);
          }
        }
      })
    }
    else {
      var price = that.data.moneyChoseArray[0][that.data.ctIndex]
      if (price > 0) {
        if (app.globalData.isIos) {
          wx.showModal({
            content: '只有管理员和非苹果手机用户能入驻店铺',
            showCancel: false,
            title: '提示',
            success(res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
          return
        }
      }

      //店铺入驻
      wx.request({
        url: addr.Address.AddStore,
        data: storeparam,
        method: "GET",
        header: {
          'content-type': "application/json"
        },
        success: function (res) {
          if (res.data.Success) {
            var storeid = res.data.Data.dataObj
            //修改
            if ("update" == storeid) {
              app.ShowMsg('修改成功')
      
              setTimeout(function(){
                wx.redirectTo({
                  url: '/pages/shop/shop_admin?storeid=' + that.data.store.Id,
                })
              },2000)
            }
            else {
            
              if (price == 0) {
                app.ShowMsg('恭喜亲，入驻成功啦')
                setTimeout(function () {
                  wx.redirectTo({
                    url: '/pages/shop/shop'
                  })
                }, 2000)
              }
              else {
                var param = {
                  itemid: storeid,
                  paytype: 6207,
                  extype: that.data.ruzhuxiangArray[0][that.data.ctIndex].id,
                  extime: 1,
                  quantity: 1,
                  openId: app.globalData.userInfo.openId,
                  remark: '店铺入驻',
                  areacode: app.globalData.areaCode,
                }
                util.AddOrder(param, that.refun)
              }
            }
          }
          else
          {
            app.ShowMsg(res.data.Message)
          }
        }
      })
    }
  },
  //手机号输入
  inputphone: function (e) {
    var value = e.detail.value
    this.data.phone = value
  },
  //介绍
  inputdecription:function(e){
    var value = e.detail.value
    this.data.store.Description = value
  },
  //验证码输入
  inputcode: function (e) {
    var value = e.detail.value
    this.data.code = value
  },
  //店铺名称
  inputsname: function (e) {
    var value = e.detail.value
    this.data.store.SName = value
  },
  //店主姓名
  inputusername: function (e) {
    var value = e.detail.value
    this.data.UserName = value
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
      var url = "../person_center/person_center"
      wx.redirectTo({
        url: url
      })
    }
  },
  loadshop: function (storeid) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetAddOrEditStore,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        storeid: storeid
      },
      success: function (res) {
        if (0 == res.data.ResultCode) {
          var bindPhone = res.data.Data.BindPhone;
          var restultStore = res.data.Data.Store;
          var resultAreas = res.data.Data.CAreaList;
          var resultStreetAreas = res.data.Data.CAreaStreetList;
          var resultStoreTypeFirst = res.data.Data.CStoreTypeFirstList;
          var resultStoreTypeSecond = res.data.Data.CStoreTypeSecondList;
          that.setData({
            province: [resultAreas,resultStreetAreas],
            storetypes: [resultStoreTypeFirst, resultStoreTypeSecond],
            resultStoreTypeFirst: resultStoreTypeFirst
          });
          //编辑赋值
          if (null != restultStore)
          {
            that.setData({ "UserName": restultStore.OwnerName })
            that.setData({ "store": restultStore })
            //店铺logo
            var uploadconfigs = that.data.uploadimgobjects
            var shopLogoConfig = uploadconfigs['shoplogo'].config
            shopLogoConfig.imageList.push(restultStore.LogoUrl)
            if (shopLogoConfig.imageList.length == shopLogoConfig.maxImageCount)
            {
              shopLogoConfig.images_full = true
            }
            
            that.setData({ "uploadimgobjects": uploadconfigs })
            //店铺轮播图
            var resultLunBoTu = res.data.Data.StoreLunBoImg;
            if (resultLunBoTu.length > 0) {
              var uploadconfigs = that.data.uploadimgobjects
              var shopLunBoConfig = uploadconfigs['shoplunbo'].config
              resultLunBoTu.forEach(function (val, index) {
                shopLunBoConfig.imageList.push(val.filepath)
                shopLunBoConfig.imageIdList.push(val.id)
              })
              if (shopLunBoConfig.imageList.length == shopLunBoConfig.maxImageCount) {
                shopLunBoConfig.images_full = true
              }
           
              that.setData({ "uploadimgobjects": uploadconfigs })
            }
              //店铺介绍图
              var resultJieShaoTu = res.data.Data.StoreJieShaoImg;
              if (resultJieShaoTu.length > 0) {
                var uploadconfigs = that.data.uploadimgobjects
                var shopJieShaoConfig = uploadconfigs['shopintroduce'].config
                resultJieShaoTu.forEach(function (val, index) {
                  shopJieShaoConfig.imageList.push(val.filepath)
                  shopJieShaoConfig.imageIdList.push(val.id)
                })
                if (shopJieShaoConfig.imageList.length == shopJieShaoConfig.maxImageCount) {
                  shopJieShaoConfig.images_full = true
                }

                that.setData({ "uploadimgobjects": uploadconfigs })
              }
              //带上ImageId删除使用
           
            //店铺二维码 
            if ('' != restultStore.Qrcode_Url)
            {
              var uploadconfigs = that.data.uploadimgobjects
              var shopQRConfig = uploadconfigs['shopqrcode'].config
              shopQRConfig.imageList.push(restultStore.Qrcode_Url)
              if (shopQRConfig.imageList.length ==shopQRConfig.maxImageCount) {
                shopQRConfig.images_full = true
              }
         
              that.setData({ "uploadimgobjects": uploadconfigs })
            }
          }
          that.setData({ "hasbindphone": bindPhone })
          //开始呈现页面
          that.setData({ "showpage": 1 })
         
        }
        else {
          app.ShowMsg(res.data.Message)

        }
        wx.hideLoading()
      }
    })
  },
  bindtap_erweima: function (e) {
    this.setData({ erweima_tk: '' })
  },
  bindtap_close: function (e) {
    this.setData({ erweima_tk: 'none' })
  },
  checkedit:function(e)
  {
    var canedit = e.target.dataset.edit
    if (0 == canedit)
    {
      app.ShowMsg('目前不支持编辑PC端填写的店铺介绍喔')
    }

  },
  //获取客服二维码
  GetQrCodeUrl: function () {
    var that = this;
    wx.request({
      url: addr.Address.GetQrCodeUrl,
      data: {
        areaCode: app.globalData.areaCode
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        if (res.data.Success) {
          that.setData({
            QrCodeUrl: res.data.Data.QrCodeUrl
          });
        } else {
          app.ShowMsg(res.data.Message)

        }
      }
    })
  }
})
