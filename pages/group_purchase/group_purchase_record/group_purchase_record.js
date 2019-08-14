let addr = require("../../../utils/addr.js")
let {
    httpClient
} = require("../../../utils/util.js");
const regeneratorRuntime = require('../../../utils/runtime');
const host = addr.HOST
let getList = (url, param) => httpClient({
    host,
    addr: url,
    data: param
})
let app = getApp()
Page({
    data: {
        pageindex: 1,
        recordList: [],
        loadingAll: false,
        isLoading: false
    },

    onLoad(options) {
        let that = this
        that.setData({
           storeid: options.storeId,
           sgid: options.gsid
        
        })
        app.getUserInfo((userInfo) => {
            that.setData({
                openid: userInfo.openId
            })
            that.requestList()
            that.verify()
        })
    },
    onReachBottom() {
        let that = this
        let {
            loadingAll,
            isLoading
        } = { ...that.data
        }
        if (!loadingAll && !isLoading) {
            that.requestList()
        }
    },
    async requestRecordList() {
        let that = this
        let {
            pageindex,
            sgid,
            openid,
            isLoading
        } = { ...that.data
        }
        let data = await getList(
            'IBaseData/GetGroupParticipants', {
                cityid: app.globalData.cityInfoId,
                openid,
                sgid,
                pageindex,
                pagesize: 5
            }
        )
        if (data.Success) {
            return data.Data.listparticipants
        }
    },
    requestList() {
        let that = this,
            arr = []
        let {
            pageindex,
            recordList,
            loadingAll,
            isLoading
        } = { ...that.data
        }
        if (!loadingAll && !isLoading) {
            wx.showLoading({
                title: '正在加载中',
                duration: 10000
            })
            that.setData({
                isLoading: true
            })
            that.requestRecordList().then((data) => {
                if (data.length > 0) {
                    pageindex = pageindex + 1
                    that.setData({
                        recordList: data,
                        pageindex
                    })
                    if (data.length < 5) {
                        that.setData({
                            loadingAll: true
                        })
                    }
                } else {
                    that.setData({
                        loadingAll: true
                    })
                }
            })
            that.setData({
                isLoading: false
            })
            wx.hideLoading()
        }
    },
    async requestVerification() {
        let {
            openid,
            sgid
        } = { ...this.data
        }
        let data = await getList(
            'IBaseData/GroupParticipantRecordMain', {
                cityid: app.globalData.cityInfoId,
                openid,
                sgid
            }
        )
        if (data.Success) {
            return data.Data.mainmodel
        }
    },
    verify() {
        let that = this
        that.requestVerification().then((data) => {
            that.setData({
                verifyNum: data
            })
        })
    },
    call(e) {
        const {
            phone
        } = { ...e.currentTarget.dataset
        }
        try {
            wx.setStorageSync('needloadcustpage', false)
        } catch (e) {
            console.log(e)
        }
        wx.makePhoneCall({
            phoneNumber: phone
        })
    },
    goMyEarns() {
        wx.navigateTo({
            url: '/pages/bill/bill'
        })
    }
})