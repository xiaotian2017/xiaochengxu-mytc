const app = getApp();
let l = console.log;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const getStoreDisSvcMgrList = (params) => httpClient({ addr: addr.Address.getStoreDisSvcMgrList, data: params });
const deleteHalfCard = (params) => httpClient({ addr: addr.Address.deleteHalfCard, data: params });

let _mgrList;

Page({
    data: {
        storeid: '',
        pageIndex: 1,
        cityCardMgrList: [],
        isAll: false, // 数据加载完或没有数据
        isNoData: false
    },
    onLoad(options) {
        _mgrList = [];
        this.setData({
            storeid: options.storeid
        })

        app.getUserInfo(() => {
            this.getStoreDisSvcMgrList(options.storeid);
        })
    },

    onPullDownRefresh() {
        _mgrList = [];
        this.setData({
            cityCardMgrList: [],
            pageIndex: 1,
            isAll: false,
            isNoData: false
        })
        this.getStoreDisSvcMgrList(this.data.storeid)
    },

    onReachBottom() {
        if (this.data.isAll) return;
        this.getStoreDisSvcMgrList(this.data.storeid)
    },

    async getStoreDisSvcMgrList(storeid) {
        wx.showNavigationBarLoading();
        let resp = await getStoreDisSvcMgrList({
            storeid,
            pageIndex: this.data.pageIndex++,
            openId: app.globalData.userInfo.openId
        });
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        if (!resp.Data.data.length) {
            console.log(this.data.pageIndex)
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

        _mgrList = [..._mgrList, ...resp.Data.data]
        this.setData({
            cityCardMgrList: _mgrList
        })
    },
    // 删除同城卡
    confirmDeleteHalfCard(e) {
        let id = e.currentTarget.dataset.id;
        let that = this;
        wx.showModal({
            title: '提示',
            content: '你确定要删除该同城卡折扣优惠服务吗？删除不可恢复,请谨慎操作！',
            success: function (res) {
                if (res.confirm) {
                    that.deleteHalfCard(id);
                } else if (res.cancel) {

                }
            }
        })
    },
    async deleteHalfCard(id) {
        let resp = await deleteHalfCard({
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            hsid: id
        })
        if (resp.Success) {
            wx.showToast({
                title: resp.Message
            })
        } else {
            wx.showToast({
                title: resp.Message
            })
        }
    },


    // 编辑
    toRelease(e) {
        vzNavigateTo({
            url: '/pages/cityCard/cityCardRelease',
            query: {
                releaseId: e.currentTarget.dataset.id,
                storeid: this.data.storeid
            }
        })
    },
    // 添加
    toReleaseDiscountByAddBtn() {
        vzNavigateTo({
            url: '/pages/cityCard/cityCardRelease',
            query: {
                releaseId: 0,
                storeid: this.data.storeid
            }
        })
    },
    // 转到抢优惠
    toDiscount() {
        vzNavigateTo({
            url: '/pages/releaseDiscount/storeDiscount',
            query: {
                storeid: this.data.storeid
            }
        })
    },
    toBuyRecord(e) {
        vzNavigateTo({
            url: '/pages/cityCard/cityCardRecord',
            query: {
                storeid: this.data.storeid,
                hid: e.currentTarget.dataset.id
            }
        })
    }
})