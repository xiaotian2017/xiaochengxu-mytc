
Component({
    properties:{
        currentType:String,
        setlike:{
            type:Array,
            observer:'render'
        }
    },
    data:{
        lovePriceList:[]
    },
    methods:{
        render(){
            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    lovePriceList: []
                })
                wx.setStorageSync('isFresh', 0)
            }

            let that = this
            let {lovePriceList,setlike} = {...that.data}
            lovePriceList.push.apply(lovePriceList,setlike)
            that.setData({
                lovePriceList
            })
        },
        goLovePriceDtl(e){
            const {storeid,loveid} = {...e.currentTarget.dataset}
            wx.navigateTo({
                url: '/pages/activity_jiaixin/activity_jiaixin_detail?loveid=' + loveid +'&storeid='+ storeid
            })
        }
    }
})