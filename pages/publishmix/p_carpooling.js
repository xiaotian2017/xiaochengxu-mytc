var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var uploadimg = require("../../utils/uploadImgenew.js");

let app = getApp()
Page({
  data: {
    topStatus: false, //选择置顶状态 2019/7/10
    isFree: false, //是否免费发帖 2019/7/11
    longpingche: 1,
    isknow: true,
    agree: 1,
    postpay: 0,
    toppay: 0,
    classifyid: 0,
    typeid: 0,
    mustpay: 0,
    topindex: 0,
    listtop: [],
    startime: '', //开始时间
    post: {
      Id: 0,
      PositionType: 3,
      isEncryption: false
    },
    uploadimgobjects: {
      //店铺头像
      "remark": {
        config: {
          //图片上传
          maxImageCount: 9,
          images_full: false,
          imageUpdateList: [], //编辑时新增的
          imageList: [],
          imageIdList: [] //用来删除图片
        }
      },
      validDay: ''
    },
    // 时间选择器组件
    isTimePicker: false,
    timerValueArrIdx: 0,
    isIos: false
  },
  onLoad: function (options) {
    var classifyid = options.classifyid
    var typeid = options.typeid
    var postid = options.postid == undefined ? 0 : options.postid
    var that = this
    var time = new Date()
    var starttime = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate()
    that.setData({
      classifyid: classifyid,
      postid: postid,
      typeid: typeid,
      startime: starttime,
      "post.IdentityType": classifyid
    })

    //调用应用实例的方法获取全局数据
    app.getUserInfo(function () {
      wx.setNavigationBarTitle({
        title: '发布拼车'
      })
      that.setData({
        isIos: app.globalData.isIos
      })
      that.loadmainmodel()
    })
  },
  //改变置顶状态 2019/7/10
  changeTopStatus() {
    let topStatus = this.data.topStatus
    this.setData({
      topStatus: !topStatus
    })
  },
  getValidDay(e) {
    if (parseInt(e.detail.value) === 0) {
      this.setData({
        content: '有效天数不能为0',
        showTips: true
      })
      this.setData({
        validDay: ''
      })
      return
    }
    this.setData({
      validDay: e.detail.value
    })

    let nowTime = new Date().getTime()

    if (new Date(this.data.post.WorkTime).getTime() > nowTime) {
      this.setData({
        postpay: this.initpay * (parseInt(e.detail.value) + 1)
      })
    } else {
      this.setData({
        postpay: this.initpay * parseInt(e.detail.value)
      })
    }

    if (!e.detail.value) {
      this.setData({
        postpay: this.initpay
      })
    }
  },
  loadmainmodel: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: addr.Address.GetAddOrEditPost,
      data: {
        cityid: app.globalData.cityInfoId,
        openid: app.globalData.userInfo.openId,
        typeid: that.data.typeid,
        postid: that.data.postid,
        classifyid: that.data.classifyid,
        typeversion: '0702' //后台用于区分版本做数据兼容   2019/07/2
      },
      success: function (res) {
        if (res.data.Success) {
          var post = res.data.Data.Post
          //发帖收费
          var payconfig = res.data.Data.ChargeTypeInfoList
          if (payconfig.length > 0 && app.globalData.userInfo.iscityowner <= 0) {
            var m = payconfig[0].Price * 1000 / 100000
            that.setData({
              postpay: m,
              mustpay: m
            })
            that.initpay = m
            //长期拼车算收费
            // setInterval(function () {
            //   var oldmoney = m
            //   var money = oldmoney
            //   var post = that.data.post
            //   if (post.PositionType == 4) {
            //     if (!!!post.WorkTime || !!!post.ExpectJob || !!!post.Experience) {
            //     } else {
            //       var startTime = new Date(post.ExpectJob);
            //       var endTime = new Date(post.Experience);
            //       var date = endTime.getTime() - startTime.getTime();
            //       var days = Math.floor(date / (24 * 3600 * 1000));
            //       var year = new Date().getFullYear(); //获取完整的年份(4位,1970-????)
            //       var mon = (new Date().getMonth() + 1); //获取当前月份(0-11,0代表1月)
            //       var day = new Date().getDate(); //获取当前日(1-31)
            //       var timestr = year + "-" + (mon >= 10 ? mon : "0" + mon) + "-" + (day >= 10 ? day : "0" + day) + "T" + post.WorkTime + ":00";
            //       var pointTime = new Date(timestr);
            //       if (post.Experience == post.ExpectJob || pointTime > new Date().getTime()) {
            //         days++;
            //       }
            //       money = money * days;
            //     }
            //   }

            //   var payhtml = money.toFixed(2);
            //   that.setData({
            //     postpay: payhtml
            //   })
            // }, 100);
          }
          that.setData({
            listtop: res.data.Data.ChargeTypeInfoTopList,
            longpingche: res.data.Data.longpingche
          })
        } else {
          app.ShowMsg(res.data.Message)
        }
        wx.hideLoading()
      }
    })
  },

  pintypechange(e) {
    var that = this
    that.setData({
      "post.PositionType": e.currentTarget.dataset.val,
      "post.WorkTime": '',
    })
  },
  inputStartPoint(e) {
    var value = e.detail.value
    this.setData({
      'post.startPoint': value
    })
  },
  inputEndPoint(e) {
    var value = e.detail.value
    this.setData({
      'post.endPoint': value
    })
  },
  inputcarPlate(e) {
    var value = e.detail.value
    this.setData({
      'post.carPlate': value
    })
  },
  inputNumber(e) {

    var value = e.detail.value.replace(/\D/g, '')
    this.setData({
      'post.Number': value
    })
  },
  inputLinkMan(e) {

    var value = e.detail.value.replace(/\D/g, '')
    this.setData({
      'post.LinkMan': value
    })
  },
  inputLinkPhone(e) {

    var value = e.detail.value.replace(/\D/g, '')
    this.setData({
      'post.LinkPhone': value
    })
  },
  inputDescription(e) {

    var value = e.detail.value
    this.setData({
      'post.Description': value
    })
  },
  // 时间选择器确定按钮
  timesure: function (e) {
    var that = this
    var data = that.data
    var value = data.year + "-" + data.month + "-" + data.day + " " + this.data.our + ":" + data.minue
    that.setData({
      "post.WorkTime": value,
    })
  },
  timesel: function (e) {
    var that = this
    var typename = e.currentTarget.dataset.type
    var value = e.detail.value

    if (typename == 'go') {
      that.setData({
        "post.WorkTime": this.data.startime + ' ' + value,
      })

      let nowTime = new Date().getTime()

      if (new Date(this.data.startime + ' ' + value).getTime() > nowTime) {
        this.setData({
          postpay: this.initpay * (parseInt(this.data.validDay) + 1)
        })
      } else {
        this.setData({
          postpay: this.initpay * parseInt(this.data.validDay)
        })
      }


      console.log(value)
    } else if (typename == 'start') {
      that.setData({
        "post.ExpectJob": value,
      })
    } else if (typename == 'end') {
      that.setData({
        "post.Experience": value,
      })
    }
  },
  uploadLogoImg: function (e) {
    wx.showLoading({
      title: '开始上传',
    })
    uploadimg.shopChooseImage(e, this);
  },
  clearImage: function (e) {
    var that = this
    //轮播图清除
    uploadimg.shopclearImage(e, this);
  },
  selTopPay(e) {
    var that = this
    var selValue = e.detail.value
    that.setData({
      "topindex": selValue
    })
    //修改需付款
    if (0 != selValue) {
      var selText = that.data.listtop[selValue].name;
      var price = selText.replace(/[^0-9.]/ig, "");
      price = parseFloat(price)

      that.setData({
        toppay: price
      })
    } else {
      that.setData({
        toppay: 0
      })
    }

  },
  agreenoticechange(e) {
    var that = this
    var selVal = e.detail.value
    if (selVal.length > 0) {
      that.setData({
        agree: 1
      })
    } else {
      that.setData({
        agree: 0
      })
    }
  },
  save() {
    var that = this
    var post = that.data.post


    if (0 == post.Id) {
      if (4 == post.PositionType) {

        post.ExpectJob = this.data.startime
        let dayTime = this.data.validDay * 24 * 60 * 60 * 1000; //参数天数的时间戳
        let nowTime = new Date().getTime()
        let t = nowTime + dayTime
        var formaterDate = "yyyy-MM-dd";
        post.Experience = util.dateFormat(formaterDate, new Date(t))
      }

      post.ImageIds = that.data.uploadimgobjects.remark.config.imageList.join(',')

    } else {
      post.ImageIds = that.data.uploadimgobjects.remark.config.imageUpdateList.join(',')
    }
    post.LinkMan = app.globalData.userInfo.nickName
    post.CarpoolingType = post.PositionType
    post.Title = post.startPoint + "拼车到" + post.endPoint
    post.TypeId = that.data.typeid
    post.CityInfoId = app.globalData.cityInfoId
    post.AreaId = app.globalData.areaCode
    post.CityCode = app.globalData.citycode
    post.IsTop = that.data.topStatus
    if (!!!post.startPoint || '' === post.startPoint) {
      app.ShowMsg('请输入出发地!');
      return;
    }
    if (!!!post.endPoint || '' === post.endPoint) {
      app.ShowMsg('请输入目的地!');
      return;
    }
    if (4 == post.PositionType) {

      if (!this.data.validDay) {
        app.ShowMsg('请输入有效天数!');
        return;
      }
      if (!!!post.WorkTime || '' === post.WorkTime) {
        app.ShowMsg('请选择出发时间!');
        return;
      }
      if (!!!post.ExpectJob || '' === post.ExpectJob) {
        app.ShowMsg('请选择开始日期!');
        return;
      }
      if (!!!post.Experience || '' === post.Experience) {
        app.ShowMsg('请选择结束日期!');
        return;
      }

    }
    if (!!!post.WorkTime || '' === post.WorkTime) {
      app.ShowMsg('请选择出发时间!');
      return;
    }
    if (!!!post.Number || 0 === post.Number) {
      var pname = post.IdentityType == 3 ? "空座" : post.IdentityType == 4 ? "乘客" : post.IdentityType == 5 ? "车辆数量" : "货物重量"
      app.ShowMsg(pname + "数不能为0或空");
      return;
    }
    if (!!!post.LinkPhone || '' === post.LinkPhone) {
      app.ShowMsg('请输入联系电话!');
      return;
    }
    if (!!!post.Description || '' === post.Description) {
      app.ShowMsg('请输入备注!');
      return;
    }
    if (1 != that.data.agree) {
      app.ShowMsg('请先阅读平台拼车声明!');
      return;
    }
    var price = (parseFloat(that.data.postpay) + parseFloat(that.data.toppay)).toFixed(2)
    if (app.globalData.isIos && 0.00 != price) {
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
    post.openid = app.globalData.userInfo.openId

    wx.request({
      url: addr.Address.AddPostNew,
      data: post,
      method: "POST",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        console.log(res)
        const resData = res.data
        if (res.data.code == 1) {
          const payType = Number(resData.data.payType)
          const post = resData.data.post
          const topStatus = that.data.topStatus
          const PostKey = that.data.PostKey
          // if (isFree && !topStatus) { //免费发帖&&没有开启置顶服务
          switch (payType) {
            case 0: //免费发帖
              if (topStatus) {
                wx.redirectTo({
                  url: '/pages/postNav/moreServer/moreServer?postId=' + post.Id + '&PostKey=' + PostKey + "&payType=201" + "&isReNew=false"
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: '发帖成功',
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      wx.redirectTo({
                        url: "/pages/postNav/postSuccess/postSuccess?post=" + JSON.stringify(post) + '&isFree=' + isFree + '&postId=' + post.Id + "&payType=" + payType + "&isReNew=false"
                      })
                    }
                  }
                })
              }

              break;
            case 200: //付费发帖
              wx.redirectTo({
                url: "/pages/postNav/moreServer/moreServer?PostKey=" + PostKey + '&postId=' + post.Id + "&payType=" + payType + "&isReNew=false"
              })
              break;
            case 201: //置顶付费
              wx.redirectTo({
                url: "/pages/postNav/moreServer/moreServer?PostKey=" + PostKey + '&postId=' + post.Id + "&payType=" + payType + "&isReNew=false"
              })
              break;
            case 210: //发帖并置顶
              wx.redirectTo({
                url: "/pages/postNav/moreServer/moreServer?PostKey=" + PostKey + '&postId=' + post.Id + "&payType=" + payType + "&isReNew=false"
              })
              break;
            default:
          }
          // } else { //免费发帖，但是开启了置顶服务
          //   const payType = 201
          //   const post = resData.data.post
          //   const isFree = that.data.isFree //帖子的免费状态
          //   const PostKey = that.data.PostKey
          //   wx.redirectTo({
          //     url: '/pages/postNav/moreServer/moreServer?postId=' + post.Id + '&PostKey=' + PostKey + "&payType=" + payType + "&isReNew=false"
          //   })
          // }

        } else {
          app.ShowMsg(res.data.msg)
        }
      }
    })

  },
  zhidaoclick: function () {
    var that = this
    that.setData({
      isknow: !that.data.isknow,
    })

  },
  //付款成功后回调
  refun: function (param, state) {
    if (state == 0) {
      app.ShowMsg("您已取消付款")
      return
    } else if (state == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000
      })
      var url = "../mypublish/mypublish"
      wx.redirectTo({
        url: url
      })
    }
  },
  timerPickerConfirm(e) {
    switch (this.data.timerValueArrIdx) {
      case 0:
        this.setData({
          'post.WorkTime': e.detail[0].timerStr,
        })
    }
    this.setData({
      isTimePicker: false
    })
  },
  timerPickerCancel() {
    this.setData({
      isTimePicker: false
    })
  },
  // 相同时间控制
  commontDateFn(e) {
    this.setData({
      isTimePicker: true,
      timerValueArrIdx: parseInt(e.target.dataset.type)
    })
  },
})