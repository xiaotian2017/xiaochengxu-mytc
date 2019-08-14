module.exports = Behavior({
    properties:{
        cityNavList:{
            type:Array,
            observer:'initLoading'
        },
        currentNav:{
            type:Number,
            value:0
        }
    },
    methods:{
        initLoading(){//初始化数据
            let that = this,
            loadingErr = [],//数据加载出错
            isLoading = [];//是否正在加载
            let {cityNavList} = {...that.data}
            for(var i = cityNavList.length;i--;){
                isLoading.push(true)
                loadingErr.push(false)
            }
            that.setData({
                isLoading,
                loadingErr,
                loadingAll:loadingErr // 是否已经加载全部
            },() => {
                that.loadData()
            })
        },
        //数据加载出错
        getDataError(){
            let that = this
            let {loadingErr,currentNav} = {...that.data}
            that.setData({
                [`loadingErr[${currentNav}]`]:true
            })
        },
        //数据正在加载中
        gettingData(){
            let that = this,status
            let {isLoading,currentNav} = {...that.data}
            that.setData({
              [`isLoading[${currentNav}]`]:false
            })
        },
        //数据加载完
        getDataDone(){
            let that = this,status
            let {isLoading,currentNav} = {...that.data}
            status = isLoading[currentNav]
            that.setData({
              [`isLoading[${currentNav}]`]:true
            })
        },
        //全部数据加载完
        getDataAll(){
            let that = this
            let {loadingAll,currentNav} = {...that.data}
            that.setData({
                [`loadingAll[${currentNav}]`]:true
            })
        }
    }
})