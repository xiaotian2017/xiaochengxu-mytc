let {HOST} = require("../../utils/addr");
Component({
    properties:{
        openid:String,
        aggregate:{
            type:Array,
            observer:'render'
        }
    },
    data:{
        storeActiveList:[]
    },
    methods:{
        render(){
            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    storeActiveList: []
                })
                wx.setStorageSync('isFresh', 0)
            }
            let that = this
            let {storeActiveList,aggregate} = {...that.data}
            storeActiveList.push.apply(storeActiveList,aggregate)
            that.setData({
                storeActiveList
            })
        },
        goToDtl(e){//去详情页
            wx.navigateTo({
              url: '/pages/news_center/news_detail?t=1&hid=' + e.currentTarget.dataset.strategeid
            })
        },
        follow(e){//关注
            let that = this
            let {storeid,index} = {...e.currentTarget.dataset}
            let {openid,storeActiveList} = {...that.data}
            wx.request({
                url:HOST + 'IBaseData/concernshop',
                data: {
                    shopid:storeid,
                    openid
                },
                method: 'POST',
                success(res){
                    let concern = !storeActiveList[index].IsConcern
                    that.setData({
                        [`storeActiveList[${index}].IsConcern`]:concern
                    })
                    wx.showToast({
                        icon:'success',
                        title:concern?'关注成功':'取消关注成功',
                        duration:1200
                    })
                }
            })
        },
        receiveCoupon(e){ //领取优惠
            const {storeid,ticketid} = {...e.currentTarget.dataset}
            wx.navigateTo({
                url: '/pages/business_detail/business_detail?storeid='+storeid+'&bid='+ticketid
            })
        },
    }
})