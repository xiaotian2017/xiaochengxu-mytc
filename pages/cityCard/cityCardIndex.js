const { vzNavigateTo, httpClient, dateFormat, GetDateTime } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
var _host = addr.HOST;
const app = getApp();

// 这些接口记得放到 addr.js

const GetUserMember = (params) => httpClient({ host: _host, addr: 'IBaseData/GetUserMember', data: params });
const drawVoucher = (params) => httpClient({ host: _host, addr: 'IBaseData/UserDoDrawVoucher', data: params, method: 'POST', contentType: 'application/json' });

const GetCityMemberStores = (params) => httpClient({ host: _host, addr: 'IBaseData/GetCityMemberStores', data: params });
const GetCityMemberVouchers = (params) => httpClient({ host: _host, addr: 'IBaseData/GetCityMemberVouchers', data: params });
const GetCityMemberGoods = (params) => httpClient({ host: _host, addr: 'IBaseData/GetCityMemberGoods', data: params });

Page({
    data: {
        couponList: [],
        pageindex: 0,
        memberuser: null,
        content: '',
        indicatorDots: false,
        autoplay: false,
        memberStoreList: [],
        memberGoodsList: [],
        city_kefu_hidden: true,
        cityphone: '',
        QrCodeUrl: ''
    },

    onLoad(options) {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId
            this.openid = app.globalData.userInfo.openId
            this.areaCode = app.globalData.areaCode;
            this.GetUserMember()
            this.GetCityMemberVouchers()
            this.GetCityMemberStores()
            this.GetCityMemberGoods()            
        })
    },

    async GetCityMemberVouchers() {
        wx.showLoading({
            title: '加载中',
        })

        let resp = await GetCityMemberVouchers({
            pageIndex: 1,
            OpenId: this.openid,
            CityInfoId: this.cityid
        })


        if (resp.code) {
            if (resp.data && resp.data.length) {
                this.setData({
                    couponList: resp.data
                })
            }
        } else {
            this.setData({
                showTips: true,
                content: resp.msg
            })
        }
        wx.hideLoading()
    },

    async GetUserMember() {

        let resp = await GetUserMember({
            OpenId: this.openid,
            CityInfoId: this.cityid
        })

        if (!resp.success) {
            wx.showModal({
                title: '提示',
                content: resp.msg,
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        app.gotohomepage()
                    }
                }
            })
            return
        }


        if (resp.code) {
            this.setData({
                memberuser: resp.data
            })
        } else {
            this.setData({
                showTips: true,
                content: resp.msg
            })
        }
    },

    async drawVoucher(e) {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        wx.showLoading({
            title: '加载中',
        })

        let data = await drawVoucher({
            openId: this.openid,
            cityInfoId: this.cityid,
            vid: e.currentTarget.dataset.vid
        })

        wx.hideLoading()
        if (data.data) {
            this.setData({
                showTips: true,
                content: '领取成功',
            })
            this.GetUserMember()
            setTimeout(() => {
                this.setData({
                    couponList: [],
                    pageindex: 0
                })
                this.GetCityMemberVouchers()
            }, 2000)
        } else {
            this.setData({
                showTips: true,
                content: data.msg
            })
        }
    },

    async GetCityMemberStores() {
        wx.showLoading()
        let resp = await GetCityMemberStores({
            OpenId: this.openid,
            CityInfoId: this.cityid
        })
        if (resp.code) {
            if (resp.data && resp.data.length) {
                this.setData({
                    memberStoreList: resp.data.slice(0, 6)
                })
            }
        } else {
            this.setData({
                showTips: true,
                content: resp.msg
            })
        }

        wx.hideLoading()
    },

    async GetCityMemberGoods() {
        wx.showLoading()
        let resp = await GetCityMemberGoods({
            OpenId: this.openid,
            CityInfoId: this.cityid
        })
        if (resp.code) {
            if (resp.data && resp.data.length) {
                this.setData({
                    memberGoodsList: resp.data.slice(0, 10)
                })
            }
        } else {
            this.setData({
                showTips: true,
                content: resp.msg
            })
        }

        wx.hideLoading()
    },

    toBuyCityCard() {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        vzNavigateTo({
            url: '/pages/cityCard/cityCardPurchase',
        })
    },

    toExchangeCityCard() {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        vzNavigateTo({
            url: '/pages/cityCard/cityCardMemberCode',
        })
    },
    toCityCardStore() {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        vzNavigateTo({
            url: '/pages/cityCard/memberStore',
        })
    },
    toCityCardGoods() {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        vzNavigateTo({
            url: '/pages/cityCard/memberStoreGoods',
        })
    },
    toCityCardCoupon() {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        vzNavigateTo({
            url: '/pages/cityCard/memberStoreCoupon',
        })
    },

    // onReachBottom: function () {
    //     this.GetCityMemberVouchers();
    // },

    toCityCardCouponDetail(e) {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        vzNavigateTo({
            url: '/pages/cityCard/memberCouponDetail?vid=' + e.currentTarget.dataset.vid,
        })
    },

    toStore(e) {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        const { qrcode, vip, telephone } = { ...e.currentTarget.dataset }

        if (vip == 0) {
            this.setData({
                city_kefu_hidden: false,
                cityphone: telephone,
                QrCodeUrl: qrcode
            })
        } else {
            wx.navigateTo({
                url: '/pages/business_detail/business_detail?storeid=' + e.currentTarget.dataset.storeid
            })
        }
    },

    toGoods(e) {
        if (app.globalData.cityExpired) {
            vzNavigateTo({
                url: '/pages/expirePage/expirePage',
            })
            return
        }
        wx.navigateTo({
            url: '/pages/goods/goods_detail/goods_detail?gid=' + e.currentTarget.dataset.goodsid
        })
    },
    // 显示客服弹窗
    bindtap_showkefuwin: function (e) {
        this.setData({ city_kefu_hidden: false })
    },
    // 关闭客服弹窗
    bindtap_close: function (e) {
        this.setData({ city_kefu_hidden: true })
    },
})