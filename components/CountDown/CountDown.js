import countDown from '../Behavior/countDown';
Component({
    properties:{
        currentType:{
            type:String,
            observer:'switchCountDown'
        },
        isEnd:Number,
        startDate:String,
        endDate:String,
        countDownColor:String
    },
    data:{
        paused:false
    },
    ready(){
        this.countDown()
    },
    methods:{
        countDown(){
            let that = this
            let {newCountDown,isEnd,startDate,endDate} = {...that.data}
            return new countDown(isEnd,startDate,endDate,that)
        },
        switchCountDown(){ //不是爱心价和抢优惠关掉定时器
            let that = this;
            let {currentType,paused} = {...that.data};
            if(['coupon','setlike'].includes(currentType)){
                that.setData({
                    paused:false
                }, () => {
                    newCountDown.initCountDown()
                })
            }else{
                if(!paused){
                    that.setData({
                        paused:true
                    }, () => {
                        clearInterval(that.timer)
                    })   
                }
            }
        }
    }
})