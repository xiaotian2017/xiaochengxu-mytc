let {httpClient} = require("../../utils/util");
let {HOST} = require("../../utils/addr");
let host = HOST;
const regeneratorRuntime = require('../../utils/runtime');
let getList = ({addr,data}) => httpClient({host,addr,data});
let backTopBehavior = require('../Behavior/backTopBehavior');
let app = getApp();

Component({
    behaviors: [backTopBehavior],
    properties:{
        viewType:{
            type:String,
            default:'column'
        },
        navType:String,
        currentGoodsType:{
            type:Number,
            observer:'navRequest'
        },
        storeTypeList:Array,
        param:{
            type:Object,
            //observer:'loadData'
        },
        pullDownRefresh:{
            type:Boolean,
            observer:'pullDownRefresh'
        }
    },
    data:{
        goodsList:[],
        isLoading:true,
        loadingAll:true,
        loadingError:true,
        loadingTimeOut:true
    },
    methods:{
         pullDownRefresh(){
            this.setData({
              goodsList: [],
              'param.pageindex': 1,
              'isLoading': true,
              'loadingAll': true,
              'loadingError': true,
              "loadingTimeOut": true
            }, () => {
              this.loadData();
              wx.stopPullDownRefresh();
              
            })
        },
        //去商品详情页
        goToGoodsDetail(e){
            const {gid,sid} = {...e.currentTarget.dataset}
            wx.navigateTo({
                url: '/pages/goods/goods_detail/goods_detail?gid='+gid+'&sid='+sid
            })
        },
        goToStore(e){
            const {storeid} = {...e.currentTarget.dataset}
            wx.navigateTo({
                url: '/pages/business_detail/business_detail?storeid=' + storeid
            })
        },
        //列表页请求
        async loadDataRequest(){
            let that = this;
            let {param} ={...that.data}
            let data = await getList({
                addr:'IBaseData/GetCityGoods',
                data:param
            })
            if(data.Success){
                return data.Data.listgood
            }else{
                that.setData({
                    isLoading:true,
                    loadingError:false
                })
            }
        },
        loadData(){
            let that = this;
            let {goodsList,isLoading,loadingAll} = {...that.data}
            if( loadingAll){
                that.setData({
                    isLoading:true
                })
                that.loadDataRequest().then((data) => {
                    if(data.length > 0){
                        if(data.length < 10){
                            that.setData({
                                loadingAll:false
                            })
                        }
                        else{
                          that.setData({
                             loadingAll: true
                          })
                        }
                            let {goodsList,param} = {...that.data}
                            let pageindex = param.pageindex;
                            (goodsList = [...goodsList,...data]);
                            ++pageindex;
                            that.setData({
                                goodsList,
                                'param.pageindex':pageindex
                            })
                        
                       
                    }else{
                        that.setData({
                            isLoading:true,
                            loadingAll:false
                        })
                    }
                }).catch((err) => {
                    //请求超时
                    if(err == 'timeout'){
                        that.setData({
                            loadingTimeOut:false
                        })
                        wx.startPullDownRefresh()
                    }else{
                        that.setData({
                            loadingError:false
                        })
                    }
                    that.setData({
                        isLoading:true
                    })
                })
            }
        },
        //导航和同城卡切换
        navRequest(){
            let that = this;
            let {navType,param,loadingError} = {...that.data}
            if(!loadingError){
                that.setData({
                    loadingError:true
                })
            }
            if(navType == 'cityCard'){
                param.storeType = 0,
                param.pageindex = 1,
                param.hct = 1
                this.setData({
                    goodsList:[],
                    'loadingAll':true,
                    param,
                },() => {
                    this.loadData()
                })
                return    
            }
            if(navType == ''){
                let {storeTypeList,currentGoodsType} = {...that.data}
                that.setData({
                    goodsList:[],
                    'param.storeType':storeTypeList[currentGoodsType].Id,
                    'param.hct':0,
                    'param.pageindex':1,
                    'loadingAll':true
                },() => {
                    that.loadData()
                })
            }
        }
    }
})