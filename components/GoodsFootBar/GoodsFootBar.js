let app = getApp();
Component({
    properties:{
        active:Number
    },
    data:{
        footBarList:['全部商家','热卖','我的订单','我的购物车','个人中心']
    },
    methods:{
        goToLink(e){
            let {index} = {...e.currentTarget.dataset}
            let url;
            switch(index){
                case 0:
                    app.gotohomepage();
                    return
                break;
                case 1:
                    url = '/pages/goods/goods_list/goods_list'
                break;
                case 2:
                    url = '/pages/cutlist/cutlist?type=goods&state=0'
                break;
                case 3:
                    url = '/pages/goods/goods_car/goods_car'
                break;
                case 4:
                    url = '/pages/person_center/person_center'
            }
            wx.navigateTo({
                url
            })
        }
    }
})