const { vzNavigateTo, httpClient } = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let addr = require("../../utils/addr.js");
const app = getApp();
var _host = addr.HOST;

Page({
    data: {
        cityName: ''
    },
    onLoad() {
            setTimeout(()=>{
                this.setData({
                    cityName: app.globalData.cityName
                }) 
            },1000)                       
    },
    toPersonCenter() {
        wx.redirectTo({
            url: '/pages/person_center/person_center',
          })
    },
    refresh() {        
        
        app.getUserInfo(() => {
               
        },1)
    }
})