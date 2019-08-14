const l = console.log;
const { vzNavigateTo, httpClient, dateFormat, GetDateTime } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();

const getHalfCardBuySuccessMain = (cityid, hpid) => httpClient({ addr: addr.Address.getHalfCardBuySuccessMain, data: { cityid, hpid } });
Page({
    data: {
        halfService: null,
        storeInfo: null,
        halfPR: null,
        orderTime: ''
    },
    onLoad(options) {
        app.getUserInfo(() => {
            this.getHalfCardBuySuccessMain(options.hpid);
        })
    },
    async getHalfCardBuySuccessMain(hpid) {
        let formaterDate = "yyyy-MM-dd hh:mm";
        wx.showNavigationBarLoading();
        let resp = await getHalfCardBuySuccessMain(app.globalData.cityInfoId, hpid);
        wx.hideNavigationBarLoading();
        this.setData({
            halfService: resp.Data.mainmodel.HalfService,
            storeInfo: resp.Data.mainmodel.StoreInfo,
            halfPR: resp.Data.mainmodel.HalfPR,
            originalPrice: (resp.Data.mainmodel.HalfService.OriginalPrice * 1000 / 100000).toFixed(2),
            orderTime: dateFormat(formaterDate, new Date(GetDateTime(resp.Data.mainmodel.HalfPR.CreateDate)))
        })
        l(resp);
    },
    makePhone(e) {
        let telnum = e.currentTarget.dataset.telnum;
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.makePhoneCall({
            phoneNumber: telnum
        })
    }
})