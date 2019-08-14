function throttle(fn, interval, _this_, event) { //节流防止scroll频繁触发
    var timer, startTime = +new Date();
    return function () {
        var currentTime = +new Date();
        clearTimeout(timer);
        if (currentTime - startTime >= interval) {
            timer = setTimeout(() => {
                fn.call(_this_, event.detail.scrollTop)
                startTime = currentTime;
            }, interval)
        } else {
            timer = setTimeout(fn.bind(_this_, event.detail.scrollTop), interval)
        }
    }
}
module.exports = Behavior({
    properties:{
        currentNav:{
            type:Number,
            value:0
        }
    },
    data:{
        scrollTop:[],//scrollTop
        showBackTop:[] //返回顶部
    },
    methods:{
        showBackTop(scrollTop){//是否显示返回顶部
            let that = this
            let {showBackTop,currentNav} = {...that.data}
            if(scrollTop >= 300){
                if(!showBackTop[currentNav]){
                    that.setData({
                        [`showBackTop[${currentNav}]`]:true
                    })
                }
            }else{
                if(!!showBackTop[currentNav]){
                    that.setData({
                        [`showBackTop[${currentNav}]`]:false
                    })
                }
            }
        },
        backTop(e){//返回顶部
            let that = this;
            let {scrollTop,currentNav} = {...that.data}
            that.setData({
                [`scrollTop[${currentNav}]`]:0
            })
        },
        scroll(e) {
            let that = this
            throttle(that.showBackTop, 167, that, e)()
        }
    }
})