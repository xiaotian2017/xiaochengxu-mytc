var addr = require("../../utils/addr.js");
const host = addr.HOST;

let { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
// 详情页获取推荐
let getListByRecom = (parmas) => httpClient({ host, addr: 'IBaseData/GetListByRecom', data: parmas });
let cityid;
let app = getApp();
Page({
    data: {
        recomList: [],
        detaildata: null,
        isShowQr: false,
        qrUrl: '',
        welfare: [],
        customName: ''
    },

    onLoad(options) {
        wx.showLoading();
        let { cpid, detaildata } = options;
        app.getUserInfo(() => {
            let _detaildata
            try {
                _detaildata = JSON.parse(detaildata)
            } catch (err) {

                _detaildata = detaildata;
            }                        
            cityid = app.globalData.cityInfoId;
            this.setData({
                detaildata: _detaildata,
                welfare: _detaildata.Welfare !== 'null' && _detaildata.Welfare && _detaildata.Welfare.split(';') || [],
                customName: app.globalData.CCityConfig.TN
            })
            wx.setNavigationBarTitle({
                title: this.data.customName
            })
            this.getListByRecom({
                cityid, cpid, pageIndex: 1, pageSize: 5
            });
        })

    },

    onShareAppMessage: function (res) {
        var that = this
        var path = addr.getCurrentPageUrlWithArgs()
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        return {
            title: that.data.detaildata.Name != 'null' && that.data.detaildata.Name && that.data.detaildata.Name || '',
            path: path,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    // 打开地图
    searchLocation(e) {
        if (this.data.detaildata.lat) {
            wx.openLocation({
                latitude: this.data.detaildata.lat,
                longitude: this.data.detaildata.lng,
                address: this.data.detaildata.Address,
                scale: 28,
                name: this.data.detaildata.Name
            })
        }
    },

    searchLocation1(e) {
        console.log(e);
        let { lat, lng, address, name } = e.target.dataset;
        if (lat) {
            wx.openLocation({
                latitude: lat,
                longitude: lng,
                address: address,
                name: name,
                scale: 28
            })
        }
    },
    // 获取推荐
    async  getListByRecom(cpid) {
        let resp = await getListByRecom(cpid);
        wx.hideLoading();
        this.setData({
            recomList: resp.Data.listcompany
        })
    },

    toBack() {
        wx.navigateBack({
            delta: 1
        })
    },

    // 打开二维码 
    openQr(e) {

        if (!this.data.detaildata.LogoUrl) {
            wx.showToast({
                title: '未上传二维码'
            })
            return;
        }
        this.setData({
            isShowQr: true,
            qrUrl: this.data.detaildata.LogoUrl
        })
    },

    // 关闭二维码 
    closeQr() {
        this.setData({
            isShowQr: false
        });
    },

    showMineDetail(e) {
        wx.showLoading();
        let _detaildata = this.data.recomList[e.currentTarget.dataset.idx];
        let cpid = _detaildata.Id;
        this.getListByRecom({
            cityid, cpid, pageIndex: 1, pageSize: 5
        });

        this.setData({
            detaildata: _detaildata,
            welfare: _detaildata.Welfare !== 'null' && _detaildata.Welfare && _detaildata.Welfare.split(';') || []
        })
        wx.pageScrollTo({
            scrollTop: 0
        })
    },

    makePhone(e) {


        let telnum = this.data.detaildata.LinkPhone
        let telNum2 = this.data.detaildata.LinkEmail
        let list = []
        if (telnum) {
            list.push(telnum)
        }

        if (telNum2) {
            list.push(telNum2)
        }


        wx.showActionSheet({
            itemList: list,
            success(res) {
                try {
                    wx.setStorageSync('needloadcustpage', false)
                }
                catch (e) {
                }
                wx.makePhoneCall({
                    phoneNumber: list[res.tapIndex]
                })
            },
            fail(res) {
                console.log(res.errMsg)
            }
        })     
    },
})