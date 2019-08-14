Component({
    properties:{
        showGift:{
            type:Boolean,
            default: true
        },
        detailObj: Object,
        listGift: {
            type:Array,
            observer: 'initData'
        }
    },
    methods:{
        initData(e) {
            let arr = []
            e.forEach(() => {
                arr.push(false)
            })
            this.setData({
                choosedArr: arr
            })
        },
        closeGift() {
            this.setData({
                showGift: true
            })
        },
        // 选择礼物
        chooseGift(e) {
            const index = +e.currentTarget.dataset.index
            let choosed = this.data.choosedArr[index]
            this.setData({
                [`choosedArr[${index}]`]:!choosed
            })
        },
        // 去支付
        goToPay() {
            try{
                wx.removeStorageSync('gift')
            }catch(err) {
                console.log(err)
            }
            let {listGift,choosedArr} = {...this.data}
            let filterArr = choosedArr.map((item,index) => {
                if(item === true) {
                    return index
                }
            }).filter((item) => {
                return item !== undefined
            })
            
            let gift = filterArr.reduce((prev, cur) => {
                return prev.concat(listGift[cur])
            }, [])

            if(gift.length > 0){
                let {voteId,participantId,resource} = {...this.data.detailObj}
                wx.setStorageSync('gift', gift)
                if(!Object.is(resource,undefined) && resource == 'dtl'){
                    wx.navigateTo({
                        url:`/pages/vote/votePay/votePay?voteId=${voteId}&participantId=${participantId}&from=dtl`
                    })
                }else{
                    wx.navigateTo({
                        url:`/pages/vote/votePay/votePay?voteId=${voteId}&participantId=${participantId}&from=mine`
                    })
                }
            }else {
                this.triggerEvent('showTips', {
                    showTips:true
                })
            }
        }
    }
})