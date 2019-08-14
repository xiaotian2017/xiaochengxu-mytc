let {httpClient} = require("../../utils/util");
let {HOST} = require("../../utils/addr");
let host = HOST;
const regeneratorRuntime = require('../../utils/runtime');
let getList = ({addr,data}) => httpClient({host,addr,data});

let app = getApp()

Component({
    properties:{ //组件传值通信
        currentNav:Number,
        beforeNav:{
            type:Number,
            observer:'switchNav'
        }
    },
    data:{
        currentScrollLeft:[]
    },
    ready() {
        app.getUserInfo(() => {
            this.initNav()
        })
    },
    methods:{
        //导航请求
        async initNavRequest(){
            try{
                let resData = await getList({
                    addr: 'IBaseData/GetSaleItemData',
                    data:{
                        cityid: app.globalData.cityInfoId
                    }
                })
                wx.stopPullDownRefresh();
                console.log(resData.Data)
                if(resData.Success){                  
                    return resData.Data
                }
            }catch(err){
                console.log(err)
            }
        },
        //初始化导航
        initNav(){
            let that = this
            that.initNavRequest().then((data) => {
                that.setData({
                    cityNavList:data.TabData
                }, () => {
                    //组件通信
                    that.triggerEvent('getNavArr',{
                        cityNavList:data
                    })
                })
            }).then(() => {
                this.getNavScrollLeft()
            }).catch((err) => {
                console.log(err)
            })
        },
        //切换
        switchNav(e){
            
            let that = this;
            let {beforeNav,currentNav,cityNavList,currentScrollLeft,navScrollLeftArr} = {...that.data}
            if(typeof e === "number"){
                currentScrollLeft = navScrollLeftArr[currentNav - 2]
                if(beforeNav < 2){
                    currentScrollLeft = navScrollLeftArr[0]
                }
            }else{
                let {navitemindex} = {...e.currentTarget.dataset}
                if(navitemindex != currentNav){
                    currentScrollLeft = navScrollLeftArr[navitemindex - 2]
                    if(navitemindex < 2){
                        currentScrollLeft = navScrollLeftArr[0]
                    }
                    //子组件向父组件传参
                    that.triggerEvent('ListenerNavChange',{
                        beforeNav:currentNav,
                        currentNav:navitemindex,
                        currentType:cityNavList[navitemindex].Type
                    })
                }
            }
            that.setData({
                currentScrollLeft
            })
        },
        //获取子项位置
        getNavScrollLeft(){
            let that = this,
                navScrollLeftArr=[]; //scrollleft
            let query = wx.createSelectorQuery().in(that)
            query.selectAll('.nav-item').boundingClientRect((res) => {
                for (let {left} of res){
                    navScrollLeftArr.push(left)
                }
                that.setData({
                    navScrollLeftArr
                })
            }).exec()
        }
    }
})