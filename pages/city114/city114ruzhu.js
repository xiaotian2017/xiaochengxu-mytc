let uploadimg = require("../../utils/uploadImgenew.js");
const regeneratorRuntime = require('../../utils/runtime');
var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const _host = addr.HOST;
let app = getApp();
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
let { Address } = require("../../utils/addr.js");

// 获取主行业分类
let getCategory = (cityid) => httpClient({ host: _host, addr: 'IBaseData/GetCompanyType', data: { cityid } });
let getSubCategory = (tid) => httpClient({ host: _host, addr: 'IBaseData/GetSubCompanyType', data: { tid } });
// 获取地区
let getArea = ({ cityid, panyId }) => httpClient({ host: _host, addr: 'IBaseData/GetArea', data: { cityid, panyId } })
let getSubAreaBigCase = (pid) => httpClient({ host: _host, addr: 'IBaseData/GetSubAreaBigCase', data: { pid } })
// 保存审核 
let savaStore = (paramStore) => httpClient({ host: _host, method: 'POST', addr: 'IBaseData/AddOrEditCompany', data: paramStore });
// 回填接口
let getAddOrEditCompany = (openid, panyid) => httpClient({ host: _host, addr: 'IBaseData/GetAddOrEditCompany', data: { openid, panyid } });
let getPayConfig = (cityid) => httpClient({ host: _host, addr: 'IBaseData/GetPayConfig', data: { cityid, paytype: 408 } })
let getAllCompanyTypeList = (cityid) => httpClient({ host: _host, addr: 'IBaseData/GetAllCompanyTypeList', data: { cityid } });

let _labelTagArr;
let cityid;
let storeParmas;
let areaCode;
let _paysArray;
Page({
    data: {
        paysArray: [], // 入驻支付
        paysArrayIdx: 0, // 入驻支付序号
        companyName: '', // 公司名
        category: '', // 所属行业
        companyArea: '', // 公司地区
        companyAddress: '', // 公司地址
        tradeId: '', // 行业id
        isSubCategory: false,
        isOpenCategory: false,
        storeId: '', // 店铺id
        ruzhuId: 0,// 编辑还是新增控制id
        areaId: '',
        streetId: '',
        latitude: 0,
        longitude: 0,
        storeInfo: '', // 商铺链接
        linkPhone: '', // 联系电话1
        linkEmail: '',// 联系电话2
        intro: '',//  简介 
        multiIndex: [0, 0, 0],
        categoryArray: [],
        labelTagArr: [],
        labelContent: '',
        multiArray: [[], []],
        uploadimgobjects: {
            "bossWx": { // 老板微信
                config: {
                    maxImageCount: 1,
                    images_full: false,
                    imageUpdateList: [], // 编辑时新增的
                    imageList: [],
                    imageIdList: [] // 用来删除图片
                }
            },
            "bossWeapp": { // 老板微信
                config: {
                    maxImageCount: 1,
                    images_full: false,
                    imageUpdateList: [], // 编辑时新增的
                    imageList: [],
                    imageIdList: [] // 用来删除图片
                }
            }
        },
        ruZhuType: null
    },

    // panyid 和 ruzhuID 做新增和编辑区分 还有付款 的显隐
    onLoad: function (options) {

        _labelTagArr = [];
        storeParmas = {};
        _paysArray = [];

        this.setData({
            ruzhuId: options.ruzhuId,
            ruZhuType: options.ruZhuType
        })
        app.getUserInfo(() => {
            cityid = app.globalData.cityInfoId;
            areaCode = app.globalData.areaCode;
            storeParmas.cityCode = app.globalData.areaCode;
            storeParmas.CityCode = app.globalData.areaCode;  // 换cityid         
            storeParmas.CityInfoId = app.globalData.cityInfoId;
            storeParmas.openid = app.globalData.userInfo.openId;
            this.getArea(options.ruzhuId);
            this.getPayConfig();
            if (Number(options.ruzhuId)) {
                this.getAddOrEditCompany(app.globalData.userInfo.openId, options.ruzhuId);
            }
        })
    },

    // 编辑回填
    async getAddOrEditCompany(openId, panyid) {
        wx.showLoading();
        let resp = await getAddOrEditCompany(openId, panyid);
        wx.hideLoading();
        let _resp = resp.Data.mainmodel;
        _labelTagArr = _resp.Welfare && _resp.Welfare !== null && _resp.Welfare !== 'null' && _resp.Welfare.split(';');
        this.setData({
            companyName: _resp.Name,
            intro: _resp.Introduce,
            companyAddress: _resp.Address,
            category: _resp.Trade,
            tradeId: _resp.TradeId,
            labelTagArr: _resp.Welfare && _resp.Welfare !== null && _resp.Welfare !== 'null' && _resp.Welfare.split(';'),
            companyArea: _resp.AreaName,
            areaId: _resp.AreaId,
            streetId: _resp.StreetId,
            latitude: _resp.lat,
            longitude: _resp.lng,
            linkPhone: _resp.LinkPhone,
            linkEmail: _resp.LinkEmail && _resp.LinkEmail != 'null' && _resp.LinkEmail || '',
            storeInfo: _resp.storeInfo,
            ruzhuId: _resp.Id,
            'uploadimgobjects.bossWx.config.imageList': _resp.LogoUrl && _resp.LogoUrl.split(),
            'uploadimgobjects.bossWeapp.config.imageList': _resp.xcxImgUrl && _resp.xcxImgUrl.split() || [],
        })
    },

    uploadLogoImg: function (e) {
        var itemid = e.currentTarget.dataset.itemid;

        wx.showLoading({
            title: '开始上传'
        })
        uploadimg.shopChooseImage(e, this);
    },
    // 确认选择支付     
    bindPickerPayChange(e) {
        this.setData({
            paysArrayIdx: e.detail.value
        })
    },
    // 获取入驻支付配置
    async getPayConfig() {
        let resp = await getPayConfig(cityid);
        // resp.Data.listpayconfig = [];
        if (!resp.Data.listpayconfig.length) {
            this.setData({
                paysArray: []
            })
            return;
        }

        let _resp = [];
        _paysArray = resp.Data.listpayconfig; // 保存未原始数据
        for (let item of resp.Data.listpayconfig) {
            _resp.push(item.Price * 1000 / 100000 + '元/' + item.ShowNote)
        }

        this.setData({
            paysArray: _resp,
        })
    },
    // 获取行业分类数据
    async getCategory() {
        wx.showLoading()
        let resp = await getAllCompanyTypeList(cityid);
        wx.hideLoading()
        this.setData({
            isOpenCategory: true,
            isSubCategory: false,
            categoryArray: resp.Data.AllCompanyCategory
        })
    },
    // 获取行业子分类数据
    async getSubCategory(e) {
        if (!this.data.isSubCategory) {
            let _secondCompanyCategoryList = this.data.categoryArray[e.currentTarget.dataset.idx].SecondCompanyCategoryList
            if (_secondCompanyCategoryList.length == 0) {
                app.ShowMsg('该类目下无二级类目，请重选！')
                this.setData({
                    isOpenCategory: false,
                    category: '',
                    tradeId: ''
                })
                return
            }
            this.setData({
                categoryArray: this.data.categoryArray[e.currentTarget.dataset.idx].SecondCompanyCategoryList,
                isSubCategory: true,
                category: e.currentTarget.dataset.name + ';',
            })
        } else {
            this.setData({
                category: this.data.category + e.currentTarget.dataset.name,
                isOpenCategory: false,
                tradeId: e.currentTarget.dataset.tid
            })

        }
    },
    // 获取地区
    async getArea(ruzhuId) {
        let resp = (await getArea({
            cityid,
            panyId: ruzhuId
        }));

        this.setData({
            'multiArray[0]': JSON.parse(resp.Data.list.AreaJsonStr),
            'multiArray[1]': JSON.parse(resp.Data.list.streetJsonStr)
        })
    },
    // 区域改变  
    async changeArea(e) {
        // (this.data.multiArray[0][Number(e.detail.value)]).Code
        // 'multiArray[0]': JSON.parse(resp.Data.list.AreaJsonStr),
        if (e.detail.column == 0) {
            let resp = await getSubAreaBigCase((this.data.multiArray[0][Number(e.detail.value)]).Code);
            this.setData({
                'multiArray[1]': resp.Data.list.splice(1),
            })
        }
    },
    // 获取地区确认
    changeAreaVal(e) {
        let val = e.detail.value;
        if (val[1] === null) {
            val[1] = 0;
        }
        this.setData({
            companyArea: this.data.multiArray[0][val[0]].Name + this.data.multiArray[1][val[1]].Name,
            areaId: this.data.multiArray[0][val[0]].Code,
            streetId: this.data.multiArray[1][val[1]].Code
        })
    },
    // 获取公司位置
    getCompanyPosition() {
        // 有时间封通用promise 
        let that = this;
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.chooseLocation({
            success(res) {

                that.setData({
                    companyAddress: res.address,
                    latitude: res.latitude,
                    longitude: res.longitude
                })
            }
        })

    },
    // 关闭分类 
    closeCategory() {
        if (this.data.isSubCategory) {
            this.setData({
                category: '',
                tradeId: ''
            })
        }

        this.setData({
            isOpenCategory: false
        })
    },
    // 获取公司名
    getCompanyName(e) {

        this.setData({
            companyName: e.detail.value
        })
    },
    // 获取标签
    getLabel(e) {
        this.setData({
            labelContent: e.detail.value
        })
    },
    // 添加标签
    addLabel() {
        if (this.data.labelContent.trim()) {
            _labelTagArr.push(this.data.labelContent);
            this.setData({
                labelTagArr: _labelTagArr,
                labelContent: ''
            })
        }
    },
    // 删除标签
    removeLabel(e) {
        _labelTagArr.splice(e.target.dataset.idx, 1);

        this.setData({
            labelTagArr: _labelTagArr
        })
    },
    // 获取个人简介
    getIntro(e) {
        this.setData({
            intro: e.detail.value
        })

    },
    // 获取公司地址
    getCompanyAddress(e) {
        this.setData({
            companyAddress: e.detail.value
        })

    },
    // 获取公司商铺链接
    getCompanyLink(e) {
        this.setData({
            storeInfo: e.detail.value
        })

    },
    catchtouchmove(e) {

    },
    // 获取联系电话1
    getTelNum1(e) {
        this.setData({
            linkPhone: e.detail.value
        })
    },
    // 获取联系电话2
    getTelNum2(e) {

        this.setData({
            linkEmail: e.detail.value
        })

    },
    // 保存入驻
    async savaRuzhu() {
        if (!this.data.uploadimgobjects.bossWx.config.imageList.length) {
            app.ShowMsg('请上传老板微信二维码!');
            return;
        }
        if (!(this.data.companyName).trim()) {
            app.ShowMsg('请输入公司名称!');
            return;
        }

        if (!(this.data.category).trim()) {
            app.ShowMsg('请选择行业!');
            return;
        }
        if (!(this.data.companyArea).trim()) {
            app.ShowMsg('请选择所属地区!');
            return;
        }
        if (!(this.data.companyAddress).trim()) {
            app.ShowMsg('请选择公司地址!');
            return;
        }

        if (!this.data.linkPhone) {
            app.ShowMsg('请输入联系电话1!');
            return;
        }


        let LogoUrl = this.data.uploadimgobjects.bossWx.config.imageList[this.data.uploadimgobjects.bossWx.config.imageList.length - 1];
        let xcxImgUrl = this.data.uploadimgobjects.bossWeapp.config.imageList[this.data.uploadimgobjects.bossWeapp.config.imageList.length - 1];
        storeParmas.Name = this.data.companyName;
        storeParmas.LogoUrl = LogoUrl
        storeParmas.xcxImgUrl = xcxImgUrl && xcxImgUrl || '';
        storeParmas.Address = this.data.companyAddress;
        storeParmas.lat = this.data.latitude;
        storeParmas.lng = this.data.longitude;
        storeParmas.AreaId = this.data.areaId;
        storeParmas.AreaName = this.data.companyArea;
        storeParmas.StreetId = this.data.streetId;
        storeParmas.LinkPhone = this.data.linkPhone;
        storeParmas.LinkEmail = this.data.linkEmail;
        storeParmas.TradeId = this.data.tradeId;
        storeParmas.Trade = this.data.category
        storeParmas.Welfare = this.data.labelTagArr && this.data.labelTagArr.join(';') || '';
        storeParmas.Introduce = this.data.intro;
        storeParmas.storeInfo = this.data.storeInfo;
        storeParmas.id = this.data.ruzhuId;
        wx.showLoading({
            title: '提交中',
        })

        let refun = (param, state) => {
            if (state == 0) {
                wx.showToast({
                    title: '您已取消付款!',
                    icon: 'faile',
                    duration: 2000
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
                    wx.redirectTo({
                        url: '/pages/city114/city114Mine?ruZhuType=1',
                    })
                }, 1000)
            }
        }

        let resp = await savaStore(storeParmas);

        if (!resp.code) {
            wx.hideLoading();
            app.ShowMsg(resp.msg);
        } else {
            wx.hideLoading();
            if (this.data.ruzhuId == 0 && this.data.paysArray.length) {

                let param = {
                    itemid: resp.Data.id,
                    paytype: 408,
                    extype: _paysArray[this.data.paysArrayIdx].ExtendType,
                    extime: 1,
                    quantity: 1,
                    openId: app.globalData.userInfo.openId,
                    remark: '同城114申请入驻',
                    areacode: app.globalData.areaCode,
                }

                util.AddOrder(param, refun)
            } else {
                wx.showToast({
                    title: resp.Message,
                    icon: 'success',
                    duration: 1000
                })
                if (this.data.ruZhuType != 1) {
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/city114/city114Mine?ruZhuType=0'
                        })
                    }, 1000)
                } else {
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/city114/city114Mine?ruZhuType=1'
                        })
                    }, 1000)
                }

            }
        }
    }
})