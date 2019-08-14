
Component({
    properties:{
        createNum:Number,
        remainNum:Number,
        isEnd:{
            type:Boolean,
            default: false,
        },
        progressBg:String,
        progressing:String
    },
    ready(){
        this.calc()
    },
    methods:{
        calc(){
            let that = this
            let {createNum,remainNum} = {...that.data}
            let salesNum = createNum - remainNum
            let percent = ((createNum - remainNum) / createNum)* 100 + '%'
            that.setData({
                salesNum,
                percent
            })
        },
        getActiveStatus(e){
            console.log(e)
            let activeOver = e.detail.activeOver
            if(e.detail.activeOver){
                this.setData({
                    isEnd: activeOver
                })
            }
        }
    }
})