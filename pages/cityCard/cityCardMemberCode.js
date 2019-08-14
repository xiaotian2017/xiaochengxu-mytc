const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
var _host = addr.HOST;
const MemberCode = (params) => httpClient({ host: _host, addr: 'IBaseData/MemberCode', data: params, method: 'POST',contentType: 'application/json'});
Page({
    data: {
        memberCode: '',
        content: '',
        memberType:''
    },
    onLoad() {
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId
            this.openid = app.globalData.userInfo.openId
        })
    },
    getMemberCode(e) {
        this.setData({
            memberCode: e.detail.value
        })
    },
    async confirmBtn() {
        if(!this.data.memberCode) {return}
        
        var reurl = '/' + addr.getCurrentPageUrlWithArgs()    
  
        if (!app.checkphonewithurl(reurl)) {         
            return
        }       
        let data = await MemberCode({
            CityInfoId: this.cityid,
            OpenId: this.openid,
            Code: this.data.memberCode
        })
        if (!data.success) {
            this.setData({
                showTips: true,
                content: data.msg
            })
        } else {
            this.setData({
                memberType: data.data.MemberType
            })
        }
    },
    toCardIndex() {
        vzNavigateTo({
            url: '/pages/cityCard/cityCardIndex',         
          })
    }
})


