
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
var _host = addr.HOST;
// 这些接口记得放到 addr.js

const drawVoucher = (params) => httpClient({ host: _host, addr: 'IBaseData/UserDoDrawVoucher', data: params, method: 'POST', contentType: 'application/json' });
const GetCityMemberVouchers = (params) => httpClient({ host: _host, addr: 'IBaseData/GetCityMemberVouchers', data: params });

Page({
    data: {
        searchKeyWords: '',
        memberCouponList: [],
        pageindex: 0,
    },
    onLoad() {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId
            this.openid = app.globalData.userInfo.openId
            this.areaCode = app.globalData.areaCode;
            this.GetCityMemberVouchers()
        })
    },
    async GetCityMemberVouchers() {
        wx.showLoading()
        let resp = await GetCityMemberVouchers({
            pageIndex: ++this.data.pageindex,
            OpenId: this.openid,
            CityInfoId: this.cityid
        })
        if (resp.code) {
            if (resp.data && resp.data.length) {
                this.setData({
                    memberCouponList: [...this.data.memberCouponList, ...resp.data]
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

    async drawVoucher(e) {
        wx.showLoading()

        let data = await drawVoucher({
            openid: this.openid,
            cityInfoId: this.cityid,
            vid: e.currentTarget.dataset.vid,
        })
        if (data.data) {
            this.setData({
                showTips: true,
                content: '领取成功',
            })
            setTimeout(() => {
                this.setData({
                    pageindex: 0,
                    memberCouponList: []
                })
                this.GetCityMemberVouchers()
            }, 2000)
        } else {
            this.setData({
                showTips: true,
                content: data.msg
            })
        }
        wx.hideLoading()
    },
    onReachBottom: function () {
        this.GetCityMemberVouchers();
    },
    toCityCardCouponDetail(e) {
        vzNavigateTo({
            url: '/pages/cityCard/memberCouponDetail?vid=' + e.currentTarget.dataset.vid,
        })
    },
})