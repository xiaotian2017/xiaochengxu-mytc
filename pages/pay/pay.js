var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");

var app = getApp();
var c_enum = app.C_Enum;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    post: {},
    chargeTypeInfoList: [{
      PriceDispaly: 0
    }],
    chargeTypeInfoTopList: [],
    total: 0,
    toptotal: 0,
    allprice: 0,
    dayprice: 0,
    extype: 0,
    istop: "true",
    toptime: '请选择置顶类型',
    startime: '',
    extime: 0,
    array: ['出租', '全租', '售卖', ],
    zhiding: ['置顶信息优先展示', '置顶一天收费￥10', '置顶一周收费￥70', '置顶一月收费￥300', ],
    issumit: 0,
    pickIndex: 0 //2019/7/1
  },
  /**
   * 监听普通picker选择器
   */
  listenerPickerSelected: function (e) {
    //改变index值，通过setData()方法重绘界面
    this.setData({
      index: e.detail.value
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var post = JSON.parse(options.post)
    this.data.post = post
    this.inite()
  },
  inite: function () {

    var time = new Date()
    var starttime = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate()
    var post = this.data.post
    this.setData({
      startime: starttime,
      post: this.data.post
    })
    this.getchargetypeinfolistpaytype(post)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var url = 'pages/mypublish/mypublish'
    app.reloadpagebyurl('', url)
  },
  getchargetypeinfolistpaytype: function (post) {
    var that = this

    wx.request({
      url: addr.Address.getchargetypeinfolistpaytype,
      data: {
        areacode: post.CityCode,
        baiduarea_id: post.AreaId,
        streetid: post.StreetId,
        paytype: post.TypeId,
        stype: post.SaleType,
        citycode: app.globalData.areaCode,
        typeversion: '0702' //后台用于区分版本做数据兼容   2019/07/2
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        if (1 == res.data.isok) {
          var chargeTypeInfoList = [{
            PriceDispaly: 0
          }]
          if (res.data.returnObj.length > 0) {
            chargeTypeInfoList = res.data.returnObj
          }
          var toplist = []
          if (res.data.returnTopObj != null && res.data.returnTopObj.length > 0) {
            for (var i in res.data.returnTopObj) {
              var temptop = res.data.returnTopObj[i]
              toplist.push("置顶一" + temptop.ShowNote + "收费￥" + (temptop.Price * 10000 / 1000000))
            }
          }
          //长途拼车价格
          if (that.data.post.TypeId == c_enum.Carpooling && that.data.post.PositionType == 4 && res.data.returnObj != null && res.data.returnObj.length > 0) {
            var day = 0
            if (that.data.post.ExpectJob != '' && that.data.post.Experience != '') {
              // var now = new Date()
              var start = new Date(that.data.post.ExpectJob)
              // > now ? start : now
              var startd = start
              var endd = new Date(that.data.post.Experience)
              var d = util.timeDiff(endd, startd)
              if (d.length > 0) {
                day = d
              }
            }
            res.data.returnObj[0].PriceDispaly = (day * res.data.returnObj[0].PriceDispaly).toFixed(2)
          } else
          if (that.data.post.TypeId == c_enum.Recruit && that.data.post.SaleType == 7) {
            that.data.extype = 2
          }

          //设置默认置顶类型
          if (toplist != null && toplist.length > 0) {
            that.data.toptime = toplist[0]
            that.data.allprice = parseFloat(res.data.returnTopObj[0].Price * 10000 / 1000000)
            that.data.extype = res.data.returnTopObj[0].ExtendType
            that.data.dayprice = res.data.returnTopObj[0].Price * 10000 / 1000000
          }
          that.data.chargeTypeInfoList = chargeTypeInfoList
          that.data.chargeTypeInfoTopList = res.data.returnTopObj
          that.data.toplist = toplist
          that.data.total = res.data.total
          that.data.toptotal = res.data.toptotal
          that.data.allprice = parseFloat(that.data.allprice) + parseFloat(res.data.returnObj != null && res.data.returnObj.length > 0 && that.data.post.istop == 0 ? res.data.returnObj[0].PriceDispaly : 0)
          that.data.allprice = that.data.allprice.toFixed(2)
          that.setData(that.data)
        } else {
          app.ShowMsg(res.data.msg)
        }
      }
    })
  },

  ListenerPickerSelected: function (e) {
    var index = e.detail.value
    var toptime = this.data.toplist[index]
    var topprice = this.data.chargeTypeInfoTopList[index]
    this.data.extype = topprice.ExtendType
    this.data.dayprice = topprice.Price * 10000 / 1000000
    this.data.allprice = parseFloat(this.data.post.State == -3 && this.data.chargeTypeInfoList != null && this.data.chargeTypeInfoList.length > 0 ? this.data.chargeTypeInfoList[0].PriceDispaly : 0) + this.data.dayprice
    this.setData({
      pickIndex: index, //2019/7/1
      allprice: this.data.allprice.toFixed(2),
      toptime: toptime,
    })
  },
  //确认支付
  payclick: function (post) {
    if (this.data.issumit == 1) {
      return
    }
    var extype = this.data.extype
    var extime = 1
    var paytype = 200
    //判断是否是发帖并置顶
    if (this.data.istop) {
      paytype = 210
      if (extype <= 0) {
        app.ShowMsg("请选择置顶类型")
        return
      }
    } else {
      extype = 1
    }
    if (this.data.post.TypeId == c_enum.Recruit && this.data.post.SaleType == 7 && paytype != 210) {
      extype = 2
    }
    //判断是否只置顶
    if (this.data.post.istop == 1) {
      paytype = 201
    }
    var param = {
      itemid: this.data.post.Id,
      paytype: paytype,
      extype: extype,
      chargeId: this.data.chargeTypeInfoList.length > 0 ? this.data.chargeTypeInfoTopList[this.data.pickIndex].Id : this.data.chargeTypeInfoList[0].Id, //2019/7/1此前没有提交这个id
      extime: extime,
      openId: app.globalData.userInfo.openId,
      quantity: 0,
      areacode: app.globalData.areaCode,
    }
    this.data.issumit = 1
    util.AddOrder(param, this.refun)
  },
  switch1Change: function (e) {
    this.data.istop = e.detail.value
    var allprice = parseFloat(this.data.chargeTypeInfoList != null && this.data.chargeTypeInfoList.length > 0 ? this.data.chargeTypeInfoList[0].PriceDispaly : 0) + (this.data.istop ? this.data.dayprice : 0)
    this.setData({
      istop: this.data.istop,
      allprice: allprice.toFixed(2),
    })
  },
  //付款成功后回调
  refun: function (param, state) {
    this.data.issumit = 0
    if (state == 0) {
      var msg = '您已取消付款'
      app.ShowMsgAndUrl(msg, '', 1)
    } else {
      app.goBackPage(1)
    }
  },
  //免费发帖
  passpost: function () {
    var that = this
    if (that.data.issumit == 1) {
      return
    }
    var openId = app.globalData.userInfo.openId
    that.data.issumit = 1
    wx.request({
      url: addr.Address.passpost,
      data: {
        postid: that.data.post.Id,
        openId: openId,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.data.issumit = 0
        if (res.data.isok) {
          app.goBackPage(1)
        } else {
          app.ShowMsg(res.data.msg)
        }
      }
    })
  },
})