let app = getApp()
Component({
    properties: {
        store: {
            type: Array,
            observer: 'render'
        }
    },
    data: {
        recommandStoreList: []
    },
    methods: {
        render() {

            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    recommandStoreList: []
                })
                wx.setStorageSync('isFresh', 0)
            }
            let that = this
            let { recommandStoreList, store } = { ...that.data }
            recommandStoreList.push.apply(recommandStoreList, store)
            that.setData({
                recommandStoreList
            })
        },
        goStoreDtl(e) {
            let that = this, phone, qrcode, contactInfo = {};
            const { id, vip } = { ...e.currentTarget.dataset }
            if (vip == 0) {// 未开通vip店铺
                let tip = '截图扫码，微信访问';
                ({ phone, qrcode } = { ...e.currentTarget.dataset });
                //如果是店主，显示城主二维码
                if (phone == app.globalData.userInfo.TelePhone) {
                    qrcode = app.globalData.cityqrcode
                    phone = app.globalData.cityphone
                    tip = '扫一扫二维码,联系同城客服升级店铺，即可在小程序访问详情'
                }
                contactInfo['phone'] = phone;
                contactInfo['qrcode'] = qrcode;
                contactInfo['tip'] = tip

                that.triggerEvent('getContactInfo', {
                    contactInfo,
                    open: true,
                    hide: true
                })
            }
            else {
                wx.navigateTo({
                    url: '/pages/business_detail/business_detail?storeid=' + id
                })
            }
        }
    }
})