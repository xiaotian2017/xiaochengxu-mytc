Page({
    data:{
      payonline:0,
      shopurl:""
       
    },
    onLoad(options) {  
      var that=this 
      var storeid = options.storeid
         let r=1
         let url

         switch(options.type) {
            case 'coupon':
            url='/pages/cutlist/cutlist'
            break
            case 'cut':
            url='/pages/cutlist/cutlist?type=cut'
            break
            case 'love':
            url='/pages/cutlist/cutlist?type=love'
            break
            case 'group':
            url='/pages/cutlist/cutlist?type=group'
            break
            case 'goods':
            url='/pages/cutlist/cutlist?type=goods&state=0'
            break   
            case 'biaodan':  
            url='/pages/mypublish/mypublish'
            break  
            case 'payonline':
             url= '/pages/business_detail/business_detail?storeid=' + storeid
             that.setData({ payonline: 1, shopurl: url})
             r=0
             break                   
         }
         if(1==r)
         {

           setTimeout(() => {
             wx.redirectTo({
               url
             })
           }, 4000)
         }
        
  },//进店逛逛
  gotoshop: function (e) {
    var that = this
    var url = that.data.shopurl
    wx.redirectTo({
      url: url,
    })
  }
})
