const app = getApp();
var util = require("../../utils/util.js");
const addr = require("../../utils/addr.js");
const { vzNavigateTo, httpClient, PayOrder } = require("../../utils/util.js");
var WxParse = require('../../utils/wxParse/wxParse.js');
const regeneratorRuntime = require('../../utils/runtime');
const host = addr.HOST;
let getVoucherDraw = (p) => util.httpClient({ host, addr: 'IBaseData/GetVoucherDraw', data: p });
// 商品订单详情
const getGoodOrderDetail = (paramsObj) => httpClient({ addr: addr.Address.GetGoodOrderDetail, data: paramsObj });
const refundOrder = (paramsObj) => httpClient({ addr: addr.Address.RefundOrder, data: paramsObj });
const refundOrderDetail = (paramsObj) => httpClient({ addr: addr.Address.RefundOrderDetail, data: paramsObj });
var intervalDate;
Page({
    data: {
        goodsid: 0,
        voucher: null,
        showVoucher: false,
        mainmodel: null,
        day: '',
        hour: '',
        min: '',
        sec: '',
        useqrcode: '',
        goodsGuid: '',
        isShowRefund: false,
        isShowCityQr: false
    },
    onLoad(options) {
        var that = this;
        app.getUserInfo(() => {
            this.refundMsg = ''
            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            this.oid = options.oid;
            this.setData({cityphone: app.globalData.cityphone, cityqrcode: app.globalData.cityqrcode })            
            this.getGoodOrderDetail();
            var count = 0
            var path = "pages/goods/usestate"
            var scene = addr.getCurrentPageUrlWithScene()
            if (scene == '') {
                scene = 0
            }
            var param = "?openid=" + app.globalData.userInfo.openId + "&appid=" + app.globalData.appid + "&path=" + path + "&scene=" + encodeURIComponent(scene)
            let qrlink = addr.Address.GetSharePosterQrCode + param;
            this.setData({ useqrcode: qrlink })
            var timer = setInterval(function () {
                that.checkuse()
                count++
                if (120 == count) {
                    clearInterval(timer)
                }
            }, 1000)
        })
        wx.setNavigationBarTitle({
            title: "商品订单明细"
        })
    },
    async getGoodOrderDetail() {
        wx.showLoading();
        let resp = await getGoodOrderDetail({
            cityid: this.cityid,
            openid: this.openid,
            orderid: this.oid
        })
        wx.hideLoading();

        this.setData({
            mainmodel: resp.Data.mainmodel,
            goodsGuid: resp.Data.mainmodel.GetGoodsOrder.GoodsGuid,
            goodsid: resp.Data.mainmodel.GetGoodsOrderDetailList[0].GoodsId
        })

        this.data.mainmodel.GetGoodsOrder.State == 0 && this.countDowm();

        if ((typeof this.data.mainmodel.CStore.Description) == 'string' && (this.data.mainmodel.CStore.Description.trim())) {
            WxParse.wxParse('Description', 'html', this.data.mainmodel.CStore.Description, this)
        }
    },
    // 商品取消订单
    cancelOrder(e) {
        let that = this;
        wx.showModal({
            title: '提示',
            content: '是否确定取消订单?',
            success(res) {
                if (res.confirm) {
                    wx.request({
                        url: addr.Address.CancelGoodOrder,
                        data: {
                            openid: app.globalData.userInfo.openId,
                            cityid: app.globalData.cityInfoId,
                            oid: e.currentTarget.dataset.id
                        },
                        success(res) {
                            if (res.data.code == 1) {
                                wx.showToast({
                                    title: res.data.msg
                                })
                                setTimeout(() => {
                                    that.getGoodOrderDetail();
                                }, 500)
                            } else {
                                wx.showToast({
                                    title: res.data.msg
                                })
                            }
                            setTimeout(() => {

                            }, 500)
                        }
                    })
                }
            }
        })
    },
    // 商品付款   等剑锋下单功能做完再调试
    goodsPay(e) {
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
                console.log("支付成功")
                // 转到贺卡
                vzNavigateTo({
                    url: ' /pages/cutlist/cutlist',
                    query: {
                        type: 'goods',
                        state: 0,
                    }
                })
            }, 1000)
        }

        wx.request({
            url: addr.Address.RefleshOrderNo,
            data: {
                openid: app.globalData.userInfo.openId,
                cityid: app.globalData.cityInfoId,
                orderId: e.currentTarget.dataset.id,
                goid: e.currentTarget.dataset.goid
            },
            success(res) {
                if (res.data.code == 1) {
                    PayOrder(e.currentTarget.dataset.id, { openId: app.globalData.userInfo.openId }, {
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
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                }
            }
        })
    },
    makePhone(e) {
        let tel = e.currentTarget.dataset.tel;
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },
    countDowm() {
        let day, hour, min, sec
        let startTime = parseInt(this.data.mainmodel.GetGoodsOrder.CreateDate.replace('/Date(', '').replace(')/', ''), 10);
        let endTime = startTime + 1800000; // 结束时间 
        let that = this;
        intervalDate = setInterval(function () {
            var nowTime = new Date().getTime();
            if (startTime >= nowTime) {
                clearInterval(intervalDate);
                console.log(1)
            } else if (endTime >= nowTime) {
                //显示倒计时
                var t = endTime - nowTime;
                day = Math.floor(t / 1000 / 60 / 60 / 24);
                hour = Math.floor(t / 1000 / 60 / 60 % 24);
                min = Math.floor(t / 1000 / 60 % 60);
                sec = Math.floor(t / 1000 % 60);

                that.setData({
                    day: day == 0 ? '0' + 0 : day,
                    hour: hour < 10 ? '0' + hour : hour,
                    min: min < 10 ? '0' + min : min,
                    sec: sec < 10 ? '0' + sec : sec
                })
                console.log(hour, min, sec);
            } else {
                clearInterval(intervalDate);
                that.getGoodOrderDetail();
            }
        }, 1000);
    },
    onUnload() {
        clearInterval(intervalDate);
    },
    // 退款
    refundOrder(e) {
        if (!this.refundMsg.trim()) {
            app.ShowMsg('亲，要输入退款原因的哦！')
            return
        }
        let that = this;

        wx.request({
            url:addr.Address.RefundOrder,
            data: {
                openid: app.globalData.userInfo.openId,
                cityid: app.globalData.cityInfoId,
                oid: this.oid,
                reason: this.refundMsg
            },
            success(res) {
                if (res.data.code == 1) {
                    app.ShowMsg(res.data.msg);
                    setTimeout(() => {
                        that.getGoodOrderDetail();
                        that.setData({
                            isShowRefund: false
                        })
                    }, 500)
                } else {
                    app.ShowMsg(res.data.msg);
                }         
            }
        })


    },
    // 去商品详情页
    toGoodDetail(e) {
        if (app.globalData.cityExpired == 1) {
            wx.redirectTo({
              url: '/pages/expirePage/expirePage',
            })
            return
          }
        vzNavigateTo({
            url: '/pages/goods/goods_detail/goods_detail',
            query: {
                gid: e.currentTarget.dataset.id
            }
        })
    },
    checkuse: function () {
        var that = this
        var url = addr.Address.CheckStoreGoodUse
        var param = {
            goodsGuid: that.data.goodsGuid,
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId
        }

        wx.request({
            url: url,
            data: param,
            async success(res) {
                if (res.data.Success) {
                    let resp = await getVoucherDraw({
                        openid: app.globalData.userInfo.openId,
                        cityid: app.globalData.cityInfoId,
                        itemid: that.data.goodsid,
                        itemtype: 5
                    })

                    if (resp.code == 1) {
                        that.setData({
                            voucher: resp.Data.Voucher,
                            showVoucher: true
                        })
                    }
                    app.ShowMsg("恭喜你，订单核销成功")
                  setTimeout(() => {
                    app.reload();
                    
                  }, 1000)
                   
                }
                else {

                }
            }
        })
    },
    toStore(e) {
        vzNavigateTo({
            url: '/pages/business_detail/business_detail',
            query: {
                storeid: e.currentTarget.dataset.sid
            }
        })
    },
    // 商品确认收货  
    confirmAccept(e) {
        let that = this;
        wx.showModal({
            title: '提示',
            content: '是否确认收货 ? 如商品有质量问题 , 请在三天内联系商家协商 ! 商家联系电话 : ' + e.currentTarget.dataset.tel,
            success(res) {
                if (res.confirm) {
                    wx.request({
                        url: addr.Address.ConfirmAccept,
                        data: {
                            openid: app.globalData.userInfo.openId,
                            cityid: app.globalData.cityInfoId,
                            orderid: e.currentTarget.dataset.id
                        },
                        success(res) {
                            if (res.data.code == 1) {
                                var uservoucher = res.data.Data.uservoucher
                                if (null != uservoucher && undefined != uservoucher) {
                                    that.setData({
                                        voucher: res.data.Data.uservoucher,
                                        showVoucher: true
                                    })
                                }
                                wx.showToast({
                                    title: res.data.msg
                                })
                                setTimeout(() => {
                                    that.getGoodOrderDetail();
                                }, 500)
                            } else {
                                wx.showToast({
                                    title: res.data.msg
                                })
                            }
                        }
                    })
                }
            }
        })
    },
    tomyVoucher() {
        wx.redirectTo({
            url: '/pages/myVoucher/myVoucher'
        })
    },
    closeVoucher() {
        this.setData({
            showVoucher: false
        })
    },
    getRefundMsg(e) {
        this.refundMsg = e.detail.value
    },
    refundLayerToggle() {
        this.setData({
            isShowRefund: !this.data.isShowRefund
        })
    },
    showCityQr() {
        this.setData({
            isShowCityQr: !this.data.isShowCityQr
        })
    }
})