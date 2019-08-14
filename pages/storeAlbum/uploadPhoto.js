

var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
const app = getApp();
let updateAlbumName = (params) => httpClient({ addr: addr.Address.UpdateAlbumName, data: params });
let addAlbumPic = (params) => httpClient({ addr: addr.Address.AddAlbumPic, data: params });
let getAlbumPic = (params) => httpClient({ addr: addr.Address.GetAlbumPic, data: params });
let uploadoneImg = (params) => httpClient({ addr: addr.Address.uploadoneImg, data: params });
let delAlbumPic = (params) => httpClient({ addr: addr.Address.DelAlbumPic, data: params });
let getAlbumMain = (params) => httpClient({ addr: addr.Address.GetAlbumMain, data: params });
Page({
data: {
        albumId: 0,
        isAblumNameDisabled: true,
        albumName: '',
        albumPhotoList: [],
        isShowDelBtn: false,
        radioIdx: [],
        isOwner: false
    },
    onLoad(options) {
        app.getUserInfo((userInfo) => {
            this.cityid = app.globalData.cityInfoId;
            this.openid = app.globalData.userInfo.openId;
            this.storeid = options.storeid;
            this.albumid = options.albumid;
            this.albumPhotoIdArr = [];
            this.setData({
                albumName: options.albumname
            })
            this.getAlbumPic();
            this.getAlbumMain();
            wx.setNavigationBarTitle({
                title: options.albumname
            })
        })
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
    onPullDownRefresh() {
        this.getAlbumPic();
    },
    delAlbumPhoto() {
        this.setData({
            isShowDelBtn: !this.data.isShowDelBtn
        })
    },
    cancelDelAlbumPhoto() {
        this.setData({
            isShowDelBtn: false,
            radioIdx: []
        })
        this.albumPhotoIdArr = [];
    },
    confirmDelAlbumPhoto() {
        let that = this;

        if (this.albumPhotoIdArr.length == 0) {
            this.setData({
                content: '请先选择要删除的相片！',
                showTips: true
            })
            return;
        }

        wx.showModal({
            title: '提示',
            content: '选中的相片将全部删除，不可恢复!',
            showCancel: false,
            async success(res) {
                if (res.confirm) {
                    let resp = await delAlbumPic({
                        cityid: that.cityid,
                        openid: that.openid,
                        storeid: that.storeid,
                        albumid: that.albumid,
                        imgid: that.albumPhotoIdArr.join(',')
                    })
                    if (resp.code == 1) {
                        that.setData({
                            content: '删除成功！',
                            showTips: true,
                            isShowDelBtn: false,
                            radioIdx: []
                        })

                        that.albumPhotoIdArr = [];

                        that.getAlbumPic();
                    } else {
                        that.setData({
                            content: resp.msg,
                            showTips: true
                        })
                    }
                }
            }
        })
    },
    // 获取相册图片
    async getAlbumPic() {
        // 做分页
        
        let resp = await getAlbumPic({
            openid: this.openid,
            cityid: this.cityid,
            albumid: this.albumid,
            storeid: this.storeid,
            pageSize: 50,
        });

        wx.stopPullDownRefresh()

    
            this.setData({
                albumPhotoList: resp.Data.listPic
            })
     
    },
    getAlbumName(e) {
        this.setData({
            albumName: e.detail.value
        })
    },
    // 编辑相册名称
    async editAlbumName(e) {
        let _isAlbumNameDisabled = this.data.isAblumNameDisabled;
        // 编辑
        if (_isAlbumNameDisabled) {
            this.setData({
                isAblumNameDisabled: false
            })
            return;
        }

        // 完成
        if (!_isAlbumNameDisabled) {
            let resp = await updateAlbumName({
                openid: this.openid,
                cityid: this.cityid,
                storeid: this.storeid,
                albumid: this.albumid,
                albumname: this.data.albumName
            })

            if (resp.code == 1) {
                this.setData({
                    content: '更新成功！',
                    showTips: true,
                    isAblumNameDisabled: true
                })
            }
        }
    },
    // 往相册添加图片
    async addAlbumPic(imgurl) {
        wx.showLoading({
            title: '上传中...'
        });
        let resp = await addAlbumPic({
            openid: this.openid,
            cityid: this.cityid,
            storeid: this.storeid,
            albumid: this.albumid,
            imgurl
        })
 
        wx.hideLoading();

        if (resp.code == 1) {
            this.setData({
                content: "上传成功!",
                showTips: true
            })

            this.getAlbumPic();
        } else {
            this.setData({
                content: '图片上传失败！',
                showTips: true
            })
        }
    },
    // 上传图片
    chooseImage() {
        let that = this;
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.chooseImage({
            count: 9,
            success: function (res) {
                var allFilePath = res.tempFilePaths;

                for (let [idx, item] of allFilePath.entries()) {
                
                    that.uploadFile(item, idx)
                }

            }
        })
    },
    uploadFile(tempFilePath, idx) {
        let that = this;
        wx.uploadFile({
            url: addr.Address.uploadImage,
            filePath: tempFilePath,
            name: 'file',
            formData: { index: idx },
            header: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            success: function (res) {
             
                var data = JSON.parse(res.data);
                that.addAlbumPic(data.path);
            }
        })
    },
    getRadioIdx(e) {
        let _radioIdx = this.data.radioIdx;
        let curIdx = e.currentTarget.dataset.idx;
        let exitIdx = _radioIdx.indexOf(curIdx);

        if (exitIdx > -1) {
            _radioIdx.splice(exitIdx, 1);
            this.albumPhotoIdArr.splice(exitIdx, 1);
        } else {
            _radioIdx.push(curIdx);
            this.albumPhotoIdArr.push(this.data.albumPhotoList[curIdx].id)
        }

        this.setData({
            radioIdx: _radioIdx
        })
    },

    // 图片预览
    previewAlbumPhoto(e) {
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.previewImage({
            current: e.currentTarget.dataset.url,
            urls: this.data.albumPhotoList.map((item) => {
                return item.filepath
            })
        })
    }
})

