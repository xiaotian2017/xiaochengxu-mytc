Component({
    properties:{
        show:{
            type:Boolean,
            default:false,
            observer:'hideLayer'
        }
    },
    methods:{
        hideLayer(){
            let that = this;
            let {show} = {...that.data};
            let showMask = show?'fadeIn':'fadeOut';
            that.setData({
                showMask
            })
            if(!show){
                setTimeout(() => {
                    that.setData({
                        showMask:''
                    },280)
                })
            }
        }
    }
})