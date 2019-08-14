const uploadimg = require("../../utils/uploadImgenew.js");
const app = getApp();
const util = require("../../utils/util.js");
const addr = require("../../utils/addr.js");
const host = addr.HOST;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
const addVoucher = (p) => httpClient({ host, addr: 'IBaseData/AddVoucher', data: p });
// 获取同城卡信息
const getAddDisSvcModel = (paramsObj) => httpClient({ addr: addr.Address.getAddDisSvcModel, data: paramsObj });
// 获取再编辑信息
const getAddOrEditGood = (paramsObj) => httpClient({ addr: addr.Address.GetAddOrEditGood, data: paramsObj });
// 发布或者修改商品
const addGoods = (paramsObj) => httpClient({ addr: addr.Address.AddGoods, data: paramsObj });
// 获取商品分类
const get_AddGoodTypeViewModel = (paramsObj) => httpClient({ addr: addr.Address.Get_AddGoodTypeViewModel, data: paramsObj });
// 修改\删除\添加商品分类
const addOrEditGoodsType = (paramsObj) => httpClient({ method: 'POST', addr: addr.Address.AddOrEditGoodsType, data: paramsObj });
// 删除规格 
const delGoodAttr = (paramsObj) => httpClient({ method: 'POST', addr: addr.Address.DelGoodAttr, data: paramsObj });
// 同城卡子分类
const getGoodsTypeConfigs = (paramsObj) => httpClient({ addr: addr.Address.GetGoodsTypeConfigs, data: paramsObj });

let _sizeNodeArr, saveChooseFareArr, releaseGoodsParamsObj = null;
// 发布成功清内存

let limtNum = [];

Page({
    data: {
        goodsId: 0,
        goodsName: '', // 标题
        goodsDesp: '', // 描述
        sizeNodeArr: [], // 类型节点数组
        cityCardSizeArr: [], // 同城卡类型
        cityCardCateArr: [],
        cityCardSizeIdx: 0,
        cityCardCateIdx: 0,
        cityCardDiscount: '',
        cityCardLimitNum: '',
        chooseFareArr: [0],
        chooseFareName: '', // 选中运费的名称
        isAttr: 0, // 0为未增加商品类型， 1为增加商品类型
        uploadimgobjects: {
            // 商品主图
            "mainGoodsImg": {
                config: {
                    maxImageCount: 9,
                    images_full: false,
                    imageUpdateList: [], // 编辑时新增的
                    imageList: [],
                    imageIdList: [] // 用来删除图片
                }
            },
            "despGoodsImg": {
                config: {
                    maxImageCount: 8,
                    images_full: false,
                    imageUpdateList: [], // 编辑时新增的
                    imageList: [],
                    imageIdList: [] // 用来删除图片
                }
            }
        },
        price: '',
        originPrice: '',
        stock: '',
        fareTemplateArr: [],
        cateArr: [],
        cateIdx: null,
        cateName: '请选择',
        createCateName: '',
        integrationPrice: '', // 抵扣金额
        isUseIntegral: false,
        isAddGoodsSize: false,
        isShowFareTemplate: false,
        isShowCate: false,
        isShowCreateCateName: false,
        isShowCityCard: false,
        isShowCityCardBtn: false, // 同城卡开关按钮 
        isShowDatePicker: false, // 日期选择器按钮
        value: [],
        isVoucher: false,
        voucherPrice: '',
        voucherNum: '',
        voucherScopeIdx: 1,
        fullSubtraction: '',
        voucherBeginTime: '',
        initVoucherBeginValue: [], // 再次打开选择器时的value
        voucherEndTime: '',
        initVoucherEndValue: [],
        voucherValidDay: '',
        isFare: true,
        discountPayInStore: '', // 到店付价格
        distribution: '',
        isShowDistribution: false,
        // 时间选择器组件
        isTimePicker: false,
        timerValueArrIdx: 0
    },
    onLoad(options) {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            this.sid = options.storeid;
            this.state = options.state;

            this.setData({
                goodsId: parseInt(options.goodsId)
            })

            this.goodsId = parseInt(options.goodsId);
            _sizeNodeArr = [];
            releaseGoodsParamsObj = {};
            releaseGoodsParamsObj.Id = this.goodsId;
            releaseGoodsParamsObj.CityInfoId = app.globalData.cityInfoId;
            releaseGoodsParamsObj.cityid = this.cityid;
            releaseGoodsParamsObj.openid = this.openid;
            releaseGoodsParamsObj.StoreId = this.sid;

            this.setData({
                voucherBeginTime: '不填视为立即可用',
                voucherEndTime: '不填视为长期可用'
            })

            this.get_AddGoodTypeViewModel();
            this.getAddDisSvcModel();

        })

        wx.setNavigationBarTitle({
            title: "发布店铺商品"
        })
    },
    //  获取商品回填或者运费模板信息
    async getAddOrEditGood() {
        wx.showLoading();
        let resp = await getAddOrEditGood({
            openid: this.openid,
            cityid: this.cityid,
            goodid: this.goodsId,
            storeid: this.sid
        });
        wx.hideLoading();
        this.setData({
            fareTemplateArr: [{ Id: 0, Name: '到店自提' }, ...resp.Data.listfreight]
        })

        // 回填信息
        if (this.goodsId !== 0) {
            let good = resp.Data.good;
            this.setData({
                goodsName: good.GoodsName,
                goodsDesp: good.Description && good.Description != 'null' ? good.Description : ''
            })

          
            if(good.IsFx!=0) {
                this.setData({
                    isShowDistribution: true,
                    distribution: good.FxRate
                })
            }

            // 未添加商品规格
            if (good.IsAttr === 0) {
                this.setData({
                    price: good.Price * 10000 / 1000000,
                    originPrice: good.OriginalPrice ? good.OriginalPrice * 10000 / 1000000 : '',
                    stock: good.Stock,
                    isAttr: 0
                })
            } else {
                this.goodattr = resp.Data.goodattr;

                for (let item of this.goodattr) {
                    item.Price = item.Price * 10000 / 1000000;
                }

                _sizeNodeArr = this.goodattr;
                console.log(_sizeNodeArr);
                this.setData({
                    sizeNodeArr: this.goodattr,
                    isAddGoodsSize: true,
                    isAttr: 1
                })
            }

            // 运费
            let freightIdsArr = good.FreightIds.split(',');
            let freightIdx = [];
            let _chooseFareName = [];
            let fareTemplateArr = this.data.fareTemplateArr;

            for (let [idx, item] of fareTemplateArr.entries()) {
                for (let [_idx, _item] of freightIdsArr.entries()) {
                    if (parseInt(fareTemplateArr[idx].Id) === parseInt(_item)) {
                        freightIdx.push(idx);       // fareTemplateArr 中的序号             
                    }
                }
            }

            for (let [idx, item] of freightIdx.entries()) {
                _chooseFareName[idx] = fareTemplateArr[item].Name;
            }

            this.setData({
                chooseFareArr: freightIdx,
                chooseFareName: _chooseFareName.join(';')
            })
            // 分类
            if (good.TypeId != 0) {
                for (let [idx, item] of this.data.cateArr.entries()) {
                    if (good.TypeId == item.Id) {
                        this.setData({
                            cateIdx: idx,
                            cateName: item.Name
                        })
                    }
                }
            }
            // 积分抵用
            if (good.IntegrationState == 1) {
                this.setData({
                    isUseIntegral: true,
                    integrationPrice: good.IntegrationPrice * 10000 / 1000000
                })
            }
            // 限制名额
            if (good.LimitNum != 0) {
                this.setData({
                    cityCardLimitNum: good.LimitNum
                })
            }

            // 同城卡
            if (good.hctId != 0) {
                let resp = await getGoodsTypeConfigs({
                    cityid: this.cityid,
                    openid: this.openid,
                    ctid: good.hctId,
                    itemtype: 1
                })

                this.setData({
                    cityCardCateArr: resp.Data.listsubcardtype
                })

                // 卡类型
                for (let [idx, item] of this.data.cityCardSizeArr.entries()) {
                    if (good.hctId == item.Id) {
                        this.setData({
                            cityCardSizeIdx: idx
                        })
                        break;
                    }
                }
                // 子分类
                for (let [idx, item] of this.data.cityCardCateArr.entries()) {
                    if (good.CategoryId == item.Id) {
                        this.setData({
                            cityCardCateIdx: idx
                        })
                        break;
                    }
                }
                this.setData({
                    isShowCityCard: true,
                    cityCardDiscount: good.discount
                })
            }
            // 回填图片
            if (resp.Data.listdetailimg.length > 0) {
                let convertList = [];
                let imgids = [];
                resp.Data.listdetailimg.forEach(function (v) {
                    convertList.push(v.filepath)
                    imgids.push(v.id);
                })
                this.setData({
                    'uploadimgobjects.despGoodsImg.config.imageList': convertList,
                    'uploadimgobjects.despGoodsImg.config.imageIdList': imgids
                })
            }
            if (resp.Data.listlunboimg.length > 0) {
                let convertList = [];
                let imgids = [];
                resp.Data.listlunboimg.forEach(function (v) {
                    convertList.push(v.filepath)
                    imgids.push(v.id);
                })
                this.setData({
                    'uploadimgobjects.mainGoodsImg.config.imageList': convertList,
                    'uploadimgobjects.mainGoodsImg.config.imageIdList': imgids
                })
            }

            this.setData({
                isFare: resp.Data.good.FreightIds == 0 ? true : false,
                discountPayInStore: resp.Data.good.ToShopPay ? resp.Data.good.ToShopPay : ''
            })
        }
    },


    // 获取同城卡相关信息
    async getAddDisSvcModel() {
        // 没有同城卡的情况
        let resp = await getAddDisSvcModel({ halfid: 0, cityid: this.cityid, openid: this.openid, storeid: this.sid });
        this.mainmodel = resp.Data.mainmodel;

        if (this.mainmodel.cardsType.length > 0) {
            this.setData({
                isShowCityCardBtn: true
            })
        }

        this.setData({
            cityCardSizeArr: this.mainmodel.cardsType,
            cityCardCateArr: this.mainmodel.subCardsType
        })
    },
    // 上传图片
    uploadLogoImg: function (e) {
        let itemid = e.currentTarget.dataset.itemid;
        uploadimg.shopChooseImage(e, this);
    },

    clearImage: function (e) {
        uploadimg.shopclearImage(e, this);
    },
    // 获取商品标题
    getGoodsName(e) {
        this.setData({
            goodsName: e.detail.value
        })
    },
    // 获取商品描述
    getGoodsDesp(e) {
        this.setData({
            goodsDesp: e.detail.value
        })
    },
    // 新增类型节点
    addGoodsSizeNode() {
        let lgh = this.data.sizeNodeArr.length;
        if (lgh >= 20) {
            wx.showModal({
                title: '提示',
                content: '商品型号最多添加20个!',
                showCancel: false
            })
            return;
        }
        _sizeNodeArr.push({
            AttrName: '',
            Price: '',
            Stock: '',
            Id: 0
        });

        this.setData({
            isAddGoodsSize: true,
            sizeNodeArr: _sizeNodeArr
        })

        if (lgh === 0) {
            this.setData({
                price: '',
                originPrice: '',
                stock: '',
                isAttr: 1
            })
        }
    },

    // 删除当前类型节点
    delGoodsSizeNode(e) {
        const idx = e.currentTarget.dataset.idx;

        let that = this;
        if (_sizeNodeArr[idx].Id != 0) {

            wx.showModal({
                title: '提示',
                content: '你确定要删除该规格吗？删除不可恢复,请谨慎操作！',
                async  success(res) {
                    if (res.confirm) {
                        let resp = await delGoodAttr({
                            cityid: that.cityid,
                            openid: that.openid,
                            id: _sizeNodeArr[idx].Id
                        })
                        if (resp.Success) {
                            wx.showToast({
                                title: '删除成功!'
                            })
                            _sizeNodeArr.splice(idx, 1);
                            that.setData({
                                sizeNodeArr: _sizeNodeArr
                            })
                        } else {
                            wx.showToast({
                                title: resp.msg
                            })
                        }
                    }
                }
            })

        } else {
            _sizeNodeArr.splice(idx, 1);
            this.setData({
                sizeNodeArr: _sizeNodeArr
            })
        }

        if (_sizeNodeArr.length === 0) {
            this.setData({
                isAddGoodsSize: false,
                isAttr: 0
            })
        }
    },
    // 获取规格
    getSize(e) {
        const idx = e.currentTarget.dataset.idx;
        _sizeNodeArr[idx].AttrName = e.detail.value.trim();
        this.setData({
            sizeNodeArr: _sizeNodeArr
        })
    },
    // 获取型号价格
    getSizePrice(e) {
        const idx = e.currentTarget.dataset.idx;
        _sizeNodeArr[idx].Price = util.verifyNum(e.detail.value);
        this.setData({
            sizeNodeArr: _sizeNodeArr
        })
    },
    // 获取型号库存
    getSizeStock(e) {
        const idx = e.currentTarget.dataset.idx;
        _sizeNodeArr[idx].Stock = e.detail.value;
        this.setData({
            sizeNodeArr: _sizeNodeArr
        })
    },
    // 获取未添加型号价格
    getPrice(e) {
        this.setData({
            price: util.verifyNum(e.detail.value)
        })
    },
    // 获取原价
    getOriginPrice(e) {
        this.setData({
            originPrice: util.verifyNum(e.detail.value)
        })
    },
    // 获取库存
    getStock(e) {
        this.setData({
            stock: parseInt(e.detail.value)
        })
    },
    // 积分switch切换
    integralChange() {
        this.setData({
            isUseIntegral: !this.data.isUseIntegral
        })
        if (!this.data.isUseIntegral) {
            this.setData({
                integrationPrice: ''
            })
        }
    },
    // 打开运费模板
    openFareTemplate(e) {
        // this.setData({
        //     isShowFareTemplate: true
        // })
    },
    fareChange(e) {
        this.setData({
            isFare: e.detail.value,
            discountPayInStore: e.detail.value ? this.data.discountPayInStore : ''
        })
    },
    // 关闭运费模板
    closeFareTemplate() {
        this.setData({
            isShowFareTemplate: false,
            // chooseFareArr: [],
            // _chooseFareName: ''
        })
        wx.pageScrollTo({
            scrollTop: 2000
        })
    },
    // 确认运费模板
    confirmFareTemplate() {

        let _chooseFareName = [];
        if (this.data.chooseFareArr.length == 0) {
            this.setData({
                chooseFareName: '',
                isShowFareTemplate: false
            })
        }
        else {
            for (let [idx, item] of this.data.chooseFareArr.entries()) {
                _chooseFareName[idx] = this.data.fareTemplateArr[item].Name;
            }

            this.setData({
                chooseFareName: _chooseFareName.join(';'),
                isShowFareTemplate: false
            })
        }
        setTimeout(() => {
            wx.pageScrollTo({
                scrollTop: 5000
            })
        }, 100)
    },

    //运费 获取选中的模板idx直接拿idx去找匹配模板数据
    fareTemplateChange(e) {
        let idx = e.currentTarget.dataset.idx;
        let _chooseFareArr = this.data.chooseFareArr;

        let exitIdx = this.data.chooseFareArr.indexOf(idx);
        if (idx == 0) {
            return
        }
        if (exitIdx > -1) {  // 存在删除
            _chooseFareArr.splice(exitIdx, 1);
            this.setData({
                chooseFareArr: _chooseFareArr
            })
        } else {
            this.setData({
                chooseFareArr: [...this.data.chooseFareArr, e.currentTarget.dataset.idx]
            })
        }
    },
    // 获取商品分类
    async get_AddGoodTypeViewModel() {
        let resp = await get_AddGoodTypeViewModel({
            cityId: this.cityid,
            storeid: this.sid
        });
        this.getAddOrEditGood();
        this.setData({
            cateArr: resp.Data.GoodsType.TypeConfigList
        })

    },
    // 打开添加到分类
    openCate() {
        this.setData({
            isShowCate: true
        })
    },
    closeCate() {
        this.setData({
            isShowCate: false,
            // cateIdx: null,
            // cateName: '请选择'
        })
        setTimeout(() => {
            wx.pageScrollTo({
                scrollTop: 5000
            })
        }, 100)

    },
    // 确认分类选择
    confirmCate() {
        this.setData({
            isShowCate: false
        })
        if (this.data.cateIdx !== null) {
            this.setData({
                cateName: this.data.cateArr[this.data.cateIdx].Name
            })
        } else {
            this.setData({
                cateName: '请选择'
            })
        }
        setTimeout(() => {
            wx.pageScrollTo({
                scrollTop: 5000
            })
        }, 100)
    },
    // 分类选择变化
    cateRadioChange(e) {
        this.setData({
            cateIdx: e.currentTarget.dataset.idx
        })
    },
    openCreateCateNameLayer() {
        this.setData({
            isShowCreateCateName: true
        })
    },
    async addOrEditGoodsType() {
        let resp = await addOrEditGoodsType();
        console.log(resp);
    },
    // 获取新建分类名称
    getCreateCateName(e) {
        this.setData({
            createCateName: e.detail.value
        })
    },
    // 确认新建分类
    async confirmCreateCateName() {
        if (!this.data.createCateName.trim()) {
            this.showModal('请填写分类名称！');
            return;
        }
        let resp = await addOrEditGoodsType({
            cityId: this.cityid,
            openid: this.openid,
            StoreId: this.sid,
            Id: 0,
            name: this.data.createCateName
        });
        if (resp.code == 1) {
            this.get_AddGoodTypeViewModel();
            this.setData({
                isShowCreateCateName: false,
                createCateName: ''
            })
        } else {
            this.showModal(resp.msg);
        }
    },
    // 取消新建分类
    closeCreateCateNameLayer() {
        this.setData({
            isShowCreateCateName: false,
            createCateName: ''
        })
    },
    // 抵扣金额
    getIntegral(e) {
        this.setData({
            integrationPrice: util.verifyNum(e.detail.value)
        })
    },
    // 获取同城卡类型
    async getCityCardSize(e) {
        let idx = e.detail.value;

        let resp = await getGoodsTypeConfigs({
            cityid: this.cityid,
            openid: this.openid,
            ctid: this.data.cityCardSizeArr[idx].Id,
            itemtype: 1
        })

        this.setData({
            cityCardSizeIdx: idx,
            cityCardCateArr: resp.Data.listsubcardtype
        })
    },
    // 获取同城卡分类
    getCityCardCate(e) {
        this.setData({
            cityCardCateIdx: e.detail.value
        })
    },
    // 获取同城卡折扣力度
    getCityCardDiscount(e) {
        this.setData({
            cityCardDiscount: util.verifyNum(e.detail.value)
        })
    },
    // 获取限制购买数量
    getLimitNum(e) {
        this.setData({
            cityCardLimitNum: e.detail.value
        })
    },
    // 同城卡开关
    toggleCityCard() {
        this.setData({
            isShowCityCard: !this.data.isShowCityCard
        })
    },
    showModal(content) {
        wx.showModal({
            title: '提示',
            content,
            showCancel: false
        })
    },
    // 发布商品
    async releaseGoods() {

        let _parseFloat = parseFloat;
        let _parseInt = parseInt;
        // 验证人人分销
        if(this.data.isShowDistribution) {
            console.log(this.data.distribution)
            if(!this.data.distribution||this.data.distribution==0) {
                app.ShowMsg('分销比例不能为空且不能为0');
                return
            }                      
        }


        releaseGoodsParamsObj.IsFx = this.data.isShowDistribution ? 1 : 0
        releaseGoodsParamsObj.FxRate = this.data.isShowDistribution ? this.data.distribution:''

        // 验证代金券

        if (this.data.goodsId == 0 && this.data.isVoucher) {
            if (!this.data.voucherPrice) {
                app.ShowMsg('发放代金券的金额不能为0！');
                return;
            }

            if (!this.data.voucherNum) {
                app.ShowMsg('发放代金券的数量不能为0！');
                return
            }

            if (this.data.voucherScopeIdx == 2 && !this.data.fullSubtraction) {
                app.ShowMsg('发放代金券满减金额不能为0！');
                return
            }

            // if (!this.data.voucherValidDay) {
            //     app.ShowMsg('有效天数不能为0！');
            //     return
            // }

            if (this.data.voucherBeginTime != '不填视为立即可用') {
                if (this.data.voucherEndTime == '不填视为长期可用') {
                    app.ShowMsg('请填写代金券结束时间！');
                    return
                }
            }

            if (this.data.voucherEndTime != '不填视为长期可用') {
                if (this.data.voucherBeginTime == '不填视为立即可用') {
                    app.ShowMsg('请填写代金券开始时间！');
                    return
                }
            }

            if (new Date(this.data.voucherBeginTime).getTime() > new Date(this.data.voucherEndTime).getTime()) {
                app.ShowMsg('代金券结束时间必须大于开始时间！')
                return
            }

            if ((new Date(this.data.voucherEndTime).getTime() - new Date(this.data.voucherBeginTime).getTime()) / (24 * 60 * 60 * 1000) < this.data.voucherValidDay) {
                app.ShowMsg('代金券有效天数不能大于代金券使用周期');
                return
            }
        }
        // 商品名      
        if (this.data.goodsName.trim() !== '') {
            releaseGoodsParamsObj.goodsName = this.data.goodsName;
        } else {
            this.showModal('请填写商品名称');
            return;
        }

        // 描述
        releaseGoodsParamsObj.Description = this.data.goodsDesp;

        let _price = this.data.price;
        // 未添加商品类型
        if (this.data.isAttr === 0) {
            let _originPrice = this.data.originPrice;
            let _stock = this.data.stock;
            if (!_price) {
                this.showModal('商品价格不能为空或0！');
                return;
            }
            // 原价不是必填
            if (_originPrice !== '') {
                if (_originPrice == 0) {
                    this.showModal('原价不能为0！');
                    return;
                }
                if (_parseFloat(_originPrice) * 100 <= _parseFloat(_price) * 100) {
                    this.showModal("原价必须大于购买价格！");
                    return;
                }
                releaseGoodsParamsObj.OriginalPrice = _parseFloat(_originPrice) * 1000000 / 10000;
            } else {
                releaseGoodsParamsObj.OriginalPrice = '';
            }

            if (!_stock) {
                this.showModal('商品库存不能为空或0！');
                return;
            } else {
                releaseGoodsParamsObj.Stock = releaseGoodsParamsObj.Inventory = _parseInt(_stock);
            }

            releaseGoodsParamsObj.Price = _parseFloat(_price) * 1000000 / 10000;

            releaseGoodsParamsObj.spec_detail = '';
            releaseGoodsParamsObj.attrids = '';
        }

        let copySizeNodeArr = this.data.sizeNodeArr;
        // 添加商品类型
        if (this.data.isAttr === 1) {

            for (let item of copySizeNodeArr) {
                if (item.AttrName === '') {
                    this.showModal('规格不能为空');
                    return;
                }
                if (item.Price === '' || item.Price == 0) {
                    this.showModal('价格不能为空或0');
                    return;
                }

                if (item.Stock === '' || item.Stock == 0) {
                    this.showModal('库存不能为空或0');
                    return;
                }
            }
            let lgh = copySizeNodeArr.length;
            for (let i = 0; i < lgh; i++) {
                for (let j = 0; j < lgh; j++) {
                    if (i == j) continue;
                    if (copySizeNodeArr[i].AttrName == copySizeNodeArr[j].AttrName) {
                        this.showModal('规格不能重复');
                        return;
                    }
                }
            }

            releaseGoodsParamsObj.Stock = releaseGoodsParamsObj.Inventory = '';
            releaseGoodsParamsObj.OriginalPrice = '';
            releaseGoodsParamsObj.Price = 0;
        }

        // 开启积分抵用
        if (this.data.isUseIntegral) {
            let _integrationPrice = this.data.integrationPrice;
            if (_integrationPrice !== '' && _integrationPrice == 0) {
                this.showModal("抵用金额不能小于1分钱！");
                return;
            }
            if (_integrationPrice === '') {
                this.setData({
                    integrationPrice: 1
                })
            }
            if (this.data.isAttr === 0) {
                if (_parseFloat(_price) <= _parseFloat(this.data.integrationPrice)) {
                    this.showModal("购买价必须大于抵用金额！");
                    return;
                }
            } else {
                for (let item of copySizeNodeArr) {
                    if (_parseFloat(item.price) <= _parseFloat(this.data.integrationPrice)) {
                        this.showModal("购买价必须大于抵用金额");
                        return;
                    }
                }
            }

            releaseGoodsParamsObj.IntegrationPrice = _parseFloat(this.data.integrationPrice) * 1000000 / 10000;
            releaseGoodsParamsObj.IntegrationState = 1;
        } else {
            releaseGoodsParamsObj.IntegrationPrice = 0;
            releaseGoodsParamsObj.IntegrationState = 0;
        }

        // 开启同城卡
        if (this.data.isShowCityCard) {
            let _cityCardDiscount = this.data.cityCardDiscount;
            let disCount = parseFloat(_cityCardDiscount);
            if (!disCount || disCount >= 10 || disCount <= 0) {
                this.showModal("折扣力度范围为0.1-9.9");
                return;
            }

            if (this.data.isUseIntegral) {
                if (this.data.isAttr === 0) {
                    if (parseInt(_price) * parseFloat(_cityCardDiscount) * 0.1 <= parseInt(this.data.integrationPrice)) {
                        this.showModal("积分抵用不能大于同城卡折后价！");
                        return;
                    }
                } else {
                    for (let item of copySizeNodeArr) {
                        if (parseInt(item.price) * parseFloat(_cityCardDiscount) * 0.1 <= parseInt(this.data.integrationPrice)) {
                            this.showModal("积分抵用不能大于同城卡折后价！");
                            return;
                        }
                    }
                }
            }

            releaseGoodsParamsObj.discount = _parseFloat(_cityCardDiscount);
            releaseGoodsParamsObj.hctId = this.mainmodel.cardsType[this.data.cityCardSizeIdx].Id;
            releaseGoodsParamsObj.CategoryId = this.data.cityCardCateArr.length > 0 ? this.data.cityCardCateArr[this.data.cityCardCateIdx].Id : ''
        } else {
            releaseGoodsParamsObj.discount = 0;
            releaseGoodsParamsObj.hctId = 0;
            releaseGoodsParamsObj.CategoryId = 0;
        }

        // 限制数量
        releaseGoodsParamsObj.LimitNum = this.data.cityCardLimitNum;
        // 图片
        let mainGoodsImg = this.data.uploadimgobjects.mainGoodsImg.config;
        let despGoodsImg = this.data.uploadimgobjects.despGoodsImg.config;
        let _mainGoodsImg = this.goodsId == 0 ? mainGoodsImg.imageList : mainGoodsImg.imageUpdateList;
        let _despGoodsImg = this.goodsId == 0 ? despGoodsImg.imageList : despGoodsImg.imageUpdateList;

        releaseGoodsParamsObj.ImgList = _mainGoodsImg.join('|');
        releaseGoodsParamsObj.DescImgList = _despGoodsImg.join('|');
        releaseGoodsParamsObj.ImgUrl = mainGoodsImg.imageUpdateList.length > 0 ? mainGoodsImg.imageUpdateList[0] : mainGoodsImg.imageList[0];
        if (releaseGoodsParamsObj.ImgUrl == void 0) { releaseGoodsParamsObj.ImgUrl = '' }

        releaseGoodsParamsObj.FreightIds = this.data.isFare ? 0 : -1
        releaseGoodsParamsObj.ToShopPay = this.data.discountPayInStore
        // TypeId 分类选择
        if (this.data.cateIdx === null) {
            releaseGoodsParamsObj.TypeId = 0;
        } else {
            releaseGoodsParamsObj.TypeId = this.data.cateArr[this.data.cateIdx].Id
        }
        // 是否修改规格  
        // 新增
        if (this.goodsId === 0) {
            let specDetail = '';
            let lgh = _sizeNodeArr.length;
            for (let [idx, item] of _sizeNodeArr.entries()) {
                specDetail += item.AttrName + ',' + item.Price + ',' + item.Stock;
                if (lgh - 1 != idx) {
                    specDetail += ';';
                }
            }
            releaseGoodsParamsObj.spec_detail = specDetail;
            releaseGoodsParamsObj.attrids = '';
        } else {
            let attrids = '';
            let specDetail = '';
            let lgh = _sizeNodeArr.length;
            console.log(_sizeNodeArr)
            for (let [idx, item] of _sizeNodeArr.entries()) {

                if (_sizeNodeArr[idx].Id === 0) {
                    specDetail += item.AttrName + ',' + item.Price + ',' + item.Stock;
                    if (lgh - 1 != idx) { // 最后一个不加
                        specDetail += ';';
                    }
                } else {
                    attrids += _sizeNodeArr[idx].Id + ',' + _sizeNodeArr[idx].Stock + ',' + _sizeNodeArr[idx].AttrName + ',' + _sizeNodeArr[idx].Price + '|'
                }
            }
            releaseGoodsParamsObj.attrids = attrids;
            releaseGoodsParamsObj.spec_detail = specDetail;
        }

        releaseGoodsParamsObj.IsAttr = this.data.isAttr;

        let resp = await addGoods(releaseGoodsParamsObj);

        if (resp.code == 1) {
            if (this.data.isVoucher) {
                let _resp = await addVoucher({
                    cityid: app.globalData.cityInfoId,
                    openid: app.globalData.userInfo.openId,
                    CreateNum: this.data.voucherNum,
                    VoucherMoney: this.data.voucherPrice,
                    Deducting: this.data.voucherScopeIdx == 2 ? this.data.fullSubtraction : '',
                    UseStartDate: this.data.voucherBeginTime == '不填视为立即可用' ? '' : this.data.voucherBeginTime,
                    UseEndDate: this.data.voucherEndTime == '不填视为长期可用' ? '' : this.data.voucherEndTime,
                    ValidDays: this.data.voucherValidDay,
                    State: 0,
                    ItemId: resp.Data.id,
                    StoreId: this.sid,
                    ItemType: 5
                })
            }
            if (this.goodsId == 0) {
                this.showToast('添加成功！');
            } else {
                this.showToast('修改成功！')
            }
        } else {
            app.ShowMsg(resp.msg)
        }
    },
    showToast(title) {
        let that = this;
        wx.showToast({
            title
        })
        setTimeout(() => {
            wx.redirectTo({
                url: "/pages/goods/goodsReleaseList?state=" + that.state + "&storeid=" + that.sid
            })
        }, 1000)
    },
    voucherToggle(e) {
        this.setData({
            isVoucher: e.detail.value
        })
    },
    getVoucherPrice(e) {
        var tempVal = e.detail.value.replace(/[.]/g, "")
        if (this.data.voucherPrice == '')
            tempVal = tempVal.replace(/[0]/g, "")
        this.setData({
            voucherPrice: tempVal
        })

    },
    getVoucherNum(e) {
        this.setData({
            voucherNum: e.detail.value
        })
    },
    changeVoucherScope(e) {
        let idx = e.currentTarget.dataset.idx

        this.setData({
            voucherScopeIdx: idx
        })
    },
    getFullSubtraction(e) {
        this.setData({
            fullSubtraction: e.detail.value
        })
    },
    getValidDay(e) {
        this.setData({
            voucherValidDay: e.detail.value
        })
    },

    // 优惠券开始时间
    getBeginUseDate(e) {
        let d = new Date()
        this.setData({
            voucherBeginDate: e.detail.value
        })
        if (!this.data.voucherBeginTime) {
            this.setData({
                voucherBeginTime: d.getHours() + ':' + d.getMinutes()
            })
        }
    },

    getBeginUseTime(e) {
        this.setData({
            voucherBeginTime: e.detail.value
        })
    },

    // 优惠券结束时间
    getEndUseDate(e) {
        let d = new Date()
        this.setData({
            voucherEndDate: e.detail.value,
        })
        if (!this.data.voucherEndTime) {
            this.setData({
                voucherEndTime: d.getHours() + ':' + d.getMinutes()
            })
        }
    },

    getEndUseTime(e) {
        this.setData({
            voucherEndTime: e.detail.value
        })
    },

    // 到店付价格
    getDiscountPayInStore(e) {
        this.setData({
            discountPayInStore: e.detail.value
        })
    },
    distributionToggle(e) {
        this.setData({
            isShowDistribution: e.detail.value
        })
    },
    getDistribution(e) {
        console.log(e)
        this.setData({
            distribution: e.detail.value
        })
    },
    timerPickerCancel() {
        this.setData({
            isTimePicker: false         
        })  
    },
    // 相同时间控制
    commontDateFn(e) {
        this.setData({
            isTimePicker: true,
            timerValueArrIdx: parseInt(e.target.dataset.type)
        })     
    },
    timerPickerConfirm(e) {
        switch(this.data.timerValueArrIdx) {
            case 0:
            this.setData({
                voucherBeginTime:e.detail[0].timerStr,       
            })
            break;
            case 1:
            this.setData({      
                voucherEndTime:e.detail[1].timerStr,        
            })        
        }    
        this.setData({
            isTimePicker: false         
        })           
    },
})