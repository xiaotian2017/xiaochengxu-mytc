const app = getApp();
let l = console.log;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const getBuyRecords = (params) => httpClient({ addr: addr.Address.getBuyRecords, data: params });
let _recordLiset;

Page({
    data: {
        pageIndex: 1,
        recordLiset: [],
        isAll: false,
        isNoData: false,
        storeid: 0,
        hid: 0
    },

    onLoad(options) {
        _recordLiset = [];
        this.setData({
            storeid: options.storeid,
            hid: options.hid
        })
        app.getUserInfo(() => {
            this.getBuyRecords(options.storeid, options.hid);
        })
    },

    async getBuyRecords(sid, hid) {

        wx.showNavigationBarLoading();

        let resp = await getBuyRecords({
            openid: app.globalData.userInfo.openId,
            cityid: app.globalData.cityInfoId,
            pageindex: this.data.pageIndex++,
            sid,
            hid
        });

        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        if (!resp.Data.listbuyrecord.length) {
            if (this.data.pageIndex != 2) {
                this.setData({
                    isAll: true
                })
            } else {
                this.setData({
                    isNoData: true
                })
            }
        }

        _recordLiset = [..._recordLiset, ...resp.Data.listbuyrecord]
        this.setData({
            recordLiset: _recordLiset
        })
    },

    onPullDownRefresh() {
        _recordLiset = [];
        this.setData({
            recordLiset: [],
            pageIndex: 1,
            isAll: false,
            isNoData: false
        })
        this.getBuyRecords(this.data.storeid, this.data.hid)
    },

    onReachBottom() {
        if (this.data.isAll) return;
        this.getBuyRecords(this.data.storeid, this.data.hid)
    }

})