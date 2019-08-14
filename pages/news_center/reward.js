const {HOST} = require("../../utils/addr");
const util = require("../../utils/util.js");
const {httpClient,stringifyQuery} = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');

function tips(content){
    this.setData({
        content,
        showTips:true
    })
}
function payCallback(state = false){
    if(!state){
        tips.call(this,'已取消付款');
        return;
    }
    wx.showToast({
        title: '支付成功!',
        icon: 'success',
        duration: 1200
    })
    setTimeout(() => {
        wx.navigateBack({
            delta: 1
        })
    },1000)
}
let rewardPay = (param) => httpClient({addr:HOST + 'apiQuery/AddPayOrder',method:'POST',data:param})
let getRewardUser = (param) => httpClient({addr:HOST + 'IBaseData/GetRewardUser',data:param});
let app = getApp();

Page({
    data:{
        moneyArr:[10,8,5,3,2,1],
        rewardMoney:'',
        avatar:'',
        showMask:true
    },
    onLoad(options){
        app.getUserInfo((userInfo) => {
            this.setData({
                options
            })
            this.getRewardUser({
                openid:app.globalData.userInfo.openId,
                cityid:app.globalData.cityInfoId,
                itemid:options.itemid,
                itemtype: options.itemtype
            })
            this.rewardParam = {
                openId:app.globalData.userInfo.openId,
                appid:app.globalData.appid,
                paytype:216,
                extype:options.itemtype,
                itemid:options.itemid
            }
        })
    },
    openMask(){
        let mask = !this.data.showMask;
        this.setData({
            showMask:mask,
            rewardMoney:''
        })
    },
    async getRewardUser(param){
        let data = await getRewardUser(param);
        if(data.Success){
            this.setData({
                avatar:data.Data.toUser.HeadImgUrl
            })
        }
    },
    getDefiniteMoney(e){
        let that = this;
        const {money} = {...e.currentTarget.dataset}
        that.setData({
            rewardMoney:money
        },() => {
            that.pay()
        })
    },
    getIndependentPay(e){
        const value = e.detail.value.trim();
        if(!!value){
            this.setData({
                rewardMoney:value
            })
        }
    },
    startPay(){
        let that = this;
        let {rewardMoney} = {...that.data}
        if(!/^(\d+\.\d{1,1}|\d+)$/.test(rewardMoney)){
            tips.call(that,'请输入正确的赞赏金额');
            return
        }
        if(rewardMoney < 0.1){
            tips.call(that,'最低赞赏金额0.1元起');
            return 
        }
        if(rewardMoney > 1000){
            tips.call(that,'最大赞赏金额不能超过1000元');
            return 
        }
        that.pay()
    },
    async pay(){
        let that = this,query;
        let {rewardMoney,options} = {...that.data};
        that.rewardParam.payinfo = rewardMoney * 100;
        let resp = await rewardPay(that.rewardParam);
        if (resp.result) {
            util.PayOrder(
                resp.obj, 
                {openId: that.rewardParam.openId},{
                failed(res) {
                    payCallback.call(that,false);
                },
                success(res) {
                    if (res == "success") {
                        payCallback.call(that,1);
                    }
                },
                complete(){
                    wx.hideLoading();
                }
            })
        } else {
            tips.call(that,resp.msg);
        }
    }
})