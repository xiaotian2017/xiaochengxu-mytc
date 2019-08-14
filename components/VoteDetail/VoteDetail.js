
let {httpClient} = require("../../utils/util");
let {HOST} = require("../../utils/addr");
let regeneratorRuntime = require('../../utils/runtime');

//投票详情
let getVoteDetail = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetVoteDetail',
    data
})

// 投票用户
let getVoteUsers = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetVoters',
    data
})

// 礼物用户
let getGiftUsers = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetGifters',
    data
})

//投票
let addVote = (data) => httpClient({
    host: HOST,
    method: 'POST',
    addr: 'vote/VoteAdd',
    data
})

let prefixPrice = (price) => {
    return ((price * 10000)/1000000).toFixed(2)
}

Component({
    properties:{
        detailObj:{
            type: Object,
            default:{},
            observer: 'init'
        }
    },
    data: {
        init: false,
        imgUrls: {}, //轮播图
        countDownObj: {}, // 倒计时
        pageIndex:[1,1],
        activeNoStart: false,
        activeOver: false,
        showTips: false,
        content: '',
        currentList:0,
        loadingAll: [false,false],
        isLoading: [false,false],
        showGift: true
    },
    methods: {
        init() {
            let {participantId,currentList} = {...this.data.detailObj}
            if(!Object.is(currentList,undefined)){
                this.setData({
                    currentList:+currentList
                })
            }
            if(!!participantId){
                this.getVoteDetail().then(() => {
                    if(this.data.init){
                        this.getVoteUsers()
                    }
                }).catch(err => {
                    console.log(err)
                }) 
            }
        },
        getActiveStatus(e) {
            if(e.detail.activeNoStart === true) {
                this.setData({
                    activeNoStart:true
                })
            }else if(e.detail.activeNoStart === false) {
                this.setData({
                    activeNoStart:false
                })
            }else if(e.detail.activeOver === true) {
                this.setData({
                    activeOver: true
                })
            }
        },
        // 详情
        async getVoteDetail() {
            try{
                let {cityId,openId,voteId,participantId} = {...this.data.detailObj}
                wx.showLoading({
                    title:'正在加载...'
                })
                let res = await getVoteDetail({
                    cityid: cityId,
                    openid: openId,
                    voteid: voteId,
                    participantId: participantId
                })
                if(res.Success) {  
                    let Participant = res.Data.mainmodel.Participant
                    let vote = res.Data.mainmodel.Vote

                    let filterParticipant = {
                        Id:Participant.Id,
                        Declaration: Participant.Participant,
                        ClickCount: Participant.ClickCount,
                        Introduction: Participant.Introduction,
                        SerialNum: Participant.SerialNum,
                        NickName: Participant.NickName,
                        Poll:Participant.Poll,
                        Last: res.Data.Last === -1? 0:res.Data.Last,
                        Next: res.Data.Next === -1? 0:res.Data.Next,
                        ProductName:Participant.ProductName,
                        Giftcount:Participant.Giftcount,
                        IsSwitchGift:vote.IsSwitchGift,
                        ShowProductName:vote.ShowProductName,
                        StartTime:/\((\d+)\)/.exec(vote.EndTime)[1]
                    }
                    if(vote.IsSwitchGift) {
                        this.setData({
                            listNav:['投票列表', '礼物列表'],
                            listUsers:[[],[]]
                        })
                    }else{
                        this.setData({
                            listNav:['投票列表'],
                            listUsers:[[]]
                        })
                    }
                    let ImgDescList = res.Data.mainmodel.ImgDescList.map((item) => {
                        return item.filepath
                    })

                   
                    let countDownObj = {
                        isEnd: vote.IsExpired ? 1:0,
                        startDate: vote.StartTime,
                        endDate: vote.VoteEndTime
                    }
                    let listGift = res.Data.mainmodel.ListGift
                    if(listGift.length > 0) {
                        listGift.forEach((item) => {
                            item.GiftPrice = prefixPrice(item.GiftPrice)
                        })
                        this.setData({
                            listGift
                        })
                    }

                    this.setData({
                        init: true,
                        countDownObj,
                        imgUrls: res.Data.mainmodel.BannerList,
                        'Participant': filterParticipant,
                        ImgDescList
                    },() => {
                        wx.hideLoading()
                        this.triggerEvent('getDataDone', {
                            init:true
                        })
                    })
                }
            } catch(err) {
                console.log(err)
            }
        },
        // 预览图片
        previewImg(e) {
            const index = e.currentTarget.dataset.index
            let url = this.data.ImgDescList[index]
            wx.previewImage({
                current: url,
                urls: [url]
            })
        },
        // 投票用户
        async getVoteUsers() {
            try {
                let {detailObj:{cityId,openId,voteId,participantId},isLoading,currentList} = {...this.data}
                if(!isLoading[currentList]) {
                    this.setData({
                        [`isLoading[${currentList}]`]: true
                    })
                    let res,param
                    if(currentList === 0) {
                        param = {
                            cityid: cityId,
                            openid: openId,
                            voteId: voteId,
                            participantId: participantId,
                            pageIndex: this.data.pageIndex[currentList]
                        }
                        res = await getVoteUsers(param)
                    }else if(currentList === 1) { 
                        param = {
                            cityid: cityId,
                            openid: openId,
                            participantid: participantId,
                            pageindex: this.data.pageIndex[currentList]
                        }
                        res = await getGiftUsers(param)
                    }
                    if(res.Success) {
                        let list 
                        if(currentList === 0) {
                            list = res.Data.listvoter
                        }else if(currentList === 1) { 
                            list = res.Data.listgift
                        }
                        if(list.length > 0) {
                            if(list.length < 10) {
                                this.setData({
                                    [`loadingAll[${currentList}]`]: true 
                                })    
                            }else {
                                let pageIndex = this.data.pageIndex[currentList]
                                ++pageIndex
                                this.setData({
                                    [`pageIndex[${currentList}]`]:pageIndex
                                })
                            }
                            this.setData({
                                [`listUsers[${currentList}]`]:[...this.data.listUsers[currentList], ...list]
                            })
                        }else {
                            this.setData({
                                [`loadingAll[${currentList}]`]: true
                            })
                        }
                    }
                }
                this.setData({
                    [`isLoading[${currentList}]`]: false
                })
            }catch(err) {
                console.log(err)
            }
        },
        // 投票
        async addVote() {
            try {
                let {cityId,openId,voteId,participantId} = {...this.data.detailObj}
                let {currentList} = {...this.data}
                let res = await addVote({
                    cityid: cityId,
                    openid: openId,
                    voteId: voteId,
                    participantId: participantId
                })
                if(res.Success) {
                    this.setData({
                        showTips: true,
                        listvoter: [[],[]],
                        [`pageIndex[${currentList}]`]: 1,
                        [`loadingAll[${currentList}]`]: false,
                        content: '投票成功'
                    }, () => {
                        this.getVoteDetail().then(() => {
                            this.getVoteUsers()
                        })
                        console.log(this.data)
                    })
                }else {
                    this.setData({
                        showTips: true,
                        content: '您已经投过票了'
                    })
                }
            }catch(err) {
                console.log(err)
            }
        },
        // 切换
        switchList(e) {
            if(this.data.listNav.length === 1) return 
            let {listUsers,loadingAll} = {...this.data}
            const index = +e.currentTarget.dataset.index
            this.setData({
                currentList:index
            },() => {
                if(listUsers[this.data.currentList].length === 0 && !loadingAll[this.data.currentList]){
                    this.getVoteUsers()
                }
            })
        },
        // 送礼物
        sendGift() {
            this.setData({
                showGift: false
            })
        },
        loadUser() {
            let {isLoading, loadingAll,currentList} = {...this.data}
            if(!isLoading[currentList] && !loadingAll[currentList]) {
                if(currentList === 0){
                    this.getVoteUsers()
                }else if(currentList === 1){
                    this.getGiftUsers()
                }
            }
        },
        // 参加投票
        attendVote() {
            if(this.data.Participant.StartTime < +new Date()) {
                this.setData({
                    showTips: true,
                    content: '参赛时间已过'
                })
                return
            }else {
                let {voteId} = {...this.data.detailObj}
                wx.redirectTo({
                    url: `/pages/vote/take?voteid=${voteId}`
                })
            }
        },
        showTips(e) {
            this.setData({
                showTips: true,
                content: '您还没有选择礼物赠送'
            })
        }
    },
})