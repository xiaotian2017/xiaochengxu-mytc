let { httpClient } = require('../../../utils/util')
let { HOST } = require('../../../utils/addr')
let regeneratorRuntime = require('../../../utils/runtime')
let wxParse = require('../../../utils/wxParse/wxParse.js');
let addr = require("../../../utils/addr.js");
let util = require("../../../utils/util.js");
let app = getApp()

// 获取视窗的高度
let getBound = (id, fn, bound) => {
    let query = wx.createSelectorQuery()
    query.select(id).boundingClientRect((rect) => {
        fn(!!bound ? rect[bound] : rect)
    }).exec()
}
// 修正时间戳
let modifyTime = (timeStamp) => {
    let time = new Date(+/\((\d+)\)/.exec(timeStamp)[1])
    let year = time.getFullYear();
    let month = time.getMonth()+1;
    let date = time.getDate();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    return `${year}-${prefixTime(month)}-${prefixTime(date)} ${prefixTime(hours)}:${prefixTime(minutes)}:00`
}
// 补0
let prefixTime = (num) => {
    if(num < 10) {
        num = '0' + num
    }
    return num
}

// 获取投票统计
let getVoteInfo = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetVoteSelfMain',
    data
})

// 获取首页
let getIndex = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetVoteParticpant',
    data
})

// 获取排行
let getRank = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetRanker',
    data
})

// 获取奖品
let getReward = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetVoteIntroMain',
    data
})

// 检测我的
let detectMineVote = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetVoteDetail',
    data
})

// 搜索投票
let searchVote = (data) => httpClient({
    host: HOST,
    addr: 'vote/SearchParticipant',
    data
})

//获取客服二维码
let getQrCodeUrl = () => httpClient({
    host: HOST,
    addr: 'IBaseData/GetQrCodeUrl',
    data:{
        areaCode: app.globalData.areaCode
    }
})

Page({
    data:{
        init:false,
        // loadVoteInfo:true, //控制首页加载
        loadVoteInfo: false,
        showPath: false,
        city_kefu_hidden: true, //客服弹窗开关
        cityphone:'',  // 城主电话
        qrCodeUrl:'', // 二维码
        activeNoStart: false,
        activeOver: false,
        imgUrls:'', // 轮播图
        currentPage:0, // 当前页码
        loadPage:[1,0,0,0], //初次渲染的页码
        // currentPage:0, // 当前页码
        // loadPage:[0,0,0,1], //初次渲染的页码
        voteInfo: {}, // 投票信息
        pageIndex: {
            voteNavList: ['最新', '热门'], //首页导航
            pageIndexArr: [1, 1],
            isLoadingArr: [false, false],
            loadingAllArr: [false,false],
            pageArr:[[],[]],
            indexCurrentNav: 0,
            showSearch: false,
            sliderWidth: '',
            leftArr: [],
            isScroll: false, //是否产生滚动
            scrollTop: 0
        },
        pageRank: {
            rankList: [],
            pageIndex:1,
            loadingAll:false
        },
        pageReward: {
            load:false,
        },
        pageMy: {
            request: false,
            isAttend: false 
        },
        countDownObj: {},
        detailObj: {},
        showSearchPage: false,
        searchNum: null,
        searchResult: {}, //搜索结果
        content: '',
        showTips: false
    },
    onLoad(options){
        if(!!options.currentPage) {
            this.setData({
                currentpage:options.currentPage,
                loadVoteInfo:false,
                loadPage:[0,0,0,1]
            })
        }
        if(!!options.currentList) {
            this.currentList = options.currentList
        }
        app.getUserInfo(() => {
            if (app.globalData.userInfo.iscityowner > 0) {
                this.setData({
                    showPath: true,
                    cityphone: app.globalData.cityphone
                })
            }
            let userInfo = app.globalData.userInfo
            this.voteId = options.voteId
            this.cityId = app.globalData.cityInfoId
            this.openId = userInfo.openId

            this.init().then(() => {
                this.setData({
                    init: true
                }, () => {
                    this.getIndex()
                })
            })
        })
    },
    // 分享初始化
    onShareAppMessage() {
        let {currentpage} = {...this.data}
        if(currentpage !== 3){
            var path = addr.getCurrentPageUrlWithArgs()
            // 用户点击右上角分享
            return {
                path: path + `currentPage=${this.data.currentPage}` // 分享路径
            }
        }
    },
    // 初始化页面
    async init() {
        try {
            let {currentPage} = {...this.data}
            this.setVoteTitle()
            if(currentPage === 0) {
                this.getVoteInfo().then(() => {
                    this.initData()
                })
            }else if(currentPage === 3){
                this.detectMineVote()
            }
        } catch(err) {
            console.log(err)
        }
    },
    // 初始化数据
    initData() {
        let that = this,leftArr = []
        getBound('.nav-slider', function(sliderWidth) {
            wx.createSelectorQuery().in(that).selectAll('.vote-nav-item').boundingClientRect((res) => {
                for(let {left,width} of res){
                    leftArr.push(left + (width - sliderWidth)/2)
                }
                that.setData({
                    ['pageIndex.leftArr']:leftArr
                })
            }).exec()
        }, 'width')

        // pageIndex的status-area scrollTop
        getBound('.status-area', function(top) {
            that.setData({
                ['pageIndex.scrollTop']:top
            })
        }, 'top')
    },
    // pageIndex的页面是否可以滚动
    detectScrollTop(e) {
        let {currentPage} = {...this.data}
        if(currentPage === 0) {
            let top = e.detail.scrollTop
            let {isScroll,scrollTop} = {...this.data.pageIndex}
            if(top >= scrollTop) {
                if(!isScroll){
                    this.setData({
                        ['pageIndex.isScroll']: true
                    })
                }
            }else {
                if(isScroll) {
                    this.setData({
                        ['pageIndex.isScroll']: false
                    })
                }
            }
        }
    },
    // 显示搜索页面
    showSearch() {
        this.setData({
            showSearchPage:true
        }, () => {
            wx.setNavigationBarTitle({
                title: '投票-搜索'
            })
        })
    },
    // 隐藏搜索页
    hideSearch() {
        this.setData({
            showSearchPage:false,
            searchResult: {},
            searchNum: null
        }, () => {
            this.setVoteTitle(this.data.currentPage)
        })
    },
    // input获取搜索的编号
    getSearchNum(e) {
        const value = +e.detail.value.trim()
        this.setData({
            searchNum: value
        })
    },
    // 搜索事件
    searchVoteItem() {
        let {searchNum} = {...this.data}
        if(/^\d+$/.test(searchNum)){
            this.search(searchNum)
        }
    },
    // 首页导航点击切换
    switchPageIndexNav(e) {
        if(e.type === 'touchstart') {
            let that = this
            let index = +e.target.dataset.currentnav
            let {indexCurrentNav} = {...that.data.pageIndex}
            if(indexCurrentNav !== index){
                that.setData({
                    ['pageIndex.indexCurrentNav']: index
                })
                that.getIndex()
            }
        }
    },
    // swiper切换
    swiperPageIndexBlock(e) {
        if(!e.detail.source) {
            const current = e.detail.current
            this.setData({
                ['pageIndex.indexCurrentNav']:current
            }, () => {
                this.getIndex()
            })
        }
    },
    // footer页面切换
    switchPage(e){
        let that = this
        let index = +e.target.dataset.currentpage
        let {loadVoteInfo,currentPage,loadPage} = {...that.data}
        if(currentPage !== index){
            that.setData({
                currentPage: index
            }, () => {
                that.setVoteTitle(index)
                if(!loadVoteInfo) {
                    this.setData({
                        loadVoteInfo: true
                    }, () => {
                        this.getVoteInfo()
                    })
                }
                !loadPage[index] && that.switchPageCallBack(index)
                that.setData({
                    [`loadPage[${index}]`]:true
                },() => {
                    if(this.data.loadVoteInfo && index === 0){
                        that.initData()   
                    }
                })
            })
        }
    },
    // 切换的回调
    switchPageCallBack(index = 0) {
        switch(index) {
            case 1: 
                this.getRank()
            break;
            case 2:
                if(!this.data.pageReward.load){
                    this.getReward()
                }
            break;
            case 3:
                if(!this.data.pageMy.request){
                    this.detectMineVote()
                }
            break;
            default:
                this.getIndex()
        }
    },
    // 设置标题
    setVoteTitle(index = 0) {
        let title = ''
        switch(index) {
            case 0:
                title = '投票首页'
                break;
            case 1:
                title = '投票排行榜'
                break;
            case 2:
                title = '投票奖品'
                break;
            case 3:
                title = '我的投票'
                break
        }
        wx.setNavigationBarTitle({
            title
        })
    },
    // 活动状态
    getActiveStatus(e) {
        if(e.detail.activeNoStart === true) {
            this.setData({
                activeNoStart:true
            })
        }else if(e.detail.activeNoStart === false) {
            this.setData({
                activeNoStart:false
            }, () => {
                this.getIndex()
            })
        }else if(e.detail.activeOver === true) {
            this.setData({
                activeOver: true
            })
        }else if(e.detail.active){
            this.getIndex()
        }
    },
    // 跳去选手详情
    goVoteDetail(e) {
        const {participantid} = {...e.currentTarget.dataset}
        wx.navigateTo({
            url: `/pages/vote/voteDetail/voteDetail?voteId=${this.voteId}&participantId=${participantid}`
        })
    },
    // 没有参加投票 
    voteEmpty() {
        let that = this
        wx.showModal({
            title: '友情提示',
            content: '您还未参加该投票活动,是否立即参加?',
            success(res) {
                if(res.confirm){
                    wx.navigateTo({
                        url: `/pages/vote/take?voteid=${this.voteId}`
                    })
                }else if(res.cancel){
                    that.setData({
                        currentPage: 0
                    })
                }
            }
        })
    },
    // 获取投票统计
    async getVoteInfo() {
        try {
            let res = await getVoteInfo({
                cityid: this.cityId,
                openid: this.openId,
                voteId: this.voteId
            })
            if(res.Success) {
                // 设置轮播图
                this.setData({
                    imgUrls: res.Data.bannerlist
                })
                let vote = res.Data.vote
                console.log(vote.Describe)
                wxParse.wxParse('pageReward.Describe', 'html', vote.Describe, this)
                this.setData({
                    ['countDownObj.isEnd']: vote.IsExpired ? 1:0,
                    ['countDownObj.startDate']: vote.StartTime,
                    ['countDownObj.endDate']: vote.VoteEndTime,
                    ['voteInfo.ClickCount']: vote.ClickCount,
                    ['voteInfo.VoteCount']: vote.VoteCount,
                    ['voteInfo.PublicVote']: vote.PublicVote,
                    ['voteInfo.IsSwitchGift']:vote.IsSwitchGift,
                    ['voteInfo.ShowProductName']:vote.ShowProductName,
                    ['pageReward.Title'] : vote.Title,
                    ['pageReward.SubTitle']: vote.SubTitle,
                    ['pageReward.SubTitleLen']: vote.SubTitle.length * (-30) + 'rpx',
                    ['pageReward.StartDate'] : modifyTime(vote.StartTime),
                    ['pageReward.EndDate'] : modifyTime(vote.EndTime),
                    ['pageReward.VoteStartDate'] : modifyTime(vote.VoteStartTime),
                    ['pageReward.VoteEndDate'] : modifyTime(vote.VoteEndTime)
                })
            }
        }catch (err) {
            console.log(err)  
        }
    },
    // 首页
    async getIndex() {
        try {
            let  {pageArr,isLoadingArr,loadingAllArr,pageIndexArr, indexCurrentNav} = {...this.data.pageIndex}
            if(!isLoadingArr[indexCurrentNav] && !loadingAllArr[indexCurrentNav]){
                this.setData({
                    [`pageIndex.isLoadingArr[${indexCurrentNav}]`]:true
                })
                let res = await getIndex({
                    cityid: this.cityId,
                    openid: this.openId,
                    voteId: this.voteId,
                    pageIndex:  pageIndexArr[indexCurrentNav],
                    order: indexCurrentNav
                })
                if(res.length > 0) {
                    if(res.length < 10) {
                        this.setData({
                            [`pageIndex.loadingAllArr[${indexCurrentNav}]`]: true
                        })
                    }else {
                        let pageIndex = pageIndexArr[indexCurrentNav];
                        ++pageIndex;
                        this.setData({
                            [`pageIndex.pageIndexArr[${indexCurrentNav}]`]: pageIndex
                        })
                    }
                    let page = [...pageArr[indexCurrentNav],...res]
                    this.setData({
                        [`pageIndex.pageArr[${indexCurrentNav}]`]: page
                    })
                } else {
                    this.setData({
                        [`pageIndex.loadingAllArr[${indexCurrentNav}]`]: true
                    })
                }
                this.setData({
                    [`pageIndex.isLoadingArr[${indexCurrentNav}]`]: false
                })
            }
        } catch(err) {
            console.log(err)
        }
    },
    // 排行
    async getRank() {
        let {rankList,pageIndex,isLoading,loadingAll} = {...this.data.pageRank}
        if(!isLoading && !loadingAll) {
            this.setData({
                ['pageRank.isLoading']:true
            })
            let res = await getRank({
                cityid: this.cityId,
                openid: this.openId,
                voteid: this.voteId,
                pageIndex:pageIndex
            })
            if(res.Success){
                let listRanker = res.Data.listRanker
                if(listRanker.length > 0) {
                    if(listRanker.length < 10){
                        this.setData({
                            ['pageRank.loadingAll']:true
                        })
                    }else{
                        ++pageIndex;
                        this.setData({
                            ['pageRank.pageIndex']: pageIndex
                        })
                    }
                    rankList = [...rankList,...listRanker];
                    this.setData({
                        ['pageRank.rankList']: rankList
                    })
                }else {
                    this.setData({
                        ['pageRank.loadingAll']:true
                    })
                }
            }
            this.setData({
                ['pageRank.isLoading']: false
            })
        }
    },
    // 奖品
    async getReward() {
        try{
            let res = await getReward({
                cityid: this.cityId,
                openid: this.openId,
                voteId: this.voteId
            })
            if(res.Success) {
                this.setData({
                    ['pageReward.load']: true
                })
                let video = res.Data.video
                if(!!video) {
                    let Video = {
                        convertFilePath: video.ConvertFilePath,
                        videoPosterPath: video.VideoPosterPath
                    }
                    this.setData({
                        ['pageReward.video']: Video
                    })
                }
            }
        } catch(err) {
            console.log(err)
        }
    },
    // 检测是否有参加投票 
    async detectMineVote() {
        try{
            let res = await detectMineVote({
                cityid: this.cityId,
                openid: this.openId,
                voteid: this.voteId
            })
            this.setData({
                ['pageMy.request']: true
            })
            if(res.Success){
                this.setData({
                    ['detailObj.voteId']: this.voteId,
                    ['detailObj.participantId']: res.Data.mainmodel.Participant.Id,
                    ['detailObj.cityId']: this.cityId,
                    ['detailObj.openId']: this.openId,
                    ['pageMy.isAttend']: true,
                    ['pageMy.participantId']: res.Data.mainmodel.Participant.Id
                }, () => {
                    if(!Object.is(this.currentList,undefined)){
                        console.log('触发了这里')
                        this.setData({
                            ['detailObj.currentList']: this.currentList
                        })
                    }
                })
            }
            if(res.Success === false){
                let {activeNoStart,activeOver} = {...this.data}
                if(!activeNoStart && !activeOver){
                    this.voteEmpty()
                }
            }
        } catch(err) {
            console.log(err)
        }
    },
    // 搜索
    async search(num) {
        try {
            let res = await searchVote({
                cityid: this.cityId,
                openid: this.openId,
                voteId: this.voteId,
                serialNum: num
            })
            if (res.length > 0) {
                this.setData({
                    ['searchResult.ImgeIds']:res[0].ImgeIds,
                    ['searchResult.Id']:res[0].Id,
                    ['searchResult.Poll']:res[0].Poll,
                    ['searchResult.SerialNum']: res[0].SerialNum,
                    ['searchResult.NickName']: res[0].NickName,
                    ['searchResult.ProductName']: res[0].ProductName
                })
            } else {
                this.setData({
                    content:'未找到该选手',
                    showTips:true
                })
            }
        } catch(err) {
            console.log(err)
        }
    },
    // 获取二维码
    async getQrCodeUrl() {
        try{
            let res = await getQrCodeUrl()
            if (res.Success) {
                this.setData({
                    qrCodeUrl: res.Data.QrCodeUrl
                })
            }else {
                wx.showToast({
                    title: res.Data.Message
                })
            }
        }catch(err) {
            console.log(err)
        }
    },
    // 快捷导航-回首页
    goIndex(){
        app.gotohomepage()
    },
    // 客服
    callphone(e) {
        var phone = e.currentTarget.dataset.phone
        util.g_callphone(phone)
    },
    // 显示客服弹窗
    bindtap_showkefuwin(e) {
        if(!this.data.QrCodeUrl) {
           this.getQrCodeUrl()
        }
        this.setData({ 
            city_kefu_hidden: false 
        })
    },
    // 关闭客服弹窗
    bindtap_close(e) {
        this.setData({
            city_kefu_hidden: true 
        })
    },
    // 快捷导航-编辑
    editMyVote() {
        console.log(this.voteId)
        wx.navigateTo({
            url: `/pages/vote/take?voteid=${this.voteId}`
        })
    },
    // 参赛
    attendVote() {
        console.log(this.voteId)
        wx.navigateTo({
            url: `/pages/vote/take?voteid=${this.voteId}`
        })
    },
    // 快捷导航-获取链接
    hiddenTips() {
        var path = addr.getCurrentPageUrlWithArgs()
        util.ShowPath(path)
    }
})