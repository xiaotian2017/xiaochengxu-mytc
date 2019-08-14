Component({
    properties:{
        discount:{
            type:Array,
            observer:'render'
        }
    },
    data:{
        cityCardList:[]
    },
    methods:{
        render(){
            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    cityCardList: []
                })
                wx.setStorageSync('isFresh', 0)
            }
            let that = this
            let {cityCardList,discount} = {...that.data}
            cityCardList.push.apply(cityCardList,discount)
            that.setData({
                cityCardList
            })
        },
        goCityCardDtl(e){
            wx.navigateTo({
                url: '/pages/cityCard/cityCardList?typeid='+e.currentTarget.dataset.typeid
            })
        }
    }
})