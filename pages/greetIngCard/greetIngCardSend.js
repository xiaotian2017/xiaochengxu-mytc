var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
const app = getApp();
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
// let patter = /^0+|^\s+|^-/;

// 获取红包费率
let getBlessAddModel = (cityid, openid) => httpClient({ addr: addr.Address.GetBlessAddModel, data: { cityid, openid } });
let addBless = (params) => httpClient({ method: 'POST', addr: addr.Address.AddBless, data: params });
let cityid, openid, addBlessParamsObj;
// 贺卡模板
let cardTempList = [{
    cardImg: 'https://j.vzan.cc/content/city/cardtype/img/card-type05.jpg',
    cardName: '元宵',
    cardId: 1107
},
{
    cardImg: 'https://j.vzan.cc/content/city/cards/newyear/img/newyear18.jpg',
    cardName: '新年',
    cardId: 1106
},
{
    cardImg: 'https://i.vzan.cc/image/jpg/2018/5/8/145708a7669ba03be84e55bfd896555115e061.jpg',
    cardName: '母亲节',
    cardId: 1112
},
{
    cardImg: 'https://i.vzan.cc/image/jpg/2018/5/28/154325d268e42a10cc445a9c1210869ffbe11d.jpg',
    cardName: '儿童节',
    cardId: 1113
}
].reverse();
Page({
    data: {
        isShowRed: false,
        redMoney: '',
        redNumber: '',
        redAmount: 0,
        redAmountConfirmText: '非必填',
        payrate: 0,
        cardTempList,
        cardId: 0,  // 0为选择  从贺卡页点击我也要发送祝福进来直接改这个设置默认模板
    },

    onLoad() {
        app.getUserInfo(() => {
            cityid = app.globalData.cityInfoId;
            openid = app.globalData.userInfo.openId;
            addBlessParamsObj = {
                OpenId: app.globalData.userInfo.openId,
                cityid: app.globalData.cityInfoId,
                appid: app.globalData.appid,
                redamount: 0,
                totalcount: 0
            }
            this.getBlessAddModel();
        })
    },

    // 获取红包费率
    async getBlessAddModel() {
        let resp = await getBlessAddModel(cityid, openid);
        if (resp.Success) {
            this.setData({
                payrate: resp.Data.payrate
            })
        }
    },

    getToNickName(e) {
        this.data.toNikeName = e.detail.value.trim();
    },

    getFromNickName(e) {
        this.data.fromNikeName = e.detail.value.trim();
    },

    getRedMoney(e) {
        // if (patter.test(e.detail.value)) {
        //     this.setData({
        //         redMoney: ''
        //     })
        //     return;
        // }
        this.setData({
            redMoney: e.detail.value,
            redAmount: (e.detail.value * (1 + parseFloat(this.data.payrate))).toFixed(2)
        })
    },

    getRedNumber(e) {
        // if (patter.test(e.detail.value)) {
        //     this.setData({
        //         redNumber: ''
        //     })
        //     return;
        // }

        this.setData({
            redNumber: e.detail.value
        })
    },
    // 发送祝福
    sendGreetingCard() {
        if (this.isEmpty(this.data.toNikeName)) {
            wx.showModal({
                title: '提示',
                content: '请输入您想发送祝福的昵称！',
                showCancel: false
            })
            return;
        } else {
            addBlessParamsObj.ToNikeName = this.data.toNikeName;
        }

        if (this.isEmpty(this.data.fromNikeName)) {
            wx.showModal({
                title: '提示',
                content: '您的昵称不能为空！',
                showCancel: false
            })
            return;
        } else {
            addBlessParamsObj.FromNikeName = this.data.fromNikeName;
        }

        if (this.data.cardId == 0) {
            wx.showModal({
                title: '提示',
                content: '请选择模板！',
                showCancel: false
            })
            return;
        }

        console.log(addBlessParamsObj);

        this.addBless();
    },

    toMyCard() {
        wx.redirectTo({
            url: '/pages/greetIngCard/greetIngCardList'
        })
    },

    // 转发
    onShareAppMessage() {
        var that = this
        var path = addr.getCurrentPageUrlWithArgs();
        console.log(path);
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        return {
            title: '小小的贺卡，满满的祝福，来送上您的祝福吧！！',
            path: path
        }
    },
    // 添加祝福
    async addBless() {
        let that = this;
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
                vzNavigateTo({
                    url: '/pages/greetIngCard/greetIngCard',
                    query: {
                        bid: resp.Data.id,
                        cardId: that.data.cardId
                    }
                })
            }, 1000)
        }

        wx.showLoading({
            title: '祝福生成中...'
        });

        let resp = await addBless(addBlessParamsObj);
        wx.hideLoading();
        if (resp.Success === true) {
            let orderid = resp.Data.orderid;
            this.setData({
                bid: resp.Data.id
            })
            if (resp.Data.orderid && resp.Data.orderid != 0) {
                // 走支付
                util.PayOrder(orderid, { openId: openid }, {
                    failed: function (res) {
                        wx.hideLoading();
                        payRefun();
                    },
                    success: function (res) {
                        wx.hideLoading();
                        if (res == "wxpay") {
                        } else if (res == "success") {
                            payRefun(1)
                        }
                    }
                })
            } else {
                // 无需支付            
                vzNavigateTo({
                    url: '/pages/greetIngCard/greetIngCard',
                    query: {
                        bid: resp.Data.id,
                        cardId: this.data.cardId
                    }
                })
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '贺卡生成失败，请稍后再试！',
                showCancel: false
            })
        }
    },
    isEmpty(param) {
        if (!param) {
            return true;
        } else {
            return false;
        }
    },

    redLayerChange() {
        if (!this.data.isShowRed) {
            this.setData({
                isShowRed: true
            })
        } else {
            this.setData({
                isShowRed: false,
                redAmountConfirmText: '非必填'
            })
            addBlessParamsObj.redamount = 0;
            addBlessParamsObj.totalcount = 0;
        }
    },

    redBtn() {
        if (!(this.data.redMoney.trim())) {
            wx.showModal({
                title: '提示',
                content: '请先输入红包金额！',
                showCancel: false
            })
            return;
        }

        if (!(this.data.redNumber.trim())) {
            wx.showModal({
                title: '提示',
                content: '请先输入红包个数！',
                showCancel: false
            })
            return;
        }

        if ((this.data.redAmount * 100 / this.data.redNumber) < 1) {
            wx.showModal({
                title: '提示',
                content: '每个红包金额不能少于1分钱！',
                showCancel: false
            })
            return;
        }

        addBlessParamsObj.redamount = parseFloat(this.data.redMoney);
        addBlessParamsObj.totalcount = parseFloat(this.data.redNumber);
        this.setData({
            redAmountConfirmText: this.data.redAmount,
            isShowRed: false
        })
    },
    // 模板选择
    chooseCardTemp(e) {
        var selVal = e.currentTarget.dataset.cardid;
        this.setData({
            cardId: selVal
        })
        addBlessParamsObj.gctype = selVal
    }
})