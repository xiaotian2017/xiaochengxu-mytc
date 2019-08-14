let { httpClient } = require("../../utils/util");
let { HOST } = require("../../utils/addr");
let host = HOST;
const regeneratorRuntime = require('../../utils/runtime');
let loadingBehavior = require('../Behavior/loadingBehavior');
let getList = ({ addr, data }) => httpClient({ host, addr, data });
let app = getApp()

module.exports = Behavior({
    behaviors: [loadingBehavior],
    properties: {
        currentNav: {
            type: Number,
            observer: 'switchLoadData'
        }
    },
    ready() {
        app.getUserInfo(() => {
            this.setData({
                cityInfoId: app.globalData.cityInfoId,
                openId: app.globalData.userInfo.openId,
                areaCode: app.globalData.areaCode,
                pointX: app.globalData.userlat,
                pointY: app.globalData.userlng
            })
        })
    },
    data: {
        urls: {}, //url对象集合
        couponState: false
    },
    methods: {
        getParam(types) { //获取参数
            let that = this,
                url;
            let { openId, cityInfoId, areaCode, pointX, pointY } = { ...that.data }
            switch (types) {
                case 'post': //post便民信息
                    url = {
                        addr: 'apiQuery/getpushpost',
                        data: {
                            areacode: areaCode,
                            pageIndex: 1,
                            PageSize: 10
                        }
                    }           
                    break;
                case 'headlines': //headlines本地头条
                    url = {
                        addr: 'IBaseData/GetHeadlinesList',
                        data: {
                            cityid: cityInfoId,
                            openid: openId,
                            pageIndex: 1,
                            pageSize: 10,
                            headtype: 0
                        }
                    }
                    break;
                case 'New': //New新入商家
                    url = {
                        addr: '/IBaseData/GetRecommendStore',
                        data: {
                            cityInfoId: cityInfoId,
                            pageIndex: 1,
                            sortType: 'new',
                            pointX: pointX,
                            pointY: pointY
                        }
                    }
                    break;
                case 'store': //推荐商家
                    url = {
                        addr: '/IBaseData/GetRecommendStore',
                        data: {
                            cityInfoId: cityInfoId,
                            pageIndex: 1,
                            sortType: 'default',
                            pointX: pointX,
                            pointY: pointY
                        }
                    }
                    break;
                case 'aggregate': //商家动态
                    url = {
                        addr: '/IBaseData/GetStoreStrategyList',
                        data: {
                            cityid: cityInfoId,
                            openid: openId,
                            pageIndex: 1
                        }
                    }
                    break;
                case 'setlike': //setlike爱心价
                    url = {
                        addr: 'IBaseData/GetLoveList',
                        data: {
                            cityid: cityInfoId,
                            sfrom: 'i',
                            pageIndex: 1,
                            pageSize: 10
                        }
                    }
                    break;
                case 'coupon': //coupon抢优惠
                    url = {
                        addr: 'actapi/GetIndexRecommend',
                        data: {
                            cityid: cityInfoId
                        }
                    }

                    break;
                case 'tuan': //coupon拼团
                    url = {
                        addr: 'IBaseData/GetGroupList',
                        data: {
                            cityid: cityInfoId,
                            searchtype: -1,
                            sfrom: 'i',
                            pageIndex: 1,
                            storetype: 0,
                            sorttype: '',
                            pointX: pointX,
                            pointY: pointY,
                            pagesize: 10,
                            newSearchType: 0,
                            isativity: 0

                        }
                    }
                    break;
                case 'bargain': //bargain减价
                    url = {
                        addr: 'IBaseData/getcitybargain_xcx',
                        data: {
                            cityid: cityInfoId,
                            sfrom: 'i', //从首页进
                            pageIndex: 1,
                            pageSize: 10
                        }
                    }
                    break;
                case 'discount': //discount同城卡
                    url = {
                        addr: 'IBaseData/GetHalfCardList',
                        data: {
                            cityid: cityInfoId,
                            openid: openId
                        }
                    }

            }

            return url
        },
        async loadDataRequest() { // 发起请求
            let that = this, data, url;
            let { currentNav, cityNavList, urls } = { ...that.data };
            let types = cityNavList[currentNav].Type
            if (types == 'coupon') {
                if (this.data.coupon) {
                    this.getDataAll()
                    return
                }
            }
            let ntype = urls[types]
            if (Object.is(ntype, undefined)) {
                url = that.getParam(types);
                data = await getList(
                    url
                )
                that.setData({
                    ['urls.' + types]: url
                })
            } else {
                data = await getList(
                    ntype
                )
            }
            if (data.Success || 1 == data.isok) {
                return data
            } else {
                that.getDataDone()
                that.getDataError()
            }
        },
        loadData() { //处理请求

            let that = this,
                contentList, type, pageIndex;
            let {
                isLoading,
                loadingAll,
                currentNav,
                cityNavList,
                urls } = { ...that.data }
                
            if (!!isLoading[currentNav] && !loadingAll[currentNav]) {
                that.gettingData()
                type = cityNavList[currentNav].Type;              
                if (wx.getStorageSync('isFresh') == 1) {
                    if(urls[type].data.pageIndex) {
                        urls[type].data.pageIndex = 1
                    }                                                   
                }
                that.loadDataRequest(currentNav, cityNavList, urls).then((res) => {
                    let data = res.Data;
                    switch (type) {
                        case 'post':
                            contentList = res.postlist
                            break;
                        case 'headlines':
                            contentList = data.listheadline
                            break;
                        case 'New':
                            contentList = data.StoreList
                            break;
                        case 'store':
                            contentList = data.StoreList
                            break;
                        case 'aggregate':
                            contentList = data.liststrategy
                            break;
                        case 'setlike':
                            contentList = data.lovelist
                            break;
                        case 'coupon':
                            contentList = data.list
                            that.setData({
                                couponState: true
                            })
                            break;
                        case 'tuan':
                            contentList = data.data
                            break;
                        case 'bargain':
                            contentList = data.ItemList
                            break;
                        case 'discount':
                            contentList = data.listhalfcard
                    }
                    if (null == contentList) {
                        that.getDataAll()
                        that.getDataDone()
                    }
                    else {
                        if (contentList.length > 0) {
                            if (contentList.length < 10) {
                                that.getDataAll()
                            } else {
                                let urlsData = that.data.urls[type].data
                                pageIndex = urlsData.pageIndex;
                                ++pageIndex;
                                that.setData({
                                    ['urls.' + type + '.data.pageIndex']: pageIndex
                                })
                            }
                            that.setData({
                                [type]: contentList
                            })

                        } else {
                            that.getDataAll()
                        }
                        that.getDataDone()

                    }

                }).catch(() => {
                    that.getDataDone()
                })
            }
        },
        switchLoadData() {
            let that = this
            let { currentNav, cityNavList } = { ...that.data }
            let type = cityNavList[currentNav].Type;
            if (Object.is(that.data[type], undefined)) {     
                that.loadData()
            }
        }
    }
})