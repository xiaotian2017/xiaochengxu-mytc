import countDown from '../Behavior/countDown';

Component({
    properties:{
        countDownObj:{
            type: Object,
            observer:'countDown'
        },
    },
    methods:{
        countDown(){
            let that = this
            let {isEnd, startDate, endDate} = { ...that.data.countDownObj }
            if(Object.is(startDate,undefined)) return 
            new countDown(isEnd,startDate,endDate,that)
        }
    }
})