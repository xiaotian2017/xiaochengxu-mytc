var util = require("../../utils/util.js");
let { vzNavigateTo } = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var uploadimg = require("../../utils/uploadImgenew.js");
var mulpicker = require("../../public/picktime.js");
var app = getApp();
var c_enum;
var option;
// 求职
const applyInput = [{
  "tag": "年龄",
  "type": "number",
  "placeholder": "请填写年龄"
}, {
  "tag": "毕业院校",
  "type": "text",
  "placeholder": "请填写毕业院校"
}, {
  "tag": "邮箱",
  "type": "text",
  "placeholder": "请填写联系邮箱"
}]
const applyPicker = [{
  "tag": "学历",
  "picker": ["请选择学历", "高中以下", "高中", "中专/技校", "大专", "本科", "硕士", "博士", "MBA/EMBA"]
}, {
  "tag": "期望月薪",
  "picker": ["请选择期望薪资", "面议", "1000元以下", "1000 - 2000元", "2000 - 3000元", "3000 - 5000元", "5000 - 8000元", "8000 - 12000元", "12000 - 20000元", "20000元以上"]
}, {
  "tag": "工作经验",
  "picker": ["请选择工作经验", "无工作经验", "应届毕业生", "一年以下工作经验", "1 - 3 年工作经验", "3 - 5年工作经验", "5 - 10年工作经验", "10年以上工作经验"]
}]
const age = {
  "tag": "年龄要求",
  "picker": ["请选择年龄要求", "不限", "25岁以下", "30岁以下", "35岁以下", "40岁以下", "45岁以下", "50岁以下"]
}
const welfare = ["交通补贴", "加班补助", "餐补", "房补", "话补", "包吃", "包住", "医保", "社保", "年终奖", "住房公积金", "节日福利", "年假", "其他补贴"]

const applyMultiArr = [0, 0, 0]

//房产租售
const housingMarket = [{
  "tag": "价格",
  "type": "number",
  "placeholder": "单位：元",
  "checked": false,
  "value": "面议"
}, {
  "tag": "面积",
  "type": "digit",
  "placeholder": "0.00"
}, {
  "tag": "户型",
  "type": "text",
  "placeholder": "几室几厅几卫"
}, {
  "tag": "详细地址",
  "type": "text"
}]

Page({
  data: {
    isadmin: 0,
    trantypeid: 0,
    showall: false,
    showpath: false,
    OpenLongCar: false,
    opentop: 1,//置顶总开关
    //start年月日时分控件参数
    multiArray: [],
    mulindex: ['2017', '7', '25', '16', '22'],
    multimes: '请选择',
    //end年月日时分控件参数
    typeid2: 304595,
    ctypeid2: 0,
    typeid: 0,
    ctypeid: 0,
    pcf: [],
    pcft: {},
    TypeList: [],

    toplist: [],
    extype: 0,
    allprice: 0,//总需要付款额
    dayprice: 0,//置顶单位天费用
    selectindex: 0,
    selectname: '请选择类型',
    istop: "false",//是否置顶
    toptime: '请选择置顶时间',
    startime: '',//开始时间
    extime: 0,//置顶时长
    areainfo: {},
    postid: 0,
    title: '',//标题
    tel: '',//手机号
    desc: '',
    saletype: 0,
    array: ['求购', '出售', '出租', '求租'],
    arrayvalues: [1, 2, 4, 5],
    zhiding: ['置顶信息优先展示', '置顶一天收费￥10', '置顶一周收费￥70', '置顶一月收费￥300',],
    showtype: false,
    SelectType: 0,
    PositionType: 0,
    address: '',//地址
    linkname: '',//姓名
    
    tongcheng_new_02: app.imgresouces.tongcheng_new_02,
    hstore: 0,//是否是商家
    lat: 0,//地址坐标
    lng: 0,//地址坐标
    isneedpay: false,//需不需要付款
    radiochecked: 1,//求职类型
    genderchecked: 0,//性别
    stype: 0,
    isknow: false,
    pctime: '',//拼车时间
    pcstarttime: '',//拼车时间
    pcendtime: '',//拼车时间
    ctpcprice: 0,//长途拼车价格
    pcday: 0,
    //拼车
    IdentityType: 0,
    startPoint: '',
    endPoint: '',
    WorkTime: '',
    carPlate: '',
    Number: 0,
    radiocheckedpc: 3,//拼车类型
    //start图片上传控件
    items: [{
      item_status: "pinglun",
      content: {
        //图片上传
        maxImageCount: 9,
        currentmaxImageCount: 9,
        images_full: false,
        imghidden: true,//上传图片
        imageList: [],
        imageUrlList: [],
        imageIdList: [],
        imageAddUrlList: [],
        icon: 'https://j.vzan.cc/content/city/images/tc-yh-07.png',
        row: 0,
      }
    },
    //求职头像
    {
      item_status: "headimg",
      content: {
        //图片上传
        maxImageCount: 1,
        currentmaxImageCount: 1,
        images_full: false,
        imghidden: true,//上传图片
        imageList: ['https://j.vzan.cc/content/city/images/fabu/03.png'],
        imageUrlList: [],
        imageIdList: [],
        imageAddUrlList: [],
        icon: 'https://j.vzan.cc/content/city/images/fabu/03.png',
        row: 1,
      }
    }],
    //end图片上传控件
    isIos: false
  },
  /**
    监听普通picker选择器
  */
  Selecttype: function (e) {
    //改变index值，通过setData()方法重绘界面
    this.setData({
      selectindex: e.detail.value,
      selectname: this.data.array[e.detail.value],
    })
  },
  fenlei: function () {
    let that = this
    //出租
    if (option.typeid == c_enum.Tenement) {
      that.data.saletype = this.data.ctypeid
      that.data.typeid = this.data.arrayvalues[this.data.selectindex]
      that.data.showtype = true
      that.initHousingMarketItems()
    }
    //全职招聘
    else if (option.typeid == c_enum.Recruit) {
      if (parseInt(option.ctypeid) == 7) {
        that.data.saletype = option.ctypeid
        that.data.typeid = this.data.arrayvalues[this.data.selectindex]
        that.data.stype = option.ctypeid
        that.data.genderchecked = 1
        that.initApplyItems()
      } else {
        that.data.saletype = this.data.ctypeid
        that.data.typeid = this.data.arrayvalues[this.data.selectindex]
        that.data.SelectType = option.ctypeid
        that.initRecruit()
      }
      that.data.showtype = true
    }
    //车辆交易 二手物品
    else if (option.typeid == c_enum.Vehiclesales || option.typeid == c_enum.UsedGoods) {
      this.data.saletype = this.data.arrayvalues[this.data.selectindex]
      this.data.typeid = this.data.ctypeid
      this.data.showtype = true
    }
    //宠物
    else if (c_enum.pet == option.typeid) {
      this.data.SelectType = this.data.arrayvalues[this.data.selectindex]
      this.data.typeid = this.data.ctypeid
      this.data.showtype = true
    }
    else {
      this.data.typeid = this.data.ctypeid
      this.data.showtype = false
    }
  },
  initfenlei: function () {
    var selectindex = 0, selectname = ''
    for (var i in this.data.arrayvalues) {
      var typeid = this.data.arrayvalues[i]
      if (this.data.typeid2 == c_enum.pet && this.data.post.PositionType == typeid) {
        selectindex = i
        selectname = this.data.array[i]
      }
      else if ((this.data.typeid2 == c_enum.UsedGoods || this.data.typeid2 == c_enum.Vehiclesales) && this.data.post.SaleType == typeid) {
        selectindex = i
        selectname = this.data.array[i]
      }
      else if (typeid == this.data.post.TypeId) {
        selectindex = i
        selectname = this.data.array[i]
      }
    }
    this.setData({
      selectindex: selectindex,
      selectname: selectname
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    option = options
    var that = this
    this.data.hidden = options.hidden
    this.data.typeid = options.typeid
    this.data.typeid2 = options.typeid
    this.data.ctypeid = options.ctypeid
    this.data.ctypeid2 = options.ctypeid
    this.data.postid = !!options.postid ? options.postid : 0
    this.setData({ trantypeid: options.typeid })
    c_enum = app.C_Enum
    // 时间选择器
    mulpicker.inite(this, this.data.hidden)
    app.getUserInfo(function () {
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: true,
          isadmin: 1
        })
      }
      that.inite(options.typeid)
    })
    this.setData({
      isIos: app.globalData.isIos
    })
  },
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.data.postid > 0) {
      var url = 'pages/mypublish/mypublish'
      app.reloadpagebyurl('', url)
    }
  },

  inite: function (typeid) {
    var time = new Date()
    var starttime = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate()
    this.setData({
      startime: starttime,
      tel: app.globalData.userInfo.TelePhone,
      linkname: app.globalData.userInfo.nickName,
      showtype: this.data.showtype,
      typeid2: this.data.typeid2,
      ctypeid2: this.data.ctypeid2,
      isknow: (option.typeid == c_enum.Carpooling),
      //desc: (option.typeid == c_enum.Carpooling)?" ":"",
    })
    this.fenlei()
    this.publish(typeid)
  },
  publish: function (typeid) {
    var that = this;
    var areacode = app.globalData.areaCode
    var openId = app.globalData.userInfo.openId
    util.showNavigationBarLoading()
    wx.request({
      url: addr.Address.publish,
      data: {
        areacode: areacode,
        openId: openId,
        typeid: typeid,
        stype: option.ctypeid,
        postid: option.postid
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        that.data.istop = false
        if (res.data.isok == 1) {
          var post = res.data.post
          if (res.data.post != null && res.data.post.Id > 0) {
            that.data.istop = false
            that.data.title = res.data.post.Title
            that.data.linkname = post.LinkMan
            that.data.tel = post.LinkPhone
            that.data.desc = post.Description
            that.data.address = post.Address
            that.data.typeid = post.TypeId
            that.data.saletype = post.SaleType
            that.data.ctypeid = post.SaleType
            option.ctypeid = post.SaleType
            //拼车
            if (that.data.typeid2 == c_enum.Carpooling) {
              that.data.startPoint = post.startPoint
              that.data.endPoint = post.endPoint
              that.data.pctime = post.WorkTime
              that.data.pcstarttime = post.ExpectJob
              that.data.pcendtime = post.Experience
              that.data.Number = post.Number
              that.data.carPlate = post.carPlate
              that.data.IdentityType = post.IdentityType
              option.ctypeid = post.IdentityType
              that.data.radiocheckedpc = post.PositionType
              that.data.multimes = post.WorkTime
            }
            //招聘求职
            else if (that.data.typeid2 == c_enum.Recruit) {
              that.data.ctypeid2 = post.SaleType
              that.data.radiochecked = post.PositionType
              that.data.genderchecked = post.Gender
              that.data.items[1].content.imageList[0] = post.ImgUrl

              //求职
              if (that.data.ctypeid == 7) {

                let applyInputVal = {};
                var birthday = util.GetDateTime(post.Birthday);
                var today = +new Date();
                applyInputVal.val0 = new Date(today).getFullYear() - new Date(birthday).getFullYear()
                applyInputVal.val1 = post.Floor
                applyInputVal.val2 = post.LinkEmail
                that.setData({
                  applyInputVal,
                  applyMultiArr: [post.WorkTime, post.Salary, post.Experience]
                })
              } else {//招聘

              }
            }
            //宠物
            else if (c_enum.pet == option.typeid) {
              option.ctypeid = post.TypeId
              that.data.ctypeid = post.TypeId
              that.data.SelectType = post.PositionType
            }
            //二手物品
            else if (c_enum.UsedGoods == option.typeid || option.typeid == c_enum.Vehiclesales) {
              option.ctypeid = post.TypeId
              that.data.ctypeid = post.TypeId
            }
          }
          var array = []
          var arrayvalues = []
          //出租
          if (res.data.TypeList.length > 0 && (c_enum.Tenement == option.typeid || option.typeid == c_enum.Recruit)) {

            for (var index in res.data.TypeList) {
              var temp = res.data.TypeList[index]
              if (that.data.ctypeid == 1 || that.data.ctypeid == 2) {
                if (temp.Id == 295276 || temp.Id == 295277) {
                  continue
                }
              }
              else if (that.data.ctypeid == 4 || that.data.ctypeid == 5) {
                if (temp.Id == 295285 || temp.Id == 295286) {
                  continue
                }
              }

              array.push(temp.Title)
              arrayvalues.push(temp.Id)
            }
            that.data.arrayvalues = arrayvalues
            // 房产租售
            let housingMarketInputVal = {}
            if (!!post.Price) {
              housingMarketInputVal.val0 = post.Price
            } else {
              that.setData({
                [`housingMarket[${0}].checked`]: true
              })
              housingMarketInputVal.val0 = '';
            }
            if (post.AreaSize == "0") {
              housingMarketInputVal.val1 == " "
            } else {
              housingMarketInputVal.val1 = post.AreaSize / 100
            }
            housingMarketInputVal.val2 = post.HouseType
            housingMarketInputVal.val3 = post.Address
            that.setData({
              housingMarketInputVal
            })
          }
          //二手物品
          else if (c_enum.UsedGoods == option.typeid) {
            that.data.arrayvalues = [1, 2]
            that.data.array = ['出售', '求购']
          }
          //宠物
          else if (c_enum.pet == option.typeid) {
            that.data.arrayvalues = [5, 6]
            that.data.array = ['赠送', '求领养']
          }
          var toplist = []
          if (res.data.ChargeTypeInfoTopList != null && res.data.ChargeTypeInfoTopList.length > 0) {
            for (var i in res.data.ChargeTypeInfoTopList) {
              var temptop = res.data.ChargeTypeInfoTopList[i]
              toplist.push("置顶一" + temptop.ShowNote + "收费￥" + (temptop.Price * 0.01))
            }
          }
          that.data.toplist = toplist
          that.data.pcf = res.data.ChargeTypeInfoList
          that.data.pcft = res.data.ChargeTypeInfoTopList
          that.data.array = array.length > 0 ? array : that.data.array
          that.data.opentop = res.data.opentop
          that.data.post = post

          if (res.data.post.Id <= 0) {
            //出租，求购
            if (295252 == that.data.trantypeid) {
              if (1 == that.data.ctypeid || 4 == that.data.ctypeid)//出租
              {
                that.data.allprice = (that.data.pcf != null && that.data.pcf.length > 0 && res.data.hstore == 0 ? that.data.pcf[0].Price * 0.01 : 0.)
              }
              else {//求购
                that.data.allprice = (that.data.pcf != null && that.data.pcf.length > 0 && res.data.hstore == 0 ? that.data.pcf[1].Price * 0.01 : 0.)
              }
            }
            else {
              that.data.allprice = (that.data.pcf != null && that.data.pcf.length > 0 && res.data.hstore == 0 ? that.data.pcf[0].Price * 0.01 : 0.)
            }
          }
          that.data.areainfo = res.data.areainfo
          that.data.hstore = res.data.hstore
          that.data.allprice = that.data.allprice.toFixed(2)
          //详情图
          that.initImg(res.data.DescImgList)
          that.setData(that.data);
          that.initfenlei()
        }
        else {
          wx: wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            complete: function (res) {
              app.goBackPage(1)
            },
          })
        }
        that.setData({ OpenLongCar: res.data.OpenLongCar })
      },
      fail: function (e) {
        app.showToast("获取表单出错")
      },
      complete: function () {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  //置顶类型选择
  ListenerPickerSelected: function (e) {
    var index = e.detail.value
    var toptime = this.data.toplist[index]
    var topprice = this.data.pcft[index]
    this.data.extype = topprice.ExtendType
    this.data.dayprice = topprice.Price * 0.01

    this.setData({
      toptime: toptime,
    })
    //重新计算总价格
    this.sumprice()
  },
  //拼车时间选择
  ListenerPickerSelected_pc: function (e) {
    var value = e.detail.value
    var typename = e.currentTarget.dataset.type
    if (typename == 'pc') {
      this.setData({
        pctime: value,
      })
    }
    else if (typename == 'pcstart') {
      this.setData({
        pcstarttime: value,
      })
    }
    else if (typename == 'pcend') {
      this.setData({
        pcendtime: value
      })
    }

    //长途拼车修改价格
    var day = 0
    if (this.data.pcstarttime != '' && this.data.pcstarttime != '请选择开始时间' && this.data.pcendtime != '' && this.data.pcendtime != '请选择结束时间') {
      var startd = new Date(this.data.pcstarttime)
      var endd = new Date(this.data.pcendtime)
      var d = util.timeDiff(endd, startd)
      if (d.length > 0) {
        day = d[0]
        this.data.pcday = day
        //重新计算总价格
        this.sumprice()
      }
    }
  },
  //计算总付款金额
  sumprice: function () {
    var data = this.data
    if (data.radiocheckedpc == 4 && data.pcday > 0 && data.pcf != null && data.pcf.length > 0) {
      //长途拼车价格
      data.ctpcprice = data.pcday * data.pcf[0].Price * 0.01
    }
    else {
      data.ctpcprice = 0
    }
    //总价
    data.allprice = (data.ctpcprice > 0 ? data.ctpcprice : (data.pcf != null && data.pcf.length > 0 && data.hstore == 0 ? data.pcf[0].Price * 0.01 : 0)) + (this.data.istop ? this.data.dayprice : 0)
    this.setData({
      allprice: data.allprice.toFixed(2),
      ctpcprice: data.ctpcprice.toFixed(2),
    })
  },
  //添加
  addpost: function (typeid) {
    var val0, val1, val2, val3, checked; //房产
    var Age, graSchool, LinkEmail, Edu, Salary, workExp //求职
    var that = this;
    var areacode = app.globalData.areaCode
    var openId = app.globalData.userInfo.openId
    var title = that.data.title
    var desc = that.data.desc
    var tel = that.data.tel
    var startPoint = that.data.startPoint
    var endPoint = that.data.endPoint
    var pctime = that.data.pctime
    var carPlate = that.data.carPlate
    var Number = that.data.Number
    var pcstarttime = that.data.pcstarttime
    var pcendtime = that.data.pcendtime
    if (option.typeid == c_enum.Carpooling) {
      that.data.IdentityType = option.ctypeid
      that.data.SelectType = that.data.radiocheckedpc
      that.data.typeid = option.typeid
      that.data.title = startPoint + "拼车到" + endPoint
      if (startPoint.trim() == '') {
        app.ShowMsg("请输入出发地")
        return
      }
      if (startPoint.trim().length <= 1) {
        app.ShowMsg("请输入出发地,至少2个字")
        return
      }

      if (endPoint.trim() == '') {
        app.ShowMsg("请输入目的地")
        return
      }
      if (endPoint.trim().length <= 1) {
        app.ShowMsg("请输入目的地,至少2个字")
        return
      }

      if (pctime.trim() == '' || pctime == '请选择时间') {
        app.ShowMsg("请选择时间")
        return
      }
      if (that.data.radiocheckedpc == 4) {
        if (pcstarttime.trim() == '' || pcstarttime == '请选择开始时间') {
          app.ShowMsg("请选择开始时间")
          return
        }
        if (pcendtime.trim() == '' || pcendtime == '请选择结束时间') {
          app.ShowMsg("请选择结束时间")
          return
        }
        if (util.compareDateFormatstr(pcstarttime, pcendtime) != -1) {
          app.ShowMsg("结束时间必须大于结束时间")
          return
        }
      }
      else {
        var pcdate = new Date(pctime)
        var pcdate2 = new Date()
        if (pcdate < pcdate2) {
          app.ShowMsg("出发时间不能小于今天")
          return
        }
      }

      if (option.ctypeid == 3 && carPlate.trim() == '') {
        app.ShowMsg("请输入车牌号")
        return
      }
      if (Number <= 0) {
        app.ShowMsg("请输入" + (option.ctypeid == 3 ? "空位数量" : "乘客人数"))
        return
      }
      if (tel.trim() == '') {
        app.ShowMsg("手机号码不能为空")
        return
      }
      if (tel.trim().length < 10) {
        app.ShowMsg("手机号码长度不对")
        return
      }
    }
    else {
      if (that.data.showtype) {
        if (that.data.selectname.trim() == '' || that.data.selectname == '请选择类型') {
          app.ShowMsg("请选择类型")
          return
        }
      }
      if (that.data.typeid2 == 304595) {
        if (that.data.address.trim() == '') {
          app.ShowMsg("请输入联系地址")
          return
        }
        if (that.data.linkname.trim() == '') {
          app.ShowMsg("请输入联系人")
          return
        }
      }
      if (tel.trim() == '') {
        app.ShowMsg("手机号码不能为空")
        return
      }
      if (tel.trim().length < 10) {
        app.ShowMsg("手机号码长度不对")
        return
      }
    }
    if (desc.trim() == '') {
      app.ShowMsg("请输入详情")
      return
    }
    that.data.isneedpay = (that.data.pcf != null && that.data.pcf.length > 0 && that.data.hstore == 0)
    //判断是否是发帖并置顶
    if (this.data.istop && this.data.toplist.length > 0) {
      if (this.data.extype <= 0) {
        app.ShowMsg("请选择置顶时间")
        return
      }
    }
    //求职
    if (option.typeid == c_enum.Recruit && option.ctypeid == 7) {
      that.data.SelectType = that.data.radiochecked
      let { applyInputVal, applyMultiArr } = { ...that.data }
      var today = new Date();
      Age = (today.getFullYear() - applyInputVal.val0) + "-" + (today.getMonth() + 1) + "-" + today.getDate(); // 年纪
      var graSchool = applyInputVal.val1 //毕业院校
      var LinkEmail = applyInputVal.val2 // 邮箱
      if ('' != LinkEmail && !!LinkEmail) {
        if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(LinkEmail)) {
          app.ShowMsg('您输入的邮箱格式不对')
          return
        }
      }

      var Edu = applyMultiArr[0]//学历
      var Salary = applyMultiArr[1]//期望月薪
      if (Salary == 0) { Salary = 1 }
      var workExp = applyMultiArr[2] //工作经验
    }

    //车辆交易 二手物品
    if (option.typeid == c_enum.Vehiclesales || option.typeid == c_enum.UsedGoods) {
      this.data.saletype = this.data.arrayvalues[this.data.selectindex]
    }
    util.showNavigationBarLoading()
    var typeid = that.data.typeid2
    if (typeid == c_enum.Lifeservice) {
      typeid = that.data.ctypeid2
    }
    // 房产
    if (this.data.typeid2 == "295252") {
      let { housingMarketInputVal } = { ...that.data };

      ({ checked } = { ...housingMarket[0] });
      ({ val0, val1, val2, val3 } = { ...housingMarketInputVal });
      if (!!checked || val0 == '') {
        val0 = 0
      }
      var selIndex = that.data.selectindex
      var posttypeid = that.data.arrayvalues[selIndex]
      typeid = posttypeid
    }


    var reportJS = {
      Id: that.data.postid,
      OpenId: openId, //帖子ID
      AreaSize: val1,
      CityCode: that.data.areainfo.CityCode,
      CityInfoId: app.globalData.cityInfoId,
      AreaId: that.data.areainfo.AreaId,
      StreetId: that.data.areainfo.StreetId,
      SaleType: that.data.saletype,
      Gender: that.data.genderchecked,
      ImgUrl: ' ',
      TypeId: typeid,
      Description: that.data.desc,
      Title: that.data.title,
      LinkPhone: that.data.tel,
      LinkMan: that.data.linkname,
      SelectType: that.data.SelectType,
      PositionType: that.data.SelectType,
      lat: that.data.lat,
      lng: that.data.lng,
      //求职
      Birthday: Age,
      Floor: graSchool,
      LinkEmail: LinkEmail,
      WorkTime: Edu || pctime, // 拼车
      Salary: Salary,
      Experience: workExp || pcendtime, //拼车
      //房产租售
      HouseType: val2,
      Price: !!val0 ? val0 * 100000 / 1000 : 0,

      Address: val3,
      //拼车
      IdentityType: that.data.IdentityType,
      startPoint: startPoint,
      endPoint: endPoint,
      carPlate: carPlate,
      Number: Number,
      ExpectJob: pcstarttime
    }
    var imgSelfitems = that.data.items[1].content.imageAddUrlList
    if (imgSelfitems.length > 0) {
      reportJS.ImgUrl = imgSelfitems[0]
    }


    var descimglist = ''
    var imgitems = that.data.items[0].content.imageAddUrlList
    if (imgitems.length > 0) {

      for (var i in imgitems) {
        var img = imgitems[i]
        if (img.trim() != '') {
          if (i == imgitems.length - 1) {
            descimglist += img
          }
          else {
            descimglist += img + ","
          }
        }
      }
    }
    reportJS = JSON.stringify(reportJS)

    if (that.data.allprice > 0) {
      if (app.globalData.isIos) {
        wx.showModal({
          content: '非苹果手机用户能发帖',
          showCancel: false,
          title: '提示',
          success(res) {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        return
      }
    }

    wx.request({
      url: addr.Address.addpost,
      data: {
        poststr: reportJS,
        ImageIds: '',
        descimglist: descimglist,
        isEncryption: 0,
        isneedpay: that.data.isneedpay,
        stype: that.data.stype,
      },
      method: "POST",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        if (res.data.isok == 1) {
          that.data.post = res.data.dataObj
          if (app.globalData.userInfo.iscityowner > 0) {
            let id = that.data.post.Id
            vzNavigateTo({
              url: '/pages/detail/detail',
              query: {
                id
              }
            })
          }
          else if (that.data.allprice > 0) {
            that.payclick(that.data.post)
          }
          else {
            setTimeout(function () {
              wx.redirectTo({
                url: "../mypublish/mypublish",
              })
            }, 2000)
          }
        }
        else if (res.data.isok == -1) {
          var msg = '请不要重复提交，可到“我的”-我的发布继续支付。点确定跳转到【我的发布】页面'
          var url = '../mypublish/mypublish'
          app.ShowMsgAndUrl(msg, url)
        }
        else {
          app.ShowMsg(res.data.msg)
        }
      },
      fail: function (e) {
        app.showToast("获取表单出错")
      },
      complete: function (e) {
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()
      }
    })
  },
  //确认支付
  payclick: function (post) {
    var that = this
    var extype = this.data.extype
    var extime = 1
    var paytype = 200
    //判断是否是发帖并置顶
    if (this.data.istop && this.data.isneedpay) {
      paytype = 210
      if (extype <= 0) {
        app.ShowMsg("请选择置顶时间")
        return
      }
    }
    else if (this.data.istop) {
      paytype = 201
      if (extype <= 0) {
        app.ShowMsg("请选择置顶类型")
        return
      }
    }
    var param = {
      itemid: this.data.post.Id,
      paytype: paytype,
      extype: extype,
      extime: extime,
      openId: app.globalData.userInfo.openId,
      quantity: 0,
      areacode: app.globalData.areaCode,
      remark: ""
    }

    util.AddOrder(param, this.refun)
  },

  switch1Change: function (e) {
    this.data.istop = e.detail.value
    this.setData({
      istop: this.data.istop,
    })
    //重新计算总价格
    this.sumprice()
  },
  //付款成功后回调
  refun: function (param, state) {

    if (state == 0) {
      var msg = '您已取消付款，可到“我的”-我的发布继续支付。点确定跳转到【我的发布】页面'
      var url = '../mypublish/mypublish'
      app.ShowMsgAndUrl(msg, url)
    }
    else if (state == 1) {
      var url = '/pages/payTransfer/payTransfer?type=biaodan'
      wx.redirectTo({
        url: url
      })
    }
  },
  //输入
  inputclick: function (e) {
    let that = this
    var value = e.detail.value
    var typename = e.currentTarget.dataset.type
    var arr = ["title", "tel", "desc", "address", "linkname", "carPlate", "Number"]
    if (arr.indexOf(typename) > -1) {
      that.data[typename] = value
    } else if (typename == "startaddress") {
      that.data.startPoint = value
    } else if (typename == "endaddress") {
      that.data.endPoint = value
    }
  },

  //初始化图片
  initImg: function (imgdatas) {
    //详情图
    if (imgdatas.length > 0) {
      var content = this.data.items[0].content
      for (var i = 0, len = imgdatas.length; i < len; i++) {
        content.imageList.push(imgdatas[i].filepath)
        content.imageIdList.push(imgdatas[i].id)
      }
      content.maxImageCount = content.currentmaxImageCount - content.imageList.length
      content.images_full = content.currentmaxImageCount <= content.imageList.length
    }
  },
  //图片上传
  chooseImage: function (e) {
    var row = e.currentTarget.dataset.row
    uploadimg.chooseImage(e, this, row);
  },
  previewImage: function (parmas) {
    uploadimg.previewImage(parmas, this);
  },
  clearImage: function (parmas) {
    uploadimg.clearImage(parmas, this);
  },
  //end图片上传控件
  //定位
  clickToLocate: function (params) {
    var that = this
    var row = params.target.dataset.row
    var cell = this.data.items[row]
    var that = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        wx.chooseLocation({
          success: function (res) {
            console.log(res)
            that.setData({
              address: res.address,
              lat: res.latitude,
              lng: res.longitude
            })
          }
        })
      }
    })
  },
  //复选框事件
  radioChange: function (e) {
    var typename = e.currentTarget.dataset.type
    if (typename == "job") {
      this.data.radiochecked = e.detail.value
    }
    else if (typename == "gender") {
      this.data.genderchecked = e.detail.value
    }
    else if (typename == 'pc') {
      this.setData({
        radiocheckedpc: e.detail.value
      })
      //重新计算总价格
      this.sumprice()
    }
  },
  //我知道
  zhidaoclick: function () {
    this.setData({
      isknow: !this.data.isknow,
      //desc: !this.data.isknow?" ":"",
    })
  },
  // 时间选择器确定按钮
  timesure: function (e) {
    var that = this
    var data = that.data
    if (!data.conditiontime) {
      data.pctime = data.year + "-" + data.month + "-" + data.day + " " + this.data.our + ":" + data.minue
    }
    mulpicker.timesure(e, that)
  },
  // 时间选择器取消按钮
  timecancel: function () {
    mulpicker.timecancel(this)
  },
  bindMultiPickerChange: function (e) {
    mulpicker.bindMultiPickerChange(e, this)
  },
  //初始化招聘
  initRecruit() {
    let that = this, welfareArr = [];
    let [...recruitArr] = applyPicker;
    let [...recruitMultiArr] = applyMultiArr;
    recruitMultiArr.push(0)
    recruitArr.push(age)
    recruitArr[1]["picker"].splice(0, 1)
    Reflect.set(recruitArr[0], "tag", "学历要求")
    Reflect.set(recruitArr[1], "tag", "薪资待遇")

    welfare.forEach((key, index) => {
      welfareArr[index] = false
    })
    that.setData({
      recruitArr,
      recruitMultiArr,
      welfare,
      welfareArr
    })
  },
  //选择福利
  chooseWelfare(e) {
    let that = this
    const { index } = { ...e.currentTarget.dataset }
    let { welfareArr } = { ...that.data }
    that.setData({
      [`welfareArr[${index}]`]: !welfareArr[index]
    })
  },
  // 初始化求职高级选项
  initApplyItems() {
    let that = this, applyInputVal = {}
    applyPicker.forEach((key, index) => {
      Reflect.set(applyInputVal, 'val' + index, '')
    })
    Reflect.set(applyInputVal, 'val0', 0)
    that.setData({
      showApplyItems: true,//展开 收起
      applyInput,
      applyInputVal,
      applyMultiArr,
      applyPicker,
      applyDescription: '' //工作经验
    })
  },
  //求职输入
  getApplyInput(e) {
    let that = this
    let { applyInputVal } = { ...that.data }
    const { index } = { ...e.currentTarget.dataset }
    const value = e.detail.value.trim()
    that.setData({
      ['applyInputVal.val' + index]: value
    })
  },
  //工作经验
  getApplyDescription(e) {
    let that = this
    const val = e.detail.value.trim()
    that.setData({
      applyDescription: val
    })
  },
  //求职选择器
  applyPicker(e) {
    let that = this
    const { index } = { ...e.currentTarget.dataset }
    const { value } = { ...e.detail }
    that.setData({
      [`applyMultiArr[${index}]`]: value
    })
  },
  //展开收起求职高级选项
  showApplyItems() {
    let that = this
    let { showApplyItems } = { ...that.data }
    that.setData({
      showApplyItems: !showApplyItems
    })
  },
  //初始化房产租售高级选项
  initHousingMarketItems() {
    let that = this, housingMarketInputVal = {}
    housingMarket.forEach((key, index) => {
      Reflect.set(housingMarketInputVal, 'val' + index, '')
    })
    that.setData({
      housingMarket,
      housingMarketInputVal
    })
  },
  //面议
  chooseHousingPrice(e) {
    let that = this
    let { checked } = { ...that.data.housingMarket[0] }
    if (checked) {
      that.setData({
        [`housingMarket[${0}].checked`]: false,
        [`housingMarketInputVal.val0`]: ''
      })
    } else {
      that.setData({
        [`housingMarket[${0}].checked`]: true,
        [`housingMarketInputVal.val0`]: '面议'
      })
    }
  },
  getHousingMarketInput(e) {
    let that = this
    let { housingMarketInputVal } = { ...that.data }
    const { index } = { ...e.currentTarget.dataset }
    let value = e.detail.value.trim()
    if (index == 0 || index == 1) {
      value = that.filterNum(value, index)
    }
    that.setData({
      ['housingMarketInputVal.val' + index]: value
    })
  },
  chooseHouseLocation() {
    let that = this
    let { housingMarketInputVal } = { ...that.data }
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        wx.chooseLocation({
          success(data) {
            that.setData({
              ['housingMarketInputVal.val' + 3]: data.address
            })
          }
        })
      },
      fail(err) {
        app.showMsg('获取地理位置失败,请手动输入')
      }
    })
  },
  //限制输入
  filterNum(obj, index) {
    if (0 == index)
      obj = obj.replace(/[^\d]/g, ""); //清除"数字"和"."以外的字符
    else
      obj = obj.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    obj = obj.replace(/^\./g, ""); //验证第一个字符是数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个, 清除多余的
    obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //
    return obj
  }
})