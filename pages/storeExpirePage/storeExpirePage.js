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
        app.getUserInfo(() => {
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor:"#ffffff"
              })
        })
    },
    toIndex() {
        app.gotohomepage()
    },
    toPerson() {        
        wx.redirectTo({
            url: '/pages/person_center/person_center',
          })
    }
})