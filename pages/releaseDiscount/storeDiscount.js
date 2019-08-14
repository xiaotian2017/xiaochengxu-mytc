
var addr = require("../../utils/addr.js");
const host = addr.HOST;
const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
var app = getApp();
// 列表数据参数
let pageIndex = 1;
let listData;
let params = {
    pageIndex,
    sid: 0,
    t: 1,
    state: 0,
    openid: ''
}

// 获取列表数据
let getDiscountList = ({
    pageIndex,
    openid,
    sid,
    t,
    state
}) => httpClient({ host, addr: 'IBaseData/GetMyMgrStoreCoupon', data: { pageIndex, sid, t, state, openid } });

// 删除 
let delDiscountItemRequst = (csid) => httpClient({ host, addr: 'IBaseData/DelStoreCoupon', data: { csid: csid, openid: app.globalData.userInfo.openId } });
//提前结束
let stopDiscountItemRequst = (csid) => httpClient({ host, addr: 'IBaseData/StopStoreCoupon', data: { scid: csid, id: app.globalData.areaCode } });
var storeid;
Page({
    data: {
        isAll: true,
        distanceList: '',
        isDone: false,
        storeid:'',
        nowTime: (new Date).getTime(),
        
    },
    onLoad(options) {
        this.setData({
            storeid: options.storeid
        })
        params.pageIndex = 1;
        params.state = 0;
        storeid = this.data.storeid;
        listData = [];
        if (undefined == storeid) {
          app.ShowMsg('参数错误')
          return
        }
        params.sid = storeid;
        app.getUserInfo(() => {
          params.openid = app.globalData.userInfo.openId;
          this.getDiscountList(params);
        });
        this.setData({
          distanceList: []
        })
    },
    // 全部tab
    allHandle() {
        this.setData({
            isAll: true,
            isDone: false
        })
        this.setData({
            distanceList: []
        })
        pageIndex = 1
        listData = [];
        params.pageIndex = 1;
        params.state = 0;
        this.getDiscountList(params);
    },
    // 已删除tab
    delHandle() {
        this.setData({
            isAll: false,
            isDone: false
        })
        this.setData({
            distanceList: []
        })
        listData = [];
        pageIndex = 1;
        params.state = -1;
        params.pageIndex = 1;
        this.getDiscountList(params);
    },
    // 获取列表数据
    async getDiscountList() {
        wx.showNavigationBarLoading(); 
        let resp = await getDiscountList(params);
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading()
        if (!resp.Data.couponlist.length) {
            this.setData({
                isDone: true
            })
            return;
        }

        for (let item of resp.Data.couponlist) {
            listData.push(item);
        }


        this.setData({
            distanceList: listData
        })
    },
    // 编辑按钮转到发布页
    toReleaseDiscount(e) {
        listData = [];
        let { sid, csid } = e.target.dataset;
        vzNavigateTo({
            url: '/pages/releaseDiscount/releaseDiscount',
            query: {
                sid,
                csid,
                isAdd: 1
            }
        })
    },
    // 添加按钮转到发布页
    toReleaseDiscountByAddBtn(e) {
        listData = [];
        vzNavigateTo({
            url: '/pages/releaseDiscount/releaseDiscount',
            query: {
                sid: storeid,
                isAdd: 0
            }
        })
    },
    // 转到购买历史
    toBuyHistory(e) {
        let { scid } = e.target.dataset;
        vzNavigateTo({
            url: '/pages/releaseDiscount/buyHistory',
            query: {
                scid
            }
        })
    },
    // 上拉更多
    onReachBottom() {
        params.pageIndex = ++pageIndex;
        this.getDiscountList();
    },
    stopactivity() {

    },
    // 删除优惠
    delDiscountItem(e) {
        var that = this
        var idx = e.target.dataset.index
        var csid = e.target.dataset.csid
        wx.showModal({
            title: '提示',
            content: '你确定要删除该优惠券吗？删除不可恢复,请谨慎操作！',
            success: function (res) {
                if (res.confirm) {
                    that.delDiscountItemRequst(csid, idx)
                } else if (res.cancel) {

                }
            }
        })
    },
    // 提前结束
    stopDiscountItem(e) {
        var that = this
        var csid = e.target.dataset.csid
        wx.showModal({
            title: '提示',
            content: '你确定要提前结束该优惠活动吗！',
            success: function (res) {
                if (res.confirm) {
                    that.stopDiscountItemRequst(csid)
                } else if (res.cancel) {

                }
            }
        })
    },
    onPullDownRefresh() {
        this.setData({
            isAll: true,
            isDone: false
        })
        this.setData({
            distanceList: []
        })
        pageIndex = 1
        listData = [];
        params.pageIndex = 1;
        params.state = 0;
        this.getDiscountList(params);
      },
    async  delDiscountItemRequst(csid, index) {
        var that = this
        let res = (await delDiscountItemRequst(csid, index));
        if (res.Success) {
            var newcoupon = that.data.distanceList
            newcoupon.splice(index, 1)
            that.setData({ distanceList: newcoupon })
            app.showToast(res.Message);          
        }
        else {
            app.ShowMsg(res.Message);
        }
    },
    async  stopDiscountItemRequst(csid) {
        let res = await stopDiscountItemRequst(csid);
        
        if (res.Success) {
            this.setData({
                isAll: true,
                isDone: false
            })
            pageIndex = 1
            listData = [];
            params.pageIndex = 1;
            params.state = 0;
            this.getDiscountList(params);
            wx.showToast({
                title:res.Message
            });
        }
        else {
            app.ShowMsg(res.Message);
        }
    }
})