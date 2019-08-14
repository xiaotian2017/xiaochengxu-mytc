Component({
    properties:{
        headlines:{
            type:Array,
            observer:'render'
        },
        updateHeadlines:{
            type:Array,
            observer:'update'
        }
    },
    data:{
        localNewsList:[],
        content:'小程序暂不支持第三方外链,敬请期待'
    },
    methods:{
        render(){
            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    localNewsList: []
                })
                wx.setStorageSync('isFresh', 0)
            }

            let that = this
            let {localNewsList,headlines} = {...that.data}
            localNewsList.push.apply(localNewsList,headlines)
            that.setData({
                localNewsList
            })
        },
        update(){
            let that = this;
        },
        readArticle(e){
            let that = this;
            let {headtype,hid} = {...e.currentTarget.dataset}
            if(headtype == 1){
                that.triggerEvent('showTips',{
                    content:'小程序暂不支持第三方外链,敬请期待',
                    showTips:true
                },{
                    bubbles:true,
                    composed:true
                })
            }else{
              wx.navigateTo({
                url: '../news_center/news_detail?hid='+hid 
              })
            }
        }
    }
})