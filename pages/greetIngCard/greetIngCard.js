var addr = require("../../utils/addr.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
const app = getApp();

let christmasbeeling = (params) => httpClient({ addr: addr.Address.Christmasbeeling, data: params });
let getNormalRedPacket = (params) => httpClient({ addr: addr.Address.GetNormalRedPacket, data: params });
let drawNormalRedPacket = (params) => httpClient({ method: 'POST', addr: addr.Address.DrawNormalRedPacket, data: params });

let drawParams = {};
// 元宵贺词
let firstPhase = '天上月圆，人间团圆\n家庭情圆，心中事圆\n左右逢圆\n愿你在每一天中\n人缘、情缘、福缘、财缘，缘缘不断，\n事事如愿\n祝元宵节快乐\n梦想成真！万事如意!';

let secondPhase = '元月十五闹元宵，吃了元宵开怀笑\n元月十五赏花灯，看了花灯美梦成\n元月十五猜灯谜，猜了灯谜万事喜\n元月十五赏月忙，赏了圆月幸福长\n元宵节快乐。';

let thirdPhase = '元宵节到，猫儿跳狗儿叫\n树上的小鸟喳喳叫\n各路财神帮我把祝愿送\n花灯灯船替我把情传，\n祝你全家老少皆安\n欢欢喜喜团团圆圆过元宵\n元宵节快乐！';

let fourthPhase = '十五月亮圆，十五喜庆多\n全家团圆幸福多，心情愉快朋友多\n身体健康快乐多，财源滚滚来\n钞票多多落，年年吉祥如意多\n祝愿好事多多多';

let fifthPhase = '元宵佳节汤圆圆\n生活美满心里甜欢天喜地庆佳节\n龙腾狮舞祈丰年各种灯笼色彩艳\n猜灯谜活动乐翻天\n鞭炮声声震天响，礼花片片洒人间\n愿君合家团圆人人羡，吉祥如意保平安\n元宵快乐！'

let sixthPhase = '正月十五月儿圆，美好祝福在耳边\n正月十五元宵甜，祝你今年更有钱\n正月十五汤圆香，祝你身体更健康\n正月十五乐团圆\n祝元宵乐连连！'

// 贺卡模板
let cardTempList = [{
    cardImg: 'https://j.vzan.cc/content/city/cardtype/img/card-type05.jpg',
    cardName: '元宵',
    cardId: 1107
},
{
    cardImg: 'https://j.vzan.cc/content/city/cardtype/img/card-type04.jpg',
    cardName: '新年',
    cardId: 1106
},
{
    cardImg: 'https://i.vzan.cc/image/jpg/2018/5/8/145708a7669ba03be84e55bfd896555115e061.jpg',
    cardName: '母亲节',
    cardId: 1112
},
{
    cardImg: 'https://i.vzan.cc/image/jpg/2018/5/28/154325d268e42a10cc445a9c1210869ffbe11d.jpg',
    cardName: '儿童节',
    cardId: 1113
}];

const yuanxiaoMusic = 'https://i.vzan.cc/citysource/xcx_heka/yuanxiao_mus.mp3';
const xinnianMusic = 'https://j.vzan.cc/content/city/lunaryear/img/happynewyear.mp3';
const montherMusic = 'http://j.vzan.cc/content/city/xcx/images/mother.mp3';
const childrenMusic = 'http://j.vzan.cc/content/city/xcx/images/child.mp3'
Page({
    data: {
        shareposterparams: {
            toNikeName: "",
            fromNikeName: "",
            createposter: 0,
            openid: "",
            appid: "",
            cardName: ''
        },
        familyTop: 0,
        oldTop: 0,
        toNikeName: '',
        fromNikeName: '',
        bid: 0,
        rpid: 0,

        newYearObj: {    // 新年贺卡
            isOpenFaimly: false,
            isOpenOld: false,
            isPrint: false
        },
        audioObj: {
            isPlay: false
        },
        redPackageObj: {
            isShowRedBtn: false, // 红包按钮
            isShowRed: false, // 红包领取弹窗
            isReceiveFail: false,
            redAmount: 0,
            allAmount: 0
        },
        lanternFestivalObj: {},
        cardId: 0,
        previewIdx: 0,
        cardTempList,
        isPreview: false
    },

    commonSwitch(cardid) {
        switch (cardid) {
            case 1106:
                this.title = '新年快乐';
                this.music = xinnianMusic;
                this.setData({
                    previewIdx: 1,
                    'shareposterparams.cardName': '新年快乐'
                })
                break;
            case 1107:
                this.title = '元宵节快乐';
                this.music = yuanxiaoMusic;
                this.setData({
                    previewIdx: 0,
                    'shareposterparams.cardName': '元宵节快乐'
                })
                break;
            case 1112:
                this.title = '母亲节快乐';
                this.music = montherMusic;
                this.setData({
                    previewIdx: 2,
                    'shareposterparams.cardName': '母亲节快乐'
                })
                break;
            case 1113:
                this.title = '儿童节快乐';
                this.music = childrenMusic;
                this.setData({
                    previewIdx: 3,
                    'shareposterparams.cardName': '儿童节快乐'
                })
        }
        this.openAudio();
        wx.setNavigationBarTitle({
            title: this.title
        })
    },

    onLoad(options) {
        this.bid = options.bid;
        this.cardid = options.cardId;
        //从海报进来
        var scene = options.scene
        if (undefined != scene || null != scene) {
            scene = decodeURIComponent(scene);
            if (0 != scene && "0" != scene) {
                //读取参数
                this.bid = addr.getsceneparam("bid", scene);
                this.cardid = addr.getsceneparam("cardId", scene);
            }
        }

        this.commonSwitch(parseInt(this.cardid));

        app.getUserInfo(() => {
            let openid = app.globalData.userInfo.openId;
            let cityid = app.globalData.cityInfoId;
            this.setData({
                bid: this.bid,
                'shareposterparams.openid': openid,
                'shareposterparams.appid': app.globalData.appid,
                cardId: this.cardid
            })
            drawParams.cityid = cityid;
            drawParams.openid = openid;
            drawParams.itemid = this.bid;
            this.christmasbeeling({
                cityid: cityid,
                bid: this.bid,
                openid: openid
            })

            this.getNormalRedPacket({
                cityid: cityid,
                openid: openid,
                itemid: this.bid,
                source: 8
            })

            // 判断贺卡才设置，选择模板时手动设置
            this.curLanternFestival();
        })
    },
    // 元宵贺卡 
    curLanternFestival() {
        let tempObj = {
            firstPhase,
            secondPhase,
            thirdPhase,
            fourthPhase,
            fifthPhase,
            sixthPhase
        }
        this.setData({
            lanternFestivalObj: tempObj
        })
    },
    // 贺卡信息
    async christmasbeeling(params) {
        wx.showLoading({
            title: '加载中...'
        })
        let resp = await christmasbeeling(params);
        wx.hideLoading();
        let toNikeName = resp.Data.model.ToNikeName;
        let fromNikeName = resp.Data.model.FromNikeName;
        this.setData({
            toNikeName,
            fromNikeName,
            'shareposterparams.toNikeName': toNikeName,
            'shareposterparams.fromNikeName': fromNikeName
        })
    },
    // 查询红包
    async getNormalRedPacket(params) {
        let resp = await getNormalRedPacket(params);
        if (resp.code == 1) {
            this.setData({
                'redPackageObj.isShowRedBtn': true,
                'redPackageObj.allAmount': resp.Data.red.Amount * 1000 / 100000,
                rid: resp.Data.red.Id,
                totalCount: resp.Data.red.TotalCount,
                displayAmount: resp.Data.red.DisplayAmount

            })

            if (resp.Data.red.State == 2) {
                this.setData({
                    'redPackageObj.isReceiveFail': true
                })
            }
            if (resp.Data.rpd) {
                this.setData({
                    'redPackageObj.redAmount': resp.Data.rpd.Amount * 1000 / 100000
                })
            }
            drawParams.rpid = resp.Data.red.Id;
        }
    },
    // 领取红包
    async drawNormalRedPacket() {
        wx.showLoading({
            title: '飞速领取中...'
        })
        let resp = await drawNormalRedPacket(drawParams);
        wx.hideLoading();
        if (resp.code == 1) {
            this.setData({
                'redPackageObj.redAmount': resp.data.Amount * 1000 / 100000
            })
        } else {
            this.setData({
                'redPackageObj.isReceiveFail': true
            })
            wx.showModal({
                title: '提示',
                content: resp.msg,
                showCancel: false
            })
        }
    },
    goToBill() {
        vzNavigateTo({
            url: '/pages/bill/bill'
        })
    },
    // 转发
    onShareAppMessage() {
        // 转发把贺卡类型带出去
        var that = this
        var path = addr.getCurrentPageUrlWithArgs();
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        // 贺词判断设置
        return {
            title: this.data.fromNikeName + '祝' + this.data.toNikeName + this.title,
            path: path,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    onReady() {
        // 新年贺卡才执行这段
        if (this.cardid == 1106) {
      
        }

        this.poster = this.selectComponent("#poster");
    },

    onReachBottom() {
        if (this.data.newYearObj.isPrint) return;
        this.setData({
            'newYearObj.isPrint': true
        })
    },

    showRed() {
        this.setData({
            'redPackageObj.isShowRed': true
        })
    },

    closeRed() {
        this.setData({
            'redPackageObj.isShowRed': false
        })
    },

    onPageScroll(e) {
        let scrollTop = e.scrollTop;

        if (scrollTop >= (this.data.familyTop - 100)) {
            if (!this.data.newYearObj.isOpenFaimly) {
                this.setData({
                    'newYearObj.isOpenFaimly': true
                })
            }
        }

        if (scrollTop >= (this.data.oldTop - 100)) {
            if (!this.data.newYearObj.isOpenOld) {
                this.setData({
                    'newYearObj.isOpenOld': true
                })
            }
        }
    },
    toSendCard() {
        this.data.innerAudioContext.destroy();
        this.data.innerAudioContext.stop();

        wx.redirectTo({
            url: '/pages/greetIngCard/greetIngCardSend'
        })
    },

    openAudio() {
        this.setData({
            innerAudioContext: wx.createInnerAudioContext()
        })
        const innerAudioContext = this.data.innerAudioContext;
        innerAudioContext.autoplay = true;
        innerAudioContext.src = this.music;
        innerAudioContext.loop = true;
        innerAudioContext.obeyMuteSwitch = true;
    },
    closeAudio() {
        if (this.data.audioObj.isPlay) {
            this.data.innerAudioContext.play();
            this.setData({
                'audioObj.isPlay': false
            })
            return;
        }
        this.setData({
            'audioObj.isPlay': true
        })
        this.data.innerAudioContext.pause();
    },
    onUnload() {
        this.destroyMusic();
    },
    destroyMusic() {
        this.data.innerAudioContext.destroy();
        this.data.innerAudioContext.stop();
    },
    toMyBless() {
        wx.redirectTo({
            url: '/pages/greetIngCard/greetIngCardList'
        })
    },
    toIndex() {
        app.gotohomepage()
    },
    goToDetail() {
        vzNavigateTo({
            url: "/pages/redPackageRecord/redPackageRecord",
            query: {
                rid: this.data.rid,
                totalCount: this.data.totalCount,
                displayAmount: this.data.displayAmount
            }
        })
    },
    // 海报
    createposter() {
        var that = this
        that.poster.createposter(1)
    },
    // 去活动页
    toActivity() {
        vzNavigateTo({
            url: "/pages/activity/activity",
            query: {
                type: 'coupon'
            }
        })
    },
    showPreview() {
        this.setData({
            isPreview: !this.data.isPreview
        })
        wx.pageScrollTo({
            scrollTop: 10000
        })
    },
    chooseCardTemp(e) {
        let { cardid, idx } = e.currentTarget.dataset;
        this.saveCardid = parseInt(cardid);
        this.setData({
            previewIdx: idx
        })
    },
    confirmCard() {
        wx.redirectTo({
            url: '/pages/greetIngCard/greetIngCard?bid=' + this.bid + '&cardId=' + this.saveCardid
        })
    },
    // 取消预览框
    cancelCard() {
        this.setData({
            isPreview: !this.data.isPreview
        })
    }
})

