
const host = require("../../utils/addr.js").HOST;
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let util = require("../../utils/util.js");
const app = getApp();
// 获取店铺审核列表
let getRuZhuList = (parmas) => httpClient({ host, addr: 'IBaseData/GetListByUser', data: parmas });
let getPayConfig = (cityid, paytype) => httpClient({ host, addr: 'IBaseData/GetPayConfig', data: { cityid, paytype } })

let params;
let _payList;
let _ruZhuList;

Page({
    data: {
        ruZhuList: [],
        isShowReason: false,
        activeIdx: 0,
        payList: [],
        isShowPay: false, // 显示续费框
        payIdx: 0,  // 选中续费的idx
        ruzhuId: '',
        paytype: 408,
        isDone: false,
        delReason: '',
        cityqr: '',
        cityphone: '',
        xuFeiList: [],
        isIos: false
    },
    onLoad: function (options) {
        if (options.ruZhuType == 1) {
            this.setData({
                activeIdx: 1
            })
        } else {
            this.setData({
                activeIdx: 0
            })
        }
        app.getUserInfo(() => {
            params = {
                state: options.ruZhuType,
                pageIndex: 1,
                openid: '',
                cityid: '',
            }
            this.setData({
                cityqr: app.globalData.cityqrcode,
                cityphone: app.globalData.cityphone,
                isIos: app.globalData.isIos
            })
            params.cityid = app.globalData.cityInfoId;
            params.openid = app.globalData.userInfo.openId;
            _payList = [];
            _ruZhuList = [];
            this.getRuZhuList();
            this._getPayConfig(408);            
        })
    },
    // 查看原因
    checkReason(e) {
        this.setData({
            isShowReason: true,
            delReason: (this.data.ruZhuList[e.target.dataset.idx]).delReason
        })
    },
    closeBtn2() {
        this.setData({
            isShowReason: false
        })
    },
    vzMakePhone() {
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.makePhoneCall({
            phoneNumber: this.data.cityphone
        })
    },
    async getRuZhuList() {
        wx.showLoading();
        let resp = await getRuZhuList(params);
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (!(resp.Data.listcompany.length)) {
            this.setData({
                isDone: true
            })
        }
        for (let item of resp.Data.listcompany) {
            _ruZhuList.push(item);
        }

        this.setData({
            ruZhuList: _ruZhuList
        })
    },
    onReachBottom() {
        if (this.data.isDone) return;
        params.pageIndex = ++params.pageIndex;
        this.getRuZhuList();
    },
    // 通过
    getTongGuo() {
        _ruZhuList = [];
        this.setData({
            activeIdx: 1,
            isDone: false,
            ruZhuList: []
        })
        params.state = 1;
        params.pageIndex = 1;
        this.getRuZhuList();
    },
    // 待审核
    getDaiShenHe() {
        _ruZhuList = [];
        this.setData({
            activeIdx: 0,
            isDone: false,
            ruZhuList: []
        })
        params.state = 0;
        params.pageIndex = 1;
        this.getRuZhuList();
    },

    // 失效
    getShiXiao() {
        _ruZhuList = [];
        this.setData({
            activeIdx: -1,
            isDone: false,
            ruZhuList: []
        })
        params.state = -1;
        params.pageIndex = 1
        this.getRuZhuList();
    },
    backEdit(e) {
        if (app.globalData.cityExpired) {  
            app.goNewPage('/pages/expirePage/expirePage')
            return
        }
        vzNavigateTo({
            url: '/pages/city114/city114ruzhu',
            query: {
                ruzhuId: e.target.dataset.id,
                ruZhuType: this.data.activeIdx == 0 ? 0 : 1
            }
        })
    },
    // 关闭
    closeBtn() {
        this.setData({
            isShowPay: false
        })
    },
    // 置顶
    setTop(e) {
        if (app.globalData.cityExpired) {  
            app.goNewPage('/pages/expirePage/expirePage')
            return
        }
        this.getPayConfig(409);
        this.setData({
            isShowPay: true,
            ruzhuId: e.target.dataset.id,
            paytype: 409,
            payIdx: 0
        })
    },
    onPullDownRefresh() {
        _ruZhuList = [];
        this.setData({
            isDone: false,
            ruZhuList: []
        })

        params.pageIndex = 1

        this.getRuZhuList();
    },
    // 获取续费数据
    async getPayConfig(paytype) {
        let resp = await getPayConfig(app.globalData.cityInfoId, paytype);
        let _resp = [];
        _payList = resp.Data.listpayconfig; // 保存未原始数据

        for (let item of resp.Data.listpayconfig) {
            _resp.push(item.Price * 1000 / 100000 + '元/' + item.ShowNote)
        }

        this.setData({
            payList: _resp,
        })
    },

    async _getPayConfig(paytype) {
        let resp = await getPayConfig(app.globalData.cityInfoId, paytype);
        this.setData({
            xuFeiList: resp.Data.listpayconfig,
        })
    },

    // 续费
    async xufei(e) {
        if (app.globalData.cityExpired) {  
            app.goNewPage('/pages/expirePage/expirePage')
            return
        }
        this.getPayConfig(408);
        this.setData({
            isShowPay: true,
            ruzhuId: e.target.dataset.id,
            paytype: 408,
            payIdx: 0
        })
    },
    // 续费radio变化
    payChange(e) {
        this.setData({
            payIdx: e.detail.value
        })
    },
    closePay() {
        this.setData({
            isShowPay: false
        })
    },
    // 点击购买
    buyIt() {
        this.setData({
            isShowPay: false
        })
        let refun = (param, state) => {
            if (state == 0) {
                wx.showToast({
                    title: '您已取消付款!',
                    icon: 'faile',
                    duration: 1000
                })
                return;
            }
            else if (state == 1) {
                wx.showToast({
                    title: '支付成功!',
                    icon: 'success',
                    duration: 1000
                })
                setTimeout(() => {
                    this.getTongGuo();
                }, 1000)
            }
        }
        let param = {
            itemid: this.data.ruzhuId,
            paytype: this.data.paytype,
            extype: _payList[this.data.payIdx].ExtendType,
            extime: 1,
            quantity: 1,
            openId: app.globalData.userInfo.openId,
            remark: _payList[this.data.payIdx].Remark,
            areacode: app.globalData.areaCode,
        }

        util.AddOrder(param, refun)
    }
})
