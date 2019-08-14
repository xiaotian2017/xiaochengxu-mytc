Component({
    properties:{
        indexItem:Array
    },
    methods:{
        navFn(e) {
            let url = e.currentTarget.dataset.url
            if (!url.trim()) return;
            wx.navigateTo({
              url
            })
        }
    }
})