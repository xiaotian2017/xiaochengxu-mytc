let addr = require("../../../utils/addr.js");
Page({
    data:{
        currentNav:1
    },
    onLoad:function(options){
        let that = this
        const {type} = {...options}
        that.setData({
            currentNav:type
        })
    },
    onShareAppMessage(res){
        let that=this,
            path = addr.getCurrentPageUrlWithArgs();
        const {currentNav} = {...that.data}
        let title
        if(title == 0){
            title = '如何发布拼团'
        }
        if(title == 1){
            title = '如何参加拼团'
        }
        try {
          wx.setStorageSync('needloadcustpage', false)
        }catch (e) {
            console.log(e)
        }
        return {
          title:title,
          path: path,
          fail(res){}
        }
      },
    switchNav(e){
        let that = this
        const {index} ={...e.currentTarget.dataset}
        let {currentNav} = {...that.data}
        if(currentNav == index){
            return 
        }else{
            that.setData({
                currentNav:index
            })
        }
    },
    swiperPage(e){
        let that = this
        const {current} = {...e.detail}
        that.setData({
            currentNav:current
        })
    }
})