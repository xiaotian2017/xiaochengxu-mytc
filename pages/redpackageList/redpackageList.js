var addr = require("../../utils/addr.js");
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
const app = getApp();

let getStoreRedListByCity = (params) => httpClient({ addr: addr.Address.GetStoreRedListByCity, data: params });
let paramsObj, tempRedPackageList;

Page({
    data: {
      showpath: false,
        imgUrls: [
            'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        pageindex: 1,
        redpackageList: [],
        isAll: false
    },

    onLoad() {
       var that=this;
        wx.setNavigationBarTitle({
            title: "赏金列表"
        })
        tempRedPackageList = [];
        app.getUserInfo(() => {
            paramsObj = {
                openid: app.globalData.userInfo.openId,
                cityid: app.globalData.cityInfoId
            }
            if (app.globalData.userInfo.iscityowner >0) {
              that.setData({
                showpath: true
              })
            }
            that.getStoreRedListByCity();
        })
    },
    // 获取列表数据
    async getStoreRedListByCity() {
        paramsObj.pageindex = this.data.pageindex++;
        wx.showNavigationBarLoading();
        let resp = await getStoreRedListByCity(paramsObj);
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        tempRedPackageList = [...tempRedPackageList, ...resp.Data.listredbag];
        if (!resp.Data.listredbag.length) {
            this.setData({
                isAll: true
            })
        }
        this.setData({
            redpackageList: tempRedPackageList
        })
    },
    // 下拉刷新
    onPullDownRefresh() {
        tempRedPackageList = [];
        this.setData({
            pageindex: 1,
            redpackageList: [],
            isAll: false
        })
        this.getStoreRedListByCity();
    },
    //返回首页
    backIndex() {
      app.gotohomepage()
    },
    //我的收益
    goToMyEarn(){
        wx.navigateTo({
            url: '/pages/bill/bill'
        })
    },
    // 跳转红包所在页面
    toRedpackagePage(e) {
        let redPackage = this.data.redpackageList[e.currentTarget.dataset.idx]
        if (redPackage.State == 1) {
            vzNavigateTo({
                url: this.data.redpackageList[e.currentTarget.dataset.idx].RedPacketShare.ShareLink
            })
        } else {
            vzNavigateTo({
                url: "/pages/redPackageRecord/redPackageRecord",
                query: {
                    rid: redPackage.Id,
                    totalCount: redPackage.TotalCount,
                    displayAmount: redPackage.DisplayAmount
                }
            })
        }

    },
    // 上拉加载更多
    onReachBottom() {
        if (this.data.isAll) return;
        this.getStoreRedListByCity()
    },
    hiddenTips: function () {
      var path = addr.getCurrentPageUrlWithArgs()
      util.ShowPath(path)
    }
})