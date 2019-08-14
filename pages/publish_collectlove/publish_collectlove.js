var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
const host = addr.HOST;
var uploadimg = require("../../utils/uploadImgenew.js");
var app = getApp();
const regeneratorRuntime = require('../../utils/runtime.js');
let addVoucher = (p) => util.httpClient({ host, addr: 'IBaseData/AddVoucher', data: p });

Page({
  data: {
    likeconfig: [{ NeedNum: "", BuyPrice: "", Stock: "", Memo: "",OriginalPrice:'' }, { NeedNum: "", BuyPrice: "", Stock: "", Memo: "",OriginalPrice:'' }, { NeedNum: "", BuyPrice: "", Stock: "", Memo: "",OriginalPrice:'' }],
    repotab: 0,//库存模式
    //buytab:0,//购买模式
    loveId: 0,
    locationGet: false,
    XcxGetEndDate: "",
    XcxGetEndTime: "",
    XcxGetStartDate: "",
    XcxGetStartTime: "",
    XcxEndDate: "",
    XcxEndTime: "",
    XcxStartDate: "",
    XcxStartTime: "",
    storeId: 0,
    love: {
      Id: 0,
      Title: "", //商铺名
      ImgUrl: "", //banner
      Remarks: "",
      OriginalPrice: "", //原价
      SetMaxCount: 0, //每次最多帮点人数,
      StartDate: "",//开始时间
      EndDate: "", //结束时间
      CreateNum: "", //商品份数
      Description: "", //描述
      StoreId: 0,//商铺Id
      ValidStartDate: "", //领取开始
      ValidEndDate: "",  //领取结束
      ValidAddress: "", //位置详情
      ValidPhone: "", //验证手机号码
    
      DescImgList: [],  //详情图修改用
      re: 0,
      StockMode: 0,
      Mode: 0
    },
    uploadimgobjects: {
      "activeCover": {// 活动封面
        config: {
          maxImageCount: 1,
          images_full: false,
          imageUpdateList: [], //编辑时新增的
          imageList: [],
          imageIdList: [] //用来删除图片
        }
      },
      //商品描述
      "goodsDecri": {
        config: {
          maxImageCount: 9,
          images_full: false,
          imageUpdateList: [], //编辑时新增的
          imageList: [],
          imageIdList: [] //用来删除图片
        }
      }
    },
    isVoucher: false,
    voucherPrice: '',
    voucherNum: '',
    voucherScopeIdx: 1,
    fullSubtraction: '',
    voucherBeginDate: '不填视为立即可用',
    voucherBeginTime: '',
    voucherEndDate: '不填视为长期可用',
    voucherEndTime: '',
    voucherValidDay: '',
    distribution: '',
    isShowDistribution: false
  },
  onLoad: function (options) {
    var that = this
    var storeId = options.storeid
  
    var loveId = options.loveid
    if (undefined == storeId && null == storeId) {
      app.ShowMsg("参数错误!")
    }
    that.setData({ storeId: storeId })
    if (undefined != loveId && null != loveId) {
      that.setData({ loveId: loveId })
    }
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function () {
      that.init();
    })
    wx.setNavigationBarTitle({
      title: '发布爱心价'
    })
  },
  init: function () {
    var that = this;
    that.loadlove();
  },
  loadlove: function () {
    var that = this


    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetAddOrEditLove,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        appid: app.globalData.appid,
        storeid: that.data.storeId,
        lid: that.data.loveId
      },
      success: function (res) {
        if (res.data.Success) {
          var returnlove = res.data.Data.mainmodel
          if (returnlove.IsFx != 0) {
            that.setData({
              isShowDistribution: true,
              distribution: returnlove.FxRate
            })
          }
          returnlove.OriginalPrice = returnlove.OriginalPrice * 1000 / 100000
          var formaterDate = "yyyy-MM-dd";
          var formaterTime = "hh:mm";
          that.setData({
            XcxGetStartDate: util.dateFormat(formaterDate, new Date(util.GetDateTime(returnlove.ValidStartDate))),
            XcxGetEndDate: util.dateFormat(formaterDate, new Date(util.GetDateTime(returnlove.ValidEndDate))), XcxStartDate: util.dateFormat(formaterDate, new Date(util.GetDateTime(returnlove.StartDate))), XcxEndDate: util.dateFormat(formaterDate, new Date(util.GetDateTime(returnlove.EndDate))), XcxGetStartTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnlove.ValidStartDate))), XcxGetEndTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnlove.ValidEndDate))), XcxGetEndTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnlove.ValidEndDate))), XcxStartTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnlove.StartDate))), XcxEndTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnlove.EndDate))), love: returnlove, repotab: returnlove.StockMode
          })
          if (0 != res.data.Data.likeconfigs) {
            res.data.Data.likeconfigs.forEach(function (v, idx) {
              v.BuyPrice = v.BuyPrice * 1000 / 100000           
            })
            that.setData({ likeconfig: res.data.Data.likeconfigs })
          }
          //图片
          if (returnlove.Id > 0) {
            if (returnlove.ImgUrl != '') {
              that.setData({
                'uploadimgobjects.activeCover.config.imageList': [returnlove.ImgUrl]
              })
            }
            if (returnlove.DescImgList.length > 0) {
              var convertList = []
              var imgids = []
              returnlove.DescImgList.forEach(function (v) {
                convertList.push(v.filepath)
                imgids.push(v.id)
              })
              that.setData({
                'uploadimgobjects.goodsDecri.config.imageList': convertList,
                'uploadimgobjects.goodsDecri.config.imageIdList': imgids
              })
            }
            that.setData({
              'uploadimgobjects.activeCover.config.imageList': [returnlove.ImgUrl],
            })
          }
          that.setData({
            'love.Description':returnlove.Description && returnlove.Description.replace(/<[^>]+>|&nbsp;*/g, "")
          })
        }
        else {
          app.ShowMsg()
        }
        wx.hideLoading(res.data.Message)
      }
    })
  },
  //上传图片
  uploadLogoImg: function (e) {
    var itemid = e.currentTarget.dataset.itemid//砍价用

    wx.showLoading({
      title: '开始上传'
    })
    uploadimg.shopChooseImage(e, this);
  },
  //清除图片
  clearImage: function (e) {
    var that = this;
    //轮播图清除
    if (e.currentTarget.dataset.which == 'goodsDecri') {
      uploadimg.shopclearImage(e, this);
    }
    else {
      var configs = that.data.uploadimgobjects
      var index = e.currentTarget.dataset.which
      var currentItem = configs[index]
      currentItem.config.imageList.splice(index, 1);
      currentItem.config.images_full = false;
      that.setData({
        "uploadimgobjects": configs
      })
    }
  },
  //获取地理位置
  getLocation() {
    var that = this;
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          'love.ValidAddress': res.address,
          locationGet: true
        })
      },
      fail: function (e) {

      }
    })
  },

  //获取活动名称
  getActivityName(e) {
    var val = e.detail.value;
    this.setData({
      'love.Title': val
    })
  },

  //获取商品份数
  getGoodsTotal(e) {
    var val = e.detail.value
    this.setData({
      'love.CreateNum': val
    })
  },
  //获取原价
  getOriginPrice(e) {
    var val = e.detail.value
    val = this.filterNum(val)
    if (val === '') {
      return false
    } else {
      this.setData({
        'love.OriginalPrice': val
      })
    }
  },
  //需要爱心数
  getNeedNum(e) {
    var val = e.detail.value
    var idx = e.currentTarget.dataset.index
    val = this.filterOnlyNum(val)
    if (val === '') {
      return false
    } else {
      this.data.likeconfig[idx].NeedNum = val
    }

  },//礼物
  getMemo(e) {
    var val = e.detail.value
    var idx = e.currentTarget.dataset.index
    this.data.likeconfig[idx].Memo = val
  },
  //价格
  getBuyPrice(e) {
    var val = e.detail.value
    var idx = e.currentTarget.dataset.index
    val = this.filterNum(val)
    if (val === '') {
      return false
    } else {
      this.data.likeconfig[idx].BuyPrice = val
    }
  },//库存
  getStock(e) {
    var val = e.detail.value
    var idx = e.currentTarget.dataset.index
    val = this.filterOnlyNum(val)
    if (val === '') {
      return false
    } else {
      this.data.likeconfig[idx].Stock = val
    }
  },

  // 获取帮点人数
  getMaxCount(e) {
    var val = e.detail.value
    this.setData({
      'love.SetMaxCount': val
    })
  },
  //获取描述
  getDescription(e) {
    var val = e.detail.value
    this.setData({
      'love.Description': val
    })
  },
  //活动开始时间
  getStartTime(e) {
    var timeStamp, val, chooseTime;
    timeStamp = this.data.timeStamp;
    val = e.detail.value;
    chooseTime = new Date(val.replace(/-/g, "/")).getTime();
    if (timeStamp > chooseTime) {
      app.ShowMsg('活动开始的时间不能小于当前时间')
      return
    } else {
      this.setData({
        XcxStartDate: val
      })
    }
  },
  //活动开始具体时间
  getStartDtlTime(e) {
    var val, date, startTime;
    val = e.detail.value;
    date = new Date().getTime();
    startTime = this.data.startTime;
    if (startTime) {
      startTime = new Date(startTime + ' ' + val).getTime();
      if (startTime < date) {
        app.ShowMsg('领取时间不能小于当前时间')
        return
      }
    }
    this.setData({
      XcxStartTime: val
    })
  },
  //活动结束时间
  getEndTime(e) {
    var timeStamp, val, chooseTime, startTime;
    timeStamp = this.data.timeStamp;
    val = e.detail.value;
    chooseTime = new Date(val.replace(/-/g, "/")).getTime();
    startTime = parseInt(this.data.startTime);
    if (startTime) {
      startTime = new Date(startTime).getTime();
    }
    if (chooseTime < timeStamp) {
      app.ShowMsg('活动结束时间不能小于当前时间');
      return
    } else if (chooseTime < startTime) {
      app.ShowMsg('活动结束时间不能小于开始时间')
      return
    } else {
      this.setData({
        XcxEndDate: val
      })
    }
  },
  //活动结束具体时间
  getEndDtlTime(e) {
    var date, val, startTime, endTime;
    val = e.detail.value;
    date = new Date().getTime();
    endTime = this.data.endTime;
    if (endTime) {
      endTime = new Date(endTime + ' ' + val).getTime();
      if (endTime < date) {
        app.ShowMsg('活动结束时间不能小于当前时间')
        return
      }
    }
    startTime = this.data.startTime + ' ' + this.data.startDtlTime;
    if (startTime) {
      startTime = new Date(startTime).getTime();
      if (endTime < startTime) {
        app.ShowMsg('活动结束时间不能小于活动开始时间')
        return
      }
    }
    this.setData({
      XcxEndTime: val
    })
  },
  //获取领取的时间
  getExStartTime(e) {
    var timeStamp, val, chooseTime;
    timeStamp = this.data.timeStamp;
    val = e.detail.value;
    chooseTime = new Date(val.replace(/-/g, "/")).getTime();
    if (timeStamp < timeStamp) {
      app.ShowMsg('活动开始的时间不能小于当前时间')
      return
    } else {
      this.setData({
        XcxGetStartDate: val
      })
    }
  },
  //获取领取的详细的时间
  getExStartDtlTime(e) {
    var date, val, exStartTime, chooseTime;
    date = new Date();
    val = e.detail.value;
    exStartTime = this.data.exStartTime;
    if (exStartTime) {
      chooseTime = new Date(exStartTime + ' ' + val).getTime();
      if (chooseTime < date.getTime()) {
        app.ShowMsg('领取时间不能小于当前时间')
        return
      }
    }
    this.setData({
      XcxGetStartTime: val
    })
  },
  //获取领取的结束时间
  getExEndTime(e) {
    var timeStamp, val, chooseTime;
    timeStamp = this.data.timeStamp;
    val = e.detail.value;
    chooseTime = new Date(val.replace(/-/g, "/")).getTime();
    if (timeStamp < timeStamp) {
      app.ShowMsg('领取的时间不能小于当前时间')
      return
    } else {
      this.setData({
        XcxGetEndDate: val
      })
    }
  },
  //获取领取的详细结束时间
  getExEndDtlTime(e) {
    var date, val, exStartTime, exEndTime, chooseTime;
    date = new Date();
    val = e.detail.value;
    exStartTime = this.data.exStartTime + this.data.exStartDtlTime;
    exEndTime = this.data.exEndTime;
    if (exEndTime) {
      exEndTime = new Date(exEndTime + ' ' + val).getTime();
      if (exEndTime < date.getTime()) {
        app.ShowMsg('领取时间不能小于当前时间')
        return
      }
    }
    if (exStartTime && exEndTime) {
      exStartTime = new Date(exStartTime).getTime();
      if (chooseTime < date.getTime()) {
        app.ShowMsg('领取结束时间不能小于领取开始时间')
        return
      }
    }
    this.setData({
      XcxGetEndTime: val
    })
  },
  //获取电话号码
  getPhone(e) {
    var val = e.detail.value
    this.setData({
      'love.ValidPhone': val
    })
  },
  //正则过滤
  filterNum(obj) {
    obj = obj.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    obj = obj.replace(/^\./g, ""); //验证第一个字符是数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个, 清除多余的
    obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //
    return obj
  },
  filterOnlyNum(obj) {
    obj = obj.replace(/[^\d]/g, ""); //清除"数字"和"."以外的字符
    return obj;
  },

  submit() {
    var that = this
  


    // 检测图片上传
    if (that.data.uploadimgobjects.activeCover.config.imageList.length === 0) {
      app.ShowMsg('请上传活动主图')
      return
    }
    if (that.data.love.Title == '') {
      app.ShowMsg('请填写活动名称')
      return
    }
    if (that.data.love.CreateNum == 0 && that.data.love.StockMode === 0) {
      app.ShowMsg('请输入本期商品数量');
      return;
    }
    if (that.data.love.CreateNum < 0 && that.data.love.StockMode === 0) {
      app.ShowMsg('商品数量必须大于0');
      return;
    }
    if (that.data.love.Mode == 0) {
      var cmoney = that.data.love.OriginalPrice
      if (cmoney == "") {
        app.ShowMsg('请填写原价')
        return
      }
      if (!/^[0-9]{1,6}(\.\d{0,2})?$/.test(cmoney)) {
        app.ShowMsg('原价必须为数字，且最多为2位小数,最大为6位整数！')
        return false;
      } else {
        var price_save = cmoney * 1000000 / 10000;
        if (parseInt(price_save) < 1) {
          app.ShowMsg('原价不能低于1分钱！！')
          return
        }
      }
    }
    var likeconfig = that.data.likeconfig
    if (that.data.love.Mode == 0)//购买模式
    {
      for (var i = 0; i < likeconfig.length; i++) {
        if (that.data.love.StockMode == 0) {
          if (i == 0) {
            if (likeconfig[i].NeedNum === "" || likeconfig[i].BuyPrice === "") {
              app.ShowMsg('请从上往下依次填写并最少填写一行爱心价规格！')
              return
            }
          }
        }
        else {
          if (i == 0) {
            if (likeconfig[i].NeedNum === "" || likeconfig[i].BuyPrice === "" || likeconfig[i].Stock === "") {
              app.ShowMsg('请从上往下依次填写请从上往下依次填写并最少填写一行爱心价规格！并最少填写一行爱心价规格！')
              return
            }
          }
        } 
     
        var likenum = parseInt(likeconfig[i].NeedNum);
        var likemoney = parseInt(likeconfig[i].BuyPrice );
        var currentmoney = parseInt(that.data.love.OriginalPrice * 1000000 / 10000);
        if (likemoney > currentmoney)
        {

          app.ShowMsg('爱心价规格里有价格大于原价，请重新填写！')
          return
        }

        if (likenum > 0 || likemoney > 0) {
          if (that.data.love.StockMode == 0) {
            if (likeconfig[i].NeedNum === "" || likeconfig[i].BuyPrice === "") {
              app.ShowMsg('爱心价规格请填写完整！')
              return
            }
          }
          else {
            if (likeconfig[i].NeedNum === "" || likeconfig[i].BuyPrice === "" || likeconfig[i].Stock === "") {
              app.ShowMsg('爱心价规格请填写完整！')
              return
            }
          }
        }
      }

    }//免费领取模式
    else {
      for (var i = 0; i < likeconfig.length; i++) {
        if (that.data.love.StockMode == 0) {
          if (i == 0) {
            if (likeconfig[i].NeedNum === "" || likeconfig[i].Memo === "") {
              app.ShowMsg('请从上往下依次填写并最少填写一行爱心价规格！')
              return
            }
          }
        }
        else {
          if (i == 0) {
            if (likeconfig[i].NeedNum === "" || likeconfig[i].Stock === "" || likeconfig[i].Memo === "") {
              app.ShowMsg('请从上往下依次填写请从上往下依次填写并最少填写一行爱心价规格！并最少填写一行爱心价规格！')
              return
            }
          }
        }
        var likenum = parseInt(likeconfig[i].NeedNum);
        if (likenum > 0) {
          if (that.data.love.StockMode == 0) {
            if (likeconfig[i].NeedNum === "" || likeconfig[i].Memo === "") {
              app.ShowMsg('爱心价规格请填写完整！')
              return
            }
          }
          else {
            if (likeconfig[i].NeedNum === "" || likeconfig[i].Memo === "" || likeconfig[i].Stock === "") {
              app.ShowMsg('爱心价规格请填写完整！')
              return
            }
          }
        }
      }
    }

    // 验证代金券  
    if (this.data.isVoucher) {
      if (!this.data.voucherPrice) {
        app.ShowMsg('发放代金券的金额不能为0！');
        return;
      }

      if (!this.data.voucherNum) {
        app.ShowMsg('发放代金券的数量不能为0！');
        return
      }

      if (this.data.voucherScopeIdx == 2 && !this.data.fullSubtraction) {
        app.ShowMsg('发放代金券满减金额不能为0！');
        return
      }

      // if (!this.data.voucherValidDay) {
      //   app.ShowMsg('有效天数不能为0！');
      //   return
      // }

      if (this.data.voucherBeginDate != '不填视为立即可用') {
        if (this.data.voucherEndDate == '不填视为长期可用') {
          app.ShowMsg('请填写代金券结束时间！');
          return
        }
      }

      if (this.data.voucherEndDate != '不填视为长期可用') {
        if (this.data.voucherBeginDate == '不填视为立即可用') {
          app.ShowMsg('请填写代金券开始时间！');
          return
        }
      }

      if (new Date(this.data.voucherBeginDate + ' ' + this.data.voucherBeginTime).getTime() > new Date(this.data.voucherEndDate + ' ' + this.data.voucherEndTime).getTime()) {
        app.ShowMsg('代金券结束时间必须大于开始时间！')
        return
      }

      if ((new Date(this.data.voucherEndDate + ' ' + this.data.voucherEndTime).getTime() - new Date(this.data.voucherBeginDate + ' ' + this.data.voucherBeginTime).getTime()) / (24 * 60 * 60 * 1000) < this.data.voucherValidDay) {
        app.ShowMsg('代金券有效天数不能大于代金券使用周期');
        return
      }
    }

    //检测时间 
    var currentStamp;
    currentStamp = new Date().getTime();
    var startTime = that.data.XcxStartDate + ' ' + that.data.XcxStartTime; //开始的时间
    that.data.love.StartDate = startTime
    var endTime = that.data.XcxEndDate + ' ' + that.data.XcxEndTime; //结束的时间
    that.data.love.EndDate = endTime
    var exStartTime = that.data.XcxGetStartDate + ' ' + that.data.XcxGetStartTime; //领取开始的时间
    that.data.love.ValidStartDate = exStartTime
    var exEndTime = that.data.XcxGetEndDate + ' ' + that.data.XcxGetEndTime; // 领取结束的时间
    that.data.love.ValidEndDate = exEndTime

    // if (new Date(startTime).getTime() < currentStamp && that.data.love.Id == 0) {
    //   app.ShowMsg('活动开始的时间不能小于当前的时间')
    //   return
    // }
    // if (new Date(exStartTime).getTime() < currentStamp && that.data.love.Id == 0) {
    //   app.ShowMsg('活动领取开始的时间不能小于当前的时间')
    //   return
    // }
    if (new Date(startTime).getTime() > new Date(endTime).getTime() && that.data.love.Id == 0) {
      app.ShowMsg('活动开始的时间不能活动大于结束的时间')
      return
    }
    if (new Date(exStartTime).getTime() > new Date(exEndTime).getTime() && that.data.love.Id == 0) {
      app.ShowMsg('领取开始的时间不能大于领取结束的时间')
      return
    }
    // if (that.data.uploadimgobjects.goodsDecri.config.imageList.length === 0) {
    //   app.ShowMsg('请上传商品描述图片')
    //   return
    // }
    //检测电话号码
    if (!/^1[3|4|5|7|8][0-9]{9}$/.test(that.data.love.ValidPhone)) {
      app.ShowMsg('请填写正确的领取电话')
      return
    }
    if (that.data.love.ValidAddress == '') {
      app.ShowMsg('请填写领取地址')
      return
    }     // 验证人人分销
    if (that.data.isShowDistribution) {

      if (!that.data.distribution || that.data.distribution == 0) {
        app.ShowMsg('分销比例不能为空且不能为0');
        return
      }
    }
    var bannerList = that.data.uploadimgobjects.activeCover.config.imageList;
    var goodsDecri = that.data.uploadimgobjects.goodsDecri.config;
    that.data.love.ImgUrl = bannerList[bannerList.length - 1];
    that.data.love.DescImgList = that.data.love.Id == 0 ? goodsDecri.imageList : goodsDecri.imageUpdateList //详情图修改用
  
    that.data.love.openid = app.globalData.userInfo.openId
    var configs = []
    for (var i = 0; i < 3; i++) {
      var v = that.data.likeconfig[i]
      v.OriginalPrice = that.data.love.OriginalPrice * 100
      if (v.NeedNum != '') {
        v.BuyPrice = v.BuyPrice * 1000/10
        configs.push(v)
      }
    }
    configs.forEach(function (v, idx) {
      if (v.BuyPrice == '') {
        delete v.name;
      }
      if (v.Stock == '') {
        delete v.Stock;
      }
      if (v.Memo == '') {
        delete v.Memo;
      }
    })
  
    var param = {
      openid: app.globalData.userInfo.openId,
      Id: that.data.love.Id,
      StoreId: that.data.storeId,
      Title: that.data.love.Title, //商铺名
      ImgUrl: bannerList[bannerList.length - 1], //banner
      SetMaxCount: that.data.love.SetMaxCount, //每次最多帮点人数,
      OriginalPrice: that.data.love.OriginalPrice * 100, //原价
      StartDate: that.data.love.StartDate,//开始时间
      EndDate: that.data.love.EndDate, //结束时间
      CreateNum: that.data.love.CreateNum, //商品份数
      Description: that.data.love.Description, //描述
      ValidStartDate: that.data.love.ValidStartDate, //领取开始
      ValidEndDate: that.data.love.ValidEndDate, //领取结束
      ValidAddress: that.data.love.ValidAddress, //位置详情
      ValidPhone: that.data.love.ValidPhone, //验证手机号码
      ImgList: bannerList.join('|'), 
      DescImgList: that.data.love.DescImgList.join('|'), //图片列表页
      re: '',
      StockMode: that.data.love.StockMode,
      Mode: that.data.love.Mode,
      attrjson: configs
    }
    param.IsFx = that.data.isShowDistribution ? 1 : 0
    param.FxRate = that.data.isShowDistribution ? that.data.distribution : ''
    wx.request({
      url: addr.Address.AddLike,
      data: param,
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      async success(res) {
        if (res.data.Success) {
          if (that.data.isVoucher) {
            let resp = await addVoucher({
              cityid: app.globalData.cityInfoId,
              openid: app.globalData.userInfo.openId,
              CreateNum: that.data.voucherNum,
              VoucherMoney: that.data.voucherPrice,
              Deducting:that.data.voucherScopeIdx==2? that.data.fullSubtraction:'',
              UseStartDate: that.data.voucherBeginDate == '不填视为立即可用' ? '' : that.data.voucherBeginDate + ' ' + that.data.voucherBeginTime,
              UseEndDate: that.data.voucherEndDate == '不填视为长期可用' ? '' : that.data.voucherEndDate + ' ' + that.data.voucherEndTime,
              ValidDays: that.data.voucherValidDay,
              State: 0,
              ItemId: res.data.Data.SetLike.Id,
              StoreId: that.data.storeId,
              ItemType: 3
            })
            if (!resp.Success) {
              app.ShowMsg(resp.msg)
              return
            } 
          }
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            success() {
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/lovemgr/lovemgr?storeid=' + that.data.storeId,
                })
              }, 1000)
            }
          })
        }
        else {
          app.ShowMsg(res.data.Message)
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '发布爱心价活动出错'
        })
      }
    })
  },
  // buymodesel: function (e) {
  //   var that=this
  //   var index = e.currentTarget.dataset.index
  //   that.setData({ buytab: index, "love.Mode":index})
  // },
  repomodesel: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index
    that.setData({ repotab: index, "love.StockMode": index })
  },
  voucherToggle(e) {
    this.setData({
      isVoucher: e.detail.value
    })
  },
  getVoucherPrice(e) {

    var tempVal = e.detail.value.replace(/[.]/g, "")
    if (this.data.voucherPrice=='')
      tempVal = tempVal.replace(/[0]/g, "")
    this.setData({
      voucherPrice: tempVal
    })
    
  },
  getVoucherNum(e) {
    this.setData({
      voucherNum: e.detail.value
    })
    console.log(this.data.voucherNum)
  },
  changeVoucherScope(e) {
    let idx = e.currentTarget.dataset.idx

    this.setData({
      voucherScopeIdx: idx
    })
  },
  getFullSubtraction(e) {
    this.setData({
      fullSubtraction: e.detail.value
    })
    console.log(this.data.fullSubtraction)
  },
  getValidDay(e) {
    this.setData({
      voucherValidDay: e.detail.value
    })
    console.log(this.data.voucherValidDay)
  },

  // 优惠券开始时间
  getBeginUseDate(e) {
    let d = new Date()
    this.setData({
      voucherBeginDate: e.detail.value
    })
    if (!this.data.voucherBeginTime) {
      this.setData({
        voucherBeginTime: d.getHours() + ':' + d.getMinutes()
      })
    }
  },

  getBeginUseTime(e) {
    this.setData({
      voucherBeginTime: e.detail.value
    })
  },

  // 优惠券结束时间
  getEndUseDate(e) {
    let d = new Date()
    this.setData({
      voucherEndDate: e.detail.value,
    })
    if (!this.data.voucherEndTime) {
      this.setData({
        voucherEndTime: d.getHours() + ':' + d.getMinutes()
      })
    }
  },
  getEndUseTime(e) {
    this.setData({
      voucherEndTime: e.detail.value
    })
  }
  ,
  distributionToggle(e) {
    this.setData({
      isShowDistribution: e.detail.value
    })
  },
  getDistribution(e) {
  
    this.setData({
      distribution: e.detail.value
    })
  }
})