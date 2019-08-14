
const l = console.log;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
let getHalfCardMain = (params) => httpClient({ addr: addr.Address.getHalfCardMain, data: params });
const app = getApp();
let WxParse = require('../../utils/wxParse/wxParse.js');
let htmljson = require('../../utils/wxParse/html2json.js');
let util = require("../../utils/util.js");

const halfCardFreeGet = (params) => httpClient({ addr: addr.Address.halfCardFreeGet, data: params });
const halfCardAddOrder = (params) => httpClient({ addr: addr.Address.halfCardAddOrder, data: params });
const FreeGetHalfOffService = (params) => httpClient({ addr: addr.Address.FreeGetHalfOffService, data: params });
// 城主是否设置了购买项
const getHalfCardBuyMain = (params) => httpClient({ addr: addr.Address.halfCardBuyMain, data: params });
Page({
    data: {
        typeId: '',
        hid: '',
        halfService: null,
        storeInfo: null,
        indicatorDots: false,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        botIndicatorDots: true,
        bannerUrls: [],
        botBannerUrls: [],
        isHalfCard: 0,
        cardType: '',
        isCanBuyCityCard: false,
        hpid: 0,
        originalPrice: 0
    },

    onLoad(options) {  
        app.getUserInfo(() => {
            this.setData({
                typeId: options.typeid,
                hid: options.hid
            })
            this.getHalfCardMain();
            this.getHalfCardBuyMain(options.typeid);
        })
    },
    // 获取同城卡购买项目 
    async getHalfCardBuyMain(typeid) {
        let resp = await getHalfCardBuyMain({
            cityid: app.globalData.cityInfoId,
            typeId: typeid
        });
        wx.stopPullDownRefresh();

        if (resp.Data.mainmodel.HalfCCs.length) {
            this.setData({
                isCanBuyCityCard: true
            })
        }
    },
    // 获取服务详情
    async getHalfCardMain() {
        wx.showNavigationBarLoading();
        let resp = await getHalfCardMain({
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            typeId: this.data.typeId,
            hid: this.data.hid
        })
        wx.hideNavigationBarLoading();
        this.setData({
            bannerUrls: resp.Data.mainmodel.AttachmentList,
            halfService: resp.Data.mainmodel.HalfService,
            storeInfo: resp.Data.mainmodel.StoreInfo,
            botBannerUrls: resp.Data.mainmodel.AttachmentList2,
            isHalfCard: resp.Data.mainmodel.IsHalfCard,
            cardType: resp.Data.mainmodel.CardType,
            originalPrice: resp.Data.mainmodel.HalfService.OriginalPrice
        })
        if (null != resp.Data.mainmodel.HalfService.Description)
        {
          WxParse.wxParse('Description', 'html', resp.Data.mainmodel.HalfService.Description, this);
        }
        l(resp.Data.mainmodel.AttachmentList.filepath, this.data.bannerUrls)
    },
    vzMakePhone(e) {
        console.log(e);
        let telnum = e.target.dataset.tel;
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.makePhoneCall({
            phoneNumber: telnum
        })
    },
    onShareAppMessage() {
        var path = addr.getCurrentPageUrlWithArgs()
        console.log(path);
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        return {
            title: app.globalData.cityName,
            path: path,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    onPullDownRefresh() {
        this.getHalfCardMain();
        this.getHalfCardBuyMain(this.data.typeId);
    },
    // 领取或购买
    async reseiveOrBuy() {
        // 验证城主是否开了同城卡购买项
        if (!this.data.isCanBuyCityCard) {
            wx.showModal({
                title: '提示',
                content: '城主暂未出售该同城卡',
                showCancel: false
            })
            return;
        }

        // 验证是否已购买
        console.log(this.data.halfService.IsHalfCard)
        if (!this.data.isHalfCard) {
            let that = this;
            wx.showModal({
                title: '提示',
                content: '请先开通同城卡权限',
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        wx.redirectTo({
                            url: '/pages/cityCard/cityCardPurchase?curCityCardId=' + that.data.cardType
                        })
                    }
                }
            })
            return;
        }

        // 免费领取
        if (this.data.halfService.DiscountType == 1) {
            wx.showLoading()
            let resp = await halfCardFreeGet({
                cityid: app.globalData.cityInfoId,
                openid: app.globalData.userInfo.openId,
                sid: this.data.storeInfo.Id,
                hid: this.data.halfService.Id,
                hTitle: this.data.halfService.Title,
                useTime: this.data.halfService.ServicesTime,
                discount: this.data.halfService.Discount,
                discountType: this.data.halfService.DiscountType
            });
            wx.hideLoading()
            // 领取成功
            if (resp.code) {
                wx.showToast({
                    title: '领取成功',
                    icon: 'success',
                    duration: 500
                })
                setTimeout(() => {
                    // 转到我的订单页
                    wx.redirectTo({
                        url: '/pages/cutlist/cutlist?type=cityCard'
                    })
                }, 500)
            }

            // 领取失败
            !resp.code && wx.showModal({
                title: '提示',
                content: resp.Message,
                showCancel: false
            })
            return;
        }
        else if (0 == this.data.halfService.DiscountPrice)
        {

          let resp = await FreeGetHalfOffService({
            price: this.data.halfService.DiscountPrice,
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            sid: this.data.storeInfo.Id,
            hid: this.data.halfService.Id,
            hTitle: this.data.halfService.Title,
            useTime: this.data.halfService.ServicesTime,
            discount: this.data.halfService.Discount,
            discountType: this.data.halfService.DiscountType
          });
          if (resp.Success) {
            wx.showToast({
              title: '领取成功',
              icon: 'success',
              duration: 500
            })
            setTimeout(() => {
              // 转到我的订单页
              wx.redirectTo({
                url: '/pages/cutlist/cutlist?type=cityCard'
              })
            }, 500)
          }
          else {
            app.ShowMsg(resp.Message)

          }
          return
        }

        // 付款抢购       
        let payRefun = (state = false) => {
            let that = this;
            if (!state) {
                wx.showToast({
                    title: '已取消付款',
                    duration: 2000
                })
                return;
            }
            wx.showToast({
                title: '支付成功 !',
                icon: 'success',
                duration: 500
            })
            setTimeout(() => {
                wx.redirectTo({
                    url: "/pages/cityCard/cityCardBuySuccess?hpid=" + that.data.hpid
                })
            }, 500)
        }

        let resp = await halfCardAddOrder({
            paytype: 302,
            price: this.data.halfService.DiscountPrice,
            appid: app.globalData.appid,
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            sid: this.data.storeInfo.Id,
            hid: this.data.halfService.Id,
            hTitle: this.data.halfService.Title,
            useTime: this.data.halfService.ServicesTime,
            discount: this.data.halfService.Discount,
            discountType: this.data.halfService.DiscountType
        });
        if (resp.Success)
        {
          this.setData({
            hpid: resp.Data.hpid
          })

          let param = {
            openId: app.globalData.userInfo.openId
          }

          wx.showLoading();
          util.PayOrder(resp.Data.orderid, param, {
            failed: function (res) {
              wx.hideLoading();
              payRefun();
            },
            success: function (res) {
              wx.hideLoading();
              if (res == "wxpay") {
                // 发起支付        
              } else if (res == "success") {
                payRefun(1)
              }
            }
          })
        }
        else{
          app.ShowMsg(resp.Message)

        }

       
    },
    toStore() {
        vzNavigateTo({
            url: '/pages/business_detail/business_detail',
            query: {
                storeid: this.data.storeInfo.Id
            }
        })
    },
    toCutlist() {
        vzNavigateTo({
            url: '/pages/cutlist/cutlist',
            query: {
                type: 'coupon'
            }
        })
    },
    toIndex(){
        app.gotohomepage()
    },
    toMine() {
        wx.redirectTo({
            url: '/pages/person_center/person_center'
        })

    },
    openmap() {
    
        if(!this.data.storeInfo.lat) return;
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.openLocation({
            latitude: this.data.storeInfo.lat,
            longitude: this.data.storeInfo.lng,
            name: this.data.storeInfo.SName,
            address: this.data.storeInfo.Address
        })
    }
})