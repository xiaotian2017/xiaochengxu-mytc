const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
var _host = addr.HOST;
// 这些接口记得放到 addr.js

const GetCityMemberGoods = (params) => httpClient({host: _host, addr: 'IBaseData/GetCityMemberGoods', data: params });

Page({
    data: {
        isShowOptions: false,
        optionidx: 1,
        searchKeyWords: '',
        memberGoodsList: [],
        pageindex: 0
    },
    onLoad() {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId
            this.openid = app.globalData.userInfo.openId
            this.GetCityMemberGoods()
        })
    },
    async GetCityMemberGoods() {
        wx.showLoading()
        let resp = await GetCityMemberGoods({
            pageIndex: ++this.data.pageindex,
            OpenId: this.openid,
            CityInfoId: this.cityid
        })
        // resp={"code":1,"msg":"ok","success":true,"data":[{"Id":149550,"GoodsName":"测试商品购买送抽奖","ImgUrl":"http://i2.vzan.cc/image/jpg/2018/12/1/112515e80e0323331346e5aa5ac5da5f8aba50.jpg","Price":2,"OriginalPrice":100,"MemberPrice":1,"OpenMemberPrice":true,"Inventory":10,"Stock":2,"StoreId":8685082,"CityInfoId":1317,"IsAttr":0,"MaxPrice":2,"MaxMemberPrice":1,"PriceRank":"0.01","GoodsAttrList":null},{"Id":159719,"GoodsName":"测试","ImgUrl":"http://i2.vzan.cc/image/jpg/2019/3/20/142341ca7ac6c134a74431896417a84da32804.jpg","Price":250,"OriginalPrice":0,"MemberPrice":200,"OpenMemberPrice":true,"Inventory":1998,"Stock":1998,"StoreId":8685082,"CityInfoId":1317,"IsAttr":1,"MaxPrice":280,"MaxMemberPrice":230,"PriceRank":"0.2-0.8","GoodsAttrList":[{"Id":56206,"GoodsId":159719,"AttrName":"蓝","OrgPrice":300,"Price":250,"Inventory":999,"Stock":999,"State":1,"MemberPrice":230,"discountPrice":0},{"Id":56207,"GoodsId":159719,"AttrName":"红","OrgPrice":300,"Price":280,"Inventory":999,"Stock":999,"State":1,"MemberPrice":200,"discountPrice":0}]},{"Id":159474,"GoodsName":"测试产品","ImgUrl":"http://i2.vzan.cc/image/jpg/2019/3/15/0921031b4f5e2f6bd349eeaeb5ce79e41494ad.jpg","Price":150,"OriginalPrice":0,"MemberPrice":130,"OpenMemberPrice":true,"Inventory":1998,"Stock":1998,"StoreId":8685082,"CityInfoId":1317,"IsAttr":1,"MaxPrice":160,"MaxMemberPrice":150,"PriceRank":"0.1-0.2","GoodsAttrList":[{"Id":56124,"GoodsId":159474,"AttrName":"大","OrgPrice":300,"Price":150,"Inventory":999,"Stock":999,"State":1,"MemberPrice":130,"discountPrice":0},{"Id":56125,"GoodsId":159474,"AttrName":"小","OrgPrice":300,"Price":160,"Inventory":999,"Stock":999,"State":1,"MemberPrice":150,"discountPrice":0}]}]}
        if (resp.code) {            
            if (resp.data&&resp.data.length) {
                this.setData({
                    memberGoodsList: [...this.data.memberGoodsList, ...resp.data]
                })
            }           
        } else {
            this.setData({
                showTips: true,
                content: resp.msg
            })
        }

        wx.hideLoading()
    },
    // 获取搜索关键字
    getSearchKeyWords(e) {
        this.setData({
            searchKeyWords: e.detail.value
        })
        console.log(this.data.searchKeyWords)
    },
    showOptions() {
        this.setData({
            isShowOptions: !this.data.isShowOptions
        })
    },
    getOptions(e) {
        let _optionidx = e.currentTarget.dataset.optionidx
        this.setData({
            optionidx: _optionidx,
            isShowOptions: false
        })
    },
    onReachBottom: function () {
        this.GetCityMemberGoods();
    },
    toGoods(e) {
        wx.navigateTo({
            url: '/pages/goods/goods_detail/goods_detail?gid=' + e.currentTarget.dataset.goodsid
          })
    }
})

