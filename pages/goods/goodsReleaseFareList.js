const app = getApp();
const addr = require("../../utils/addr.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
// 发布商品列表
const getFreightList = (paramsObj) => httpClient({ addr: addr.Address.GetFreightList, data: paramsObj });
const deleteFreight = (paramsObj) => httpClient({ method: 'POST', addr: addr.Address.DeleteFreight, data: paramsObj });
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
            this.sid = options.storeid;
            fareParams = {
                pageIndex: 1,
                openid: this.openid,
                storeid: this.sid
            }

            this.getFreightList();
        })

        wx.setNavigationBarTitle({
            title: "运费模板"
        })
    },
    async getFreightList() {
        if (this.data.isLoadAll) { return; }

        let resp = await getFreightList(fareParams);
        if (resp.Data.FreightTemplateList.length == 0) {
            fareParams.pageIndex == 1 ? this.setData({
                isHasData: true
            }) : this.setData({
                isLoadAll: true
            })
        }

        _fareListArr = [..._fareListArr, ...resp.Data.FreightTemplateList];

        this.setData({
            fareListArr: _fareListArr
        })
    },
    onReachBottom() {
        fareParams.pageIndex = ++fareParams.pageIndex;

        this.getFreightList();
    },
    // 删除该运费模板
    deleteFreight(e) {
        let that = this;
        wx.showModal({
            title: '提示',
            content: '确认删除该运费模板吗',
            async success(res) {
                if (res.confirm) {
                    let resp = await deleteFreight({ Fid: e.currentTarget.dataset.id })
                    if (resp.code == 1) {
                        wx.showToast({
                            title: '删除成功!'
                        })
                        _fareListArr = [];
                        that.setData({
                            fareListArr: []
                        });
                        that.getFreightList();
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
    toAddFareTemp() {
        vzNavigateTo({
            url: "/pages/goods/goodsReleaseFareAdd",
            query: {
                fareId: 0,
                storeid:this.sid 
            }
        })
    },
    toEditFareTemp(e) {
        vzNavigateTo({
            url: "/pages/goods/goodsReleaseFareAdd",
            query: {
                fareId: e.currentTarget.dataset.id,
                storeid:this.sid 
            }
        })
    }
})