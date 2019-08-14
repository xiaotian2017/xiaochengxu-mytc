Component({
    properties:{
        contactInfo:Object,
        open:Boolean,
        hide:Boolean
    },
    data:{
        hide:false
    },
    methods:{
        call(e){
            var phone = e.currentTarget.dataset.phone;
            try {
                wx.setStorageSync('needloadcustpage', false)
            }
            catch (e) {
            }
            wx.makePhoneCall({
                phoneNumber: phone
            })
        },
        closeMask(e){
            let that = this;
            that.setData({
                hide:false
            },() => {
               setTimeout(() => {
                    that.setData({
                        'contactInfo.phone': '',
                        'contactInfo.qrcode': '',
                        open:false
                    })
               },230)
            })
        }
    }
})