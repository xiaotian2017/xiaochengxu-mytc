
let l = console.log;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const app = getApp();
var _host = addr.HOST;
// 记得放addr
const GetMemberConfigs = (params) => httpClient({ host: _host, addr: 'IBaseData/GetMemberConfigs', data: params });
const GetMepaymember = (params) => httpClient({ addr: addr.Address.PayMemberOrder, data: params, method: 'POST' });
const GetUserMember = (params) => httpClient({ host: _host, addr: 'IBaseData/GetUserMember', data: params });

Page({
    data: {
        cityCardListArray: [],
        userInfo: null,
        chooseCardIdx: 0,
        payMoney: 0,
        memberuser: null
    },
    onLoad(options) {
        this.setData({

        })

        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId
            this.openid = app.globalData.userInfo.openId
            this.setData({
                userInfo: app.globalData.userInfo
            })
            this.GetMemberConfigs()
            this.GetUserMember()
        })
    },
    chooseCityCard(e) {
        this.setData({
            chooseCardIdx: e.currentTarget.dataset.idx
        })

    },
    onShareAppMessage() {
        var path = addr.getCurrentPageUrlWithArgs()
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
    async GetMemberConfigs() {

        let resp = await GetMemberConfigs({
            CityInfoId: this.cityid,
            OpenId: this.openid
        });
        if (resp.code) {
            this.setData({
                cityCardListArray: resp.data.config || [],
                isNew: resp.data.isNew
            })
        } else {
            this.setData({
                showTips: true,
                content: resp.msg
            })
        }
    },


    async GetUserMember() {
        let resp = await GetUserMember({
            OpenId: this.openid,
            CityInfoId: this.cityid
        })

        if (resp.data) {
            resp.data.EndDate = resp.data.EndDate.substring(0, 11)
            console.log(resp.data.EndDate)
            this.setData({
                memberuser: resp.data
            })
        }
    },

    async payByWx() {

        var reurl = '/' + addr.getCurrentPageUrlWithArgs()

        if (!app.checkphonewithurl(reurl)) {
            return
        }
        let resp = await GetMepaymember({
            cityInfoId: Number(app.globalData.cityInfoId),
            openid: String(app.globalData.userInfo.openId),
            configid: this.data.cityCardListArray[this.data.chooseCardIdx].id,
            appid: app.globalData.appid
        })

        if (!resp.success) {
            wx.showModal({
                title: '提示',
                content: resp.msg,
                showCancel: false
            })
            return;
        }

        //付款成功后回调
        let payRefun = (state = false) => {
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
                duration: 1000
            })
            setTimeout(() => {
                wx.redirectTo({
                    url: "/pages/cityCard/cityCardIndex",
                })
            }, 1000)

        }
        let param = {
            openId: app.globalData.userInfo.openId
        }
        wx.showLoading();
        util.PayOrder(resp.data, param, {
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
})
