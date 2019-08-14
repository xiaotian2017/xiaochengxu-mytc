const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
var _host = addr.HOST;
// 这些接口记得放到 addr.js

const GetVoucherDetail = (params) => httpClient({ host: _host, addr: 'IBaseData/GetVoucherDetail', data: params });
const drawVoucher = (params) => httpClient({ host: _host, addr: 'IBaseData/UserDoDrawVoucher', data: params, method: 'POST', contentType: 'application/json' });

Page({
    data: {
        voucherDetail: null,
        rank: '',
        uv: null
    },
    onLoad(options) {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId
            this.openid = app.globalData.userInfo.openId
            this.vid = options.vid
            this.GetVoucherDetail()
        })
    },
    async drawVoucher(e) {

        if (app.globalData.cityExpired == 1) {
            wx.redirectTo({
              url: '/pages/expirePage/expirePage',
            })
            return
          }
        if (this.data.voucherDetail.IsHaving == 1) {
            wx.navigateTo({
                url: '/pages/business_detail/business_detail?storeid=' + e.currentTarget.dataset.storeid
            })
            return
        }
        wx.showLoading({
            title: '加载中',
        })

        let data = await drawVoucher({
            openId: this.openid,
            cityInfoId: this.cityid,
            vid: e.currentTarget.dataset.vid
        })

        wx.hideLoading()
        if (data.data) {
            this.setData({
                showTips: true,
                content: '领取成功',
                voucherDetail: null
            })
            this.GetVoucherDetail()
        } else {
            this.setData({
                showTips: true,
                content: data.msg
            })
        }
    },
    async GetVoucherDetail() {
        let resp = await GetVoucherDetail({
            openId: this.openid,
            cityInfoId: this.cityid,
            vid: this.vid
        })
        let detail = resp.data.detail || {}
        let uv = resp.data.uv || {}
        detail.UseStartDate = detail.UseStartDate && detail.UseStartDate.substring(0, 11)
        detail.UseStartDate = detail.UseEndDate && detail.UseEndDate.substring(0, 11)
        uv.CreateDate = uv.CreateDate && uv.CreateDate.substring(0, 11)
        uv.EndDate = uv.EndDate && uv.EndDate.substring(0, 11)
        if (resp.code) {
            this.setData({
                voucherDetail: detail,
                uv: uv
            })

            if (detail.IsNewUser == 0 && detail.IsCityMember == 0 && detail.IsDiscount == 0) {
                this.setData({
                    rank: "无限制"
                })
            } else {
                let rl = [];
                if (detail.IsNewUser == 1) rl.push("限店铺新人");
                if (detail.IsCityMember == 1) rl.push("限会员");
                if (detail.IsDiscount == 1) rl.push("限在线买单");
                this.setData({
                    rank: rl.join("、")
                })
            }

        } else {
            this.setData({
                showTips: true,
                content: resp.msg
            })
        }
    },
    gotostore(e) {
        if (app.globalData.cityExpired == 1) {
            wx.redirectTo({
              url: '/pages/expirePage/expirePage',
            })
            return
          }
        wx.navigateTo({
            url: '/pages/business_detail/business_detail?storeid=' + e.currentTarget.dataset.storeid
        })
    }
})