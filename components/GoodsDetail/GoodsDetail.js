let backTopBehavior = require('../Behavior/backTopBehavior');
let WxParse = require('../../utils/wxParse/wxParse.js');
Component({
    behaviors:[backTopBehavior],
    properties:{
        mainmodel:{
            type:Object,
            observer:'getDescription'
        }
    },
    ready(){
        console.log(this.data.mainmodel)
    },
    methods:{
        getDescription(){
            let mainmodel = this.data.mainmodel.mainmodel;
            if (!!mainmodel.Description) {
                WxParse.wxParse('Description', 'html', mainmodel.Description, this)
            }
        },
        //预览图片
       viewFullPicture(e){
           const {type} = {...e.currentTarget.dataset}
           let that = this,urls,imgList;
           if(type == "banner"){
                imgList = that.data.mainmodel.mainmodel.ImgList
            }
           if(type == "desc"){
                imgList = that.data.mainmodel.mainmodel.DescImgList
            }
            const {index,src} = {...e.currentTarget.dataset}
            urls = imgList.map(item => item.filepath || item.FileFullUrl)
            that.pictureTaps(src,urls)
        },
        pictureTaps(url, urls) {
            try {
                wx.setStorageSync('needloadcustpage', false)
            }catch (e) {}
            wx.previewImage({
                current: url,
                urls: urls
            })
        },
        //去店铺详情页
        goToStore(e){
            const {storeid} = {...e.currentTarget.dataset}
            wx.navigateTo({
                url: '/pages/business_detail/business_detail?storeid=' + storeid
            })
        },
        //开通同城卡
        goToOpenCityCard(e){
            const {hctid} = {...e.currentTarget.dataset}
            wx.navigateTo({
                url: '/pages/cityCard/cityCardPurchase?curCityCardId=' + hctid + '&type=goods'
            })
        },
        //去购物车
        goToMyCar(){
            wx.navigateTo({
                url: '/pages/goods/goods_car/goods_car'
            })
        }
    }
})