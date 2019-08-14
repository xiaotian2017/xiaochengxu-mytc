const app = getApp();
var addr = require("../../utils/addr.js");
var _host = addr.HOST;
let { vzNavigateTo, httpClient } = require("../../utils/util.js");
let util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let gretj = (typeid, cityid) => httpClient({ host: _host, addr: 'actapi/gretj', data: { typeid, cityid } });

Page({
    data: {
        cate: ''
    },
    onLoad(options) { 
        app.getUserInfo(() => {
            this.cityid = app.globalData.cityInfoId;
            this.typeid = options.typeid         
            this.saletype = options.saletype   
            this.getGretj()
        })
    },
    async getGretj() {
        let resp = await gretj(this.typeid, this.cityid)
        this.setData({
            allData: resp.Data
        })
        if (this.saletype == 7) {
            wx.setNavigationBarTitle({
                title: '求职'
            })
            return
        }
        if (this.saletype == 6) {
            wx.setNavigationBarTitle({
                title: '招聘'
            })
            return
        }
        wx.setNavigationBarTitle({
            title: resp.Data.type.Title
        })
    },
    toPostList(e) {
        if(this.saletype==7) {
            wx.navigateTo({
                url: '/pages/post/postlist?ctypeid=' + e.currentTarget.dataset.id+'&saletype=7&typename='+e.currentTarget.dataset.name+'&typeid='+this.typeid,
            })
            return
        }
        if(this.saletype==6) {
            wx.navigateTo({
                url: '/pages/post/postlist?ctypeid=' + e.currentTarget.dataset.id+'&saletype=6&typename='+e.currentTarget.dataset.name+'&typeid='+this.typeid,
            })
            return
        }
        wx.navigateTo({
            url: '/pages/post/postlist?typeid='+this.typeid+'&ctypeid='+e.currentTarget.dataset.id+'&typename='+e.currentTarget.dataset.name
        })
    },
    bottomnavswitch(e) {
        var path = e.currentTarget.dataset.url
        wx.navigateTo({
            url: path
        })
    }

})