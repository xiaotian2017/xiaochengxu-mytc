let addr = require("../../../utils/addr.js");
const host = addr.HOST;
const util = require("../../../utils/util.js")
let { httpClient } = require("../../../utils/util.js");
const regeneratorRuntime = require('../../../utils/runtime');
let getList = (url, param) => httpClient({ host, addr: url, data: param })
let WxParse = require('../../../utils/wxParse/wxParse.js');
let app = getApp()

//修正时间
let modifyTime = (time) => {
    let modifyTime = /\((\d+)\)/.exec(time)
    return parseInt(modifyTime[1])
}
//补0
let prefixTime = (num) => {
    return num >= 10 ? num : '0' + num
}
//计算剩余时间 (天,时,分,秒)
let leftTime = (timespan) => {
    let leftTime = (timespan - (new Date().getTime())) / 1000 //剩余时间
    if (leftTime < 0) {
        return false
    } else {
        let days = prefixTime(parseInt(leftTime / 60 / 60 / 24, 10))
        let hours = prefixTime(parseInt(leftTime / 60 / 60 % 24, 10))
        let minutes = prefixTime(parseInt(leftTime / 60 % 60, 10))
        let seconds = prefixTime(parseInt(leftTime % 60, 10))
        return {
            days,
            hours,
            minutes,
            seconds
        }
    }
}
//
let formatDate = (time) => {
    let date = new Date(modifyTime(time))
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute
}
//修正价格
let prefixPrice = (price) => {
    return price * 10000 / 1000000
}
let getStoreVoucherList = (p) => util.httpClient({ host, addr: 'IBaseData/GetStoreVoucherList', data: p })
Page({
    data: {
        UserName: '',
        Phone: '',
        cityid: 0,
        totalNum: 0,//总的团购份数
        init: false, //是否初始化成功
        follow: false,//关注
        storeInfo: { //商家信息
            currentphone: '',
            currentshopqrcode: '',
            currentshoptip: ''
        },
        loadRecommand: false,
        recommandList: [],//推荐列表
        openLayer: false,
        payNum: 1,
        showAllMem: true,
        timeOver: false,//时间过期
        success: false, //是否组团成功
        hasVoucher: false,
        uservoucherlist: [],
        payMoney: '',
        voucherIdx: '',
        voucherMoney: 0,
        voucher: null,
        listvoucher: []
    },
    onLoad(options) {
        let that = this
        app.getUserInfo((userInfo) => {
            that.setData({
                Phone: app.globalData.userInfo.TelePhone,
                UserName: app.globalData.userInfo.nickName,
                cityid: app.globalData.cityInfoId,
                gsid: options.gsid,
                openid: userInfo.openId
            })
            that.initData()
        })
    },
    //转发分享
    onShareAppMessage(res) {
        let that = this,
            path = addr.getCurrentPageUrlWithArgs();
        const { GroupUserList } = { ...that.data }
        try {
            wx.setStorageSync('needloadcustpage', false)
        } catch (e) {
            console.log(e)
        }
        return {
            title: GroupUserList[0].ShopName + '的拼团',
            path: path,
            fail(res) { }
        }
    },
    // 初始化
    async initRequest() {
        let { cityid, openid, gsid, totalNum } = { ...this.data }
        wx.showLoading({
            title: '加载中',
            duration: 10000,
        })
        let data = await getList(
            'IBaseData/GetSubGroupMain',
            { openid, cityid, gsid }
        )
        if (data.Success) {
            let d = data.Data.mainmodel, totalNum = 0
            let mainmodel = d.Groups
            let Store = d.Store
            let GroupUserList = d.GroupUserList
            delete mainmodel.CityInfo
            Object.keys(mainmodel).forEach((key) => {
                if (mainmodel[key] == null) {
                    delete mainmodel[key]
                }
            })
            mainmodel.UnitPrice = prefixPrice(parseFloat(mainmodel.UnitPrice))
            mainmodel.OriginalPrice = prefixPrice(parseFloat(mainmodel.OriginalPrice))
            mainmodel.DiscountPrice = parseFloat(mainmodel.DiscountPrice)
            mainmodel.HeadDeduct = prefixPrice(parseFloat(mainmodel.HeadDeduct))
          mainmodel.State=d.State
          mainmodel.IsExpire = d.IsExpire
            //使用截止时间
            mainmodel.UserDateEnd = formatDate(mainmodel.UserDateEnd)
            mainmodel.StartDate = d.StartDate
            mainmodel.EndDate = d.EndDate
            totalNum = GroupUserList.length
            return {
                mainmodel,
                Store,
                GroupUserList,
                totalNum
            }
        } else {
            app.ShowMsg(data.Message)
        }
    },
    async initData() {
       
        let that = this
        that.initRequest().then((data) => {
            if (!!data.mainmodel.Description) {
                WxParse.wxParse('Description', 'html', data.mainmodel.Description, that)
            }
            that.setData({
                mainmodel: data.mainmodel,
                Store: data.Store,
                GroupUserList: data.GroupUserList,
                totalNum: data.totalNum
            })
            wx.setNavigationBarTitle({
                title: data.GroupUserList[0].ShopName + '的拼团'
            })            
            that.getStoreVoucherList(data.Store.Id)
        }).then(() => {
            setTimeout(() => {
                that.setData({
                    init: true
                })
            }, 100)
            wx.hideLoading()
            that.countdown()
        })
    },
    async getStoreVoucherList(storeid) {
        let resp = await getStoreVoucherList({
            openid: app.globalData.userInfo.openId,
            cityid: app.globalData.cityInfoId,
            storeid,
            pageIndex: 1
        })

        this.setData({
            listvoucher: resp.Data.listvoucher
        })
    },
    //预览轮播图
    viewFullPic(e) {
        let that = this
        const { filepath } = { ...e.currentTarget.dataset }
        const { ImgList } = { ...that.data.mainmodel }
        let urls = ImgList.map(item => item.filepath)
        app.pictureTaps(filepath, urls)
    },
    //倒计时
    countdown() {
        let currentTime, startTime, endTime, restTime, countInfo
        let that = this
        let { mainmodel, GroupUserList } = { ...that.data }
        let { ValidDateStart, ValidDateEnd, remainNum, state, EndDate, StartDate } = { ...mainmodel }
        state = mainmodel.state
        //修正时间
        currentTime = new Date().getTime()
        startTime = modifyTime(StartDate)
        endTime = modifyTime(EndDate)
        restTime = endTime - startTime


        if (state == -1) {
            that.setData({
                timeOver: true
            })
            return
        }
        if (endTime <= currentTime || remainNum <= 0) {
            that.setData({
                timeOver: true
            })
            if (that.data.totalNum >= mainmodel.GroupSize) {
                that.setData({
                    success: true
                })
            }
        } else if (startTime <= currentTime < endTime) {
            that.changeDate(endTime)
        } else {
            that.changeDate(endTime)
        }
    },
    changeDate(restTime) {
        let that = this
        let countTime, days, hours, minutes, seconds
        countTime = leftTime(restTime)
        that.setData({
            countTime
        })
        let timer = setInterval(() => {
            countTime = leftTime(restTime);
            ({ days, hours, minutes, seconds } = { ...countTime })
            if (countTime) {
                if (hours == '00' && minutes == '00' && seconds == '00') {
                    that.setData({
                        countTime
                    })
                } else if (minutes == '00' && seconds == '00') {
                    that.setData({
                        'countTime.hours': hours,
                        'countTime.minutes': minutes,
                        'countTime.seconds': seconds
                    })
                } else if (seconds == '00') {
                    that.setData({
                        'countTime.minutes': minutes,
                        'countTime.seconds': seconds
                    })
                } else {
                    that.setData({
                        'countTime.seconds': seconds
                    })
                }
            } else {
                clearInterval(timer)
                that.setData({
                    timeOver: true
                })
                return
            }
        }, 1000)
    },
    //显示地图
    getLocation() {
        let that = this
        const { lat, lng } = { ...that.data.Store }
        try {
            wx.setStorageSync('needloadcustpage', false)
            wx.openLocation({
                latitude: lat,
                longitude: lng
            })
        }
        catch (e) {
            app.ShowMsg('获取地理位置信息出错')
            console.log(e)
        }
    },
    //拨打电话
    call(e) {
        const { phone } = { ...e.currentTarget.dataset }
        if (phone == '') {
            app.ShowMsg('该商铺未填写电话号码')
        } else {
            try {
                wx.setStorageSync('needloadcustpage', false)
            }
            catch (e) {
                console.log(e)
            }
            wx.makePhoneCall({
                phoneNumber: phone
            })
        }
    },
    //查看拼团成员
    seeAllMem() {
        let that = this
        let { showAllMem } = { ...that.data }
        that.setData({
            showAllMem: !showAllMem
        })
    },
    //获取加载位置
    // getRect(){
    //     let that = this,loadPosition
    //     wx.createSelectorQuery().select('.countTime').boundingClientRect((rect) => {
    //         loadPosition = rect.top + rect.height
    //         that.setData({
    //             loadPosition
    //         })
    //     }).exec()
    //   },
    //推荐
    getRecommand(e) {
        let that = this
        const { loadPosition, recommandList, loadRecommand } = { ...that.data }
        const { scrollTop } = { ...e.detail }
        if (scrollTop >= 20) {
            if (!loadRecommand && recommandList.length == 0) {
                that.recommand()
                that.setData({
                    loadRecommand: true
                })
            }
        }
    },
    async recommandRequest() {
        let recommandList = []
        let data = await getList(
            'IBaseData/GetRecommendGroup',
            { cityid: app.globalData.cityInfoId }
        )
        if (data.Success) {
            if (data.length != 0 && data != undefined) {
                let listgroup = data.Data.listgroup
                listgroup.forEach((key, index) => {
                    Object.keys(key).forEach((obj) => {
                        if (key[obj] == null) {
                            delete key[obj]
                        }
                    })
                    key.UnitPrice = prefixPrice(parseFloat(key.UnitPrice))
                    key.OriginalPrice = prefixPrice(parseFloat(key.OriginalPrice))
                    recommandList[index] = key
                })
            }
            return recommandList
        }
    },
    recommand() {
        let that = this
        that.recommandRequest().then((data) => {
            that.setData({
                recommandList: data,
                loadRecommand: true
            })
        })
    },
    //跳去店铺详情页
    goStoreDtl() {
        let that = this, storeInfo = {}, qrcode, phone, tip
        let { Store } = { ...that.data }
        const { Id, VIPStatus } = { ...Store }
        if (VIPStatus == 0) {// 未开通vip店铺
            tip = '截图扫码，微信访问'
            let { TelePhone, Qrcode_Url } = { ...Store }
            phone = TelePhone
            qrcode = Qrcode_Url
            //如果是店主，显示城主二维码
            if (phone == app.globalData.userInfo.TelePhone) {
                qrcode = app.globalData.cityqrcode
                phone = app.globalData.cityphone
                tip = '扫一扫二维码,联系同城客服升级店铺，即可在小程序访问详情'
            }
            Reflect.set(storeInfo, 'currentphone', phone)
            Reflect.set(storeInfo, 'currentshopqrcode', qrcode)
            Reflect.set(storeInfo, 'currentshoptip', tip)
            that.setData({
                storeInfo
            })
        }
        else {
            wx.reLaunch({
                url: '/pages/business_detail/business_detail?storeid=' + Id
            })
        }
    },
    //关闭弹层
    closeqrcode: function () {
        let that = this
        that.setData({
            'storeInfo.currentphone': '',
            'storeInfo.currentshopqrcode': ''
        })
    },
    // 推荐拼团详情页
    goGroupDtl(e) {
        const { id } = { ...e.currentTarget.dataset }
        wx.navigateTo({
            url: '/pages/group_purchase/group_purchase/group_purchase?gid=' + id
        })
    },
    goGroupList() {
        wx.navigateTo({
            url: '/pages/activity/activity?type=' + 'group'
        })
    },
    //支付
    finishPay() {
        let that = this
          that.groupPurchase().then((data) => {
          if (!data.Success)
            {
            app.ShowMsg(data.Message)
            return
            }

            let param = {
                openId: that.data.openid
            }
          
            wx.showLoading();
            util.PayOrder(data.Data.orderid, param, {
                failed(res) {
                    wx.hideLoading();
                    that.payRefun();
                },
                success(res) {
                    wx.hideLoading();
                    if (res == "wxpay") {

                    } else if (res == "success") {
                        that.payRefun(1)
                    }
                }
            })
        })
    },
    async groupPurchase(e) {
        let that = this, param
        let { cityid, openid, mainmodel, GroupUserList, groupPurchase, payNum } = { ...that.data }
        let { Id, isGHead } = { ...mainmodel }
        let gsid = GroupUserList[0].GroupSponsorId
        gsid = Object.is(gsid, undefined) ? 0 : gsid
        var reurl = '/' + addr.getCurrentPageUrlWithArgs()
        if (app.checkphonewithurl(reurl)) {
            param = {
                cityid,
                openid: openid,
                appid: app.globalData.appid,
                gid: Id,
                num: payNum,
                isGroup: groupPurchase,
                isGHead: 0,
                gsid: gsid,
                uvId: this.data.voucherIdx !== '' ? this.data.listvoucher[this.data.voucherIdx].Id : ''
            }         
            let data = await getList(
                'IBaseData/AddGroupOrder',
                param
            )
          
            return data
        }
    },
    //支付回调
    payRefun(state = false) {
        let gsid = this.data.GroupUserList[0].GroupSponsorId
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
            wx.redirectTo({
                url: "/pages/group_purchase/group_subPurchase/group_subPurchase?gsid=" + gsid
            })
        }, 1000)
    },
    openPay(e) {
        let that = this
        const { index } = { ...e.currentTarget.dataset }
        this.setData({
            openLayer: true,
            groupPurchase: parseInt(index)
        })
    }
    ,
    //取消支付
    cancle() {
        let that = this
        that.setData({
            payNum: 1,
            openLayer: false
        })
    },
    //add
    add() {
        let that = this
        let { payNum, mainmodel: { LimitNum,CreateNum  } } = { ...that.data }
        
        if (LimitNum == 0) {            
            payNum += 1
            if (payNum >= CreateNum) {
                payNum = CreateNum
            }
        }
        if (LimitNum >= 1) {
            payNum += 1
            if (payNum >= LimitNum) {
                payNum = LimitNum
            }
        }
        that.setData({
            payNum
        })
    },
    //minus
    minus() {
        let that = this
        let { payNum } = { ...that.data }
        payNum -= 1
        if (payNum < 1) {
            return
        } else {
            that.setData({
                payNum
            })
        }
    },
    openNewGroup() {
        var that = this
        let { Id } = { ...this.data.mainmodel }
        if (!that.data.over) {
            wx.navigateTo({
                url: '/pages/group_purchase/group_purchase/group_purchase?gid=' + Id
            })
        } else {
            wx.navigateTo({
                url: '/pages/activity/activity?type=group'
            })
        }
    },
    //返回首页
    backHome() {
        app.gotohomepage()
    },
    //去我的团购
    goMyGroup() {
        wx.navigateTo({
            url: '/pages/cutlist/cutlist?type=group'
        })
    },
    showVoucher() {
        this.setData({
            hasVoucher: !this.data.hasVoucher        
        })
    },
    hideVoucher() {
        this.setData({
            hasVoucher: false,
            voucherIdx: '',
            voucherMoney: 0
        })
    },
    chooseVoucher(e) {
        let idx = e.currentTarget.dataset.idx
        this.setData({
            voucherIdx: idx
        })
        let voucher = this.data.listvoucher[idx]
        let voucherMoney = voucher.Money
        if (voucher.Voucher.Deducting > 0) {
            if ((this.data.groupPurchase == 1 ? this.data.mainmodel.DiscountPrice * this.data.payNum : this.data.mainmodel.UnitPrice * this.data.payNum) < voucher.Voucher.Deducting * 100) {
                app.ShowMsg('购买金额不足满减金额，该代金券不可用')
            } else {
                if (voucherMoney * 100 >= (this.data.groupPurchase == 1 ? this.data.mainmodel.DiscountPrice * this.data.payNum : this.data.mainmodel.UnitPrice * this.data.payNum)) {
                    app.ShowMsg('购买金额小于减免金额，该代金券不可用')
                } else {
                    this.setData({
                        hasVoucher: false,
                        voucherMoney: voucherMoney*100
                    })
                }
            }
        } else {
            if (voucherMoney * 100 >= (this.data.groupPurchase == 1 ? this.data.mainmodel.DiscountPrice * this.data.payNum : this.data.mainmodel.UnitPrice * this.data.payNum)) {
                app.ShowMsg('购买金额小于减免金额，该代金券不可用')
            } else {
                this.setData({
                    hasVoucher: false,
                    voucherMoney: voucherMoney*100
                })
            }
        }
    }
})
