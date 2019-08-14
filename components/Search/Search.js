let app = getApp();
Component({
    properties:{
        searchType:String
    },
    methods:{
        clickToSearch(){
            // 分类信息
            let searchType = this.data.searchType;
            var url;
            if(searchType == 'classify'){
                url = '/pages/post/postlist?typeid=0&typename=最新推荐&sousuo=1';
                app.goNewPage(url)
            }else if(searchType == 'shop'){
                wx.navigateTo({
                    url: '/pages/business_list/business_list?source=index&&typeid=0'
                })
            }
        }
    }
})