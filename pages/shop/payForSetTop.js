var addr = require("../../utils/addr.js");
var _host = addr.HOST;
const app = getApp()
const regeneratorRuntime = require('../../utils/runtime');
let { vzNavigateTo, httpClient, PayOrder } = require("../../utils/util.js");
let getpayinfo = (p) => httpClient({ host: _host, addr: 'IBaseData/getpayinfo', data: p });
let addPayOrder = (p) => httpClient({ host: _host, method: 'POST', addr: 'apiQuery/AddPayOrder', data: p });

Page({
    data: {
        radioIdx: null,
        setTopAmount: 0,
        setTopArr: []
    },
    onLoad(options) {
        app.getUserInfo(() => {
            this.cityId = app.globalData.cityInfoId
            this.openId = app.globalData.userInfo.openId
            this.storeid = options.storeId
            this.areaCode = app.globalData.areaCode
            this.getpayinfo()
        })
    },
    async getpayinfo() {
        let resp = await getpayinfo({
            cityid: this.cityId,
            openid: this.openId,
            itemid: this.storeid,
            paytype: 202,
            type: -1
        })
        this.setData({
            setTopArr: resp.Data.listpayconfig
        })
    },
    // 下单
    async addOrder() {
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
            setTimeout(()=>{
                wx.setStorageSync('isFromSetTop', 1)
                wx.navigateBack({
                    delta: 1
                  })
            },1000)
            // setTimeout(() => {
            //     console.log("支付成功")
            //     // 转到贺卡
            //     vzNavigateTo({
            //         url: ' /pages/cutlist/cutlist',
            //         query: {
            //             type: 'goods',
            //             state: 0,
            //         }
            //     })
            // }, 1000)
        }
       var extype = this.data.setTopArr[this.data.radioIdx].ExtendType
        let resp = await addPayOrder({
            cityid: this.cityId,
            openId: this.openId,
            paytype: 202,
          extype: extype,
            extime: this.num,
            itemid: this.storeid,
            quantity: '',
            areacode: this.areaCode,
            appid: app.globalData.appid,
            remark: '',
            payinfo: ''
        })
        if (resp.result == 1) {
            PayOrder(resp.obj, { openId: app.globalData.userInfo.openId }, {
                failed: function (res) {
                    wx.hideLoading()
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
            wx.showModal({
                title: '提示',
                content: res.msg,
                showCancel: false
            })
        }
    },

    chooseSetTopItem(e) {
        this.setData({
            setTopAmount: 0,
            radioIdx: e.currentTarget.dataset.idx
        })
    },
    acountAmount(e) {
        let num = this.num = !parseInt(e.detail.value) ? 0 : parseInt(e.detail.value)
        this.setData({
            setTopAmount: num * this.data.setTopArr[this.data.radioIdx].Price
        })
    }
})
