let { httpClient } = require('../../../utils/util')
let { HOST } = require('../../../utils/addr')
let regeneratorRuntime = require('../../../utils/runtime')
let addr = require("../../../utils/addr.js");
let util = require("../../../utils/util.js");
let app = getApp()
let getBanner = (data) => httpClient({
    host: HOST,
    addr: 'IBaseData/GetBannerAjax',
    data
})
let getVoteList = (data) => httpClient({
    host: HOST,
    addr: 'vote/GetVoteList',
    data: data
})
// 获取视窗的高度
let getBound = (id, bound, fn) => {
    let query = wx.createSelectorQuery()
    query.select(id).boundingClientRect((rect) => {
        fn(rect[bound])
    }).exec()
}

let test = require('./test')

Page({
    data:{
        city_kefu_hidden:false, //客服二维码
        imgUrls:'',         // 轮播图
        scroll: false,      // 滚动触发条件
        voteList:[],        // 投票数组
        pageIndex: 1,       // 页码
        loadingAll: false,  // 加载全部
        isLoading: false,   // 正在加载
        loadingError: false,// 加载出错
        showPath:false      // 路径
    },
    onLoad(){
        app.getUserInfo(() => {
            let userInfo = app.globalData.userInfo
            if (userInfo.iscityowner > 0) {
                that.setData({
                    showPath: true
                })
            }
            this.cityId = app.globalData.cityInfoId
            this.openId = userInfo.openId
            this.init()
        })
    },
    // 分享
    onShareAppMessage() {
        let path = addr.getCurrentPageUrlWithArgs()
        return {
            title:app.globalData.cityName + '的投票活动',
            path
        }
    },
    // 滚动
    onPageScroll(e) {
        let {offsetTop, scroll} = {...this.data}
        if(e.scrollTop >= offsetTop) {
            if(!scroll) {
                this.setData({
                    scroll: true
                })
            }
        }else {
            if(scroll) {
                this.setData({
                    scroll:false
                })
            }
        }
    },
    // 下拉刷新
    onPullDownRefresh(){
        if(!this.data.isLoading) {
            this.setData({
                isLoading: true,
                loadingAll: false,
                loadError: false
            })
            this.loadRequest(1).then((data) => {
                this.setData({
                    voteList: data,
                    pageIndex: 2,
                    isLoading: false
                })
                wx.stopPullDownRefresh()
            })
        }
    },
    // 初始化
    async init() {
        try {
            await this.getBanner()
            await this.loadData()
            await this.getContentOffsetTop()
        } catch(err) {
            console.log(err)
        }
    },
    async getContentOffsetTop(){
        let that = this
        getBound('#content', 'top', function(top){
            that.setData({
                offsetTop: top
            })
        })
    },
    async getBanner() {
        let that = this
        try {
            let res = test
            // let res = await getBanner({
            //     cityid: this.cityId,
            //     typeid: '',
            //     defaulturl: ''
            // }
            if(res.Success) {
                this.setData({
                    imgUrls: res.Data.bannerlist
                })
            }
        } catch(err) {
            console.log(err)
        }
    },
    async loadRequest(page) {
        try{
            let res = await getVoteList({
                cityid:this.cityId,
                openid: this.openId,
                storeid: 0,
                pageSize: 10,
                pageIndex: page || this.data.pageIndex
            })
            if(res.Success) {
                this.setData({
                    isLoading: false
                })
                let listvote = res.Data.listvote
                if(listvote.length > 0) {
                    // let filterData = listvote.filter(item => item.IsExpire === false)
                    // if(filterData.length > 0) {
                    return listvote.map(item => {
                        return {
                            IsExpire:item.IsExpire,
                            AdvImageUrl: item.AdvImageUrl,
                            Title:item.Title,
                            Id: item.Id,
                            VoteCount: item.VoteCount,
                            NumberOneCount: item.NumberOneCount,
                            NumberOneName: item.NumberOneName,
                            PublicVote: item.PublicVote
                        }
                    })
                }else {
                    this.setData({
                        loadingAll: true
                    })
                    return null
                }
            }else {
                this.setData({
                    loadingError:true
                })
            }
            this.setData({
                isLoading:false
            })
        } catch(err) {
            console.log(err)
        }
    },
    loadData() {
        if(!this.data.isLoading) {
            this.setData({
                loadError: false
            })
            this.loadRequest().then((data) => {
                if(data !== null) {
                    let {voteList,pageIndex} = {...this.data}
                    voteList = [...voteList, ...data]
                    this.setData({
                        isLoading: false,
                        voteList,
                        pageIndex:++pageIndex
                    })
                }
            }).catch(err => {
                console.log(err)
            })
        }
    },
    scrollEvent(e) {
        if(!this.data.loadingAll && !this.data.isLoading) {
            this.loadData()
        }
    },
    // 去我的投票
    goToVote(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/vote/voteActivity/voteActivity?voteId=${id}`
        })
    },
    // 回首页
    goIndex() {
        app.gotohomepage()
    },
    hiddenTips: function () {
        var path = addr.getCurrentPageUrlWithArgs()
        util.ShowPath(path)
    }
})