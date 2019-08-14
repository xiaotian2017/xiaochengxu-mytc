Component({
    properties:{
        bargain:{
            type:Array,
            observer:'render'
        }
    },
    data:{
        cutPriceList:[]
    },
    methods:{
        render(){
            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    cutPriceList: []
                })
                wx.setStorageSync('isFresh', 0)
            }
            let that = this
            let {cutPriceList,bargain} = {...that.data}
            cutPriceList.push.apply(cutPriceList,bargain)
            that.setData({
                cutPriceList
            })
        },
        goCutPriceDtl(e){
            const {cutid,storeid} = {...e.currentTarget.dataset}
            wx.navigateTo({
              url: '/pages/cutPriceTake/cutPriceTake?cutid=' + cutid + '&storeid=' + storeid
            })
        }
    }
})