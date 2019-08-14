let addr = require("../../../utils/addr.js");
let util = require("../../../utils/util.js");
let app = getApp()

Page({
    data:{
        detailObj:{},
        showPath: false
    },
    onLoad(options){
       app.getUserInfo(() => {
            if (app.globalData.userInfo.iscityowner >0) {
                this.setData({
                    showPath: true,
                    cityphone: app.globalData.cityphone
                })
            }
            let userInfo = app.globalData.userInfo
            this.setData({
               ['detailObj.voteId']: options.voteId,
               ['detailObj.participantId']: options.participantId,
               ['detailObj.cityId']: app.globalData.cityInfoId,
               ['detailObj.openId']: userInfo.openId, 
               ['detailObj.resource']: 'dtl'
            },() => {
                if(!Object.is(options.currentList,undefined)){
                    this.setData({
                        ['detailObj.currentList']: options.currentList, 
                    })
                }
            })
       })
    },
    onShareAppMessage: function() {
        let path = addr.getCurrentPageUrlWithArgs()
        let {SerialNum,Introduction,NickName} = {...this.voteDetail.data.Participant}
        // 用户点击右上角分享
        return {
            title: `${SerialNum}号${NickName}的投票`, // 分享标题
            desc: Introduction, // 分享描述
            path: path // 分享路径
        }
    },
    getDataDone(e) {
        if(e.detail.init) {
            this.voteDetail = this.selectComponent('#vote-detail')
        }
    },
    // 返回首页
    goIndex() {
        app.gotohomepage()
    },
    // 返回上一级
    goBack() {
        wx.redirectTo({
            url:`/pages/vote/voteActivity/voteActivity?voteId=${this.data.detailObj.voteId}`
        })
    },
    // 显示路径
    hiddenTips() {
        var path = addr.getCurrentPageUrlWithArgs()
        util.ShowPath(path)
    }
})