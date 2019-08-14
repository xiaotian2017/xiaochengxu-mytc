var vzTimer = require("../../utils/countDown.js").vzTimer;  
Component({
    properties:{
        currentType:String,
        coupon:{
            type:Array,
            observer:'render'
        }
    },
    data:{
        privilegeList:[],
        wxTimerList:[]
    },
    methods:{
        render(){
            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    privilegeList: []
                })
                wx.setStorageSync('isFresh', 0)
            }
            let that = this
            let {privilegeList,coupon} = {...that.data}
            privilegeList.push.apply(privilegeList,coupon)
            let timeArr = []
            that.setData({
                privilegeList
            })
            for(let item of this.data.privilegeList) {
                timeArr.push(/\((\d+)\)/.exec(item.EndDate)[1])
            }
            vzTimer(timeArr, that);
        },
        getActiveStatus(e){
            this.setData({
                activeOver:true
            })
        },
        goPrivilegeDtl(e){
            const {id,storeid,itemtype} = {...e.currentTarget.dataset}
            let url = ''
            switch(itemtype) {
                case 1:
                url = '/pages/youhui_detail/youhui_detail?couponid=' + id + '&storeid=' + storeid
                break
                case 2:
                url = '/pages/group_purchase/group_purchase/group_purchase?gid=' + id + '&storeId=' + storeid
                break
                case 3: 
                url = '/pages/activity_jiaixin/activity_jiaixin_detail?loveid=' + id +'&storeid='+ storeid
                break
                case 4: 
                url =  '/pages/cutPriceTake/cutPriceTake?cutid=' + id + '&storeid=' + storeid
            }
            wx.navigateTo({
              url: url
            })
        }
    }
})