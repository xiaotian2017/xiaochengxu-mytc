var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
const app = getApp();
let { vzNavigateTo, httpClient } = require("../../utils/util.js");

let getmybeeling = (params) => httpClient({ addr: addr.Address.Getmybeeling, data: params });
let paramsObj = {};
let _cardList;

Page({
    data: {
        pageIndex: 1,
        cardList: [],
        isLoadAll: false,
        avatarUrl: '',
        nickName: '',
        isNoData: false
    },

    onLoad() {
        _cardList = [];
        let cityid, openid;
        app.getUserInfo(() => {
            paramsObj.cityid = app.globalData.cityInfoId;
            paramsObj.openid = app.globalData.userInfo.openId;
            this.getmybeeling();
            this.setData({
                avatarUrl: app.globalData.userInfo.headImgUrl,
                nickName: app.globalData.userInfo.nickName
            })
        })
    },

    async getmybeeling() {
        if (this.data.isLoadAll) return;
        paramsObj.pageIndex = this.data.pageIndex++;
        wx.showLoading({
            title: '加载中...'
        });
        let resp = await getmybeeling(paramsObj);

        if (resp.Data.BeelingList.length == 0) {
            if (paramsObj.pageIndex > 1) {
                this.setData({
                    isLoadAll: true
                })
            } else {
                this.setData({
                    isNoData: true
                })
            }

        }
        wx.hideLoading();
        wx.stopPullDownRefresh();
        _cardList = [..._cardList, ...resp.Data.BeelingList];

        this.setData({
            cardList: _cardList
        })
    },

    onReachBottom() {
        this.getmybeeling();
    },

    toSendCard() {
        wx.redirectTo({
            url: '/pages/greetIngCard/greetIngCardSend'
        })
    },

    toRedDetail(e) {
        let { rid, totalCount, displayAmount } = e.currentTarget.dataset;

        vzNavigateTo({
            url: "/pages/redPackageRecord/redPackageRecord",    
            query: {
                rid,
                totalCount,
                displayAmount
            }
        })
    },
    toCard(e) {
        let { id, cardid } = e.currentTarget.dataset;
        vzNavigateTo({
            url: "/pages/greetIngCard/greetIngCard",
            query: {
                bid: id,
                cardId: cardid
            }
        })
    },
    onPullDownRefresh() {
        _cardList = [];
        this.setData({
            cardList: [],
            pageIndex: 1,
            isLoadAll: false,
            isNoData: false
        })
        this.getmybeeling()
    },
})