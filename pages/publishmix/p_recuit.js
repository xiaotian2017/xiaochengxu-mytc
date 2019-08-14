var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var uploadimg = require("../../utils/uploadImgenew.js");
let app = getApp()
Page({
  data: {
    topStatus: false, //选择置顶状态 2019/7/10
    isFree: false, //是否免费发帖 2019/7/11
    floorarr: [],
    mustpay: 0,
    needpay: 0,
    recruitnumberdisable: false,
    expectmoneydisable: false,
    topindex: 0,
    experienceindex: 0,
    educationindex: 0,
    ageindex: 0,
    regionindex: 0,
    pikerworktypeindex: 0,
    pikersalaryindex: 0,
    post: {
      Id: 0
    },
    typeid: 0,
    classifyid: 0,
    postid: 0,
    frompage: 0,
    worktype: [],
    listage: [],
    listsalary: [],
    listexperience: [],
    listeducation: [],
    listtop: [],
    region: [],
    multiIndex: [0, 0],

    benifits: [{
        name: '交通补贴',
        value: '交通补贴',
        checked: false
      },
      {
        name: '加班补助',
        value: '加班补助',
        checked: false
      },
      {
        name: '餐补',
        value: '餐补',
        checked: false
      },
      {
        name: '房补',
        value: '房补',
        checked: false
      },
      {
        name: '话补',
        value: '话补',
        checked: false
      },
      {
        name: '包吃',
        value: '包吃',
        checked: false
      },
      {
        name: '包住',
        value: '包住',
        checked: false
      },
      {
        name: '医保',
        value: '医保',
        checked: false
      },
      {
        name: '社保',
        value: '社保',
        checked: false
      },
      {
        name: '年终奖',
        value: '年终奖',
        checked: false
      },
      {
        name: '住房公积金',
        value: '住房公积金',
        checked: false
      },
      {
        name: '节日福利',
        value: '节日福利',
        checked: false
      },
      {
        name: '其他补贴',
        value: '其他补贴',
        checked: false
      },
      {
        name: '年假',
        value: '年假',
        checked: false
      },
    ],
    hidedetail: true,
    uploadimgobjects: {
      "jobrequire": {
        config: {
          //图片上传
          maxImageCount: 9,
          images_full: false,
          imageUpdateList: [], //编辑时新增的
          imageList: [],
          imageIdList: [] //用来删除图片
        }
      }
    },
    positionTitle: '',
    isIos: false
  },
  onLoad: function (options) {
    var that = this
    var typeid = options.typeid
    var classifyid = options.classifyid ? options.classifyid : 0
    var postid = options.postid == undefined ? 0 : options.postid
    that.setData({
      classifyid: classifyid,
      postid: postid,
      typeid: typeid,
      isIos: app.globalData.isIos
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function () {
      that.loadmainmodel()
    })
    wx.setNavigationBarTitle({
      title: "发布详情"
    })
  },

  //改变置顶状态 2019/7/10
  changeTopStatus() {
    let topStatus = this.data.topStatus
    this.setData({
      topStatus: !topStatus
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
  opendetail() {
    var that = this
    that.setData({
      hidedetail: !that.data.hidedetail
    })
  },
  //获取信息状态
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
          var streetlist = res.data.Data.CAreaStreetList
          var post = res.data.Data.Post
          that.setData({
            worktype: res.data.Data.TypeList,
            listage: res.data.Data.listAge,
            listsalary: res.data.Data.listSalary,
            listexperience: res.data.Data.listExperience,
            listeducation: res.data.Data.listEducation,
            listarea: res.data.Data.CAreaList,
            liststreet: streetlist,
            listtop: res.data.Data.ChargeTypeInfoTopList,
            region: [res.data.Data.CAreaList, streetlist],
            positionTitle: res.data.Data.Post.Title == null ? "" : res.data.Data.Post.Title,
            positionType: res.data.Data.Post.PositionType == 0 ? 1 : res.data.Data.Post.PositionType,
            'post.PositionType': res.data.Data.Post.PositionType == 0 ? 1 : res.data.Data.Post.PositionType,
            isFree: res.data.Data.IsFree, //2019/7/11 
            PostKey: res.data.Data.PostKey
          })
          var payconfig = res.data.Data.ChargeTypeInfoList
          if (payconfig.length > 0 && app.globalData.userInfo.iscityowner <= 0) {

            var m = payconfig[0].Price * 1000 / 100000
            that.setData({
              needpay: m,
              mustpay: m
            })
          }

          // 单独的兼职招聘进来
          if (that.data.typeid == 295255) {
            var target = that.data.worktype.findIndex(x => x.Id == that.data.classifyid)
            that.setData({
              pikerworktypeindex: target,
            })
          }

          // 特殊处理解决null.trme报错的问题
          that.setData({
            'post.CompanyName': !post.CompanyName ? '' : post.CompanyName
          })


          // 编辑的时候回填
          if (post.Id > 0) {
            var target = that.data.worktype.findIndex(x => x.Id == post.TypeId)
            var areatarget = that.data.liststreet.findIndex(x => x.Code == post.StreetId)

            var items = that.data.benifits;
            if ('' != post.Floor && !!post.Floor) {
              var checkArr = post.Floor.split(";");
              for (var i = 0; i < items.length; i++) {
                if (checkArr.indexOf(items[i].value) != -1) {
                  items[i].checked = true;
                } else {
                  items[i].checked = false;
                }
              }
            }

            var multiIndex = [0, areatarget]
            that.setData({
              multiIndex: multiIndex,
              pikerworktypeindex: target,
              pikersalaryindex: post.Salary - 1,
              ageindex: post.AgeRe - 1,
              educationindex: post.WorkTime - 1,
              experienceindex: post.Experience - 3,
              post: post,
              benifits: items
            })
            // 详情图片   
            if (res.data.Data.DescImgList && res.data.Data.DescImgList.length > 0) {
              let convertList = [];
              let imgids = [];
              res.data.Data.DescImgList.forEach((v) => {
                convertList.push(v.filepath)
                imgids.push(v.id);
              })
              that.setData({
                'uploadimgobjects.jobrequire.config.imageList': convertList,
                'uploadimgobjects.jobrequire.config.imageIdList': imgids
              })
            }
          }
        } else {
          app.ShowMsg(res.data.Message)
        }
        wx.hideLoading()
      }
    })
  },
  getPositionType(e) {
    this.setData({
      positionType: e.currentTarget.dataset.val,
      'post.PositionType': e.currentTarget.dataset.val
    })
  },
  inputNumber: function (e) {
    var val = e.detail.value;
    this.setData({
      'post.Number': val
    })
  },
  inputposttitle: function (e) {
    var val = e.detail.value;
    this.setData({
      'post.Title': val
    })
  },
  inputCompanyName: function (e) {
    var val = e.detail.value;
    this.setData({
      'post.CompanyName': val
    })
  },
  inputAddress: function (e) {
    var val = e.detail.value;
    this.setData({
      'post.Address': val
    })
  },
  inputWorkHours: function (e) {
    var val = e.detail.value;
    this.setData({
      'post.WorkHours': val
    })
  },
  inputPayUnit: function (e) {
    var val = e.detail.value;
    this.setData({
      'post.PayUnit': val
    })
  },
  salarysel: function (e) {
    var that = this
    var selVal = parseInt(e.detail.value)
    that.setData({
      'post.Salary': selVal + 1,
      pikersalaryindex: selVal
    })

  },
  worktypesel: function (e) {
    var that = this
    var selVal = e.detail.value
    var target = that.data.worktype[selVal].Id
    that.setData({
      'post.TypeId': target,
      pikerworktypeindex: selVal
    })

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
  //导航
  getLocation: function () {
    var that = this;
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    wx.chooseLocation({
      success: function (res) {
        var post = that.data.post
        post.Address = res.address
        post.lat = res.latitude
        post.lng = res.longitude
        that.setData({
          post: post
        })
      }
    })
  },

  selAge(e) {
    var that = this
    var selValue = parseInt(e.detail.value)
    that.setData({
      ageindex: selValue,
      "post.AgeRe": selValue + 1
    })
  },

  selEducation(e) {
    var that = this
    var selValue = parseInt(e.detail.value)
    that.setData({
      educationindex: selValue,
      "post.WorkTime": selValue + 1
    })
  },
  selExperience(e) {
    var that = this
    var selValue = parseInt(e.detail.value)
    that.setData({
      experienceindex: selValue,
      "post.Experience": selValue + 3
    })
  },

  selTopPay(e) {
    var that = this
    var payprice = that.data.mustpay
    var selValue = e.detail.value
    that.setData({
      "topindex": selValue
    })
    //修改需付款
    if (0 != selValue) {
      var selText = that.data.listtop[selValue].name;
      var price = selText.replace(/[^0-9.]/ig, "");
      price = payprice + parseFloat(price)
      that.setData({
        needpay: price
      })
    } else {
      that.setData({
        needpay: payprice
      })
    }
  },
  // 获取联系人
  getLinkMan(e) {
    this.setData({
      'post.LinkMan': e.detail.value
    })
  },
  benifitschange(e) {
    var that = this
    that.setData({
      floorarr: e.detail.value
    })
    var items = this.data.benifits;
    var checkArr = e.detail.value;
    for (var i = 0; i < items.length; i++) {
      if (checkArr.indexOf(items[i].value) != -1) {
        items[i].checked = true;
      } else {
        items[i].checked = false;
      }
    }
    this.setData({
      benifits: items
    })
  },
  bindRegionPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindRegionPickerColumnChange(e) {
    if (e.detail.column == 0) {
      var that = this;
      var code = that.data.region[0][e.detail.value].Code
      var multiIndex = that.data.multiIndex
      console.log(multiIndex)
      wx.request({
        url: addr.Address.GetSubArea,
        data: {
          pid: code
        },
        method: "GET",
        header: {
          'content-type': "application/json"
        },
        success: function (res) {
          if (res.data.Success) {
            multiIndex[1] = 0
            that.setData({
              "region[1]": res.data.Data.list,
              multiIndex: multiIndex
            });
          }
        }
      })
    }
  },
  genderChange(e) {
    var that = this
    that.setData({
      "post.Gender": e.detail.value
    })
  },
  recruitnumberchange(e) {
    var that = this
    var selVal = e.detail.value
    if (selVal.length > 0) {
      that.setData({
        "post.Number": 0,
        recruitnumberdisable: true
      })
    } else {
      that.setData({
        recruitnumberdisable: false
      })
    }
  },

  //2019/7/10  修改逻辑(写法上没有优化，just copy and change)
  save() {
    const _this = this
    const topStatus = _this.data.topStatus
    let {
      postid,
      uploadimgobjects,
      post
    } = _this.data
    let imageList = uploadimgobjects.jobrequire.config.imageList
    let imageUpdateList = uploadimgobjects.jobrequire.config.imageUpdateList
    let isUpdate = post.Id > 0 ? true : false
    if (0 == post.TypeId || !!!post.TypeId) {
      let target = _this.data.worktype[0].Id
      post.TypeId = target
    }
    if (0 == post.Salary || !!!post.Salary) {
      post.Salary = 1
    }
    if (0 == post.AgeRe) {
      post.AgeRe = 1
    }
    if (0 == post.WorkTime || !!!post.WorkTime) {
      post.WorkTime = 1
    }
    if (0 == post.Experience || !!!post.Experience) {
      post.Experience = 3
    }
    post.CityCode = _this.data.region[0][_this.data.multiIndex[0]].Code
    post.StreetId = _this.data.region[1][_this.data.multiIndex[1]].Code
    post.DescImgList = postid == 0 ? imageList.join() : imageUpdateList.join()
    post.CityInfoId = app.globalData.cityInfoId
    post.AreaId = app.globalData.areaCode
    post.PostKey = _this.data.PostKey
    post.IsTop = _this.data.topStatus
    console.log(post)

    if (!_this.data.positionTitle.trim()) {
      app.ShowMsg('请输入职位名称');
      return
    } else {
      post.Title = this.data.positionTitle
    }
    if (_this.data.floorarr.length > 0) {
      _this.setData({
        "post.Floor": _this.data.floorarr.join(';')
      })
    }
    if (!!!post.LinkPhone || '' === post.LinkPhone) {
      app.ShowMsg('请输入联系电话!');
      return;
    }
    if (!!!post.LinkMan || '' === post.LinkMan) {
      app.ShowMsg('请输入联系人!');
      return;
    }
    if (!post.Number && parseInt(post.Number) !== 0) {
      app.ShowMsg('请输入招聘人数!');
      return;
    }
    if (!!!post.TypeId || 0 === post.TypeId) {
      app.ShowMsg('请选择职业类别!');
      return;
    }
    if (!!!post.Description || '' === post.Description) {
      app.ShowMsg('请输入岗位职责与要求!');
      return;
    }
    if (!post.CompanyName.trim()) {
      app.ShowMsg('请输入公司名称!');
      return
    }
    if (0 == post.Id) {
      post.openid = app.globalData.userInfo.openId
    }

    wx.request({
      url: addr.Address.AddPostNew,
      data: post,
      method: "POST",
      header: {
        'content-type': "application/json"
      },
      success: function (res) {
        const resData = res.data
        if (resData.code == 1) {
          const payType = Number(resData.data.payType)
          const post = resData.data.post
          const topStatus = _this.data.topStatus
          const PostKey = _this.data.PostKey
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
                        url: "/pages/postNav/postSuccess/postSuccess?post=" + JSON.stringify(post) + '&postId=' + post.Id + "&payType=" + payType + "&isReNew=false"
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
        } else {
          app.ShowMsg(resData.msg)
        }
      }
    })


  },
  //付款成功后回调
  refun: function (param, state) {
    if (state == 0) {
      app.ShowMsg("您已取消付款")
      return
    } else if (state == 1) {
      var url = "/pages/payTransfer/payTransfer?type=biaodan"
      wx.redirectTo({
        url: url
      })
    }
  },
  getTitle(e) {
    this.setData({
      positionTitle: e.detail.value
    })
  },
  expectmoneychange(e) {
    var that = this
    var selVal = e.detail.value
    if (selVal.length > 0) {
      that.setData({
        "post.PayUnit": "",
        "post.Pay": 1,
        expectmoneydisable: true
      })

    } else {
      that.setData({
        "post.Pay": 0,
        expectmoneydisable: false
      })
    }
  }
})