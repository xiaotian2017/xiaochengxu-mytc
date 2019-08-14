const app = getApp();
const addr = require("../../utils/addr.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
// 发布商品列表
const getGoodsList = (paramsObj) => httpClient({ addr: addr.Address.GetMyMgrGoods, data: paramsObj });
const updateGoodSort = (paramsObj) => httpClient({ addr: addr.Address.UpdateGoodSort, data: paramsObj });
const goodIsSell = (paramsObj) => httpClient({ addr: addr.Address.GoodIsSell, data: paramsObj });
const delGoods = (paramsObj) => httpClient({ addr: addr.Address.DelGoods, data: paramsObj });

let _goodsListArr, goodsListParams = null;

Page({
    data: {
        tabArr: ['出售中', '未审核', '已下架', '已删除'],
        tabIdx: 0,
        sgid: '',
        isShowSortLayer: false,
        sortNum: '',
        goodsListArr: [],
        isHasData: false,
        isLoadAll: false
    },
    onLoad(options) {
        let state = parseInt(options.state);
        this.sid = options.storeid;
        app.getUserInfo(() => {
            _goodsListArr = [];
            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            goodsListParams = {
                pageindex: 1,
                sid: options.storeid,
                state,
                cityid: app.globalData.cityInfoId,
                openid: app.globalData.userInfo.openId,
            }

            switch (state) {
                case 0:
                    this.setData({
                        tabIdx: 0
                    });
                    goodsListParams.state = 1;
                    break;
                case 1:
                    this.setData({
                        tabIdx: 1
                    });
                    goodsListParams.state = 0;
                    break;
                case 2:
                    this.setData({
                        tabIdx: 2
                    });
                    goodsListParams.state = -1;
            }

            this.getGoodsList();
        })

        wx.setNavigationBarTitle({
            title: "店铺商品"
        })
    },
    // tab切换
    changeTab(e) {
        let idx = parseInt(e.currentTarget.dataset.idx);
        this.setData({
            tabIdx: idx,
            goodsListArr: [],
            isLoadAll: false,
            isHasData: false
        })
        _goodsListArr = [];
        goodsListParams.pageindex = 1;
        switch (idx) {
            case 0:
                goodsListParams.state = 1;
                break;
            case 1:
                goodsListParams.state = 0;
                break;
            case 2:
                goodsListParams.state = -1;
                break;
            case 3:
                goodsListParams.state = -2;
        }
        this.getGoodsList();
    },
    // 添加
    toGoodsRelease() {
        vzNavigateTo({
            url: "/pages/goods/goodsRelease",
            query: {
                goodsId: 0,
                storeid: this.sid,
                state: 1
            }
        })
    },
    // 编辑
    toEditGoods(e) {
        // vzNavigateTo({
        //     url: "/pages/goods/goodsRelease",
        //     query: {
        //         goodsId: e.currentTarget.dataset.id,
        //         storeid: this.sid,
        //         state: e.currentTarget.dataset.state
        //     }
        // })
        wx.redirectTo({
            url:'/pages/goods/goodsRelease?goodsId='+e.currentTarget.dataset.id+'&storeid='+this.sid+'&state='+e.currentTarget.dataset.state 
        })  
    },
    showSortLayer(e) {
        this.setData({
            isShowSortLayer: true,
            sgid: e.currentTarget.dataset.id
        })
    },
    closeSortLayer() {
        this.setData({
            isShowSortLayer: false
        })
    },
    async confirmSortLayer(e) {
        if (!this.data.sortNum.trim()) {
            wx.showModal({
                title: '提示',
                content: '排序值不能为空',
                showCancel: false
            })
            return;
        }
        let resp = await updateGoodSort({
            cityid: this.cityid,
            openid: this.openid,
            sgid: this.data.sgid,
            sort: this.data.sortNum
        })
        if (resp.code == 1) {
            this.setData({
                isShowSortLayer: false,
                sortNum: '',
            })
            wx.showToast({
                title: resp.msg
            })
            setTimeout(() => {
                this.setData({
                    goodsListArr: []
                })
                goodsListParams.pageindex = 1;
                _goodsListArr = [];
                this.getGoodsList();
            }, 1000)

        } else {
            wx.showModal({
                title: '提示',
                content: resp.msg,
                showCancel: false
            })
        }
    },
    // 获取排序值
    getSort(e) {
        this.setData({
            sortNum: e.detail.value
        })
    },
    // 获取发布商品列表
    async getGoodsList() {
        if (this.data.isLoadAll) { return }
        wx.showLoading({
            title: '加载中...'
        });
        let resp = await getGoodsList(goodsListParams);
        wx.hideLoading();
        wx.stopPullDownRefresh();
        let listgood = resp.Data.listgood;
        if (listgood.length == 0) {
            goodsListParams.pageindex == 1 ? this.setData({
                isHasData: true
            }) : this.setData({
                isLoadAll: true
            })
        }

        _goodsListArr = [..._goodsListArr, ...listgood];
        this.setData({
            goodsListArr: _goodsListArr
        })

    },
    onReachBottom() {
        goodsListParams.pageindex = ++goodsListParams.pageindex;
        this.getGoodsList();
    },
    // 上下架商品
    setGoodIsSell(e) {
        let that = this;
        let { id, issell } = e.currentTarget.dataset;

        wx.showModal({
            title: '提示',
            content: issell == 1 ? '你确定要下架该商品' : '你确定要上架该商品',
            async success(res) {
                if (res.confirm) {
                    let resp = await goodIsSell({
                        cityid: that.cityid,
                        openid: that.openid,
                        isSell: issell == 1 ? 0 : 1,
                        sgid: id
                    });
                    if (resp.code == 1) {
                        wx.showToast({
                            title: resp.msg
                        })
                        setTimeout(() => {
                            that.setData({
                                goodsListArr: []
                            })
                            goodsListParams.pageindex = 1;
                            _goodsListArr = [];
                            that.getGoodsList();
                        }, 500)
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: resp.msg,
                            showCancel: false
                        })
                    }
                }
            }
        })
    },
    // 删除发布商品
    delGoods(e) {
        let that = this;
        wx.showModal({
            title: '提示',
            content: '你确定要删除该商品吗？删除不可恢复,请谨慎操作！',
            async success(res) {
                if (res.confirm) {
                    let resp = await delGoods({
                        cityid: that.cityid,
                        openid: that.openid,
                        gid: e.currentTarget.dataset.id
                    })
                    if (resp.code == 1) {
                        wx.showToast({
                            title: resp.msg
                        })
                        setTimeout(() => {
                            that.setData({
                                goodsListArr: []
                            })
                            goodsListParams.pageindex = 1;
                            _goodsListArr = [];
                            that.getGoodsList();
                        }, 500)

                    } else {
                        wx.showModal({
                            title: '提示',
                            content: resp.msg,
                            showCancel: false
                        })
                    }
                }
            }
        })
    },
    // 销售记录
    toSellRecord(e) {
        vzNavigateTo({
            url: "/pages/goods/goodsRecord",
            query: {
                scoid: e.currentTarget.dataset.id
            }
        })
        // pages/releaseDiscount/buyHistory  scid=
    },
    onPullDownRefresh() {

        this.setData({
            goodsListArr: [],
            isLoadAll: false,
            isHasData: false
        })
        _goodsListArr = [];
        goodsListParams.pageindex = 1;

        this.getGoodsList();
    },
    toGoodsDetail(e) {
        console.log( e.currentTarget.dataset.id)
        vzNavigateTo({
            url: '/pages/goods/goods_detail/goods_detail',
            query: {
                gid: e.currentTarget.dataset.id
            }
        })
    }

})