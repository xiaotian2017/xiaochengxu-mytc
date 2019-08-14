let regeneratorRuntime = require('../../../utils/runtime')
let { httpClient } = require('../../../utils/util')
let { HOST } = require('../../../utils/addr')
const util = require("../../../utils/util.js")

let app = getApp()

let sendGift = (data) => httpClient({
    host: HOST,
    addr: 'vote/Votegiftorder',
    data
})

let prefixPrice = (price) => {
    return ((price * 10000)/10000).toFixed(2)
}

Page({
    data:{
        init:false,
        total: '',
        content:'',
        showTips: false
    },
    onLoad(options){
        this.voteId = options.voteId
        this.participantId = options.participantId
        this.resource = options.from
        app.getUserInfo(() => {
            this.init().then(() => {
                this.setData({
                    init: true
                })
            })
        })
    },
    async init() {
        try {
            var gift = wx.getStorageSync('gift')
            gift.forEach((item) => {
                item.Count = 1
            })
            this.setData({
                gift
            },() => {
                this.calcTotalPrice()
            })
        } catch (e) {
            console.log(e)
        }
    },
    // 礼物减
    giftMinus(e) {
        const index = e.currentTarget.dataset.index
        let {Count} = {...this.data.gift[index]}
        if(Count <= 1){
            this.setData({
                content:'亲，您是真心在送礼物？',
                showTips: true
            })
            return
        }else {
            --Count
        }
        this.setData({
            [`gift[${index}].Count`]:Count
        }, () => {
            this.calcTotalPrice()
        })
    },
    // 礼物加
    giftAdd(e){
        const index = e.currentTarget.dataset.index
        let {Count} = {...this.data.gift[index]}
        ++Count
        this.setData({
            [`gift[${index}].Count`]:Count
        }, () => {
            this.calcTotalPrice()
        })
    },
    // 计算价格
    calcTotalPrice() {
        let {gift} = {...this.data}
        let total = gift.reduce((prev,cur) => {
            return prev += cur.Count * cur.GiftPrice
        }, 0)
        this.setData({
            total: prefixPrice(total)
        })
    },
    // 下单请求
    async payOrder() {
        let gift = this.data.gift.map((item) => {
            return {
                Giftid: item.Id,
                Count: item.Count
            }
        })
        let res = await sendGift({
            cityid:app.globalData.cityInfoId,
            openid:app.globalData.userInfo.openId,
            appid:app.globalData.appid,
            pid:this.participantId,
            gift
        })
        if(res.Success){
            this.payCallBack(res.Data.orderid)
        }
    },
    // 支付回调
    payCallBack(data) {
       try{
            let that = this;
            wx.showLoading()
            util.PayOrder(data, {
                openId: app.globalData.userInfo.openId
            }, {
                failed(res){
                    console.log(res)
                    wx.hideLoading()
                    wx.showToast({
                        title: '已取消付款',
                        duration: 2000
                    })
                    return
                },
                success(res){
                    wx.hideLoading()
                    if(res == "wxpay"){
                    }else if(res == "success") {
                        wx.showToast({
                            title: '支付成功 !',
                            icon: 'success',
                            duration: 1000
                        })
                        setTimeout(() => {
                            if(that.resource == 'dtl') {
                                wx.redirectTo({
                                    url: `/pages/vote/voteDetail/voteDetail?voteId=${that.voteId}&participantId=${that.participantId}&currentList=1`
                                })
                            }else if(that.resource == 'mine') {
                                console.log(2)
                                wx.redirectTo({
                                    url: `/pages/vote/voteActivity/voteActivity?voteId=${that.voteId}&currentPage=3&&currentList=1`
                                })
                            }
                        },1500)
                    }
                }
            })
       }catch(err) {
           console.log(err)
       }
    }
})