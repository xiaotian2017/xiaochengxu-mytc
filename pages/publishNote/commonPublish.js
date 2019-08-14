let util = require("../../utils/util");
let addr = require("../../utils/addr");
let uploadimg = require("../../utils/uploadImgenew.js");
const regeneratorRuntime = require('../../utils/runtime');
let {
  vzNavigateTo,
  httpClient
} = require("../../utils/util.js");
let app = getApp();
let getAddOrEditPost = (data) => httpClient({
  host: addr.HOST,
  addr: 'apiQuery/GetAddOrEditPost',
  data
});
let savepost = (data) => httpClient({
  host: addr.HOST,
  addr: 'apiQuery/SavePostNew',
  contentType: 'application/json',
  data,
  method: 'POST'
});

Page({
  data: {
    topStatus: false, //选择置顶状态 2019/7/10
    isFree: false, //是否免费发帖 2019/7/11
    phoneNumber: '',
    detailInfo: '',
    uploadimgobjects: {
      // 详情图片
      "detailInfoImage": {
        config: {
          maxImageCount: 9,
          images_full: false,
          imageUpdateList: [], // 编辑时新增的
          imageList: [],
          imageIdList: [] // 用来删除图片
        }
      }
    },
    items: [{
      //求职头像
      item_status: "headimg",
      content: {
        //图片上传
        maxImageCount: 1,
        currentmaxImageCount: 1,
        images_full: false,
        imghidden: true, //上传图片
        imageList: [],
        imageUrlList: [],
        imageIdList: [],
        imageAddUrlList: [],
        icon: 'https://j.vzan.cc/content/city/images/fabu/03.png',
        row: 0,
        imageIdx: 0
      }
    }],
    expectmoneydisable: false,
    postid: 0,
    address: '',
    areaRegion: [],
    areaIdxArr: [0, 0],
    chargeTypeInfoTopList: [],
    price: 0, // 发帖收费和置顶收费的价格        
    setTopIdxArr: [0],
    lat: 0,
    lng: 0,
    typeArr: [],
    typeIdx: 0,
    nickName: '',
    typeList: [], // 房产租售用
    isPublishHouse: false,
    housePrice: '', // 发布房产的价格
    areaSize: '', // 房屋面积
    houseType: '', // 几室几厅
    isMeetTalk: true,
    typeListIdx: null, // 选择房产类型
    positionType: 1, // 求职类型  1 全职 2兼职      
    positionTypeArr: [], // 职位类别数据
    salaryTypeArr: [], // 薪资类别
    positionTypeArrIdx: null, // 位置类别序号
    listEducationArr: [],
    listExperience: [],
    isJobWanted: false,
    salaryTypeArrIdx: null, // 薪资类别序号
    gender: 0, // 性别  0不填，1男，2女
    educationIdx: null, // 学历序号
    experienceIdx: null,
    posterAge: '',
    isShowMore: false,
    posterEmail: '', // 邮箱
    title: '', // 求职标题
    pay: 0,
    payunit: ""
  },
  onLoad(options) {
    app.getUserInfo(() => {
      this.cityid = app.globalData.cityInfoId
      this.openid = app.globalData.userInfo.openId
      this.typeid = options.typeid
      this.stype = options.ctypeid

      if (this.typeid == 295252) {
        // 房产租售                 
        this._stype = options.stype
      }

      this.setData({
        postid: options.postid || 0,
        isWholesale: this.typeid == 304595, // 批发商城
        isIos: app.globalData.isIos
      })
      // 是否是城主
      if (app.globalData.userInfo.iscityowner > 0) {
        this.setData({
          showpath: true,
          isadmin: 1
        })
      }

      wx.setNavigationBarTitle({
        title: "发布详情"
      })

      this.getAddOrEditPost()
      this.initSetting()
    })
  },
  //改变置顶状态 2019/7/10
  changeTopStatus() {
    let topStatus = this.data.topStatus
    this.setData({
      topStatus: !topStatus
    })
  },
  initSetting() {
    // 特殊页面的初始设置
    switch (parseInt(this.typeid)) {
      case 295257: // 车辆交易               
        this.setData({
          typeArr: [{
            id: 1,
            name: '求购'
          }, {
            id: 2,
            name: '出售'
          }, {
            id: 4,
            name: '出租'
          }, {
            id: 5,
            name: '求租'
          }]
        })
        break
      case 286121: // 二手买卖
        this.setData({
          typeArr: [{
            id: 1,
            name: '出售'
          }, {
            id: 2,
            name: '求购'
          }]
        })
        break
        // case 304497:  // 宠物        
        // this.setData({
        //     typeArr: ['赠送', '求领养']
        // })
    }
  },
  // 获取类型
  getType(e) {
    let idx = e.currentTarget.dataset.idx
    this.setData({
      typeIdx: idx
    })
  },
  // 获取初始数据
  async getAddOrEditPost() {
    let _resp = this.editData = (await getAddOrEditPost({
      openid: this.openid,
      cityid: this.cityid,
      typeid: this.typeid,
      stype: this.stype,
      postid: this.data.postid,
      typeversion: '0702' //后台用于区分版本做数据兼容   2019/07/2
    }))

    if (!_resp.Success) {
      wx.showModal({
        title: '提示',
        content: _resp.Message,
        success(res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })
          } else if (res.cancel) {}
        },
        showCancel: false
      })
      return
    }

    let resp = this.editData = _resp.Data

    let isReEdit = this.data.postid > 0 // 重新编辑,隐藏掉置顶和收费

    this.isNeedPay = isReEdit ? false : resp.ChargeTypeInfoList.length // 发帖是否付费
    this.price = this.isNeedPay && resp.ChargeTypeInfoList[0].Price * 10000 / 1000000 || 0
    this.setData({
      areaRegion: [resp.CAreaList, resp.CAreaStreetList],
      chargeTypeInfoTopList: isReEdit ? [] : resp.ChargeTypeInfoTopList,
      price: this.price.toFixed(2),
      typeList: this.typeid == 295252 ? resp.TypeList : [], // 房产租售用
      isPublishHouse: this.typeid == 295252 ? true : false, // 发布房产租售     
      isJobWanted: this.typeid == 295254 ? true : false,
      isFree: resp.IsFree, //2019/7/11 
      PostKey: resp.PostKey
    })
    // 求职
    if (this.typeid == 295254 && this.stype == 7) {
      this.setData({
        positionTypeArr: resp.TypeList,
        salaryTypeArr: resp.listSalary,
        listEducationArr: resp.listEducation,
        listExperience: resp.listExperience
      })
    }
    this.reEdit()
  },
  reEdit() {
    // 特殊分类项目的回填
    let {
      Post: post,
      Post: {
        Address: address,
        LinkMan: linkMan,
        SaleType: saleType
      },
      DescImgList: descImgList
    } = this.editData
    let {
      areaRegion
    } = this.data
    this.setData({
      phoneNumber: post.LinkPhone,
      detailInfo: post.Description,
      address: address && address != 'null' && address || '',
      // 批发商城有联系人这个待填选项
      nickName: this.typeid == 304595 ? linkMan : ''
    })

    if (saleType) {
      for (let [idx, item] of this.data.typeArr.entries()) {
        if (saleType == item.id) {
          this.setData({
            typeIdx: idx
          })
          break
        }
      }
    }

    areaRegion[1].forEach((v, i) => {
      if (v.Code == post.StreetId) {
        this.setData({
          'areaIdxArr[1]': i
        })
      }
    })
    areaRegion[0].forEach((v, i) => {
      if (v.Code == post.AreaId) {
        this.setData({
          'areaIdxArr[0]': i
        })
      }
    })
    // 房产编辑回填   
    if (this.data.isPublishHouse) {
      for (let [idx, item] of this.data.typeList.entries()) {
        if (item.Id == post.TypeId) {
          this.setData({
            typeListIdx: idx
          })
          this.typeid = this.data.typeList[idx].Id
          break
        }
      }

      this.setData({
        areaSize: !parseFloat(post.AreaSize) ? '' : parseFloat(post.AreaSize),
        houseType: post.HouseType,
        housePrice: post.Price > 0 ? post.Price : ''
      })

      if (post.Price > 0) {
        this.setData({
          isMeetTalk: false
        })
      }
    }

    // 求职编辑回填 
    // 区分是重新编辑还是发布
    if (this.data.isJobWanted && this.data.postid) {
      let birthday = util.GetDateTime(post.Birthday);
      let today = +new Date();

      for (let [idx, item] of this.data.positionTypeArr.entries()) {
        if (item.Id == post.TypeId) {
          this.setData({
            positionTypeArrIdx: idx
          })
          break
        }
      }

      this.setData({
        'items[0].content.imageList[0]': post.ImgUrl,
        experienceIdx: post.Experience && post.Experience - 1 || null,
        posterEmail: post.LinkEmail && post.LinkEmail != 'undefined' && post.LinkEmail || '',
        educationIdx: post.WorkTime && post.WorkTime - 1 || null,
        gender: post.Gender,
        salaryTypeArrIdx: post.Salary && post.Salary - 1 || null,
        posterAge: new Date(today).getFullYear() - new Date(birthday).getFullYear() ? new Date(today).getFullYear() - new Date(birthday).getFullYear() : '',
        nickName: post.LinkMan,
        positionType: post.PositionType,
        title: post.Title,
        pay: post.Pay,
        payunit: post.PayUnit

      })
    }

    if (descImgList && descImgList.length > 0) {
      let convertList = [];
      let imgids = [];
      descImgList.forEach((v) => {
        convertList.push(v.filepath)
        imgids.push(v.id);
      })
      this.setData({
        'uploadimgobjects.detailInfoImage.config.imageList': convertList,
        'uploadimgobjects.detailInfoImage.config.imageIdList': imgids,
      })
    }
  },
  // 获取地址
  areaPickerChange(e) {
    let val = e.detail.value
    this.setData({
      areaIdxArr: val
    })
    console.log(val)
  },
  chooseLocationByWx() {
    let that = this
    wx.chooseLocation({
      success(res) {
        that.setData({
          address: res.address,
          lat: res.latitude,
          lng: res.longitude
        })
      },
      fail() {
        app.showMsg('获取地址失败,可以手动输入地址,或者重试!')
      }
    })
  },
  // 选择置顶
  chargePickerChange(e) {
    let val = e.detail.value
    let setTopPrice = 0
    let setTopChargeObj = this.data.chargeTypeInfoTopList[val]
    if (setTopChargeObj.id) {
      let idx = setTopChargeObj.name.indexOf('元')
      setTopPrice = parseFloat(setTopChargeObj.name.substring(0, idx))
      this.setData({
        price: (this.price + setTopPrice).toFixed(2)
      })
    } else {
      this.setData({
        price: this.price
      })
    }

    this.setData({
      'setTopIdxArr[0]': val,
    })
  },
  getPhoneNumber(e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },
  autoFillPhoneNumber: function (e) {
    this.setData({
      phoneNumber: app.globalData.userInfo.TelePhone
    })
  },
  getDetailInfo(e) {
    this.setData({
      detailInfo: e.detail.value
    })
  },
  getAddress(e) {
    this.setData({
      address: e.detail.value
    })
  },
  uploadLogoImg(e) {
    uploadimg.shopChooseImage(e, this);
  },
  clearImage(e) {
    uploadimg.shopclearImage(e, this);
  },
  getLinkMan(e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  checkInput() {
    if (!this.data.phoneNumber.trim()) {
      app.ShowMsg('请输入正确的电话号码!')
      return
    }

    if (!this.data.detailInfo.trim()) {
      app.ShowMsg('请输入详细信息!')
      return
    }

    if (this.data.isWholesale || this.data.isJobWanted) {
      if (!this.data.nickName.trim()) {
        app.ShowMsg('请输入联系人!')
        return
      }
    }

    if (this.data.isPublishHouse) {
      if (this.data.typeListIdx === null) {
        app.ShowMsg('请选择类型')
        return
      }
    }

    if (this.data.isJobWanted) {
      if (this.data.payunit === '' && 0 == this.data.pay) {
        app.ShowMsg('请选择薪资待遇')
        return
      }
      if (this.data.positionTypeArrIdx === null) {
        app.ShowMsg('请选择职位类别')
        return
      }
    }
    return true
  },

  async submitNote() {
    const _this = this //2019/7/13 不会影响原来的this
    const topStatus = _this.data.topStatus
    if (this.checkInput()) {
      let {
        isMeetTalk,
        isPublishHouse,
        houseType,
        areaSize,
        housePrice,
        typeArr,
        typeIdx,
        chargeTypeInfoTopList,
        setTopIdxArr,
        price,
        postid,
        areaRegion,
        detailInfo,
        areaIdxArr,
        address,
        lat,
        lng,
        phoneNumber,
        uploadimgobjects: {
          detailInfoImage: {
            config: {
              imageList,
              imageUpdateList
            }
          }
        }
      } = this.data
      let params = {
        PostKey: this.data.PostKey, //2019/7/13
        Id: postid,
        openid: this.openid,
        // cityid: this.cityid,
        CityInfoId: this.cityid,
        // isEncryption: false,//2019/7/13
        CityCode: areaRegion[0][0].ParentCode,
        CitySubId: 0,
        TypeId: this.typeid, // 发布房产租售是类型id 
        // stype: this.stype,  //2019/7/13
        ImgUrl: '',
        // ImageCount: 0,//2019/7/13
        ImageIds: '',
        lat: lat,
        lng: lng,
        Title: '',
        // Price: housePrice ? housePrice : '', //2019/7/13
        Price: 0, //2019/7/13
        LinkMan: this.data.isWholesale || this.data.isJobWanted ? this.data.nickName : '',
        LinkPhone: phoneNumber,
        AreaId: areaRegion[0][areaIdxArr[0]].Code,
        StreetId: areaRegion[1][areaIdxArr[1]].Code,
        Address: address,
        Description: detailInfo,
        descimglist: postid == 0 ? imageList.join() : imageUpdateList.join(),
        // Payamout: 0, //2019/7/13
        // isneedpay: price > 0 ? 1 : 0,
        // Integration: 0,//2019/7/13
        // paySurplus: 0, //2019/7/13
        IsTop: _this.data.topStatus, // 是否置顶, // 2019/7/15
        // top_hours: setTopIdxArr[0] > 0 ? chargeTypeInfoTopList[setTopIdxArr[0]].name : '', // 置顶时长 //2019/7/13
        SaleType: typeArr.length ? typeArr[typeIdx].id : 0,
        Pay: this.data.pay,
        PayUnit: this.data.payunit
      }
      // 发布房产
      if (this.data.isPublishHouse) {
        params.AreaSize = areaSize ? areaSize * 100000 / 1000 : ''
        params.HouseType = houseType ? houseType : ''
        params.IdentityType = 2 // IdentityType 个人是2 区分中介     
        params.SaleType = this.stype // 子类型
        if (isMeetTalk) {
          params.MeetTalk = 'on'
        }
        // params.TypeId =  // 做获取id   //2019/7/13
        // if (this._stype != 'undefined') {
        //   params.stype = this._stype
        // }
      }

      // 发布求职
      if (this.data.isJobWanted) {
        let today = new Date();
        params.LinkEmail = this.data.poseterEmail ? this.data.poseterEmail : ''
        // 类型选择判断 
        params.TypeId = this.data.positionTypeArr[this.data.positionTypeArrIdx].Id
        params.Salary = parseInt(this.data.salaryTypeArrIdx) + 1
        params.Gender = this.data.gender ? this.data.gender : 0 //2019/7/13
        // // 还差年龄区间判断
        params.Birthday = ((today.getFullYear() - this.data.posterAge) + "-" + (today.getMonth() + 1) + "-" + today.getDate())
        // params.WorkTime = this.data.educationIdx !== null ? parseInt(this.data.educationIdx) + 1 : ''  //2019/7/13
        // params.Experience = this.data.experienceIdx !== null ? parseInt(this.data.experienceIdx) + 1 : '' //2019/7/13
        params.PositionType = this.data.positionType
        let imgSelfitems = this.data.items[0].content.imageList
        if (imgSelfitems.length > 0) {
          params.ImgUrl = imgSelfitems[imgSelfitems.length - 1]
        }
        params.SaleType = 7 // 发布求职必须传这个 区分招聘    

        if (!this.data.title.trim()) {
          app.ShowMsg('请填写求职标题')
          return
        }
        params.Title = this.data.title
      }
      params.payType
      let resp = await savepost(params)
      console.log(resp)
      if (resp.code == 1) {
        const payType = Number(resp.data.payType)
        const post = resp.data.post
        const PostKey = _this.data.PostKey
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
        if (resp.Message == "请不要重复提交") {
          let msg = '请不要重复提交，可到“我的”-我的发布继续支付。点确定跳转到【我的发布】页面'
          let url = '/pages/mypublish/mypublish'
          app.ShowMsgAndUrl(msg, url)
          return
        }
        app.ShowMsg(resp.msg)
      }
    }

  },

  checkPayType() {

    // 只是置顶
    if (this.data.setTopIdxArr[0] > 0 && !this.isNeedPay) {
      this.paytype = 201
      this.remark = '帖子置顶'
      return
    }
    // 发帖付费并置顶
    if (this.data.setTopIdxArr[0] > 0 && this.isNeedPay) {
      this.paytype = 210
      this.remark = '帖子付费置顶'
      return
    }
    // 只是发帖付费
    this.paytype = 200
    this.remark = '分类信息发帖收费'
  },


  vzPay(postid) {
    this.checkPayType()
    console.log(this.data.setTopIdxArr, this.data.chargeTypeInfoTopList)
    let param = {
      cityid: app.globalData.cityInfoId,
      itemid: postid,
      paytype: this.paytype,
      extype: this.data.setTopIdxArr[0] > 0 ? this.data.chargeTypeInfoTopList[this.data.setTopIdxArr[0]].id : 1,
      chargeId: this.data.setTopIdxArr[0] > 0 ? (this.data.chargeTypeInfoTopList[this.data.setTopIdxArr[0]].cid || 0) : 0,
      extime: 1,
      openId: app.globalData.userInfo.openId,
      quantity: 0,
      areacode: app.globalData.areaCode,
      remark: this.remark,
    }
    console.log('我在支付')
    console.log(param)
    util.AddOrder(param, this.refun)
  },
  //付款成功后回调
  refun(param, state) {
    if (state == 0) {
      let msg = '您已取消付款，可到“我的”-我的发布继续支付。点确定跳转到【我的发布】页面'
      let url = '/pages/mypublish/mypublish'
      app.ShowMsgAndUrl(msg, url)
      return
    } else if (state == 1) {
      let url = "/pages/payTransfer/payTransfer?type=biaodan"
      wx.redirectTo({
        url: url
      })
    }
  },
  hiddenTips() {
    util.ShowPath(addr.getCurrentPageUrlWithArgs())
  },
  // 获取房产发布的价格
  getPrice(e) {
    this.setData({
      housePrice: e.detail.value
    })
  },
  // 获取房产发布的面积
  getAreaSize(e) {
    this.setData({
      areaSize: e.detail.value
    })
  },
  // 几室几厅
  getHouseType(e) {
    this.setData({
      houseType: e.detail.value
    })
  },
  // 是否面议
  getMeetTalk() {
    this.setData({
      isMeetTalk: !this.data.isMeetTalk
    })
    if (this.data.isMeetTalk) {
      this.setData({
        housePrice: ''
      })
    }
  },
  // 选择发布房产的类型
  selectType(e) {
    this.setData({
      typeListIdx: e.detail.value,
    })
    this.typeid = this.data.typeList[e.detail.value].Id
  },
  // 发布求职
  getPositionType(e) {
    this.setData({
      positionType: e.currentTarget.dataset.val
    })
  },
  getEmail(e) {
    this.setData({
      poseterEmail: e.detail.value
    })
  },
  selectPositionType(e) {
    this.setData({
      positionTypeArrIdx: e.detail.value
    })
  },
  selectSalaryType(e) {
    this.setData({
      salaryTypeArrIdx: e.detail.value
    })
  },
  getGender(e) {
    this.setData({
      gender: e.currentTarget.dataset.gender
    })
  },
  getAge(e) {
    this.setData({
      posterAge: e.detail.value
    })
  },
  selectEducationType(e) {
    this.setData({
      educationIdx: e.detail.value
    })
  },
  selectExperienceType(e) {
    this.setData({
      experienceIdx: e.detail.value
    })
  },
  showMoreData() {
    this.setData({
      isShowMore: !this.data.isShowMore
    })
  },
  chooseImage(e) {
    var row = e.currentTarget.dataset.row
    uploadimg.chooseImage(e, this, row);
  },
  getTitle(e) {
    this.setData({
      title: e.detail.value

    })
  },
  expectmoneychange(e) {
    var that = this
    var selVal = e.detail.value
    if (selVal.length > 0) {
      that.setData({
        payunit: "",
        pay: 1,
        expectmoneydisable: true
      })

    } else {
      that.setData({
        pay: 0,
        expectmoneydisable: false
      })

    }
  },
  inputPayUnit: function (e) {
    var val = e.detail.value;
    this.setData({
      payunit: val
    })
  },
  areaPickerChange(e) {
    let val = e.detail.value
    this.setData({
      areaIdxArr: val
    })
  },

  bindRegionPickerColumnChange(e) {

    if (e.detail.column == 0) {
      var that = this;
      var code = that.data.areaRegion[0][e.detail.value].Code
      var multiIndex = that.data.areaIdxArr
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
          multiIndex[1] = 0
          if (res.data.Success) {
            that.setData({
              "areaRegion[1]": res.data.Data.list,
              areaIdxArr: multiIndex
            });
          }
        }
      })
    }
  },
})