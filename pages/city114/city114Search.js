const app = getApp(); 
var addr = require("../../utils/addr.js");
var _host = addr.HOST;
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let getAreaList = (code, cityid) => httpClient({ host: _host, addr: 'IBaseData/GetCityAreaByCityId', data: { code, cityid } });
let getAllCompanyTypeList = (cityid) => httpClient({ host: _host, addr: 'IBaseData/GetAllCompanyTypeList', data: { cityid } });
let getPayConfig = (cityid) => httpClient({ host: _host, addr: 'IBaseData/GetPayConfig', data: { cityid, paytype: 409 } });
let _payList;

// 获取列表数据
let getIndexList = ({
    pageIndex,
    cityid,
    type,
    isall,
    order,
    name,
    areaid
}
) => httpClient({
    host: _host,
    addr: 'IBaseData/GetIndexList',
    data: { pageIndex, cityid, type, name, isall, order, areaid }
});
Page({
    data: {
        showArea: false,
        showCat: false,
        showOrder: false,
        areaList: [],
        subAreaList: [],
        mainAreaIdx: null,
        subAreaIdx: null,
        allCompanyCategory: [],
        mainCompanyCategoryIdx: null,
        subCompanyCategoryIdx: null,
        areaid: '',
        orderIdx: null,
        paramsOfindexList: {
            pageIndex: 0,
            cityid: 0,
            type: 0,
            isall: 0,
            order: 0,
            name: '',
            areaid: 0
        },
        indexList: [],
        isShowQr: false,
        isShowPay: false,
        payList: [],
        payIdx: 0,
        isIos: false
    },
    onLoad(options) {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId;
            this.catid = options.catid // 点击轮播下面的圆形图标进来
            this.maincatidx = parseInt(options.maincatidx)            
            this.subid = options.subid  // 点击行业的子分类进来
        
            this.getAreaList()
            this.getAllCompanyTypeList()

            this.setData({
                openid: app.globalData.userInfo.openId,
                'paramsOfindexList.cityid': app.globalData.cityInfoId,
                'paramsOfindexList.pageIndex': 1,
                'paramsOfindexList.isall': 1,
                isIos: app.globalData.isIos
            })

            this.setData({
                'paramsOfindexList.type': options.catid ? options.catid : 0
            })

            if(this.subid) {
                this.setData({
                    'paramsOfindexList.type': this.subid
                })
            }

            this.getPayConfig()
            this.getIndexList()
        })

    },
    toggleArea() {
        this.setData({
            showArea: !this.data.showArea,
            showCat: false,
            showOrder: false
        })
    },
    toggleCat() {
        this.setData({
            showCat: !this.data.showCat,
            showArea: false,
            showOrder: false
        })
    },
    toggleOrder() {
        this.setData({
            showOrder: !this.data.showOrder,
            showCat: false,
            showArea: false
        })
    },
    // 获取区域列表
    async getAreaList() {
        let areaList = (await getAreaList(0, this.cityid));
        this.setData({
            areaList: areaList.Data.CAreaList
        })
    },
    // 获取子区域数据
    async getSubArea(e) {
        let areaList = (await getAreaList(e.currentTarget.dataset.pid, this.cityid));
        // 把全部加上去
        this.setData({
            subAreaList: [{ id: null, name: '全部' }, ...areaList.Data.CAreaStreetList],
            mainAreaIdx: parseInt(e.currentTarget.dataset.idx),
        })
    },
    getSubAreaIndexList(e) {
        this.setData({
            subAreaIdx: e.currentTarget.dataset.idx,
            areaid: e.currentTarget.dataset.areaid,
            showArea: false,
            'paramsOfindexList.areaid': e.currentTarget.dataset.areaid ? e.currentTarget.dataset.areaid : this.data.areaList[this.data.mainAreaIdx].id,
            'paramsOfindexList.pageIndex': 1,
            indexList: [],
        })
        this.getIndexList(this.data.paramsOfindexList);
    },
    async getAllCompanyTypeList() {
        let resp = await getAllCompanyTypeList(this.cityid)
        let allCompanyCategory = resp.Data.AllCompanyCategory
        this.setData({
            allCompanyCategory: [{ Id: 0, Name: '全部' }, ...resp.Data.AllCompanyCategory]
        })

        if (this.catid != 0) {
            for (let [idx, item] of allCompanyCategory.entries()) {
                if (this.catid == item.Id) {            
                    this.setData({
                        mainCompanyCategoryIdx: idx + 1,
                        subCompanyCategory: [{ id: null, Name: '全部' }, ...this.data.allCompanyCategory[idx + 1].SecondCompanyCategoryList],
                    })
                }
            }
        }
        if (this.maincatidx >= 0) {
            for (let [idx, item] of this.data.allCompanyCategory[this.maincatidx + 1].SecondCompanyCategoryList.entries()) {
                if (this.subid == item.Id) {
                    this.setData({
                        subCompanyCategoryIdx: idx + 1,
                        subCompanyCategory: [{ id: null, Name: '全部' }, ...this.data.allCompanyCategory[this.maincatidx + 1].SecondCompanyCategoryList],
                        mainCompanyCategoryIdx: this.maincatidx + 1
                    })
                }
            }
        }
    },
    getSubCat(e) {
        if (e.currentTarget.dataset.idx == 0) {
            this.setData({
                'paramsOfindexList.type': 0,
                'paramsOfindexList.pageIndex': 1,            
                indexList: [],
                showCat: false,
                subCompanyCategory: [],
                subCompanyCategoryIdx: null,
                mainCompanyCategoryIdx: e.currentTarget.dataset.idx
            })
            this.getIndexList(this.data.paramsOfindexList);
            return
        }

        this.setData({
            subCompanyCategory: [{ id: null, Name: '全部' }, ...this.data.allCompanyCategory[e.currentTarget.dataset.idx].SecondCompanyCategoryList],
            mainCompanyCategoryIdx: e.currentTarget.dataset.idx,
        })
    },
    getSubCatId(e) {
        this.setData({
            subCompanyCategoryIdx: e.currentTarget.dataset.idx,
            'paramsOfindexList.type': e.currentTarget.dataset.id ? e.currentTarget.dataset.id : this.data.allCompanyCategory[this.data.mainCompanyCategoryIdx].Id,
            'paramsOfindexList.pageIndex': 1,
            'paramsOfindexList.isall': e.currentTarget.dataset.idx == 0?1:0,
            indexList: [],
            showCat: false
        })
        this.getIndexList(this.data.paramsOfindexList);
    },
    // 获取排序
    getOrder(e) {
        this.setData({
            orderIdx: e.currentTarget.dataset.idx,
            'paramsOfindexList.order': e.currentTarget.dataset.idx,
            'paramsOfindexList.pageIndex': 1,
            indexList: [],
            showOrder: false
        })

        this.getIndexList(this.data.paramsOfindexList);
    },
    async getIndexList() {
        wx.showLoading({
            title: '加载中...'
        })
        let resp = await getIndexList(this.data.paramsOfindexList);
        wx.hideLoading();

        this.setData({
            indexList: [...this.data.indexList, ...resp.Data.listcompany]
        })
    },
    onReachBottom() {
        this.setData({
            'paramsOfindexList.pageIndex': ++this.data.paramsOfindexList.pageIndex,
        });

        this.getIndexList(this.data.paramsOfindexList);
    },
    searchConfirm() {
        this.setData({
            indexList: [],
            'paramsOfindexList.name': this.data.sValue,
            'paramsOfindexList.pageIndex': 1
        });
        this.getIndexList(this.data.paramsOfindexList);
    },
    getValue(e) {
        if(!e.detail.value.trim()) {
            this.setData({
                'paramsOfindexList.name': ''
            });
        }
        this.setData({
            sValue: e.detail.value
        })
    },
    search() {
        this.setData({
            indexList: [],
            'paramsOfindexList.name': this.data.sValue,
            'paramsOfindexList.pageIndex': 1
        });
        this.getIndexList(this.data.paramsOfindexList);
    },
    makePhone(e) {
        let telnum = e.currentTarget.dataset.telnum;
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.makePhoneCall({
            phoneNumber: telnum
        })
    },
    // 打开二维码 
    openQr(e) {
        this.setData({
            isShowQr: true,
            qrUrl: e.target.dataset.qr
        })
    },
    // 关闭二维码
    closeQr() {
        this.setData({
            isShowQr: false
        });
    },
    toStore(e) {
        vzNavigateTo({
            url: '/pages/business_detail/business_detail',
            query: {
                storeid: e.currentTarget.dataset.sid
            }
        })
    },
    toTop(e) {
        this.setData({
            isShowPay: true,
            ruzhuId: e.target.dataset.id
        })
    },
    payChange(e) {
        this.setData({
            payIdx: e.detail.value
        })
    },
    closeBtn() {
        this.setData({
            isShowPay: false
        })
    },
    // 置顶
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
                    this.setData({
                        indexList: [],
                        'paramsOfindexList.pageIndex': 1
                    });
                    this.getIndexList(this.data.paramsOfindexList);
                }, 1000)
            }
        }
        let param = {
            itemid: this.data.ruzhuId,
            paytype: 409,
            extype: _payList[this.data.payIdx].ExtendType,
            extime: 1,
            quantity: 1,
            openId: app.globalData.userInfo.openId,
            remark: _payList[this.data.payIdx].Remark,
            areacode: app.globalData.areaCode,
        }

        util.AddOrder(param, refun)
    },
    async getPayConfig() {
        let resp = await getPayConfig(this.cityid);
        let _resp = [];
        _payList = resp.Data.listpayconfig; // 保存未原始数据

        for (let item of resp.Data.listpayconfig) {
            _resp.push(item.Price * 1000 / 100000 + '元/' + item.ShowNote)
        }

        this.setData({
            payList: _resp
        })
    },
      // 导航去详情页
  toDetail(e) {
    let { cpid, detaildata } = e.currentTarget.dataset;
    detaildata.storeInfo = null;
    vzNavigateTo({
      url: '/pages/city114/city114Detail',
      query: {
        cpid,
        detaildata: JSON.stringify(detaildata)
      }
    })
  },
})