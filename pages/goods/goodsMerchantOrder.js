const app = getApp();
const addr = require("../../utils/addr.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
var _host = addr.HOST;
const getMerchantOrder = (paramsObj) => httpClient({ addr: addr.Address.GetMerchantOrder, data: paramsObj });
// 获取配送信息
const getDistributionInfo = (paramsObj) => httpClient({ addr: addr.Address.GetDistributionInfo, data: paramsObj });
// 立即发货或配送完成
const confirmDistribute = (paramsObj) => httpClient({ addr: addr.Address.ConfirmDistribute, data: paramsObj });

let refund_oper = (paramsObj) => httpClient({ host: _host, addr: 'IBaseData/refund_oper', data: paramsObj });

let _ordersListArr, ordersListParams = null;
Page({
    data: {
        tabIdx: 0,
        isHasData: false,
        isLoadAll: false,
        ordersListArr: [],
        isShowDispatchingPanel: false,
        distributionInfo: null,
        orderState: '',
        orderId: '',
        searchWord: ''
    },
    onLoad(options) {
        app.getUserInfo(() => {
            _ordersListArr = [];
            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            ordersListParams = {
                pageIndex: 1,
                storeid: options.storeid,
                state: 99,
                cityid: app.globalData.cityInfoId,
                openid: app.globalData.userInfo.openId,
                query: ''
            }

            this.getMerchantOrder();
        })
        wx.setNavigationBarTitle({
            title: "商家订单"
        })
    },

    changeTab(e) {
        let tabIdx = parseInt(e.currentTarget.dataset.idx);
        if (!this.data.searchWord.trim()) {
            ordersListParams.query = '';
        }
        this.setData({
            tabIdx,
            ordersListArr: [],
            isLoadAll: false,
            isHasData: false
        })
        _ordersListArr = [];
        ordersListParams.pageIndex = 1;

        switch (tabIdx) {
            case 0:
                ordersListParams.state = 99;
                break;
            case 1:
                ordersListParams.state = 0;
                break;
            case 2:
                ordersListParams.state = 3;
                break;
            case 3:
                ordersListParams.state = 5;
                break;
            case 4:
                ordersListParams.state = -2;
        }

        this.getMerchantOrder();
    },

    // 获取订单列表
    async getMerchantOrder() {
        if (this.data.isLoadAll) { return }
        wx.showLoading({
            title: '加载中...'
        });

        let resp = await getMerchantOrder(ordersListParams);
        wx.hideLoading();
        wx.stopPullDownRefresh();
        let listOrder = resp.Data.listOrder;
        if (listOrder.length == 0) {
            ordersListParams.pageIndex == 1 ? this.setData({
                isHasData: true
            }) : this.setData({
                isLoadAll: true
            })
        }

        _ordersListArr = [..._ordersListArr, ...listOrder];
        this.setData({
            ordersListArr: _ordersListArr
        })

    },
    onReachBottom() {
        ordersListParams.pageIndex = ++ordersListParams.pageIndex;
        this.getMerchantOrder();
    },
    // 立即发货 或 查看送货地址 或已收货查看地址
    async deliveryGoods(e) {
        let that = this
        let state = e.currentTarget.dataset.state;
        let resp = await getDistributionInfo({
            cityid: this.cityid,
            openid: this.openid,
            id: e.currentTarget.dataset.id
        });

        // if (!resp.Success) {
        //     wx.showModal({
        //         title: '提示',
        //         content: '数据异常，点击确定重新刷新页面',
        //         showCancel: false,
        //         success(res) {
        //             if (res.confirm) {
        //                 that.setData({
        //                     ordersListArr: [],
        //                     isLoadAll: false,
        //                     isHasData: false
        //                 })
        //                 _ordersListArr = [];
        //                 ordersListParams.pageIndex = 1;
        //                 that.getMerchantOrder();
        //             }
        //         }
        //     })
        //     return
        // }

        if (state == 3 || state == 4 || state == -4) {
            this.setData({
                orderId: e.currentTarget.dataset.id,
                orderState: e.currentTarget.dataset.state
            })
        }
        this.setData({
            isShowDispatchingPanel: true,
            distributionInfo: resp.Data.DistributionInfo
        })
    },
    // 隐藏发货面板
    hideDisPatchingPanel() {
        this.setData({
            isShowDispatchingPanel: false
        })
    },
    // 确认立即发货或者配送完成
    confirmDistribute(e) {
        let that = this;
        if (e.currentTarget.dataset.id) {
            this.setData({
                orderId: e.currentTarget.dataset.id,
                orderState: e.currentTarget.dataset.state,
            })
        }

        wx.showModal({
            title: '提示',
            content: this.data.orderState == 3 ? '确认立即发货吗?' : '请向配送人员确认是否配送完成未配送完成请勿点击确认,否则会降低商家信誉度!',
            async success(res) {
                if (res.confirm) {
                    let resp = await confirmDistribute({
                        cityid: that.cityid,
                        openid: that.openid,
                        id: that.data.orderId,
                        state: e.currentTarget.dataset.state ? e.currentTarget.dataset.state : 3
                    });
                    if (resp.code == 1) {
                        wx.showToast({
                            title: resp.msg
                        })

                        setTimeout(() => {
                            that.setData({
                                ordersListArr: [],
                                isLoadAll: false,
                                isHasData: false,
                                isShowDispatchingPanel: false
                            })
                            _ordersListArr = [];
                            ordersListParams.pageIndex = 1;
                            that.getMerchantOrder();
                        }, 500)

                    } else {
                        wx.showModal({
                            title: '提示',
                            content: resp.msg,
                            showCancel: false
                        })
                        setTimeout(() => {
                            that.setData({
                                ordersListArr: [],
                                isLoadAll: false,
                                isHasData: false,
                                isShowDispatchingPanel: false
                            })
                            _ordersListArr = [];
                            ordersListParams.pageIndex = 1;
                            that.getMerchantOrder();
                        }, 500)
                    }
                }
            }
        })
    },
    // 订单搜索
    searchOrder() {
        ordersListParams.query = this.data.searchWord;
        this.setData({
            ordersListArr: [],
            isLoadAll: false,
            isHasData: false,
            tabIdx: 0
        })
        _ordersListArr = [];
        ordersListParams.state = 99;
        ordersListParams.pageIndex = 1;
        this.getMerchantOrder();
    },
    getSearchWord(e) {
        this.setData({
            searchWord: e.detail.value
        })
    },
    onPullDownRefresh() {

        this.setData({
            ordersListArr: [],
            isLoadAll: false,
            isHasData: false
        })
        _ordersListArr = [];
        ordersListParams.pageIndex = 1;

        this.getMerchantOrder();
    },
    refundComfirm(e) {
        let that = this
        let state = e.currentTarget.dataset.state
        wx.showModal({
            title: '提示',
            content: state == '-2' ? '确认接受此订单的退款申请？' : '确认拒绝此订单的退款申请？',
            async success(res) {
                if (res.confirm) {
                    let resp = await refund_oper({
                        openid: that.openid,
                        oid: e.currentTarget.dataset.id,
                        op_state: state
                    });
                    if (resp.code == 1) {
                        wx.showToast({
                            title: resp.msg
                        })
                        setTimeout(() => {
                            that.setData({
                                ordersListArr: [],
                                isLoadAll: false,
                                isHasData: false
                            })
                            ordersListParams.pageIndex = 1;
                            _ordersListArr = [];
                            that.getMerchantOrder()
                        }, 1000)

                    } else {
                        wx.showModal({
                            title: '提示',
                            content: resp.msg,
                        })
                    }
                }
            }
        })
    }

})