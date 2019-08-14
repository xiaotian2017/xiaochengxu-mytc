var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var app = getApp();
var cell;
var c_enum;
var marginleft = 0; //距离左边距
var itemwidth = 100;
var option;
var timer;
Page({
  data: {
    currenttab: 0, //tabIndex
    buyversion: 1,
    showallbtns: {},
    showpath: true, //是否显示侧边栏
    opentop: 1, //开启置顶总开关
    newposts: [
      [],
      []
    ], //帖子
    havemore: [true, true], //加载更多
    isloadData: [false, false], //是否加载中
    pageIndex: 1, //页码
    PageSize: 10,
    index: 0,
    startime: '',
    issubmit: 0, //是否操作中
    imgresouces: "https://j.vzan.cc/content/city/images/tongcheng-new-02.png",
    tongcheng_new_02: "",
    tc_icon: "",
    icon04: "",
    tongcheng_01: "",
    isIos: false

  },

  // tab切换 2019/7//11
  tab(e) {
    const tabIndex = e.currentTarget.dataset.tabindex
    const currenttab = this.data.currenttab
    if (tabIndex == currenttab) return false
    this.setData({
      currenttab: tabIndex
    })
    switch (Number(tabIndex)) { //如果长度不为0，切换不请求，刷新通过下拉或者上拉加载更多
      case 0:
        if (this.data.newposts[0].length == 0) {
          this.inite()
        }
        break;
      case 1:
        if (this.data.newposts[1].length == 0) {
          this.inite()
        }
        break;
      default:
    }
  },
  //更多点击 2019/7/12
  more(e) {
    const state = e.currentTarget.dataset.state,
      index = e.currentTarget.dataset.index,
      currenttab = Number(this.data.currenttab),
      newposts = this.data.newposts
    //先重置按钮的显示
    for (let i = 0; i < newposts[currenttab].length; i++) {
      newposts[currenttab][i].showMoreBtn = false
    }
    newposts[currenttab][index].showMoreBtn = true
    this.setData({
      newposts
    })
  },
  //隐藏更多 //2019/7/13
  hiddenMore() {
    const {
      currenttab,
      newposts
    } = this.data
    for (let i = 0; i < newposts[currenttab].length; i++) {
      newposts[currenttab][i].showMoreBtn = false
    }
    this.setData({
      newposts
    })
  },
  //获取我的发布  2019/7/11 添加头条数据处理，没有优化写法
  GetMyPublish(pageIndex) {
    var that = this;
    var currentData = this.data
    var PageSize = that.data.PageSize
    const currenttab = Number(that.data.currenttab), //当前的tab下标
      havemore = that.data.havemore,
      isloadData = that.data.isloadData
    util.showNavigationBarLoading()
    //我的发布列表
    wx.request({
      // url: addr.Address.GetMyPublish,
      url: addr.Address.GetMyPost,
      data: {
        OpenId: app.globalData.userInfo.openId,
        CityInfoId: app.globalData.cityInfoId,
        PageIndex: pageIndex,
        PageSize: PageSize,
        isHead: currenttab //头条区分的参数
      },
      method: "GET",
      header: {
        'content-type': "application/json"
      },
      //下拉刷新 
      success: function (res) {
        console.log(res)
        if (res.data.code == 1) {
          var data = that.data.newposts,
            postlist = res.data.data.list
          var thisTabHas = postlist == null ? false : postlist.length == PageSize
          if (!!postlist && postlist.length > 0) {
            for (let i = 0; i < postlist.length; i++) {
              postlist[i].showMoreBtn = false
              if (postlist[i].State == 0 || postlist[i].State == 1 || postlist[i].State == -3) {
                postlist[i].showMore = true
              } else {
                postlist[i].showMore = false
              }

            }
            data[currenttab].push.apply(data[currenttab], postlist)
            havemore[currenttab] = thisTabHas
            that.setData({
              newposts: data,
              havemore: havemore
            })
            that.data.pageIndex = pageIndex
          } else {
            let havemore = that.data.havemore
            havemore[currenttab] = false
            that.setData({
              havemore: havemore
            })
          }
        }

      },
      fail: function (e) {
        that.data.isloadData = false //没意义，没setdATA
        wx.showToast({
          title: '获取我的发布出错',
        })
        console.log(e)
      },
      complete: function () {
        that.data.isloadData = false //没意义，没setdATA
        wx.stopPullDownRefresh()
        util.hideNavigationBarLoading()

      }
    })
  },
  //点击进详情
  bottomItemClick: function (params) {
    console.log(app.globalData.cityExpired)
    if (app.globalData.cityExpired) {
      app.goNewPage('/pages/expirePage/expirePage')
      return
    }
    let that = this
    let state = that.data.state

    if (that.data.issubmit == 1) {
      return
    }
    console.log(params.currentTarget.dataset)
    if (params.currentTarget.dataset.state == 0) {
      app.ShowMsg('该帖子需要管理员审核，请耐心等待')
      return
    }
    if (params.currentTarget.dataset.state == '-3') {
      app.ShowMsg('该帖子尚未付款，请先完成付款')
      return
    }

    that.data.issubmit = 1
    var id = params.currentTarget.dataset.id
    var url = '../publishNote/noteDetail?id=' + id
    app.goNewPage(url)
  },
  onLoad: function (options) {
    option = options
    var that = this
    //获取用户信息
    app.getUserInfo(function () {
      if (app.globalData.userInfo.iscityowner > 0) {
        that.setData({
          showpath: false
        })
      }
      that.setData({
        buyversion: app.globalData.buyVersion,
        tongcheng_new_02: app.imgresouces.tongcheng_new_02,
        tongcheng_01: app.imgresouces.tongcheng_01,
        tc_icon: app.imgresouces.tc_icon,
        icon04: app.imgresouces.icon04,
        isIos: app.globalData.isIos
      })
      that.inite(that.options)
    })


  },
  hiddenTips: function () {
    var path = "pages/mypublish/mypublish"
    util.ShowPath(path)
  },
  //初始化
  inite: function (options) {
    c_enum = app.C_Enum
    // app.globalData.userInfo = { IsValidTelePhone: 0 }
    // 页面显示
    var that = this
    var time = new Date()
    var starttime = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate()
    //获取系统信息。
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderHeight: res.windowHeight,
        });
      }
    });
    that.setData({
      newposts: [
        [],
        []
      ], //帖子
      havemore: [true, true], //加载更多
      isloadData: [false, false],
      pageIndex: 1, //页码
      PageSize: 10,
      issubmit: 0, //是否操作中
      startime: starttime,
    })

    var names = app.globalData.content;
    //我的发布帖子列表
    that.GetMyPublish(that.data.pageIndex)
  },

  onShow: function (params) {
    this.data.issubmit = 0
    if (params == 'reload') {
      this.inite()
    } else if (params == 0) {
      this.setData({
        sliderOffset: 207,
        activeIndex: params,
      })
    }
  },
  onUnload: function () {
    // 页面关闭
    if (timer > 0) {
      clearTimeout(timer)
      timer = 0
    }
  },

  toast: function (e) {
    wx.navigateTo({
      url: '../choose_city/choose_city',
    })
  },

  //上拉加载更多 2019/7/11写成二维数组写法
  onReachBottom: function (e) {
    let {
      isloadData,
      havemore,
      currenttab
    } = this.data
    currenttab = Number(currenttab)
    console.log(isloadData, havemore, currenttab)
    if (!isloadData[currenttab] && havemore[currenttab]) {
      // isloadData[currenttab] = true  //原写法没有setdata 
      this.GetMyPublish(this.data.pageIndex + 1)
    }

  },

  bindKeyInput: function (e) {
    this.data.sousuovalue = e.detail.value
  },
  //点击放大图片
  pictureTap: function (e) {
    var id = e.currentTarget.dataset.id;
    var url = e.currentTarget.dataset.src;
    var postlist = this.data.newposts
    if (postlist.length > 0 && id > 0) {
      var item = postlist.filter(f => f.Id == id)
      if (item != undefined && item.length > 0 && item[0].ImgList.length > 0) {
        var urls = item[0].ImgList.map(m => m.FileFullUrl)
        app.pictureTaps(url, urls)
      }
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    //app.globalData.areaCode = 110107
    this.inite(option)
    wx.stopPullDownRefresh()
  },
  //时间选择
  ListenerPickerSelected: function (e) {
    var value = e.detail.value
    var postid = e.currentTarget.dataset.id

    var extime = util.timeDiff(new Date(value), new Date(this.data.startime))
    if (extime[0] > 0) {
      var param = {
        itemid: postid,
        paytype: 201,
        extype: 2,
        extime: extime[0],
        openId: app.globalData.userInfo.openId,
        quantity: 0,
        areacode: app.globalData.areaCode,
      }
      var url = "../mypublish/mypublish"
      util.AddOrder(param, url, 0)
      // this.AddOrder(extime[0], postid, app.globalData.userInfo.openId)
    }
  },

  //继续付款
  continuepostpay: function (e) {
    if (app.globalData.cityExpired) {
      app.goNewPage('/pages/expirePage/expirePage')
      return
    }
    if (this.data.issubmit == 1) {
      return
    }
    this.data.issubmit = 1
    var postid = e.currentTarget.dataset.postid
    var istop = e.currentTarget.dataset.top
    postid > 0 ? this.checkcontinuepostpay(postid, istop) : app.ShowMsg("帖子id不能小于0")
  },
  checkcontinuepostpay: function (postid, istop = 0) {
    var that = this
    wx.request({
      url: addr.Address.continuepostpay,
      data: {
        postid: postid,
        istop: istop
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.isok) {

          var post = JSON.stringify(res.data.data)
          app.goNewPage("/pages/pay/pay?post=" + post)
        } else {
          app.ShowMsg(res.data.msg)
        }
      }
    })
  },
  //编辑
  editpost: function (e) {
    if (app.globalData.cityExpired) {
      app.goNewPage('/pages/expirePage/expirePage')
      return
    }
    if (this.data.issubmit == 1) {
      return
    }
    this.data.issubmit = 1
    var typeid = e.currentTarget.dataset.typeid
    var ctypeid = e.currentTarget.dataset.ctypeid
    console.log(ctypeid)
    var postid = e.currentTarget.dataset.id
    //求职招聘
    if (typeid == 295255 || (typeid == 295254 && ctypeid != 7)) {
      var url = "../publishmix/p_recuit?typeid=" + typeid + "&postid=" + postid

    } else if ((typeid == 295254 && ctypeid == 7)) {
      var url = "/pages/publishNote/commonPublish?typeid=" + typeid + "&ctypeid=" + ctypeid + "&postid=" + postid
    } else {
      var ctypeid = e.currentTarget.dataset.ctypeid
      var url = "/pages/publishNote/commonPublish?typeid=" + typeid + "&ctypeid=" + ctypeid + "&postid=" + postid + "&hidden=1"
    }
    app.goNewPage(url)

  },
  //删除帖子
  delpost: function (e) {
    if (this.data.issubmit == 1) {
      return
    }
    this.data.issubmit = 1
    var postid = e.currentTarget.dataset.id
    if (postid <= 0) {
      app.ShowMsg("帖子异常，请刷新重试")
    } else {
      var that = this
      wx.showModal({
        title: '提示',
        content: '删除后将不可恢复，是否需要删除？',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: addr.Address.delpost,
              data: {
                openId: app.globalData.userInfo.openId,
                postid: postid,
                action: 'delpost',
                reason: ''
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                that.data.issubmit = 0
                app.ShowMsg(res.data.msg)
                that.inite(option)
                that.hiddenMore()
              }
            })
          } else {
            that.data.issubmit = 0
          }
        }
      })
    }
  },
  //刷新帖子
  refreshpost: function (e) {
    if (app.globalData.cityExpired) {
      app.goNewPage('/pages/expirePage/expirePage')
      return
    }
    var postid = e.currentTarget.dataset.id
    var that = this;
    var msg = "你确认要刷新该帖子吗？";
    wx.showLoading({
      title: '等待服务器...',
    })
    wx.request({
      url: addr.Address.RefreshPost,
      data: {
        openid: app.globalData.userInfo.openId,
        postid: postid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var rdata = res.data;
        wx.hideLoading();
        if (!rdata.isok) {
          if (rdata.dataObj == -999) {
            var param = {
              itemid: postid,
              paytype: 211,
              extype: 1,
              extime: 1,
              openId: app.globalData.userInfo.openId,
              quantity: 0,
              areacode: app.globalData.areaCode,
            }
            util.AddOrder(param, that.refun)
          } else {

            app.ShowMsg(rdata.Msg);
            return;
          }

        } else if (rdata.isok) {
          app.ShowMsg("刷新成功！一键置顶长期保持优先曝光，省时省心")
        }

      }
    })
  },
  //付款成功后回调
  refun: function (param, state) {
    this.data.issubmit = 0
    if (state == 0) {
      var msg = '您已取消付款，一键置顶长期保持优先曝光，省时省心'
      app.ShowMsg(msg)
    } else {
      this.inite(this.options)
    }
  },
  showall: function (params) {
    var that = this;
    var state = params.currentTarget.dataset.state;
    var btnState = (state == 1 ? true : false);

    var domname = params.currentTarget.dataset.domname;
    var btns = that.data.showallbtns;
    btns[domname] = {
      open: btnState
    };
    that.setData({
      showallbtns: btns
    });

  },
  bottomnavswitch: function (e) {
    var path = e.currentTarget.dataset.url
    wx.reLaunch({
      url: path,
    })
  },
  setStatus(e) {
    let that = this
    let {
      state
    } = {
      ...that.data
    }
    let {
      status
    } = {
      ...e.currentTarget.dataset
    }
    if (Object.is(state, undefined)) {
      this.setData({
        state: status
      })
    }
  },
  //投诉 2019/7/15
  goSuggest(e) {
    const typeid = e.currentTarget.dataset.typeid,
      postid = e.currentTarget.dataset.postid
    wx.navigateTo({
      url: '/pages/detail/shop_report?typeid=' + typeid + '&postId=' + postid + "&t=1"
    })
  },
  //置顶 2019/7/15
  goZD(e) {
    const postid = e.currentTarget.dataset.id,
      index = e.currentTarget.dataset.index,
      newposts = this.data.newposts,
      currenttab = this.data.currenttab,
      post = JSON.stringify(newposts[currenttab][index])
    wx.redirectTo({
      url: "/pages/postNav/continueServer/continueServer?postid=" + postid + "&payType=201" + "&isReNew=false" + "&post=" + post
    })
  },
  //续费 2019/7/15
  addPay: function (e) {
    const postid = e.currentTarget.dataset.postid,
      index = e.currentTarget.dataset.index,
      newposts = this.data.newposts,
      currenttab = this.data.currenttab,
      post = JSON.stringify(newposts[currenttab][index])
    wx.navigateTo({
      url: '/pages/postNav/continueServer/continueServer?postid=' + postid + "&post=" + post + '&payType=200'
    })
  },
})