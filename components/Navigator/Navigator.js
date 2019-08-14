Component({
    options:{
        multipleSlots:true
    },
    data:{
        show:false
    },
    methods:{
        showNavigator(){
            let that = this;
            let show = !that.data.show
            that.setData({
                show
            })
        },
        hideLayer(){
            this.setData({
                show:false
            })
        }
    }
})