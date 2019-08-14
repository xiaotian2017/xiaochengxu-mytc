Component({
    properties:{
        showTips:{
            type:Boolean,
            observer:'showTips'
        },
        content:String
    },
    methods:{
        showTips(){
            let that = this,timer;
            let {showTips} = {...that.data}
            if(!showTips){return}
            clearTimeout(timer)
            that.setData({
                animCla:'sliderFromDown'
            })
            timer = setTimeout(() => {
                that.setData({
                    animCla:'scaleHide'
                },() => {
                    setTimeout(() => {
                        that.setData({
                            showTips:false,
                            content:''
                        })
                    },500)
                })
            },1420)
        }
    }
})