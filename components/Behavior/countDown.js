class countDown {
    //_this_ 挂载外部_this_
    constructor(isEnd,startTimeStamp,endTimeStamp,_this_){
        this.config = {
            _this_:_this_,
            currentTime:countDown.getCurrentTime(),
            startTime:countDown.modiifyTimeStamp(startTimeStamp),
            endTime:countDown.modiifyTimeStamp(endTimeStamp)
        }
        _this_.timer = '';
        if(!!isEnd){
            _this_.setData({
                activeOver:true
            }, () => {
                _this_.triggerEvent('getActiveStatus',{
                    activeOver:true
                })
            })
        } else {
            this.initCountDown()   
        }
    }
    initCountDown(){ //初始化
        let {_this_,currentTime,startTime,endTime} = {...this.config}
        if(endTime < currentTime){ //结束
            _this_.setData({
                activeOver:true
            }, () => {
                //向外传递是否结束
                _this_.triggerEvent('getActiveStatus',{
                    activeOver:true
                })
            })
            return 
        }
        if(startTime > currentTime){ //未开始
            _this_.setData({
                activeNoStart:true
            }, () => {
                _this_.triggerEvent('getActiveStatus',{
                    activeNoStart:true
                })
                this.updataTime(startTime,_this_)
            })
        }else{//进行中
            this.updataTime(endTime,_this_)
        }
    }
    calcLeftTime(leftTime){//剩余时间
        let days = this.prefixTime(parseInt(leftTime / 3600 / 24, 10))
        let hours = this.prefixTime(parseInt(leftTime / 3600 % 24, 10))
        let minutes = this.prefixTime(parseInt(leftTime / 60 % 60, 10))
        let seconds = this.prefixTime(parseInt(leftTime % 60, 10))
        return {
            days,
            hours,
            minutes,
            seconds
        }
    }
    prefixTime(num){//补0
        return num >= 10 ? num : '0' + num
    }
    updataTime(timeStamp,_this_){//更新时间 
        let that = this,
            leftTime,
            countTime;
        let {endTime,timer} = {...that.config}
        leftTime = countDown.getLeftStamp(timeStamp);
        countTime = that.calcLeftTime(leftTime);
        _this_.setData({
            timeList: [countTime.days, countTime.hours, countTime.minutes, countTime.seconds]
        })
        that.timer = setInterval(() => {
            leftTime = countDown.getLeftStamp(timeStamp); //剩余时间
            if(leftTime > 0){
                countTime = that.calcLeftTime(leftTime);
                _this_.setData({
                    timeList: [countTime.days, countTime.hours, countTime.minutes, countTime.seconds]
                })
            }else{
                clearInterval(_this_.timer)
                let {activeNoStart} = {..._this_.activeNoStart}
                if(!Object.is(activeNoStart,undefined)){
                    _this_.setData({
                        activeNoStart:false
                    }, () => {
                        _this_.triggerEvent('getActiveStatus',{
                            activeNoStart:false
                        })
                        that.updataTime(endTime,_this_)
                    })
                }else{
                    _this_.setData({
                        activeOver:true
                    }, () => {
                        _this_.triggerEvent('getActiveStatus',{
                            activeOver:true
                        })
                    })
                }
            }
        },100)
    }
     // 静态方法不能被实例对象调用
    static getCurrentTime(){
        return +new Date()
    }
    static getLeftStamp(timeStamp){
        return (timeStamp - countDown.getCurrentTime()) / 1000
    }
    static modiifyTimeStamp(time){//转换服务器时间戳
        return /\((\d+)\)/.exec(time)[1]
    }
}
export default countDown
