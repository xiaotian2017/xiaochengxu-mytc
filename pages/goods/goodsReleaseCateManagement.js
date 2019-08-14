const app = getApp();
const addr = require("../../utils/addr.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
// 获取店铺商品分类
const get_AddGoodTypeViewModel = (paramsObj) => httpClient({ addr: addr.Address.Get_AddGoodTypeViewModel, data: paramsObj });
// 修改\删除\添加商品分类
const addOrEditGoodsType = (paramsObj) => httpClient({ method: 'POST', addr: addr.Address.AddOrEditGoodsType, data: paramsObj });
// 设置商品分类排序值
const editGoodsTypeSort = (paramsObj) => httpClient({ method: 'POST', addr: addr.Address.EditGoodsTypeSort, data: paramsObj });
let paramsObj = null;
Page({
    data: {
        isShowAddCateLayer: false,
        isShowSortLayer: false,
        cateName: '',
        sortNum: '',
        cateArr: []
    },
    onLoad(options) {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            this.sid = options.storeid;
            paramsObj = {
                cityId: this.cityid,
                openid: this.openid, 
                StoreId: this.sid,
                Id: this.cateId
            }

            this.get_AddGoodTypeViewModel();
        })
        wx.setNavigationBarTitle({
            title: "商品分类管理"
        })
    },
    // 获取店铺商品分类
    async get_AddGoodTypeViewModel() {
        let resp = await get_AddGoodTypeViewModel({
            cityId: this.cityid,
            storeid: this.sid
        });
        console.log(resp);
        this.setData({
            cateArr: resp.Data.GoodsType.TypeConfigList
        })
    },
    // 修改\删除\添加商品分类
    async addOrEditGoodsType() {
        let resp = await addOrEditGoodsType(paramsObj);
        console.log(resp);
        if (resp.code == 1) {
            // 要刷新列表
            this.setData({
                isShowAddCateLayer: false
            })
            switch (this.type) {
                case 1:
                    wx.showToast({
                        title: '添加成功'
                    });
                    break;
                case 2:
                    wx.showToast({
                        title: '修改成功'
                    });
                    break;
                default:
                    wx.showToast({
                        title: '删除成功'
                    });
            }
            this.setData({
                cateArr: []
            })
            this.get_AddGoodTypeViewModel();
        } else {
            this.showModal(resp.msg);
        }

    },
    showAddCateLayer(e) {
        this.setData({
            isShowAddCateLayer: true
        })
        let { id, type, name } = e.currentTarget.dataset;
        this.type = parseInt(type);
        this.id = parseInt(id);

        if (type == 2) {
            this.setData({
                cateName: name
            })
        }

        if (type == 1) {
            this.setData({
                cateName: ''
            })
        }
    },

    closeCreateCateNameLayer() {
        this.setData({
            isShowAddCateLayer: false
        })
    },
    showModal(content) {
        wx.showModal({
            title: '提示',
            content,
            showCancel: false
        })
    },
    addOrEditCateName(e) {
        if (this.type != 3 && !this.data.cateName.trim()) {
            this.showModal('分类名称不能为空！');
            return;
        }
        paramsObj.Id = this.id;
        if (this.type == 3) {
            paramsObj.name !== void 0 && delete paramsObj.name;
            paramsObj.State = -1;
        } else {
            paramsObj.State !== void 0 && delete paramsObj.State;
            paramsObj.name = this.data.cateName;
        }
        this.addOrEditGoodsType();
    },
    delCateName(e) {
        let { id, type } = e.currentTarget.dataset;
        this.type = parseInt(type);
        this.id = parseInt(id);
        let that = this;
        wx.showModal({
            title: '提示',
            content: '确定要删除该分类吗？',
            success(res) {
                if (res.confirm) {
                    that.addOrEditCateName();
                }
            }
        })
    },
    // 获取类名名称
    getCate(e) {
        this.setData({
            cateName: e.detail.value
        })    
    },
    showSortLayer(e) {
        this.id = parseInt(e.currentTarget.dataset.id);
        this.setData({
            isShowSortLayer: true
        })
    },
    closeSortLayer() {
        this.setData({
            isShowSortLayer: false
        })
    },
    // 设置商品分类值
    async editGoodsTypeSort() {
        let resp = await editGoodsTypeSort({
            cityId: this.cityid,
            Gtid: this.id,
            sort: this.data.sortNum
        });
        if (resp.code == 1) {
            wx.showToast({
                title: resp.msg
            })
            this.setData({
                cateArr: []
            })
            this.get_AddGoodTypeViewModel();
        } else {
            this.showModal(resp.msg)
        }
        this.setData({
            isShowSortLayer: false,
            sortNum: ''
        })
    },
    confirmSortLayer(e) {
        if (!this.data.sortNum.trim()) {
            this.showModal('排序值不能为空！');
            return;
        }
        this.editGoodsTypeSort();
    },
    // 获取排序值
    getSort(e) {
        this.setData({
            sortNum: e.detail.value
        }) 
    }

})