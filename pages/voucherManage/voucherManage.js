var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime');
let getMgrVoucherList = (p) => util.httpClient({ host, addr: 'IBaseData/getMgrVoucherList', data: p });
let editVoucher = (p) => util.httpClient({ host, addr: 'IBaseData/editVoucher', data: p });

let app = getApp()

Page({
    data: {
        voucherList: [],
        state: 0,
        isShowEdit: false,
        switchState: true,
        editNum: 0,
        vid: ''
    },

    onLoad(options) {
        wx.setNavigationBarTitle({
            title: "代金券"
        })
        this.sid = options.sid
        this.pageIndex = 0
        app.getUserInfo(()=> {            
          this.getMgrVoucherList(0)          
        })
    },

    changeTab(e) {
        this.pageIndex = 0
        let state = e.currentTarget.dataset.state
        this.setData({
            voucherList: [],
            state
        })
        this.getMgrVoucherList()
    },

   async getMgrVoucherList () {      
    let resp = await getMgrVoucherList({
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        storeid: this.sid,
        pageIndex: ++this.pageIndex,
        state:this.data.state  
    })

    this.setData({
        voucherList: [...this.data.voucherList,...resp.Data.VoucherList]
    })
    },

    toStore(e) {
        wx.navigateTo({
            url: '/pages/business_detail/business_detail?storeid=' +e.currentTarget.dataset.id
        })
    },

    onReachBottom() {
        this.getMgrVoucherList()
    },

    toRecord(e) {
        wx.navigateTo({
            url: '/pages/voucherManage/voucherRecord?vid=' +e.currentTarget.dataset.vid
        })
    },

    showEditLayer(e) {
        // 保存代金券id
        this.setData({
            isShowEdit: true,
            editNum:'',
            vid: e.currentTarget.dataset.vid,
            switchState:true
        })
    },

    closeEditLayer() {
        this.setData({
            isShowEdit: false
        })
    },

    getSwitchState(e) {     
        this.setData({
            switchState: e.detail.value
        })
    },
    
    getEditNum(e) {
        this.setData({
            editNum: e.detail.value
        })
    },

   async confirmEdit(){
    let resp = await editVoucher({
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        addnumber: this.data.editNum==''?0:this.data.editNum,
        vid: this.data.vid,
        state: this.data.switchState? 0: -1
    })

    if(resp.code) {
        app.ShowMsg("操作成功！")
        this.setData({
            voucherList: []
        })
        this.pageIndex = 0
        this.getMgrVoucherList()
    } else {
        app.ShowMsg(resp.Message)
    }

    this.setData({
        isShowEdit: false
    })
    }
})