const Type = require('./type');
const util = require('../../utils/util.js');
let httpClient = util.httpClient;
let {
  HOST
} = require('../../utils/addr');
let regeneratorRuntime = require('../../utils/runtime');
let WxParse = require('../../utils/wxParse/wxParse.js');
let htmljson = require('../../utils/wxParse/html2json.js');
let uploadimg = require("../../utils/uploadImgenew.js");
let addr = require("../../utils/addr.js");
let app = getApp();
let getPostDetail = (data) => httpClient({
  addr: HOST + 'apiQuery/GetPostDetail',
  data
});
let getCommentList = (data) => httpClient({
  addr: HOST + 'apiQuery/GetComment',
  data
});
let deliverComment = (param) => httpClient({
  addr: HOST + 'apiQuery/AddComment',
  method: 'POST',
  data: param
});

//提示
function tips(content) {
  this.setData({
    content,
    showTips: true
  })
}

//获取评论的参数
function getDeliverParam(commentContent, imageList) {
  let param = {},
    stringObj;
  let {
    comment: {
      parentid,
      comuserid
    }
  } = {
    ...this.data
  };

  stringObj = {
    storeId: this.postid, //店铺ID
    Content: commentContent, //评论内容
    CType: 1
  }

  if (!!parentid && !!comuserid) {
    stringObj.ParentId = parentid;
    stringObj.DirectUserId = comuserid;
  }

  param.comment = JSON.stringify(stringObj);
  if (imageList.length > 0 && !parentid && !comuserid) {
    Reflect.set(param, 'imgs', imageList[0]);
  } else {
    Reflect.set(param, 'imgs', '');
  }

  param.openId = this.openid;
  return param
}

//五条评论
function initCheckCommentStatus(arr) {
  let len = arr.length;
  let newArr = [];
  while (len) {
    --len;
    newArr.push(5);
  }
  return newArr
}

Page({
  data: {
    postInfo: '',
    isShowPrice: false,
    typeName: '',
    advid: "",
    advopen: true,
    init: 0,
    showpath: false,
    focus: false,
    sliderCla: '',
    comment: {
      ctype: 1,
      pageIndex: 1,
      parentid: '', // 父评论
      comuserid: '', // 子评论
      index: '',
      subindex: '',
      commentContent: '',
      placeholder: ''
    },
    commentList: [],
    checkAllCommentArr: [],
    isMore: false,
    //评论
    items: [{
      ruid: 0,
      isShareSuccess: false,
      content: {
        maxImageCount: 1,
        currentmaxImageCount: 1,
        images_full: false,
        imageList: [],
        imageAddUrlList: []
      }
    }],
    isHouseDetail: false, // 房产详情
    isCarDetail: false, // 拼车详情
    isJobWanted: false, // 求职
    isRecuit: false, // 招聘
    shareposterparams: {
      openid: app.globalData.userInfo.openId || '',
      appid: app.globalData.appid || '',
    } //海报参数 2019/7/2
  },
  onShow() {
    this.poster = this.selectComponent("#poster");
  },
  onLoad(options) {
    app.getUserInfo(() => {
      this.cityid = app.globalData.cityInfoId
      this.openid = app.globalData.userInfo.openId

      this.postid = options.id
      this.areacode = app.globalData.areaCode
      this.pageIndex = 0
      app.GetAdv(604, (advid) => {
        this.setData({
          advid: advid,
        })
      })
      this.setData({
        cityName: app.globalData.cityName,
        userAvatar: app.globalData.userInfo.avatarUrl
      })

      this.getPostDetail()
      this.getCommentList()
      if (options.typename == 'pl') {
        this.startComment();
      }
    })
  },

  // 获取发布详情
  async getPostDetail() {
    let {
      post,
      isok,
      msg
    } = await getPostDetail({
      postid: this.postid,
      areacode: this.areacode,
      openId: this.openid
    })
    //2019/07/05  纯属为了海报的两个标题=v=
    let shareposterparams = this.data.shareposterparams
    if (isok) {
      let PTypeId = post.PTypeId
      //  286121 二手买卖 295257 车辆交易
      if (PTypeId == 286121 || PTypeId == 295257) {
        this.setData({
          isShowPrice: true
        })
      }

      // 295252 房产详情
      if (PTypeId == 295252) {
        this.setData({
          isHouseDetail: true
        })
      }

      // 304069 拼车详情
      if (PTypeId == 304069) {
        this.setData({
          isCarDetail: true
        })
      }

      // 招聘详情
      if (PTypeId == 295254) {
        if (post.SaleType == 7) {
          // 招聘
          this.setData({
            isJobWanted: true
          })
        } else {
          // 求职
          this.setData({
            isRecuit: true
          })
        }
      }

      if (post.SaleType) {
        let typeArr = []
        if (PTypeId == 286121) {
          typeArr = [{
            id: 1,
            name: '出售'
          }, {
            id: 2,
            name: '求购'
          }]
        }
        if (PTypeId == 295257) {
          typeArr = [{
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
        }
        if (PTypeId == 295252) {
          typeArr = [{
            id: 4,
            name: '出租'
          }, {
            id: 5,
            name: '求租'
          }, {
            id: 1,
            name: '出售'
          }, {
            id: 2,
            name: '求购'
          }]
        }
        if (PTypeId == 304069) {
          typeArr = [{
            id: 3,
            name: '车找人'
          }, {
            id: 4,
            name: '人找车'
          }, {
            id: 5,
            name: '车找货'
          }, {
            id: 6,
            name: '货找车'
          }]
        }

        for (let item of typeArr) {
          if (item.id == post.SaleType) {
            shareposterparams.houseType = item.name == '出租' || '求租' ? item.name : ''
            this.setData({
              typeName: item.name,
              shareposterparams
            })
          }
        }
      }

      post.Experience = Type.Experience[post.Experience];

      if (!isNaN(post.WorkTime)) {
        post.WorkTime = Type.WorkTime[post.WorkTime];
      }

      // 招聘
      if (this.data.isRecuit) {

        post.AgeRe = Type.Age[post.AgeRe]
        if (post.Floor) {
          post.Floor = post.Floor.split(';');
        }
      }
      if (post.Salary != '面议') {
        post.Salary = post.Salary && post.Salary || '';
      }
      let reg = /<[^<>]+>/g;
      shareposterparams.pname = post.pname
      shareposterparams.Title = post.Title
      shareposterparams.Salary = post.Salary //工资
      shareposterparams.Description = post.Description.replace(reg, '') //描述
      shareposterparams.Description = shareposterparams.Description.replace(/&nbsp;/ig, "")
      shareposterparams.wantedAvatar = post.user.img
      shareposterparams.Floor = post.Floor
      shareposterparams.AreaName = post.Address //地点
      shareposterparams.imgList = [] //商品图

      if (post.DescImgList.length > 0) {
        for (let i = 0; i < post.DescImgList.length; i++) {
          shareposterparams.imgList.push(post.DescImgList[i].filepath)
        }
      }
      this.setData({
        postInfo: post,
        shareposterparams
      })

      wx.setNavigationBarTitle({
        title: post.pname + '详情'
      })

      WxParse.wxParse('Description', 'html', post.Description, this);

    } else {
      app.ShowMsg(msg)
    }

  },

  getMoreComment() {
    this.getCommentList()
  },

  //查看全部评论
  checkAllComment(e) {
    let that = this;
    const {
      index
    } = {
      ...e.currentTarget.dataset
    };
    let {
      checkAllCommentArr
    } = {
      ...that.data
    }
    let comment = checkAllCommentArr[index] === 5 ? 100 : 5;
    that.setData({
      [`checkAllCommentArr[${index}]`]: comment
    })
  },

  // 获取评论
  async getCommentList() {
    let that = this;

    let resp = await getCommentList({
      commentid: this.postid,
      openId: this.openid,
      CType: 1,
      pageSize: 20,
      pageIndex: ++this.pageIndex,
    })

    if (resp.count) {
      resp.obj.forEach((item) => {
        item.ContentHtml = htmljson.html2json(item.ContentHtml, 'commentContent' + item.Id);
        let parentNickName = {};
        if (!!item.SubCommentList && item.SubCommentList.length > 0) {
          item.SubCommentList.forEach((subItem) => {
            Reflect.set(parentNickName, subItem.Id, subItem.NickName)
            subItem.ContentHtml = htmljson.html2json(subItem.ContentHtml, 'commentContent' + subItem.Id);
          })
          Reflect.set(item, 'parentNickName', parentNickName);
        }
      })

      this.setData({
        commentList: [...this.data.commentList, ...resp.obj],
        isMore: resp.more,
        checkAllCommentArr: [...this.data.checkAllCommentArr, ...initCheckCommentStatus(resp.obj)]
      })
    }
  },

  //直接评论
  startComment() {
    let that = this;
    new Promise((resolve, reject) => {
      that.setData({
        sliderCla: 'slideFromDown'
      })
      setTimeout(() => {
        resolve(1)
      }, 100)
    }).then((data) => {
      that.setData({
        focus: true
      })
    }).catch(err => {
      log(err)
    })
  },
  closeadv() {
    this.setData({
      advopen: false
    })
  },

  //隐藏评论框
  endComment() {
    let that = this;
    new Promise((resolve, reject) => {
      that.setData({
        focus: false
      }, () => {
        that.clearCommentStatus();
        resolve(1)
      })
    }).then((data) => {
      that.setData({
        sliderCla: 'slideDown'
      }, () => {
        setTimeout(() => {
          that.setData({
            sliderCla: ''
          })
        }, 360)
      })
    }).catch(err => {
      log(err)
    })
  },

  //图片上传
  chooseImage(parmas) {
    uploadimg.chooseImage(parmas, this);
  },
  clearImage(parmas) {
    uploadimg.clearImage(parmas, this);
  },

  deliver() {
    let that = this;
    let {
      commentList,
      comment: {
        commentContent,
        index,
        comuserid,
        parentid
      },
      items: [{
        content: {
          imageList
        }
      }]
    } = {
      ...this.data
    }
    if ((!index && imageList.length === 0) && commentContent.trim().length === 0) {
      tips.call(that, '请输入评论内容');
      return
    }
    if (!!index && commentContent.trim().length === 0) {
      tips.call(that, '请输入评论内容');
      return
    }

    that.deliverRequest(function () {
      return getDeliverParam.apply(that, [commentContent, imageList]);
    }).then((data) => {
      if (data.result) {
        tips.call(that, '评论成功');
        that.setData({
          loadingAll: true
        }, () => {
          that.setData({
            commentList: []
          })
          that.pageIndex = 0
          that.getCommentList();
        })
      } else {
        app.ShowMsg(data.msg);
      }
    }).catch((err) => {
      tips.call(that, err.msg)
    })
    that.endComment()
  },
  //发表评论请求
  async deliverRequest(fn) {
    let data = await deliverComment(fn());
    return data;
  },

  //取消评论
  cancelComment() {
    let that = this;
    wx.showActionSheet({
      itemList: ['离开'],
      success(res) {
        const {
          tapIndex
        } = {
          ...res
        };
        if (tapIndex === 0) {
          that.endComment()
        }
      }
    })
  },
  //清除评论的状态
  clearCommentStatus() {
    let that = this;
    let {
      comment
    } = {
      ...that.data
    };
    let resetComment = {
      parentid: '',
      comuserid: '',
      index: '',
      subindex: '',
      commentContent: '',
      placeholder: ''
    }
    Reflect.set(resetComment, 'pageIndex', comment.pageIndex);
    Reflect.set(resetComment, 'ctype', comment.ctype);
    that.setData({
      comment: resetComment,
      [`items[${0}].content.imageList`]: [],
      [`items[${0}].content.imageAddUrlList`]: []
    })
  },
  //查看评论图片
  viewCommentPic(e) {
    let commentImage = [];
    const {
      src
    } = {
      ...e.currentTarget.dataset
    }
    commentImage.push(src);
    app.pictureTaps(src, commentImage);
  },
  //查看全部评论
  checkAllComment(e) {
    let that = this;
    const {
      index
    } = {
      ...e.currentTarget.dataset
    };
    let {
      checkAllCommentArr
    } = {
      ...that.data
    }
    let comment = checkAllCommentArr[index] === 5 ? 100 : 5;
    that.setData({
      [`checkAllCommentArr[${index}]`]: comment
    })
  },
  //动态输入
  getComment(e) {
    let that = this;
    let val = e.detail.value.trim();
    that.setData({
      'comment.commentContent': val
    })
  },
  //子评论
  reply(e) {
    let that = this;
    const {
      parentid,
      comuserid,
      index,
      subindex,
      nickname
    } = {
      ...e.currentTarget.dataset
    };
    if (!!comuserid) {
      that.setData({
        'comment.parentid': parentid,
        'comment.comuserid': comuserid,
        'comment.index': index
      })
    } else {
      that.setData({
        'comment.parentid': parentid,
        'comment.index': index
      })
    }
    that.setData({
      'comment.placeholder': nickname
    }, () => {
      that.startComment()
    })
  },
  //拨打电话
  call(e) {
    var that = this
    const {
      postid,
      phone
    } = {
      ...e.currentTarget.dataset
    }
    util.paycallpeple(postid, phone)
  },
  toIndex() {
    app.gotohomepage()
  },
  toMyPublish() {
    util.vzNavigateTo({
      url: '/pages/mypublish/mypublish'
    })
  },
  toPublish() {
    util.vzNavigateTo({
      url: '/pages/addpost/addenter'
    })
  },
  //举报  2019/7/15
  report() {
    const postInfo = this.data.postInfo
    if (app.checkphonewithurl()) {
      app.goNewPage('../detail/shop_report?t=1&postId=' + postInfo.Id + '&typeid=' + postInfo.TypeId)
    }
  },
  onShareAppMessage: function (res) {
    let that = this;
    let path = addr.getCurrentPageUrlWithArgs();
    //设置标题
    let title = that.data.postInfo.Title ? that.data.postInfo.Title : app.globalData.cityName;
    try {
      wx.setStorageSync('needloadcustpage', false)
    } catch (e) {}
    return {
      title: title,
      path: path,
      success: function (res) {}
    }
  },
  //首页
  toIndexPage() {
    app.gotohomepage()
  },
  //个人中心
  goToPersonalCenter() {
    wx.navigateTo({
      url: '/pages/person_center/person_center'
    })
  },
  createPoster() {
    const isHouseDetail = this.data.isHouseDetail, // 房产详情
      isCarDetail = this.data.isCarDetail, // 拼车详情
      isJobWanted = this.data.isJobWanted, // 求职
      isRecuit = this.data.isRecuit // 招聘
    if (isHouseDetail) {
      console.log('房产')
      this.poster.createposter(4)
    } else if (isJobWanted) {
      console.log('求职')
      this.poster.createposter(3)
    } else if (isRecuit) {
      console.log('招聘')
      this.poster.createposter(2)
    } else {
      console.log('其他')

      this.poster.createposter(5)
    }

  }

})