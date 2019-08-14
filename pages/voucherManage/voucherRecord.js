var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
let getUserVoucherList = (p) => util.httpClient({ host, addr: 'IBaseData/GetUserVoucherList', data: p });

let app = getApp()

// public ActionResult GetUserVoucherList(string openid, int cityid, int vid, int pageIndex, int state)

Page({
    data: {     
        voucherRecordList: [],
        state: 0
    },
    onLoad(options) {  
        this.pageIndex = 0
        app.getUserInfo(()=> {
            this.state = 0
            this.vid = options.vid
            this.getUserVoucherList()          
          })
    },
    async getUserVoucherList(state) {
        let resp = await getUserVoucherList({
            cityid: app.globalData.cityInfoId,
            openid: app.globalData.userInfo.openId,
            vid: this.vid,
            pageIndex: ++this.pageIndex,
            state:this.state
        })
        
        for(let item of resp.Data.list) {
             item.isShow = false
        }
        this.setData({
            voucherRecordList: [...this.data.voucherRecordList, ...resp.Data.list] 
        })
    
    },
    changeTab(e) {
        this.pageIndex = 0
        let state = e.currentTarget.dataset.state
        this.setData({
            voucherRecordList: [],
            state         
        }),
        this.state = state==0?0:-1
        this.getUserVoucherList()
    },
    showOrder(e) {
        let _voucherRecordList = this.data.voucherRecordList
        _voucherRecordList[e.currentTarget.dataset.idx].isShow = !(_voucherRecordList[e.currentTarget.dataset.idx].isShow)
        this.setData({
            voucherRecordList: _voucherRecordList
        })
    },
    onReachBottom() {
        this.getUserVoucherList()
    },

})