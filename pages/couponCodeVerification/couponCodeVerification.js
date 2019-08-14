var addr = require("../../utils/addr.js")
var util = require("../../utils/util.js")
let { httpClient } = require("../../utils/util");
const regeneratorRuntime = require('../../utils/runtime');
const csvnum = (paramsObj) => httpClient({ addr: addr.Address.Csvnum, data: paramsObj });

//获取应用实例
var app = getApp()
Page({
    data: {
        checkError: false,
        number: ''
    },
    onLoad: function (options) {
        app.getUserInfo(() => {
            this.cityId = app.globalData.cityInfoId
            this.openId = app.globalData.userInfo.openId
        })
    },
    async csvnum() {
        if (!this.data.number) { return }
        wx.showLoading({
            title: '核销中...'
        })
        let resp = await csvnum({
            cityid: this.cityId,
            openId: this.openId,
            validNum: this.data.number
        })

        if (resp.Success) {
            wx.hideLoading()
            let data = resp.Data
            let scene
            this.setData({
                number:''
            })
            switch (parseInt(data.svt)) {
                // 优惠券
                case 1:            
                    scene = `${data.storeCouponId}:${data.userCouponId}`
                    wx.navigateTo({
                        url: `/pages/my_coupon/use_state?scene=${encodeURIComponent(scene)}`
                    })
                    // this.storeCouponUse(data.storeCouponId, data.userCouponId)
                    break

                // 同城卡
                case 2:
                scene = `halfserviceguid=${data.halfsGuid}&hsid=${data.hsId}`
                  wx.navigateTo({
                    url: `/pages/cityCard/usestate?scene=${encodeURIComponent(scene)}`
                  })
                  // this.storeCouponUse(data.storeCouponId, data.userCouponId)
                  break
                // 砍价    
                case 5:           
                    scene = `${data.BId}:${data.BargainUserId}`
                    wx.navigateTo({
                        url: `/pages/cutuse/usestate?scene=${encodeURIComponent(scene)}`
                    }) 
                    // this.storeCutUse(data.BargainUserId, data.BId)
                    break
                case 8:
                    // 爱心价
                    scene = `${data.LId}:${data.UserSetLikeId}`
                    wx.navigateTo({
                        url: `/pages/cutuse/loveusestate?scene=${encodeURIComponent(scene)}`
                    })
                    // this.adminUseLike(data.UserSetLikeId, data.LId)
                    break
                // 拼团    
                case 3:   
                    scene = `gid=${data.GroupId}&guid=${data.UserGroupId}`
                    wx.navigateTo({
                        url: `/pages/groupuse/usestate?scene=${encodeURIComponent(scene)}`
                    })
                // this.adminGroup(data.UserGroupId, data.GroupId)
            }
        } else {
          app.ShowMsg(resp.msg)
        }       
    },
    getNumber(e) {
        this.setData({
            number: e.detail.value
        })
        console.log(this.data.number);
    }
})
