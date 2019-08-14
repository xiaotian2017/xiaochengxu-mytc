var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp();
var cell;
var c_enum;
var areacode;
Page({
  data: {
    ShowAllEntrance:true,
    currenttab: 0,//推荐店铺与分类信息两个tab
    buyversion: 1,
    showpath: false,
    showtypelist: true,
    typeitems: [],//类目
    items: {},
    zhaopingitem: [{ Title: "招聘", PId: 295254, Id: 1 },{ Title: "求职", PId: 295254, Id: 7 }],
    pincheitem: [{ Title: "车找人", PId: 304069, Id: 3 }, { Title: "人找车", PId: 304069, Id: 4 }, { Title: "车找货", PId: 304069, Id: 5 }, { Title: "货找车", PId: 304069, Id: 6 }],
    chuzuitem: [{ Title: "出租", PId: 295252, Id: 4,stype:7 }, { Title: "求租", PId: 295252, Id: 5 }, { Title: "出售", PId: 295252, Id: 1,stype:7 }, { Title: "求购", PId: 295252, Id: 2 }],
 
    tongcheng_new_02: "",
    tongcheng_01: "",
    rowcount: 4,
  },
  onShareAppMessage: function (res) {
    let that = this;
    var path = addr.getCurrentPageUrlWithArgs()
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    return {
      title:'发布入驻',
      path: path,
      success: function (res) {
      
      }
    }
  },

  GetHomeInfoData: function (areacode) {
    console.log(areacode)
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.GetHomeInfoData,
      data: {
        areacode: areacode,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        if (res.data.isok == 1) {
          that.setData({
            typeitems: res.data.recommentinfo,
            rowcount: res.data.rowcount,
          });
        
        }
      },
      fail: function (e) {
      
      },
      complete: function () {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  getposttypeconfig: function (areacode, pId = 295257) {
    var that = this;
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.getposttypeconfig,
      data: {
        areaId: areacode,
        pId: pId,
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        if (res.data.isok == 1) {
          if (res.data.data.length==0)
          {
            var reurl = '/' + addr.getCurrentPageUrlWithArgs()
            if (app.checkphonewithurl(reurl)) {         
              var url = "../publishNote/commonPublish?typeid=" + pId + "&ctypeid=" +pId
              app.goNewPage(url)
            }
          }
          else
          {
            that.setData({
              items: res.data.data,
              showtypelist: false,
            });

          }         
        }
      },
      fail: function (e) {
      
      },
      complete: function () {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  onLoad: function (options) {
    var that=this
    wx.setNavigationBarTitle({
      title: "发布入驻"
    })
    var showpath=false
    app.getUserInfo(function () {
      if (app.globalData.userInfo.iscityowner>0) {
        showpath=true
      }
      that.setData({
        showpath: showpath,
        ShowAllEntrance: app.globalData.ShowAllEntrance
      })
      that.inite()
    })
 
  },
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url
    wx.reLaunch({
      url: path,
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },

  //初始化
  inite: function () {
    c_enum = app.C_Enum
    // 页面显示
    var that = this
    that.setData({
      showtypelist: true,
      typeitems: [],//类目
      item: {},
      buyversion: app.globalData.buyVersion
    })
    var names = app.globalData.content;
    if (app.globalData.userInfo.openId == undefined || app.globalData.userInfo.openId == '') {
      //获取用户信息
      app.getUserInfo(function () {
        //首页
        that.GetHomeInfoData(app.globalData.areaCode)
      })
    }
    else {
      that.GetHomeInfoData(app.globalData.areaCode)
    }
   
  },
  //板块跳转
  showtypelistclick: function (e) {
    var typename = e.currentTarget.dataset.typename
    var typeid = e.currentTarget.dataset.typeid
    //招聘求职
    if (typeid == c_enum.Recruit) {
      this.setData({
        items: this.data.zhaopingitem,
        showtypelist: false,
      })
    }
    //拼车
    else if (typeid == c_enum.Carpooling) {
      this.setData({
        items: this.data.pincheitem,
        showtypelist: false,
      })
    }
    //租房
    else if (typeid == c_enum.Tenement) {
      this.setData({
        items: this.data.chuzuitem,
        showtypelist: false,
      })
    }
    else {
      var items = wx.getStorageSync("typelist" + typeid)
      if (items != undefined && items.length > 0) {
        this.setData(
          {
            items: items,
            showtypelist: false
          })
      }
      else {
        this.getposttypeconfig(app.globalData.areaCode, typeid)
      }
    }
  },
  itemclick: function (e) {
    //app.globalData.userInfo.IsValidTelePhone=0
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      var typeid = e.currentTarget.dataset.typeid
      var cid = e.currentTarget.dataset.cid
      var stype = e.currentTarget.dataset.stype
      //取消
      if (typeid == 0 && cid == 0) {
        this.setData({
          showtypelist: true,
        })
      }
      else {
        var url = "../publishNote/commonPublish?typeid=" + typeid + "&ctypeid=" + cid+ "&stype=" + stype
       //求职招聘
        if (typeid == c_enum.Recruit && cid == 1 || typeid == 295255 ) {
          // 295255 兼职招聘
          url = "../publishmix/p_recuit?typeid=" + typeid+"&classifyid=" + cid
        }
        //拼车
        else if (typeid == c_enum.Carpooling ) {       
         url = "../publishmix/p_carpooling?typeid=" + typeid + "&classifyid=" + cid
        } 
        // else if(typeid == c_enum.Recruit && cid == 7) {
        //   // 发布求职
        //   var url = "../fabu_biaodan/fabu_biaodan?typeid=" + typeid + "&ctypeid=" + cid         
        // }
        wx.navigateTo({
          url: url,
        })
      }
    }
  },
  gotoaddshop:function() {
    var reurl = '/' + addr.getCurrentPageUrlWithArgs()
    if (app.checkphonewithurl(reurl)) {
      wx.navigateTo({
        url: '../business_ruzhu/business_ruzhu'
      })
    }
   
  },
  cancelModel: function () {
    this.setData({
      showtypelist: true,
    })
  },
})