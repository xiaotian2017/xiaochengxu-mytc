const uploadimg = require("../../utils/uploadImgenew.js");
const app = getApp();
let l = console.log;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
// 获取同城卡列表
const getHalfCardList = ({ cityid, openid }) => httpClient({ addr: addr.Address.getHalfCardList, data: { cityid, openid } });
// 添加
const postAddDisSvcModel = (params) => httpClient({ method: 'post', addr: addr.Address.postAddDisSvcModel, data: params });
// 回填相关信息
const getAddDisSvcModel = (params) => httpClient({ method: 'post', addr: addr.Address.getAddDisSvcModel, data: params });
//获取同城卡子分类
const subHalfCardType = (params) => httpClient({ addr: addr.Address.GetGoodsTypeConfigs, data: params });
let getDay = () => {
    let dayArr = [];
    for (let i = 1; i < 32; i++) {
        dayArr.push(i + '号');
    }
    return dayArr;
}

let chooseWeekIdx;
let chooseDayIdx;
let copy
let weekArr = ['周一', '周二', '周三', '周四', '周五', '周六', '周日',]
let dayArr = getDay();
let isLimitSubmit;
Page({
    data: {
     
        subCityCardList:[],
        discountArr: ['5折', '5.5折', '5.8折', '6折', '6.5折', '6.8折', '7折', '7.5折', '7.8折', '8折', '8.5折', '8.8折', '9折', '9.5折'],
        isShowDate: false,
        weekArr,
        dayArr,
        releaseId: 0, // 发布id，添加是0，修改用传过来的id,
        cityCardList: [], // 购物卡类型
        mainmodel: null,
        uploadimgobjects: {
            "cityCardBanner": {
                config: {
                    maxImageCount: 9,
                    images_full: false,
                    imageUpdateList: [], // 编辑时新增的
                    imageList: [],
                    imageIdList: [] // 用来删除图片
                }
            },
            "cityCardDesp": {
                config: {
                    maxImageCount: 9,
                    images_full: false,
                    imageUpdateList: [], // 编辑时新增的
                    imageList: [],
                    imageIdList: [] // 用来删除图片
                }
            }
        },
        originalPrice: '',
        cityCardIndex: 0, // 购物卡类型idx  
        subCityCardIndex:0,  
        discountName: '',  // 优惠标题
        discountType: 0, // 默认全场折扣
        discountDescription: '', // 折扣描述
        isLimitNum: false,
        limitNum: '',
        isAppointment: false,
        dateType: 0,  // 默认按周
        discountArrIdx: 0,
        discountPrice: 0.00, // 折后价格
        isChooseWeek: false,
        chooseWeekIdx: chooseWeekIdx,
        weekChoosedStr: '', // 选中的week       
        weekChoosedArr: [],
        chooseDayIdx: chooseDayIdx,
        dayChoosedStr: '', // 选中的day,
        dayChoosedArr: [],
        storeid: ''
    },

    onLoad(options) {
        l(options.storeid);
        isLimitSubmit = false;
        chooseWeekIdx = [];
        chooseDayIdx = [];

        this.setData({
            storeid: options.storeid,
            releaseId: options.releaseId,
            chooseWeekIdx: chooseWeekIdx,
            chooseDayIdx: chooseDayIdx
        })
        app.getUserInfo(() => {
          this.getAddDisSvcModel(options.storeid, options.releaseId);
       
        })
    },
    // 上传图片
    uploadLogoImg: function (e) {
        var itemid = e.currentTarget.dataset.itemid
        uploadimg.shopChooseImage(e, this);
    },
    clearImage: function (e) {
        uploadimg.shopclearImage(e, this);
    },
    // 获取优惠标题
    getDiscountName(e) {
        this.setData({
            discountName: e.detail.value
        })
    },
    // 购物卡类型
    cityCardChange(e) {
        var that=this
        var selidx = e.detail.value
        this.setData({
          cityCardIndex: selidx
        })
        //获取子分类
        var p = this.data.cityCardList[selidx].Id
        that.subHalfCardType(p)
    },
    // 子购物卡类型
    subCityCardChange(e) {
      var selidx = e.detail.value
      this.setData({
        subCityCardIndex: selidx
      })
     
    },
    // 选择优惠类型
    chooseDiscountType(e) {
        this.setData({
            discountType: Number(e.currentTarget.dataset.type)
        })
    },
    // 获取描述内容
    getDescription(e) {
        this.setData({
            discountDescription: e.detail.value
        })
    },
    // 是否限制人数
    changeLimit() {
        this.setData({
            isLimitNum: !this.data.isLimitNum,
            limitNum: ''
        })
    },
    // 是否限制人数数量
    getLimitNum(e) {
        this.setData({
            limitNum: e.detail.value.trim()
        })
    },
    // 是否预约
    switchChange(e) {
        this.setData({
            isAppointment: e.detail.value
        })
    },
    // 显示日期选择
    showDataPicker() {
        this.setData({
            isShowDate: true
        })
    },
    // 取消情况 
    closeDate() {
        this.setData({
            isShowDate: false
        })

        if (!this.data.dateType) {
            let idxArr = [];
            weekArr.forEach((item, idx) => {
                this.data.weekChoosedArr.forEach((_item) => {
                    if (item == _item) {
                        idxArr.push(idx);
                    }
                })
            })
            this.setData({
                chooseWeekIdx: idxArr
            })
            chooseWeekIdx = idxArr;
            return;
        }

        let dayIdxArr = [];
        dayArr.forEach((item, idx) => {
            this.data.dayChoosedArr.forEach((_item) => {
                if (item == _item) {
                    dayIdxArr.push(idx);
                }
            })
        })
        this.setData({
            chooseDayIdx: dayIdxArr
        })
        chooseDayIdx = dayIdxArr;

    },
    // 确认选择
    confirmDate() {
        this.setData({
            isShowDate: false
        })
        let _weekChoosedArr = [];
        let _dayChoosedArr = [];
        if (!this.data.dateType) {
            this.setData({
                weekChoosedStr: ''
            })
            for (let item of this.data.chooseWeekIdx.sort()) {
                _weekChoosedArr.push(weekArr[item]);
                this.setData({
                    weekChoosedStr: this.data.weekChoosedStr + weekArr[item]
                })
            }
            this.setData({
                weekChoosedArr: _weekChoosedArr
            })

            l(this.data.weekChoosedStr);
            return;
        }

        this.setData({
            dayChoosedStr: ''
        })

        for (let item of this.data.chooseDayIdx.sort((a, b) => { return a - b; })) {
            _dayChoosedArr.push(dayArr[item]);

            this.setData({
                dayChoosedStr: this.data.dayChoosedStr + dayArr[item]
            })
        }

        this.setData({
            dayChoosedArr: _dayChoosedArr
        })

    },
    // 选择日期类型
    chooseDateType(e) {
        l(e.currentTarget.dataset.type);
        this.setData({
            dateType: Number(e.currentTarget.dataset.type)
        })
    },
    // 原价
    getOriginalPrice(e) {
        if (/^0+/.test(e.detail.value)) {
            this.setData({
                originalPrice: '',
            })
            return;
        }
        this.setData({
            originalPrice: e.detail.value,
            discountPrice: (Number(e.detail.value) * 0.1 * Number(this.data.discountArr[this.data.discountArrIdx].replace(/折/, ''))).toFixed(2)
        })

    },

    cityDiscountChange(e) {
        this.setData({
            discountArrIdx: e.detail.value,
            discountPrice: (Number(this.data.originalPrice) * 0.1 * Number(this.data.discountArr[e.detail.value].replace(/折/, ''))).toFixed(2)
        })
    },

    getWeek(e) {
        let weekIdx = e.currentTarget.dataset.weekidx;
        let _weekIdx = chooseWeekIdx.indexOf(weekIdx);

        if (_weekIdx > -1) {
            chooseWeekIdx.splice(_weekIdx, 1)
            this.setData({
                chooseWeekIdx: chooseWeekIdx
            })

        } else {
            chooseWeekIdx.push(weekIdx);
            this.setData({
                chooseWeekIdx: chooseWeekIdx
            })
        }
    },

    getDay(e) {
        let dayIdx = e.currentTarget.dataset.dayidx;
        let _dayIdx = chooseDayIdx.indexOf(dayIdx);

        if (_dayIdx > -1) {
            chooseDayIdx.splice(_dayIdx, 1)
            this.setData({
                chooseDayIdx: chooseDayIdx
            })
        } else {
            chooseDayIdx.push(dayIdx);
            this.setData({
                chooseDayIdx: chooseDayIdx
            })
        }
    },

    // 回填相关信息
    async getAddDisSvcModel(storeid, halfid) {
        let resp = await getAddDisSvcModel({
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            storeid,
            halfid
        });
        this.setData({
            mainmodel: resp.Data.mainmodel,
            cityCardList: resp.Data.mainmodel.cardsType,
            subCityCardList: resp.Data.mainmodel.subCardsType
        }, () => {
            if (halfid == 0) return;
            this.reEdit(halfid);
        })
    },
    reEdit() {
        if (this.data.mainmodel.AttachmentList.length > 0) {
            let convertList = [];
            let imgids = [];
            this.data.mainmodel.AttachmentList.forEach(function (v) {
                convertList.push(v.filepath)
                imgids.push(v.id);
            })
            this.setData({
                'uploadimgobjects.cityCardBanner.config.imageList': convertList,
                'uploadimgobjects.cityCardBanner.config.imageIdList': imgids
            })
        }
        if (this.data.mainmodel.AttachmentList2.length > 0) {
            let convertList = [];
            let imgids = [];
            this.data.mainmodel.AttachmentList2.forEach(function (v) {
                convertList.push(v.filepath)
                imgids.push(v.id);
            })
            this.setData({
                'uploadimgobjects.cityCardDesp.config.imageList': convertList,
                'uploadimgobjects.cityCardDesp.config.imageIdList': imgids
            })
        }


        this.data.cityCardList.forEach((item, idx) => {
            if (item.Id == this.data.mainmodel.HalfServices.TypeId) {
                this.setData({
                    cityCardIndex: idx
                })
            }
        })

        if (this.data.mainmodel.HalfServices.DiscountType == 1) {
            this.setData({
                discountType: 0
            })
        } else {
            this.setData({
                discountType: 1
            })
        }

        let leh = this.data.discountArr.length;

        for (let i = 0; i < leh; i++) {
            if (this.data.discountArr[i] == (this.data.mainmodel.HalfServices.Discount + '折')) {
                this.setData({
                    discountArrIdx: i
                })
                break;
            }
        }

        this.setData({
            originalPrice: '' + (this.data.mainmodel.HalfServices.OriginalPrice * 1000 / 100000),
            discountPrice: '' + (this.data.mainmodel.HalfServices.DiscountPrice / 100).toFixed(2),
        })

        if (this.data.mainmodel.HalfServices.ServicesTimeType == 1) {
            this.setData({
                dateType: 0,
                weekChoosedStr: this.data.mainmodel.HalfServices.ServicesTime
            })
        } else {
            this.setData({
                dateType: 1,
                dayChoosedStr: this.data.mainmodel.HalfServices.ServicesTime
            })
        }

        if (this.data.mainmodel.HalfServices.isNumber == 0) {
            this.setData({
                isLimitNum: true,
                limitNum: ''
            })
        } else {
            this.setData({
                isLimitNum: false,
                limitNum: this.data.mainmodel.HalfServices.Number
            })
        }

        if (this.data.mainmodel.HalfServices.IsReservation == 0) {
            this.setData({
                isAppointment: false
            })
        } else {
            this.setData({
                isAppointment: true
            })
        }
        let desp = this.data.mainmodel.HalfServices.DescriptionNoHtml;
        this.setData({
            discountName: this.data.mainmodel.HalfServices.Title,
            discountDescription: desp && desp != 'null' ? desp : ''
        })
    },

    // 确认发布
    async confirmRelease() {
        if (isLimitSubmit == true) return;
        let rp = {};
        let cityCardBannerConfig = this.data.uploadimgobjects.cityCardBanner.config;
        let cityCardDespConfig = this.data.uploadimgobjects.cityCardDesp.config;
        if (!(cityCardBannerConfig.imageList.length)) {
            app.ShowMsg('请至少添加一张轮播图!');
            return;
        }

        if (!(this.data.discountName.trim())) {
            app.ShowMsg('请填写优惠名称!');
            return;
        } else {
            rp.Title = this.data.discountName;
        }

        if (!this.data.discountType) {
            rp.DiscountType = 1;
            rp.DiscountPrice = 0;
        } else {
            rp.DiscountType = 2;
            if ((!this.data.originalPrice.trim())) {
                app.ShowMsg('原价不能为空！');
                return;
            }
            rp.OriginalPrice = this.data.originalPrice;
            rp.DiscountPrice = this.data.discountPrice;
        }

        if (!this.data.dateType) {
            rp.ServicesTimeType = 1;
            if (!(this.data.weekChoosedStr.trim())) {
                app.ShowMsg('请选择折扣时间！');
                return;
            }
            rp.ServicesTime = this.data.weekChoosedStr;
        } else {
            rp.ServicesTimeType = 2;
            if (!(this.data.dayChoosedStr.trim())) {
                app.ShowMsg('请选择折扣时间！');
                return;
            }
            rp.ServicesTime = this.data.dayChoosedStr;
        }

        if (this.data.isLimitNum) {
            rp.isNumber = 0;
            rp.Number = '';
        } else {
            if (!this.data.limitNum) {
                app.ShowMsg('请输入限制参与的人数');
                return;
            }
            rp.isNumber = 1;
            rp.Number = this.data.limitNum;
        }

        if (this.data.isAppointment) {
            rp.IsReservation = 1;
        } else {
            rp.IsReservation = 0;
        }

        let bannerImgList = this.data.uploadimgobjects.cityCardBanner.config;
        let despImgList = this.data.uploadimgobjects.cityCardDesp.config;

        let _bannerImgList = this.data.releaseId == 0 ? bannerImgList.imageList : bannerImgList.imageUpdateList;
        let _despImgList = this.data.releaseId == 0 ? despImgList.imageList : despImgList.imageUpdateList;
        rp.ImageIds = _bannerImgList.join(',');
        rp.ImageIds2 = _despImgList.length !== 0 ? _despImgList.join(',') : '';
        rp.Id = this.data.releaseId;
        rp.STitle = this.data.mainmodel.Store.SName; // SName
        rp.SId = this.data.storeid; // 店铺Id
        rp.CityCode = this.data.mainmodel.HalfServices.CityCode;
        rp.AreaId = this.data.mainmodel.HalfServices.AreaId;
        rp.AreaName = this.data.mainmodel.HalfServices.AreaName;
        rp.StreetId = this.data.mainmodel.Store.StreetId;
        rp.CitySubId = this.data.mainmodel.Store.CitySubId;
        rp.TypeId = this.data.cityCardList[this.data.cityCardIndex].Id;
        if (this.data.subCityCardList.length>0)
        {
          rp.CategoryId = this.data.subCityCardList[this.data.subCityCardIndex].Id;
        }
      
        rp.openid = app.globalData.userInfo.openId;
        rp.cityid = app.globalData.cityInfoId;
        rp.CityInfoId = app.globalData.cityInfoId;
        rp.Description = this.data.discountDescription;
        rp.DiscountAll = rp.Discount = this.data.discountArr[this.data.discountArrIdx].replace(/折/, '');

        if (!isLimitSubmit) {
            isLimitSubmit = true;

            wx.showLoading({
                title: '提交中',
            })
            let resp = await postAddDisSvcModel(rp);
            wx.hideLoading()
            if (resp.code) {
                wx.showToast({
                    title: '发布成功'
                })
                setTimeout(() => {
                  wx.redirectTo ({
                    url: '/pages/cityCard/cityCardMgrList?storeid=' + this.data.storeid
                    })
                }, 1000);
            } else {
                wx.showModal({
                    content: resp.msg,
                    showCancel: false
                })
                isLimitSubmit = false;
            }
        }
    },  // 回填相关信息
    async subHalfCardType(ctid) {
      var that=this
      let resp = await subHalfCardType({
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        ctid: ctid,
        itemtype:1
      });
      if (resp.Success)
      {
        that.setData({ subCityCardList: resp.Data.listsubcardtype, subCityCardIndex:0})
      }
   
    }
})