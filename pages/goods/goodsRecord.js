const app = getApp();

let { HOST } = require("../../utils/addr");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let util = require("../../utils/util.js");

//获取核销数据
const getGoodsDataDetail = (params) => httpClient({ addr: HOST + '/IBaseData/GoodsSalesRecord', data: params });

//获取核销列表页
const getPersonList = (params) => httpClient({
    addr: HOST + 'IBaseData/GetSalesRecord', data: params
})


Page({
    data: {
        recordList: [],
        isAll: false,
        isNoData: false
    },
    onLoad(options) {
        app.getUserInfo(() => {
            this.setData({
                scoid: options.scoid,
                pageIndex: 1
            })
            this.getGoodsDataDetail();
            this.getPersonList();
        })
    },
    async getPersonList() {
        wx.showNavigationBarLoading();
        let { recordList, pageIndex } = { ...this.data }
        let res = await getPersonList({
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            pageIndex,
            scoid: this.data.scoid
        });
        let list = res.Data.listgoodorderdetail;
        if (list.length > 0) {
            if (list.length < 10) {
                this.setData({
                    isAll: true
                })
            }
            ++pageIndex;
            recordList = [...recordList, ...list];
            this.setData({
                recordList,
                pageIndex
            })
        } else {
            this.setData({
                isNoData: true
            })
        }
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
    },
    async getGoodsDataDetail() {
        let that = this;
        let res = await getGoodsDataDetail({
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            scoid: this.data.scoid
        })
        if (res.Success) {
            let { BuyNum, GetedCash, ValidNum, Goods: { Inventory, Price } } = { ...res.Data.mainmodel }
            let verifyNum = {
                BuyNum,
                GetedCash,
                Price,
                ValidNum,
                Inventory
            }
            this.setData({
                verifyNum
            })
        }
    },

    onPullDownRefresh() {
        this.setData({
            recordList: [],
            verifyNum: '',
            pageIndex: 1,
            isAll: false,
            isNoData: false
        })
        this.getGoodsDataDetail()
        this.getPersonList()
    },

    onReachBottom() {
        if (this.data.isAll) return;
        this.getPersonList(this.data.scoid)
    },

    goMyEarns() {
        wx.navigateTo({
            url: '/pages/bill/bill'
        })
    },

    call(e) {
        const { phone } = { ...e.currentTarget.dataset }
        try {
            wx.setStorageSync('needloadcustpage', false)
        } catch (e) {
            console.log(e)
        }
        wx.makePhoneCall({
            phoneNumber: phone
        })
    },
})