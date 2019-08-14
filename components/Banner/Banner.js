Component({
    properties:{
        imgUrls:{
            type:Array,
            observer:'init'
        }   
    },
    data: {
        activeDocIdx: 0
    },
    methods:{
        init(){
            let that = this,swiperImgLoadArr = [];
            let {imgUrls} = {...that.data}
            imgUrls.forEach((key,index) => {
                index>0? swiperImgLoadArr.push(false):swiperImgLoadArr.push(true)
            })
            that.setData({
                swiperImgLoadArr
            })
        },
        swiperImgLazyLoad(e){
             
            let {current} = {...e.detail}        
            let {swiperImgLoadArr} = {...this.data}
            this.setData({
                activeDocIdx: current
            })
            if(!swiperImgLoadArr[current]){
                this.setData({
                    [`swiperImgLoadArr[${current}]`]:true,                 
                })
            }
        },
        goToLink(e) {
            var url = e.target.dataset.url
            wx.redirectTo({
                url: url
            })
        },
    }
})