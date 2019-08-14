const app = getApp();
const addr = require("../../utils/addr.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
// 发布商品列表
const getAddressList = (paramsObj) => httpClient({ addr: addr.Address.GetAddressList, data: paramsObj });
const deleteAddress = (paramsObj) => httpClient({ addr: addr.Address.DeleteAddress, data: paramsObj });
const setDefaultAddress = (paramsObj) => httpClient({ addr: addr.Address.SetDefaultAddress, data: paramsObj });
let _fareListArr, fareParams = null;
Page({
    data: {
        fareListArr: [],
        isHasData: false,
        isLoadAll: false
    },
    onLoad(options) {
        app.getUserInfo(() => {
            _fareListArr = [];
            this.openid = app.globalData.userInfo.openId;
            this.cityid = app.globalData.cityInfoId;
            fareParams = {
                pageIndex: 1,
                openid: this.openid,
                cityid: this.cityid
            }

            this.getAddressList();
        })

        wx.setNavigationBarTitle({
            title: "收货地址"
        })
    },
    async getAddressList() {
        if (this.data.isLoadAll) { return; }

        let resp = await getAddressList(fareParams);
        if (resp.Data.AddressList.length == 0) {
            fareParams.pageIndex == 1 ? this.setData({
                isHasData: true
            }) : this.setData({
                isLoadAll: true
            })
        }

        _fareListArr = [..._fareListArr, ...resp.Data.AddressList];

        this.setData({
            fareListArr: _fareListArr
        })
    },
    onReachBottom() {
        fareParams.pageIndex = ++fareParams.pageIndex;

        this.getAddressList();
    },
    // 删除该运费模板
    deleteAddress(e) {
        let that = this;
        wx.showModal({
            title: '提示',
            content: '确认删除该收货地址吗',
            async success(res) {
                if (res.confirm) {
                    let resp = await deleteAddress({ cityid: that.cityid, openid: that.openid, id: e.currentTarget.dataset.id })
                    if (resp.code == 1) {
                        wx.showToast({
                            title: '删除成功!'
                        })
                        _fareListArr = [];
                        that.setData({
                            fareListArr: []
                        });
                        that.getAddressList();
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: resp.msg,
                            showCancel: false
                        })
                    }
                }
            }
        })
    },
    // 设置默认模板
    setDefault(e) {
        let that = this;
        if (e.currentTarget.dataset.state==1) return;
        wx.showModal({
            title: '提示',
            content: '确认设置该默认收货地址吗',
            async success(res) {
                if (res.confirm) {
                    let resp = await setDefaultAddress({ cityid: that.cityid, openid: that.openid, addrid: e.currentTarget.dataset.id })
                    if (resp.code == 1) {
                        wx.showToast({
                            title: resp.msg
                        })
                        _fareListArr = [];
                        that.setData({
                            fareListArr: []
                        });
                        that.getAddressList();
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: resp.msg,
                            showCancel: false
                        })
                    }
                }
            }
        })
    },
    toAddress(e) {
        vzNavigateTo({
            url: "/pages/goods/goodsAddressAdd",
            query: {
                addrid: e.currentTarget.dataset.id
            }
        })
    }
})