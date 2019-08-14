var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
let  getMyVoucher = (p) => util.httpClient({ host, addr: 'IBaseData/GetMyVoucher', data: p });
let app = getApp()

Page({
    data: {
        voucherList: [],
        state: 0
    },

    onLoad() {
        wx.setNavigationBarTitle({
            title: "我的代金券"
        })
        this.pageIndex = 0

        app.getUserInfo(()=> {

          this.getMyVoucher(0)          
        })
    },
    changeTab(e) {
        if (app.globalData.cityExpired == 1) {
            wx.redirectTo({
              url: '/pages/expirePage/expirePage',
            })
            return
          }
        this.pageIndex = 0
        let state = e.currentTarget.dataset.state
        this.setData({
            voucherList: [],
            state
        })
        this.getMyVoucher(state)
    },
   async getMyVoucher (state) {      
    let resp = await getMyVoucher({
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        storeid: 0,
        pageIndex: ++this.pageIndex,
        state    
    })
    this.setData({
        voucherList: [...this.data.voucherList,...resp.Data.list]
    })
    },
    toStore(e) {
        if (app.globalData.cityExpired == 1) {
            wx.redirectTo({
              url: '/pages/expirePage/expirePage',
            })
            return
          }
        wx.navigateTo({
            url: '/pages/business_detail/business_detail?storeid=' +e.currentTarget.dataset.id
        })
    },
    onReachBottom() {
        this.getMyVoucher()
    },
    toCityCardCouponDetail(e) {
        wx.navigateTo({
            url: '/pages/cityCard/memberCouponDetail?vid=' + e.currentTarget.dataset.vid,
        })
    },
})