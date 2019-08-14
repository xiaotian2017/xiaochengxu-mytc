Component({
    properties:{
        imgList:Array
    },
    methods:{
        viewFullPicture(e){
            let that = this,urls
            let {imgList} = {...that.data}
            const {index,src} = {...e.currentTarget.dataset}
            urls = imgList.map(item => item.filepath || item.FileFullUrl)
            that.pictureTaps(src,urls)
        },
        pictureTaps(url, urls) {
            try {
              wx.setStorageSync('needloadcustpage', false)
            }
            catch (e) {
            }
            wx.previewImage({
              current: url,
              urls: urls,
            })
          }
    }
})