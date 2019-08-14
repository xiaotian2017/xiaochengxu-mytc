const app = getApp();
let { HOST } = require("../../../utils/addr");
const { vzNavigateTo, httpClient } = require("../../../utils/util.js");
const regeneratorRuntime = require('../../../utils/runtime');
//获取购物车
const getMyCart = (paramsObj) => httpClient({ host: HOST,addr: '/IBaseData/GetMyCart', data: paramsObj });
//更新购物车数量
const updateCartNum = (paramsObj) => httpClient({ addr: HOST + '/IBaseData/UpdateCartNum', data: paramsObj });
//删除商品
const deleteGoods = (paramsObj) => httpClient({ addr: HOST + '/IBaseData/DelCartGoods', data: paramsObj });


var slice = Array.prototype.slice;
function initArr(arr) {
    if (Array.isArray(arr)) {
        var args = slice.call(arguments, 1);
        if (args !== undefined) {
            return handleInitArr(args, function () {
                return getCheckedArr(arr)
            }, function () {
                return getEditArr(arr)
            })
        }
    }
}
//选择结算商品
function getCheckedArr(arr) {
    var newArr = [];
    for (var len1 = arr.length; len1--;) {
        newArr[len1] = {};
        Reflect.set(newArr[len1], 'checkedAll', false);
        Reflect.set(newArr[len1], 'checkedArr', []);
        if (!!arr[len1].CartList) {
            var len2 = arr[len1].CartList.length;
            while (len2--) {
                newArr[len1].checkedArr.push(false);
            }
        }
    }
    return newArr;
}
//编辑
function getEditArr(arr) {
    var newArr = [];
    for (var len1 = arr.length; len1--;) {
        newArr[len1] = [];
        if (!!arr[len1].CartList) {
            var len2 = arr[len1].CartList.length;
            while (len2--) {
                newArr[len1].push(false);
            }
        }
    }
    return newArr;
}
function handleInitArr(arr, fn1, fn2) {
    var obj = {
        checkedArr: fn1(),
        editArr: fn2()
    }
    return obj;
}
//获取选中的店铺
function getIndex(arr) {
    return arr.findIndex(function (value) {
        return value.checkedAll === true || value.checkedArr.includes(true);
    })
}
//获取选中的商品的索引
function getSubIndex(arr) {
    return arr.map(function (value, index) {
        return value === true ? index : value
    }).filter(function (value, index) {
        return value !== false
    })
}
//判断是否全选
function all(arr) {
    return arr.every(function (value) {
        return value === true
    })
}
//删除商品
function deleteArr(arr, index) {
    arr.splice(index, 1);
    return arr
}
//验证数据类型
function verifyDataType(obj) {
    var t;
    var toString = Object.prototype.toString;
    var type = ['Function', 'String', 'Number', 'Boolean'];
    type.forEach(function (name) {
        if (toString.call(obj) === '[object ' + name + ']') {
            t = true;
            return
        };
    })
    return t;
}

//计算价格
function fixPrice(price, num, discount, discountPrice) {
    let lastPrice, base = 1000 / 100000;
    if (!!discountPrice) {
        lastPrice = discountPrice * base * num;
    } else {
        if (discount) {
            lastPrice = price * base * discount * num / 10;
        } else {
            lastPrice = price * base * num;
        }
    }
    lastPrice = lastPrice > 0.01 ? lastPrice : 0.01;
    return lastPrice
}
//price public
function publicCount(goCarList, value, allCarList,isMemberUser) {
    let discountPrice,
        totalPrice = 0;
    //无商品属性
    if (goCarList[value].AttrId == 0) {

        totalPrice += fixPrice(isMemberUser && allCarList.OpenMemberPrice && goCarList[value].Goods.MemberPrice > 0 && goCarList[value].Goods.MemberPrice || goCarList[value].Goods.Price, goCarList[value].BuyNum)
    } else {

        totalPrice += fixPrice(isMemberUser && allCarList.OpenMemberPrice && goCarList[value].GoodsAttr.MemberPrice > 0 && goCarList[value].GoodsAttr.MemberPrice || goCarList[value].GoodsAttr.Price, goCarList[value].BuyNum);

    }
    return totalPrice
}

//计算总价
function countTotalPay(arr, goCarList, allCarList,isMemberUser) {
    let totalPrice = 0;
    getSubIndex(arr).forEach((value) => {
        totalPrice += publicCount(goCarList, value, allCarList,isMemberUser)
    })
    return totalPrice.toFixed(2);
}

Page({
    data: {
        goCarList: [],
        totalPrice: 0,
        initfinnish: false,
        isMemberUser: false
    },
    onLoad: function (options) {
        let that = this;
        app.getUserInfo((userInfo) => {
            let param = this.param = {
                cityid: app.globalData.cityInfoId,
                openid: app.globalData.userInfo.openId,
                pageIndex: 1,
                pageSize: 20
            }
            that.setData({
                param
            })
        })

    },
    onShow() {
        this.getMyCart(this.param);
    },
    //页面隐藏清空状态
    onHide() {
        let that = this;
        let { editArr, checkedArr } = { ...that.data };
        editArr.forEach((key, index) => {
            checkedArr[index].checkedAll = false;
            key.forEach((bool, idx) => {
                key[idx] = false;
                checkedArr[index].checkedArr[idx] = false;
            })
        })
        that.setData({
            editArr,
            checkedArr,
            totalPrice: ''
        })
    },
    onPullDownRefresh() {
        let that = this;
        let { param } = { ...that.data }
        that.setData({
            totalPrice: ''
        })
        that.getMyCart(param);
        wx.stopPullDownRefresh()
    },
    async getMyCart(param) {
        wx.showLoading();
        let data = await getMyCart(param);
        wx.hideLoading();
        if (data.Success) {
            let goCarList = data.Data.listgoodscart;
            let init = initArr(goCarList, 'checkedArr', 'editArr');
            this.setData({
                goCarList: goCarList,
                checkedArr: init.checkedArr,
                editArr: init.editArr,
                initfinnish: true,
                isMemberUser: data.Data.isMemberUser
               
            })
        }
    },
    // 全选结算
    selectAll(e) {
        let that = this;
        const { index } = { ...e.currentTarget.dataset };
        let { checkedArr } = { ...that.data };
        let idx = getIndex(checkedArr);
        if (idx != -1 && idx != index) {
            that.setData({
                content: '暂不支持跨店购买',
                showTips: true
            })
            return
        } else {
            let checkedAll = !checkedArr[index].checkedAll;
            let subCheckedArr = checkedArr[index].checkedArr;

            subCheckedArr.forEach((key, index) => {
                subCheckedArr[index] = checkedAll
            })
            if (checkedAll) {
                let goCarList = that.data.goCarList[index].CartList;
                let totalPrice = countTotalPay(subCheckedArr, goCarList,that.data.goCarList[index],this.data.isMemberUser);
                this.setData({
                    totalPrice
                })
            } else {
                this.setData({
                    totalPrice: 0
                })
            }
            that.setData({
                [`checkedArr[${index}]`]: {
                    checkedAll,
                    checkedArr: subCheckedArr
                }
            })
        }
    },
    //单选结算
    select(e) {
        let that = this;
        const { index, subindex } = { ...e.currentTarget.dataset };
        let { checkedArr, goCarList } = { ...that.data };
        let idx = getIndex(checkedArr);
        let { Stock, AttrId, Goods: { IsSell } } = { ...goCarList[index].CartList[subindex] };
        if (idx != -1 && idx != index) {
            that.setData({
                content: '暂不支持跨店购买',
                showTips: true
            })
            return
        }
        if (Stock < 1) {
            that.setData({
                content: '卖完啦，客官您来晚了',
                showTips: true
            })
            return
        }
        if (IsSell != 1) {
            that.setData({
                content: '该商品已下架或删除',
                showTips: true
            })
            return
        }
        let subCheckedArr = checkedArr[index].checkedArr;
        let subChecked = !subCheckedArr[subindex];
        subCheckedArr[subindex] = subChecked;

        if (all(subCheckedArr)) {
            that.setData({
                [`checkedArr[${index}].checkedAll`]: true
            })
        } else {
            that.setData({
                [`checkedArr[${index}].checkedAll`]: false
            })
        }
        new Promise((resolve) => {
            let CartList = goCarList[index].CartList;
            let totalPrice = countTotalPay(subCheckedArr, CartList, goCarList[index],this.data.isMemberUser);
            console.log(totalPrice)
            resolve(totalPrice);
        }).then((data) => {
            that.setData({
                totalPrice: data,
                [`checkedArr[${index}].checkedArr[${subindex}]`]: subChecked
            })
        }).catch(err => {
            console.log(err)
        })
    },
    //去店铺
    goToStore(e) {
        let that = this;
        const { index } = { ...e.currentTarget.dataset };
        let { StoreId } = { ...that.data.goCarList[index] }
        vzNavigateTo({
            url: '/pages/business_detail/business_detail',
            query: {
                storeid: StoreId
            }
        })
    },
    //去商品详情
    goToDetail(e) {
        let that = this;
        const { type, goodsid } = { ...e.currentTarget.dataset };
        if (Object.is(type, undefined)) {
            wx.navigateTo({
                url: '/pages/goods/goods_detail/goods_detail?gid=' + goodsid
            })
        }
    },
    //编辑
    goodsEdit(e) {
        let that = this;
        const { index, subindex } = { ...e.currentTarget.dataset };
        let { editArr } = { ...that.data };
        let edit = !editArr[index][subindex];
        that.setData({
            [`editArr[${index}][${subindex}]`]: edit
        })
    },
    //加
    goodsAdd(e) {
        let that = this;
        let { checkedArr, goCarList } = { ...that.data };
        let { index, subindex } = { ...e.currentTarget.dataset };
        let { Goods: { IsSell, Stock, LimitNum }, GoodsId, StoreId, BuyNum } = { ...goCarList[index].CartList[subindex] };
        let num = BuyNum;
        ++num;
        if (!IsSell) {
            that.data({
                content: '该商品下架或移至别处',
                showTips: true
            })
            return
        }
        if (LimitNum >= 1) {
            if (num > LimitNum) {
                that.setData({
                    content: '超过限购数量',
                    showTips: true
                })
                return
            }
        }
        if (num > Stock) {
            that.setData({
                content: '库存不足',
                showTips: true
            })
            return
        } else {
            let param = {
                cityid: app.globalData.cityInfoId,
                openid: app.globalData.userInfo.openId,
                goodsid: GoodsId,
                storeid: StoreId,
                count: num,
                type: 'add'
            }
            that.countSelectedPrice(param, that, index, subindex, num, BuyNum)
        }
    },
    //减
    goodsMinus(e) {
        let that = this;
        let { checkedArr, goCarList } = { ...that.data };
        let { index, subindex } = { ...e.currentTarget.dataset };
        let { Goods: { IsSell }, GoodsId, StoreId, BuyNum } = { ...goCarList[index].CartList[subindex] };
        if (!IsSell) {
            that.data({
                content: '该商品下架或移至别处',
                showTips: true
            })
            return
        }
        let num = BuyNum;
        --num;
        if (num < 1) {
            return
        } else {
            let param = {
                cityid: app.globalData.cityInfoId,
                openid: app.globalData.userInfo.openId,
                goodsid: GoodsId,
                storeid: StoreId,
                count: num,
                type: 'enduce'
            }
            that.countSelectedPrice(param, that, index, subindex, num, BuyNum)
        }
    },
    async updateCartNum(param) {
        let data = await updateCartNum(
            param
        )
        if (data.Success) {
            return true
        } else {
            return false
        }
    },
    countSelectedPrice(param, obj, index, subindex, num, BuyNum) {
        obj.updateCartNum(param).then((data) => {
            if (data) {
                obj.setData({
                    [`goCarList[${index}].CartList[${subindex}].BuyNum`]: num
                }, () => {
                    let { checkedArr } = { ...obj.data };
                    let subCheckedArr = checkedArr[index].checkedArr;
                    if (getIndex(checkedArr) == index && subCheckedArr) {
                        let totalPrice = 0;
                        let verifyCheckedArr = getSubIndex(subCheckedArr);
                        if (verifyCheckedArr.length > 0) {
                            let CartList = obj.data.goCarList[index].CartList;

                            verifyCheckedArr.forEach(value => {
                                if (subindex == value) {
                                    if (CartList[value].AttrId == 0) {                                     
                                        totalPrice += fixPrice(obj.data.isMemberUser && obj.data.goCarList[index].OpenMemberPrice && CartList[value].Goods.MemberPrice > 0 && CartList[value].Goods.MemberPrice || CartList[value].Goods.Price, num);                                        
                                    } else {                                    
                                        totalPrice += fixPrice(obj.data.isMemberUser && obj.data.goCarList[index].OpenMemberPrice && CartList[value].GoodsAttr.MemberPrice > 0 && CartList[value].GoodsAttr.MemberPrice || CartList[value].GoodsAttr.Price, num);                                        
                                    }
                                } else {
                                    //无商品属性
                                    totalPrice += publicCount(CartList, value,obj.data.goCarList[index],obj.data.isMemberUser)
                                }
                            })
                            obj.setData({
                                totalPrice: parseFloat(totalPrice).toFixed(2)
                            })
                        }
                    }
                })
            }
        })
    },
    //删除订单
    goodsDelete(e) {
        let that = this;
        const { index, subindex } = { ...e.currentTarget.dataset };
        let { goCarList, editArr, checkedArr } = { ...that.data };

        let { IsSell } = { ...goCarList[index].CartList[subindex].Goods };

        if (IsSell) {
            wx.showModal({
                title: '提示',
                content: '客官您不要我了吗?删除不可恢复',
                confirmText: '删除',
                confirmColor: '#999',
                cancelColor: '#fe3d49',
                success(res) {
                    if (res.confirm) {
                        that.deleteGoods(that, goCarList, editArr, checkedArr, index, subindex)
                    }
                }
            })
        } else {
            that.deleteGoods(that, goCarList, editArr, checkedArr, index, subindex)
        }
    },
    //删除请求
    async deleteGoodsRequest(param) {
        let data = await deleteGoods(param)
        if (data.Success) {
            return true
        } else {
            return false
        }
    },
    deleteGoods(obj, goCarList, editArr, checkedArr, index, subindex) {
        let { StoreId, GoodsId, AttrId } = { ...goCarList[index].CartList[subindex] }
        let param = {
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            storeid: StoreId,
            goodsid: GoodsId
        }
        obj.deleteGoodsRequest(param).then((data) => {
            if (data) {
                if (goCarList[index].CartList.length <= 1) {
                    obj.setData({
                        goCarList: deleteArr(goCarList, index),
                        checkedArr: deleteArr(checkedArr, index),
                        editArr: deleteArr(editArr, index),
                        totalPrice: ''
                    })
                } else {
                    let len = checkedArr[index].checkedArr.length;

                    checkedArr = checkedArr[index].checkedArr;

                    let CartList = deleteArr(goCarList[index].CartList, subindex);
                    let subCheckedArr = deleteArr(checkedArr, subindex);
                    let totalPrice = countTotalPay(getSubIndex(subCheckedArr), CartList);
                    obj.setData({
                        [`goCarList[${index}].CartList`]: CartList,
                        [`checkedArr[${index}].checkedArr`]: subCheckedArr,
                        [`editArr[${index}]`]: deleteArr(editArr[index], subindex),
                        totalPrice
                    }, () => {
                        //检测删除完是否全选
                        if (all(subCheckedArr)) {
                            obj.setData({
                                [`checkedArr[${index}].checkedAll`]: true
                            })
                        }
                    })
                }
                obj.setData({
                    content: '删除成功',
                    showTips: true
                })
            } else {
                obj.setData({
                    content: '删除失败',
                    showTips: true
                })
            }
        })
    },
    //跳转提交订单
    goodsPay() {
        let that = this;
        let { checkedArr, goCarList } = { ...that.data }
        let index = getIndex(checkedArr);
        if (getIndex(checkedArr) == -1) {
            that.setData({
                content: '客官您还没有选择宝贝哟',
                showTips: true
            })
            return
        }

        let verifyCheckedArr = getSubIndex(checkedArr[index].checkedArr);
        let { StoreId, CartList } = { ...goCarList[index] };
        let AttrId = [], BuyNum = [], GoodsId = [];

        verifyCheckedArr.forEach((value) => {
            if (CartList[value].Goods.Stock <= 0) {
                that.setData({
                    content: '该商品已售罄',
                    showTips: true
                })
                return
            }
            if (CartList[value].Goods.IsSell != 1) {
                that.setData({
                    content: '您看中的宝贝已下架或移至别处',
                    showTips: true
                })
                return
            }
            if (CartList[value].Goods.LimitNum >= 1 && CartList[value].BuyNum > CartList[value].Goods.LimitNum) {
                that.setData({
                    content: '超过限购数量',
                    showTips: true
                })
                return
            } else {
                GoodsId.push(CartList[value].GoodsId);
                BuyNum.push(CartList[value].BuyNum);
                if (!!CartList[value].GoodsAttr) {
                    AttrId.push(CartList[value].AttrId);
                }
            }
        })
        vzNavigateTo({
            url: '/pages/goods/goodsOrder',
            query: {
                goodsId: GoodsId.join(','),
                attrId: AttrId.length && AttrId.join(','),
                storeId: StoreId,
                type: 0,
                buyNum: BuyNum
            }
        })
    },
    //去列表页
    goToList() {
        wx.redirectTo({
            url: '/pages/goods/goods_list/goods_list'
        })
    }
})