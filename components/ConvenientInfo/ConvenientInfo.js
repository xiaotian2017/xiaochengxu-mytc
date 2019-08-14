const c_enum = require('../../public/C_Enum');
let util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
let HOST = addr.HOST;
let app = getApp()
Component({
    properties: {
        showpath: Boolean,
        repost: {
            type: Boolean,
            observer: 'updateRepost'
        },
        post: {
            type: Array,
            observer: 'render'
        }
    },
    ready() {
        this.setData({
            openId: app.globalData.userInfo.openId
        })
    },
    data: {
        convenientInfoList: [],
        index: 0,
        shareCount: 0,
        isShow: [],//是否显示展开全部
        showArr: [] //收起展开
    },
    methods: {
        render() {
            if (wx.getStorageSync('isFresh') == 1) {
                this.setData({
                    convenientInfoList: []
                })
                wx.setStorageSync('isFresh', 0)
            }

            let that = this, tempdata, imgArr = [];
            let { isShow, convenientInfoList, post } = { ...that.data }
            console.log(this.data.post, this.data.convenientInfoList)
            if (0 == post.length) {
                that.setData({ convenientInfoList: [] })
                return
            }

            //类型
            for (var i = 0, len = post.length; i < len; i++) {
                tempdata = post[i];
                imgArr[i] = tempdata.ImgList
                // [c_enum.UsedGoods,c_enum.Tenement,c_enum.Vehiclesales].indexOf(tempdata.PTypeId):
                if (tempdata.pname == tempdata.cname) {
                    tempdata.cname = ''
                }


                switch (parseInt(tempdata.PTypeId)) {
                    //二手买卖 租房 车辆买卖  
                    case 295252:
                    case 295257:
                        if (tempdata.cname) {
                            tempdata.pname = { "1": "出售", "2": "求购", "4": "出租", "5": "求租" }[tempdata.SaleType]
                        }

                        break;
                    //拼车
                    case c_enum.Carpooling:
                        tempdata.pname = { '4': "人找车", '3': '车找人', '5': '车找货', '6': '货找车' }[tempdata.IdentityType]
                        if (tempdata.IsExpired == 1) {
                            tempdata.pname += "-已发车"
                        }
                        break;
                        //宠物
                        // case c_enum.pet:
                        //   tempdata.pname += {"5":"- 赠送","2":"- 求领养"}[tempdata.PositionType]
                        break;
                    //招聘求职
                    case c_enum.Recruit:
                        if (tempdata.SaleType != 7) {
                            tempdata.pname = { "1": "全职招聘", "2": "兼职招聘" }[tempdata.PositionType] || "招聘"
                        } else {
                            tempdata.pname = { "1": "求全职", "2": "求兼职" }[tempdata.PositionType] || "求职"
                        }

                }
            }

            convenientInfoList.push.apply(convenientInfoList, post)

            that.setData({
                convenientInfoList
            }, () => {
                that.getDescriptionHeight(isShow, convenientInfoList, post)
            })
        },
        //打电话
        callpeple(e) { //付费查看联系方式
            var that = this
            const {
                postid, phone
            } = {
                    ...e.currentTarget.dataset
                }
            util.paycallpeple(postid, phone)

        },
        //跳转详情页
        bottomItemClick(e) {
            const { id, type, typeid } = { ...e.currentTarget.dataset }
            var url = '/pages/publishNote/noteDetail?id=' + id + "&typename=" + type

            app.goNewPage(url)
        },
        //获取decription高度
        getDescriptionHeight(isShow, convenientInfoList, post) {
            let that = this;
            let len1 = convenientInfoList.length,
                len2 = post.length
            let len = len1 - len2;
            let showArr = this.data.showArr
            wx.createSelectorQuery().in(that).selectAll('.description').boundingClientRect((res) => {
                for (let { height, dataset: { index } } of res) {
                    if (index >= len) {
                        height > 40 ? isShow[index] = showArr[index] = true : isShow[index] = showArr[index] = false
                    }
                }
                that.setData({
                    isShow,
                    showArr
                })
            }).exec()
        },
        //展开收起
        showAll(e) {
            let that = this;
            let { showArr } = { ...that.data }
            const { index } = { ...e.currentTarget.dataset }
            let show = !showArr[index]
            that.setData({
                [`showArr[${index}]`]: show
            })
            console.log(this.data.showArr)
        },
        openLayer(e) {
            const { index, postid } = { ...e.currentTarget.dataset }
            let that = this;
            wx.showActionSheet({
                itemList: ['拉黑', '删除'],
                success(res) {
                    const { tapIndex } = { ...res };
                    switch (tapIndex) {
                        case 0:
                            wx.showModal({
                                content: '拉黑后他将无法发帖,确定要拉黑？',
                                cancelColor: '#999',
                                confirmColor: '#fe3d49',
                                success(res) {
                                    if (res.confirm) {
                                        that.block(postid, that)
                                    }
                                }
                            })
                            break;
                        case 1:
                            that.deleteItem(postid, index, that)
                    }
                }
            })
        },
        //拉黑
        block(postid, obj) {
            let { openId } = { ...obj.data }
            wx.request({
                url: HOST + 'apiQuery/delpost',
                data: {
                    openId,
                    postid,
                    action: 'bak',
                    reason: ''
                },
                method: 'POST',
                success(res) {
                    if (res.data.code == 1) {
                        obj.triggerEvent('showTips', {
                            content: '拉黑成功',
                            showTips: true
                        })
                    } else {
                        obj.triggerEvent('showTips', {
                            content: res.data.msg,
                            showTips: true
                        })
                    }
                }
            })
        },
        //删除
        deleteItem(postid, index, obj) {
            let { openId, convenientInfoList, isShow, showArr } = { ...obj.data }
            wx.request({
                url: HOST + 'apiQuery/delpost',
                data: {
                    openId,
                    postid,
                    action: 'delpost',
                    reason: ''
                },
                method: 'POST',
                success(res) {
                    if (res.data.isok == 1) {
                        convenientInfoList.splice(index, 1)
                        isShow.splice(index, 1)
                        showArr.splice(index, 1)
                        obj.setData({
                            convenientInfoList,
                            isShow,
                            showArr
                        }, () => {
                            obj.triggerEvent('showTips', {
                                content: '删除成功',
                                showTips: true
                            })
                        })
                    } else {
                        obj.triggerEvent('showTips', {
                            content: '删除失败',
                            showTips: true
                        })
                    }
                }
            })
        },
        //转发成功
        updateRepost() {
            let that = this
            let { index, shareCount } = { ...that.data }
            ++shareCount;
            that.setData({
                [`convenientInfoList[${index}].ShareCount`]: shareCount
            }, () => {
                that.setData({
                    repost: false
                })
            })
        },
        //获取当前帖子
        getCurrentPost(e) {
            let that = this;
            const { index, sharecount } = { ...e.currentTarget.dataset }
            that.setData({
                index,
                shareCount: sharecount
            })
        }
    }
})