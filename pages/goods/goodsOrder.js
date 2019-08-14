
function testPhone(phone) {
    return !/^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/.test(phone);
}

const app = getApp();
const util = require("../../utils/util.js");
const addr = require("../../utils/addr.js");
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
const host = addr.HOST
// a.GetMyCart =  HOST + 'IBaseData/GetMyCart'; // 购物车订单商品信息
// a.GetBuyGoodDetail =  HOST + 'IBaseData/GetBuyGoodDetail'; // 直接购买订单商品信息
const getMyCardOrder = (paramsObj) => httpClient({ addr: addr.Address.GetMyCardOrder, data: paramsObj });
// 直接购买商品订单信息
// const getBuyGoodDetail = (paramsObj) => httpClient({ addr: addr.Address.GetBuyGoodDetail, data: paramsObj });
const getBuyGoodDetail = (paramsObj) => httpClient({ host, addr: '/IBaseData/GetBuyGoodDetail', data: paramsObj });
// 购物车进来商品订单
// const getMyCart = (paramsObj) => httpClient({ addr: addr.Address.GetMyCart, data: paramsObj });
const getMyCart = (paramsObj) => httpClient({ host,addr: '/IBaseData/GetMyCart', data: paramsObj });
// 下单
const goodsPay = (paramsObj) => httpClient({ addr: addr.Address.GoodsPay, data: paramsObj });

const goodsCartPay = (paramsObj) => httpClient({ method: 'post', addr: addr.Address.GoodsCartPay, data: paramsObj });
// GoodsPay(int cityid,string openid,string appid, int gid = 0, int num = 0, int attrid = 0, string message = "", int FreightTemplateId = 0, int AddressId = 0, string AccepterName = "", string AccepterTelePhone = "", int IntegrationState = 0)
const getStoreVoucherList = (p) => util.httpClient({ host, addr: 'IBaseData/GetStoreVoucherList', data: p })
let addOrderParamsObj = null;

Page({
    data: {
        navList: ['商家配送', '到店自提'],
        navActive: null,
        deliverRange: [],
        deliverIndex: 0,
        defalutAddress: false,
        leaveMessage: '',
        liftUserName: '',
        liftUserPhone: '',
        isShowTab: false,
        mainmodel: null,
        price: '', // 小计
        totalPrice: '', // 合计, 
        fee: 0, // 运费
        cartList: [],
        addressArr: [],
        hasAddress: false,
        addressIdx: 0,
        isShowAddressPanel: false,
        addressIdx: 0,
        hasVoucher: false,
        listvoucher: [],
        payMoney: '',
        voucherIdx: '',
        voucherMoney: 0,
        isMemberUser: false,
        listgoodscart: {}
    },
    onShow() {
        this.isSubmit = false;
        this.getMyCardOrder();
    },
    onLoad(options) {
        let that = this;
        this.goodsid = options.goodsId;
        this.sid = options.storeId;
        var buyNum = 0;
        var tempbuynum = options.buyNum;
        var arr = tempbuynum.split(",");
        for (var j = 0; j < arr.length; j++) {
            buyNum += parseInt(arr[j]);
        }

        this.buyNum = buyNum;

        this.attrid = options.attrId ? options.attrId : '';
        app.getUserInfo(() => {
            that.setData({ liftUserName: app.globalData.userInfo.nickName, liftUserPhone: app.globalData.userInfo.TelePhone });

            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            this.type = options.type;
            addOrderParamsObj = {
                cityid: this.cityid,
                openid: this.openid,
                appid: app.globalData.appid,
                num: this.buyNum,
                attrid: this.attrid,
                gid: this.goodsid,
                // IntegrationState: 0  // 多商品怎么传
            }
            addOrderParamsObj.num = this.buyNum;
            // this.getMyCardOrder();
            if (options.type == 1) {
                // 直接购买
                this.getBuyGoodDetail();
            } else {
                this.iscar = true
            }

            this.getStoreVoucherList()
        })
        //进来读取有无默认地址的缓存
    },
    // 102760 
    // 获取订单信息 
    async getStoreVoucherList() {

        let resp = await getStoreVoucherList({
            openid: app.globalData.userInfo.openId,
            cityid: app.globalData.cityInfoId,
            storeid: this.sid,
            pageIndex: 1
        })

        this.setData({
            listvoucher: resp.Data.listvoucher
        })
    },
    async getMyCardOrder() {
        wx.showLoading();
        let resp = await getMyCardOrder({
            cityid: this.cityid,
            openid: this.openid,
            gcids: this.goodsid,
            gaids: '',
            storeid: this.sid
        });
        // 商品id
        wx.hideLoading();
        let mainmodel = resp.Data.mainmodel;
        this.setData({
            mainmodel,
            addressArr: mainmodel.Addresses,
            hasAddress: mainmodel.Addresses.length > 0 ? true : false
        })

        let freightArr = this.freightArr = mainmodel.FreightTemplates
        this.setData({
            deliverRange: mainmodel.FreightTemplates
        })

        if (this.iscar) {
            this.getMyCart();
            return
        }


        let hasFreight = false;
        if (freightArr.length > 0) {
            if (mainmodel.IsShowSelfPick) {
                this.setData({
                    navActive: 0,
                    isShowTab: true,
                    deliverRange: mainmodel.FreightTemplates
                })
            } else {
                this.setData({
                    navActive: 0,
                    isShowTab: false,
                    deliverRange: mainmodel.FreightTemplates
                })

            }
            hasFreight = true;
        } else {
            this.setData({
                navActive: 1
            })
        }

        // 初始计算运费

        hasFreight && this.countFee();
    },

    // 获取订单商品信息 直接购买进来
    async getBuyGoodDetail() {
        wx.showLoading();
        let resp = await getBuyGoodDetail({
            cityid: this.cityid,
            openid: this.openid,
            goodsid: this.goodsid,
            num: this.buyNum,
            attrid: this.attrid
        });
        wx.hideLoading();

        let _cartList = []
        let mainmodel = resp.Data.mainmodel;
        _cartList.push(mainmodel);
        this.setData({
            cartList: _cartList,
            addressArr: mainmodel.Addresses,
            hasAddress: mainmodel.Addresses.length > 0 ? true : false       
        })
        addOrderParamsObj.gid = this.goodsid;
        // addOrderParamsObj.IntegrationState = mainmodel.Goods.IntegrationState;
        this.countPrice() // 计算小计
    },

    async getMyCart() {
        wx.showLoading();
        let resp = await getMyCart({
            cityid: this.cityid,
            openid: this.openid,
            gcids: this.goodsid,
            gaids: this.attrid
        });
        wx.hideLoading();

        this.setData({
            listgoodscart: resp.Data.listgoodscart[0],
            cartList: resp.Data.listgoodscart[0].CartList,
            isMemberUser: resp.Data.isMemberUser            
        })
        let isSupport = false
        for (let item of this.data.cartList) {
            if (item.Goods.FreightIds == -1) { // 不支持到店自提
                if (this.freightArr.length > 0) {
                    this.setData({
                        navActive: 0,
                        isShowTab: false,
                    })
                    this.countFee();
                } else {
                    this.setData({
                        navActive: 1,
                        isShowTab: false,
                    })
                }
                isSupport = true
                break
            }
        }

        if (!isSupport) {
            if (this.freightArr.length > 0) {
                this.setData({
                    navActive: 0,
                    isShowTab: true,
                })
                this.countFee();
            } else {
                this.setData({
                    navActive: 1,
                    isShowTab: false,
                })
            }
        }

        this.countPrice() // 计算小计
    },

    onPullDownRefresh() {

    },

    switchNav(e) {
        let that = this;
        const { index } = { ...e.currentTarget.dataset };
        let { navActive } = { ...that.data };

        if (index == navActive) {
            return
        } else {
            that.setData({
                navActive: index
            })
        }
        if (this.data.navActive == 0) {
            this.countFee()
        } else {
            this.setData({
                fee: 0,
                voucherMoney: 0,
                voucherIdx: ''
            })
        }
    },
    // 送货地址
    showAddAddress() {
        this.setData({
            isShowAddressPanel: true
        })
    },
    //选择配送方式
    selectDeliver(e) {
        const { value } = { ...e.detail };
        this.setData({
            deliverIndex: parseInt(value)
        })
        this.countFee();
    },
    //自提用户名
    getLiftUserName(e) {
        let val = e.detail.value.trim();
        this.setData({
            liftUserName: val
        })
    },
    //自提电话号码
    getLiftUserPhone(e) {
        let val = e.detail.value.trim();
        this.setData({
            liftUserPhone: val
        })
    },
    testLiftUserPhone(e) {
        let val = e.detail.value.trim();
        if (testPhone(val)) {
            this.setData({
                content: '手机号码格式有误',
                showTips: true
            })
        }
    },
    //留言
    getLeaveMessage(e) {
        let val = e.detail.value.trim();
        this.setData({
            leaveMessage: val
        })
    },
    //下单检测
    deliverPayTest(e) {
        let that = this;

        if (this.data.addressArr.length == 0) {
            that.setData({
                content: '您还没填写收货信息',
                showTips: true
            })
            return false
        } else {
            return true;
        }
    },
    liftPayTest() {
        let that = this;
        let { liftUserPhone, liftUserName } = { ...that.data }
        if (!liftUserName.trim()) {
            that.setData({
                content: '您还没填写提货人名字',
                showTips: true
            })
            return false
        } else if (testPhone(liftUserPhone)) {
            that.setData({
                content: '手机号码格式有误',
                showTips: true
            })
            return false
        } else {
            addOrderParamsObj.AccepterName = liftUserName;
            addOrderParamsObj.AccepterTelePhone = liftUserPhone;
            return true
        }
    },
    async goodsPay() {
        let that = this;
        addOrderParamsObj.uvId = this.data.voucherIdx !== '' ? this.data.listvoucher[this.data.voucherIdx].Id : ''
        // 需要付运费
        if (this.data.navActive == 1) {
            if (!this.liftPayTest()) return;
        } else {
            if (!this.deliverPayTest()) return;
            addOrderParamsObj.AddressId = this.data.addressArr[this.data.addressIdx].Id;
            addOrderParamsObj.AccepterName = this.data.addressArr[this.data.addressIdx].NickName;
            addOrderParamsObj.AccepterTelePhone = this.data.addressArr[this.data.addressIdx].TelePhone;
        }

        addOrderParamsObj.FreightTemplateId = this.data.navActive == 0 ? this.data.deliverRange[this.data.deliverIndex].Id : '';
        addOrderParamsObj.message = this.data.leaveMessage;

        //付款成功后回调
        let payRefun = (state = false) => {
            if (!state) {
                wx.showToast({
                    title: '已取消付款',
                    duration: 500
                })
                // if (this.type != 1) { // 购物车购买取消去我的订单页面
                setTimeout(() => {
                    wx.redirectTo({
                        url: '/pages/cutlist/cutlist?type=goods&state=1'
                    })
                }, 500)
                // } else {
                //     this.isSubmit = false;
                // }
                return;
            }
            // wx.showToast({
            //     title: '支付成功 !',
            //     icon: 'success',
            //     duration: 500
            // })            

            wx.redirectTo({
                url: '/pages/payTransfer/payTransfer?type=goods'
            })
        }
        let resp = null;

        if (this.isSubmit) { return };
        this.isSubmit = true;
        if (this.type == 1) {
            resp = await goodsPay(addOrderParamsObj);
        } else {
            resp = await goodsCartPay(addOrderParamsObj);
        }

        if (resp.code == 1) {

            util.PayOrder(resp.Data.orderid, { openId: app.globalData.userInfo.openId }, {
                failed: function (res) {
                    wx.hideLoading();
                    payRefun();
                },
                success: function (res) {
                    wx.hideLoading();
                    if (res == "wxpay") {
                    } else if (res == "success") {
                        payRefun(1)
                    }
                }
            })

        } else {
            that.setData({
                content: resp.msg,
                showTips: true
            })
        }

    },
    // 计算小计
    countPrice() {
        let _price = 0;
        for (let item of this.data.cartList) {
            if (item.AttrId == 0) {
                if (this.iscar) {
                    _price += item.BuyNum * (this.data.isMemberUser && this.data.listgoodscart.OpenMemberPrice && item.Goods.MemberPrice > 0 && item.Goods.MemberPrice * 10000 / 1000000 || item.Goods.Price * 10000 / 1000000)
                } else {
                    _price += item.BuyNum * (item.Goods.Price * 10000 / 1000000)
                }
            } else {
                if (this.iscar) {
                    _price += item.BuyNum * (this.data.isMemberUser && this.data.listgoodscart.OpenMemberPrice && item.GoodsAttr.MemberPrice > 0 && item.GoodsAttr.MemberPrice * 10000 / 1000000 || item.GoodsAttr.Price * 10000 / 1000000)
                }
                else {
                    _price += item.BuyNum * (item.GoodsAttr.Price * 10000 / 1000000)
                }


            }
        }
        this.setData({
            price: parseFloat(_price.toFixed(2))
        })
    },

    // 计算运费
    countFee() {

        let freightItem = this.data.deliverRange[this.data.deliverIndex];
        let basecount = freightItem.BaseCount;
        let basecost = freightItem.BaseCost * 0.01;
        let extracost = freightItem.ExtraCost * 0.01;

        let fee = 0;
        if (this.buyNum > basecount) {
            fee = basecost + (this.buyNum - basecount) * extracost;
        } else {
            fee = basecost;
        }
        this.setData({
            fee: parseFloat(fee.toFixed(2))
        })

    },
    chooseAddress(e) {
        this.setData({
            addressIdx: e.currentTarget.dataset.idx,
            isShowAddressPanel: false
        })

    },
    closeAddressPanel() {
        this.setData({
            isShowAddressPanel: false
        })
    },
    toAddAddress() {
        vzNavigateTo({
            url: "/pages/goods/goodsAddressAdd",
            query: {
                addrid: 0,
                type: 'fromOrder'
            }
        })
    },
    toGoodsdetail(e) {
        util.vzNavigateTo({
            url: '/pages/goods/goods_detail/goods_detail',
            query: {
                gid: e.currentTarget.dataset.id
            }
        })
    },
    showVoucher() {
        this.setData({
            hasVoucher: !this.data.hasVoucher,
            //   payMoney: this.data.coupon.BuyPrice
        })
    },
    hideVoucher() {
        this.setData({
            hasVoucher: false,
            voucherIdx: '',
            voucherMoney: 0
        })
    },
    chooseVoucher(e) {
        let idx = e.currentTarget.dataset.idx

        this.setData({
            voucherIdx: idx
        })
        let voucher = this.data.listvoucher[idx]
        let voucherMoney = voucher.Money
        if (voucher.Voucher.Deducting > 0) {
            if (this.data.price * 100  < voucher.Voucher.Deducting * 100) {
                app.ShowMsg('购买金额不足满减金额，该代金券不可用')
            } else {
                if (this.data.price * 100 <= voucherMoney * 100) {
                    app.ShowMsg('购买金额小于减免金额，该代金券不可用')
                } else {
                    this.setData({
                        hasVoucher: false,
                        voucherMoney: voucherMoney
                    })
                }
            }
        } else {
            if (this.data.price * 100 <= voucherMoney * 100) {
                app.ShowMsg('购买金额小于减免金额，该代金券不可用')
            } else {
                this.setData({
                    hasVoucher: false,
                    voucherMoney: voucherMoney
                })
            }
        }
    }
})