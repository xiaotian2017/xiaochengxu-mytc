Component({
    properties:{
        tuan:{
            type:Array,
            observer:'render'
        }
    },
    data:{
        groupList:[]
    },
    methods:{
        render(){
            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    groupList: []
                })
                wx.setStorageSync('isFresh', 0)
            }
            let that = this
            let {groupList,tuan} = {...that.data}
            groupList.push.apply(groupList,tuan)
            that.setData({
                groupList
            })
        },
        goGroupDtl(e){
            const { gid,storeid } = { ...e.currentTarget.dataset }
            wx.navigateTo({
                url: "/pages/group_purchase/group_purchase/group_purchase?gid=" + gid + '&storeId=' + storeid
            })
        }
    }
})