let addr = require("../../../utils/addr.js");
let util = require("../../../utils/util.js");
let app = getApp();
Page({
    data:{
        showpath: false,
        navType:'',
        viewType:"column",
        currentGoodsType:0,
        showLayer:'',
        slideDown:''
  },
    onLoad:function(options){
        let that = this;
        app.getUserInfo((userInfo) => {
            that.getLocation();
            that.getNav();
            let param = {
                cityid:app.globalData.cityInfoId,
                openid:app.globalData.userInfo.openId,
                pageSize:10,
                pageindex:1,
                seachtype:-1,
                storeType:0,
                sortType:'',
                pointX:app.globalData.userlat,
                pointY:app.globalData.userlng,
                hct:0
            }
            if (app.globalData.userInfo.iscityowner>0) {
              that.setData({
                showpath: true
              })
            }
            that.setData({
                param
            })
            this.module_goodlist = this.selectComponent("#module_goodlist");
            that.module_goodlist.loadData();
        })
    },
    //获取地理位置
    getLocation: function () {
        let that = this
        wx.getLocation({
          type: 'wgs84',
          success(res){
            that.setData({
              lat: res.latitude,
              lng: res.longitude
            })
            app.globalData.userlat = res.latitude;
            app.globalData.userlng = res.longitude;
          }
        })
    },
    //下拉刷新
    onPullDownRefresh: function(){
       this.setData({
           pullDownRefresh:true
       })
    },
    //分享
    onShareAppMessage: function() {
        let that = this,
            path = addr.getCurrentPageUrlWithArgs();
        try {
            wx.setStorageSync('needloadcustpage', false)
        } catch (e) {
            console.log(e)
        }
        return {
            title:app.globalData.cityName +'热卖',
            path: path,
            fail(res){},
            success(res){
            }
        }
    },
    getNav(){
        let that = this;
        wx.request({
            url:addr.HOST + 'IBaseData/getSubStoreType',
            data: {
                pid:0,
                cityInfoId:app.globalData.cityInfoId
            },
            method: 'GET', 
            success(res){
                if(res.data.Success){
                    let storeTypeList = [{
                        Id:0,
                        Name:'全部'
                    },...res.data.Data.StoreTypeList];
                    that.setData({
                        storeTypeList
                    })
                }
            }
        })
    },
    //同城卡相关
    viewCityCardPrivilege(){
        this.setData({
            navType:'cityCard',
            currentGoodsType:-1
        })
    },
    //选择浏览商品种类
    selectGoodsType(e){
        let that = this;
        let navType = that.data.navType;
        let {index} = {...e.currentTarget.dataset};
        if(navType == 'cityCard'){
            that.setData({
                navType:''
            })            
        }
        that.setData({
            currentGoodsType:index
        }) 
    },
    //横向or竖向
    selectViewType(e){
        let type;
        const {viewtype} = {...e.currentTarget.dataset};
        if(viewtype == 'column'){
            type = 'list';
        }else if(viewtype == 'list'){
            type = 'column'
        }
        this.setData({
            viewType:type
        })
    },
    //显示导航栏弹层
    showLayer(){
        this.setData({
            showLayer:'fadeIn'
        },setTimeout(() => {
            this.setData({
                slideDown:'slideDown'
            })
        },160))
    },
    //隐藏导航栏弹层
    hideLayer(){
        this.setData({
            slideDown:''
        },()=>{
            this.setData({
                showLayer:'fadeOut'
            })
            setTimeout(() => {
                this.setData({
                    showLayer:''
                })
            },280)
        })
    },
    hiddenTips: function () {
      var path = addr.getCurrentPageUrlWithArgs()
      util.ShowPath(path)
    }
})