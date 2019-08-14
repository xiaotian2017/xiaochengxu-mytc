
let addr = require("../../utils/addr.js");
let { vzNavigateTo, httpClient, dateFormat, GetDateTime } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');

const getRedPackDetail = (params) => httpClient({ addr: addr.Address.GetRedPackDetail, data: params });
let _recordList;
Page({
    data: {
        recordList: [],
        totalCount: 0,
        countCurrent: 0,
        displayAmount: 0,
        rid: 0,
        pageindex: 1,
        isLoadAll: false
    },
    onLoad(options) {
        _recordList = [];
        this.setData({
            totalCount: options.totalCount,
            displayAmount: options.displayAmount,
            rid: options.rid
        })
        this.getRedPackDetail();
    },
    async getRedPackDetail() {
        wx.showLoading({
            title: '加载中...'
        })
        let resp = await getRedPackDetail({
            rid: this.data.rid,
            pageindex: this.data.pageindex++
        })
        if (resp.Data.listredbagdetail.length == 0) {
            this.setData({
                isLoadAll: true
            })
        }
        wx.hideLoading();
        wx.stopPullDownRefresh();
        _recordList = [..._recordList, ...resp.Data.listredbagdetail];
        var formaterDate = "MM-dd hh:mm";

        _recordList.forEach((item, idx) => {
            _recordList[idx].DrawDateTime = dateFormat(formaterDate, new Date(GetDateTime(item.DrawDateTime)))
        });

        this.setData({
            recordList: _recordList
        })
    },

    onPullDownRefresh() {
        _recordList = [];
        this.setData({
            recordList: [],
            pageindex: 1,
            isLoadAll: false
        })
        this.getRedPackDetail();
    },
    onReachBottom() {
        if (this.data.isLoadAll && this.data.pageindex != 1) return;

        this.getRedPackDetail();
    }
})