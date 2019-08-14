
let log = console.log;

var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
const app = getApp();

let getDetailConfig = (params) => httpClient({ addr: addr.Address.GetDetailConfig, data: params });
let editDetailConfig = (params) => httpClient({ method: 'POST', addr: addr.Address.EditDetailConfig, data: params });

Page({
    data: {
        themeColorArr: [
            { name: '默认', color: '#fe3d49' },
            { name: '', color: '#ff006a' },
            { name: '', color: '#009cff' },
            { name: '', color: 'linear-gradient(to right,#2b78ed,#852cf3)' }
        ],
        themeIdx: 0,
        isShowSort: false,
        sortVal: 0,
        tabArr: [],
        tabArrIdx: 0,
        isShowEdit: false,
        tabName: '',
        labelObj: null
    },

    onLoad(options) {
        app.getUserInfo((userInfo) => {
            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            this.storeid = options.storeid;
            // this.storeid = 8566989;

            this.getDetailConfig();
        })

        wx.setNavigationBarTitle({
            title: "店铺编辑"
        })
    },

    //    传的时候传json字符串 导航和标签
    async getDetailConfig() {
        let resp = await getDetailConfig({
            openid: this.openid,
            storeid: this.storeid
        });

        let detailConfig = this.detailConfig = resp.Data.DetailConfig;

        this.setData({
            themeIdx: detailConfig.StoreSkin - 1,
            tabArr: JSON.parse(detailConfig.StoreNavigation),
            labelObj: detailConfig.TagList
        })
        console.log(resp)
    },

    setThemeColor(e) {
        this.setData({
            themeIdx: e.currentTarget.dataset.idx
        })
    },

    showSort(e) {
        let { sort, cancel, idx } = e.currentTarget.dataset;

        if (cancel) {
            this.setData({
                isShowSort: !this.data.isShowSort
            })
        } else {
            this.setData({
                sortVal: sort == '' ? 0 : sort,
                isShowSort: !this.data.isShowSort,
                tabArrIdx: idx
            })
        }
    },

    getSort(e) {
        this.setData({
            sortVal: e.detail.value
        })
    },

    getTabName(e) {
        this.setData({
            tabName: e.detail.value
        })
    },

    confirmSetSort() {
        let idx = this.data.tabArrIdx;
        let _tabArr = this.data.tabArr;
        _tabArr[idx].sort = this.data.sortVal ? parseInt(this.data.sortVal) : 0;
        this.setData({
            tabArr: _tabArr,
            isShowSort: false
        })        
    },

    showEdit(e) {
        let { name, cancel, idx } = e.currentTarget.dataset;

        if (cancel) {
            this.setData({
                isShowEdit: !this.data.isShowEdit
            })
        } else {
            this.setData({
                tabName: name,
                isShowEdit: !this.data.isShowEdit,
                tabArrIdx: idx
            })
        }
    },

    chooseLabel(e) {
        let _labelObj = this.data.labelObj;
        let flag = e.currentTarget.dataset.flag;
        _labelObj[flag] = !_labelObj[flag];
        this.setData({
            labelObj: _labelObj
        })
    },
    confirmSetTabName() {
        let idx = this.data.tabArrIdx;
        let _tabArr = this.data.tabArr;

        if (!this.data.tabName|| this.data.tabName && !this.data.tabName.trim()) {
             switch(parseInt(idx)) {
                case 0:
                _tabArr[idx].navname = '商家';
                break;
                case 1:
                _tabArr[idx].navname = '商品';
                break;
                case 2:
                _tabArr[idx].navname = '动态';
             }
        } else {
            _tabArr[idx].navname = this.data.tabName;
        }
        
        this.setData({
            tabArr: _tabArr,
            isShowEdit: false
        })
        
    },
    async submitUpdate() {
        wx.showLoading({
            title: '加载中...'
        })
        let resp = await editDetailConfig({
            openid: this.openid,
            Id: this.detailConfig.Id,
            StoreId: this.storeid,
            StoreSkin: parseInt(this.data.themeIdx) + 1,
            StoreNavigation: JSON.stringify(this.data.tabArr),
            StoreLink: null,
            StoreTag: JSON.stringify(this.data.labelObj)
        })
        wx.hideLoading();
        if (resp.code == 1) {
             this.setData({
                 content: '修改店铺成功！',
                 showTips: true
             })
             wx.navigateTo({
                url: '/pages/business_detail/business_detail?storeid='+this.storeid
            })

        } else {
            this.setData({
                content: resp.msg,
                showTips: true
            })
        }
    }
})