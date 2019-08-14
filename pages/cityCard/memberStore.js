const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
var _host = addr.HOST;
// 这些接口记得放到 addr.js

const GetCityMemberStores = (params) => httpClient({ host: _host, addr: 'IBaseData/GetCityMemberStores', data: params });

Page({
    data: {
        isShowOptions: false,
        optionidx: 1,
        searchKeyWords: '',
        pageindex: 0,
        memberStoreList: [],
        city_kefu_hidden: true,
        cityphone: '',
        QrCodeUrl: ''
    },
    onLoad() {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId
            this.openid = app.globalData.userInfo.openId
            this.GetCityMemberStores()
        })
    },
    async GetCityMemberStores() {
        wx.showLoading()
        let resp = await GetCityMemberStores({
            pageIndex: ++this.data.pageindex,
            OpenId: this.openid,
            CityInfoId: this.cityid,
            PageSize: 20
        })
        if (resp.code) {
            if (resp.data && resp.data.length) {
                this.setData({
                    memberStoreList: [...this.data.memberStoreList, ...resp.data]
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
    // 搜索
    async goingSearch() {
        this.setData({
            memberStoreList: []
        })
        this.GetCityMemberStores();
    },
    // 获取搜索关键字
    getSearchKeyWords(e) {
        this.setData({
            searchKeyWords: e.detail.value
        })
        console.log(this.data.searchKeyWords)
    },
    showOptions() {
        this.setData({
            isShowOptions: !this.data.isShowOptions
        })
    },
    getOptions(e) {
        let _optionidx = e.currentTarget.dataset.optionidx
        this.setData({
            optionidx: _optionidx,
            isShowOptions: false,
            memberStoreList: []
        })

        this.GetCityMemberStores();
    },

    onReachBottom: function () {
        this.GetCityMemberStores();
    },
    toStore(e) {
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
    // 显示客服弹窗
    bindtap_showkefuwin: function (e) {
        this.setData({ city_kefu_hidden: false })
    },
    // 关闭客服弹窗
    bindtap_close: function (e) {
        this.setData({ city_kefu_hidden: true })
    },
    // goStoreDtl(e) {
    //     let that = this, phone, qrcode, contactInfo = {};
    //     const { id, vip } = { ...e.currentTarget.dataset }
    //     if (vip == 0) {// 未开通vip店铺
    //         let tip = '截图扫码，微信访问';
    //         ({ phone, qrcode } = { ...e.currentTarget.dataset });
    //         //如果是店主，显示城主二维码
    //         if (phone == app.globalData.userInfo.TelePhone) {
    //             qrcode = app.globalData.cityqrcode
    //             phone = app.globalData.cityphone
    //             tip = '扫一扫二维码,联系同城客服升级店铺，即可在小程序访问详情'
    //         }
    //         contactInfo['phone'] = phone;
    //         contactInfo['qrcode'] = qrcode;
    //         contactInfo['tip'] = tip

    //         that.triggerEvent('getContactInfo', {
    //             contactInfo,
    //             open: true,
    //             hide: true
    //         })
    //     }
    //     else {
    //         wx.navigateTo({
    //             url: '/pages/business_detail/business_detail?storeid=' + id
    //         })
    //     }
    // }
})