let log = console.log;

var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
const app = getApp();

let addAlbum = (params) => httpClient({ addr: addr.Address.AddAlbum, data: params });
let getAlbumList = (params) => httpClient({ addr: addr.Address.GetAlbumList, data: params });
let delAlbum = (params) => httpClient({ addr: addr.Address.DelAlbum, data: params });
let getAlbumMain = (params) => httpClient({ addr: addr.Address.GetAlbumMain, data: params });

Page({
    data: {
        isShowCreateLayer: false,
        albumName: '',
        albumList: [],
        radioIdx: [],
        isShowDelBtn: false,
        isOwner: false
    },

    onLoad(options) {
        app.getUserInfo((userInfo) => {
            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            this.storeid = options.storeid;

            this.getAlbumMain();
            this.getAlbumList();

            this.albumIdArr = [];

            wx.setNavigationBarTitle({
                title: '商家相册'
            })
        })
    },
    onPullDownRefresh() {
        this.getAlbumList();
    },
    async getAlbumMain() {
    
        let resp = await getAlbumMain({
            cityid: this.cityid,
            openid: this.openid,
            storeid: this.storeid
        })
   
        this.setData({
            isOwner: resp.Data.isOwner,
        })
    },
    // 删除相册
    delAlbum() {
        this.setData({
            isShowDelBtn: !this.data.isShowDelBtn
        })
    },
    // 确认删除
    confirmDelAlbum() {
        let that = this;

        if (this.albumIdArr.length == 0) {
            this.setData({
                content: '请先选择要删除的相册！',
                showTips: true
            })
            return;
        }

        wx.showModal({
            title: '提示',
            content: '相册里的照片将全部删除，不可恢复!',
            showCancel: false,
            async success(res) {
                if (res.confirm) {
                    let resp = await delAlbum({
                        cityid: that.cityid,
                        openid: that.openid,
                        storeid: that.storeid,
                        albumid: that.albumIdArr.join(',')
                    })
                    if (resp.code == 1) {
                        that.setData({
                            content: '删除成功！',
                            showTips: true,
                            isShowDelBtn: false,
                            radioIdx: []
                        })

                        that.albumIdArr = [];

                        that.getAlbumList();
                    }
                }
            }
        })
    },
    // 获取选中的相册序号
    getRadioIdx(e) {
        let _radioIdx = this.data.radioIdx;
        let curIdx = e.currentTarget.dataset.idx;
        let exitIdx = _radioIdx.indexOf(curIdx);

        if (exitIdx > -1) {
            _radioIdx.splice(exitIdx, 1);
            this.albumIdArr.splice(exitIdx, 1);
        } else {
            _radioIdx.push(curIdx);
            this.albumIdArr.push(this.data.albumList[curIdx].Id)
        }

        this.setData({
            radioIdx: _radioIdx
        })
    },
    // 取消删除相册
    cancelDelAlbum() {
        this.setData({
            isShowDelBtn: false,
            radioIdx: []
        })

        this.albumIdArr = [];
    },
    // 获取相册名
    getAblumName(e) {
        this.setData({
            albumName: e.detail.value
        })
    },
    // 获取相册列表
    async getAlbumList() {
        wx.showLoading({
            title: '加载中...'
        })
        let resp = await getAlbumList({
            cityid: this.cityid,
            openid: this.openid,
            storeid: this.storeid,
            pageSize: 100
        })

        wx.hideLoading();
        wx.stopPullDownRefresh()

        this.setData({
            albumList: resp.Data.listAlbum
        })
    },
    // 添加相册    
    async confirmCreateAblum() {
        if (!this.data.albumName.trim()) {
            this.setData({
                content: '相册名不能为空！',
                showTips: true
            })
            return;
        }

        let resp = await addAlbum({
            openid: this.openid,
            cityid: this.cityid,
            storeid: this.storeid,
            name: this.data.albumName
        })

        if (resp.code == 1) {
            this.setData({
                content: '添加成功！',
                showTips: true,
                isShowCreateLayer: false
            })
            this.getAlbumList();
            return;
        }

        this.setData({
            content: resp.msg,
            showTips: true
        })
    },

    showCreateLayer() {
        this.setData({
            isShowCreateLayer: !this.data.isShowCreateLayer
        })
    },

    toAlbumPhoto(e) {
        vzNavigateTo({
            url: "/pages/storeAlbum/uploadPhoto",
            query: {
                albumid: e.currentTarget.dataset.id,
                albumname: e.currentTarget.dataset.name,
                storeid: this.storeid
            }
        })
    }
})

