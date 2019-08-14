const Type = require('./type');
const util = require('../../utils/util.js');
let httpClient = util.httpClient;
let {HOST} = require('../../utils/addr');
let regeneratorRuntime = require('../../utils/runtime');
let WxParse = require('../../utils/wxParse/wxParse.js');
let htmljson = require('../../utils/wxParse/html2json.js');
let uploadimg = require("../../utils/uploadImgenew.js");
let addr = require("../../utils/addr.js");
let app = getApp();
let log = console.log.bind('console');

//提示
function tips(content){
    this.setData({
        content,
        showTips:true
    })
}

//图片预览
function pictureTaps(url,urls){
  try {
      wx.setStorageSync('needloadcustpage', false)
  }
  catch (e) {
  }
  wx.previewImage({
      current: url,
      urls: urls
  })
}

function pushItem(arr,obj){
  arr.push(obj);
  return arr
}

function deleteItem(arr,index){  
  return arr.splice(index,1)
}

function getDelelteNum(arrNum,arr){
  arrNum.forEach(val => {
      deleteItem(arr,val)
  });
  return arr
}

function getArr(arr,obj){
  return function(...args){
      arr = pushItem(arr,obj);
      let newArr = [];
      Array.from(args).forEach((key) => {
          if(isFinite(key) && Object.prototype.toString.call(key) === '[object Number]'){
              newArr = pushItem(newArr,key);
          }
      })
      return newArr.length > 0 ? getDelelteNum(newArr,arr):false
  }
}
//设置帖子标题
function setTitle(post){
  if(post.PTypeId == 295254){
    post.pname = post.SaleType != 7 ? '招聘':'求职'
  }
  wx.setNavigationBarTitle({
    title:post.pname + '详情'
  })
}
//获取帖子参数
function getPostParam(postid){
    let param = {
        areacode:app.globalData.areaCode,
        openId:app.globalData.userInfo.openId
    };
    Reflect.set(param,'postid',postid);
    return function(){
        return param
    }
}
//拼车
function getCarpool(arr,post){
    arr.forEach((key,index) => {
      switch(index){
          case 0:
              Reflect.set(key,'val',Type.CarpoolType[post.IdentityType]);
          break;
          case 1:
              Reflect.set(key,'val',post.startPoint)
          break;
          case 2:
              Reflect.set(key,'val',post.endPoint)
          break;
          case 3:
              Reflect.set(key,'val',post.WorkTime)
          break;
          case 4:
              Reflect.set(key,'val',post.LinkPhone)
          break;
          case 5:
              post.IdentityType == 6?Reflect.set(key,'val', post.Number + 'kg'):Reflect.set(key,'val',!!post.carPlate?post.carPlate:'')
          break;
          case 6:
              Reflect.set(key,'val',post.Number+'空位')
        }
    })
    return arr;
}
//房产
function getHouse(post){
    Reflect.set(Type.House[0],'val',post.HouseType)
    Reflect.set(Type.House[1],'val',parseInt(post.AreaSize))
    Reflect.set(Type.House[2],'val',post.TypeName)
    return Type.House
}
//导航
function openLocation(post){
  wx.getLocation({
    type: 'gcj02',
    success: function(res){
      wx.openLocation({
        latitude:parseInt(post.AgeQ),
        longitude:parseInt(post.AgeRe),
        scale: 28
      })
    }
  })
}
//获取评论的参数
function getDeliverParam(commentContent,imageList){
    let param = {},stringObj;
    let {options:{id},comment:{parentid,comuserid}}= {...this.data};
    stringObj = {
        storeId:id, //店铺ID
        Content:commentContent, //评论内容
        CType:1
    }
    if(!!parentid && !!comuserid){
        stringObj.ParentId = parentid;
        stringObj.DirectUserId = comuserid;
    }
    param.comment = JSON.stringify(stringObj);
    if(imageList.length > 0 && !parentid && !comuserid){
        Reflect.set(param,'imgs',imageList[0]);
    }else{
        Reflect.set(param,'imgs','');
    }
    param.openId = this.openId;
    return param
}
//五条评论
function initCheckCommentStatus(arr){
    let len = arr.length;
    let newArr = [];
    while(len){
        --len;
        newArr.push(5);
    }
    return newArr
}
//请求
let getPostDetail = (param) => httpClient({addr:HOST + 'apiQuery/GetPostDetail',data:param});
let getCommentList = (param) => httpClient({addr:HOST + 'apiQuery/GetComment',data:param});
let deliverComment = (param) => httpClient({addr:HOST + 'apiQuery/AddComment',method:'POST',data:param});

Page({
  data: {
    buyversion:0,
    advid: "",
    advopen: true,
    init:0,
    showpath: false,
    focus:false,
    sliderCla:'',
    comment:{
        ctype: 1,
        pageIndex:1,
        parentid:'', //父评论
        comuserid:'',//子评论
        index:'',
        subindex:'',
        commentContent:'',
        placeholder:''
    },
    commentList:[],
    checkAllCommentArr:[],
    loadingAll:true,
    loadingError:true,
    isLoading:true,
    //评论
    items: [{
        // 红包相关参数
        ruid: 0,
        isShareSuccess: false,
        content:{
            maxImageCount: 1,
            currentmaxImageCount: 1,
            images_full: false,
            imageList: [],
            imageAddUrlList: []
        }
    }],
  },
  onLoad(options){
      let that = this;
      app.getUserInfo((userInfo) => {
        if (app.globalData.userInfo.iscityowner >0) {
            that.setData({
                showpath: true
            })
        }
        that.setData({buyversion: app.globalData.buyVersion,})
        app.GetAdv(604, function (advid) {
          that.setData({ advid: advid, })
        })
        let postid = options.id,
            state = options.state;
        if(state != -3){
            that.cityId = app.globalData.cityInfoId;
            that.openId = app.globalData.userInfo.openId;
            that.setData({
                options,
                storeId: postid,
                cityName:app.globalData.cityName,
                userAvatar:app.globalData.userInfo.avatarUrl,
                // redPackageParams: {
                //     itemId: postid,
                //     redtype: 8,
                //     storeid: app.globalData.userInfo.Id,
                //     cityid: app.globalData.cityInfoId,
                //     openId: app.globalData.userInfo.openId,
                //     userlat: app.globalData.userlat,
                //     userlng: app.globalData.userlng,
                //     ruid: options.ruid && options.ruid,  // 从分享进来得参数
                //     uid: app.globalData.userInfo.Id
                // }
            })
            new Promise((resolve,reject) => {
                resolve(getPostParam(options.id)());
            }).then((param) => {
                console.log(options)
                if(String(options.typename) !== "undefined"){
                   that.startComment();
                }
                that.getPostDetail(param)
                that.getCommentList();
            }).catch((err) => {
                throw new Error(err)
            })
        }
    })
  },
  // 获取分享红包参数
  getDeliverParams(e) {
    this.setData({
      rid: e.detail.rid
    })
    console.log(e.detail.rid);
  },
  //链接
  hiddenTips: function () {
    var path = addr.getCurrentPageUrlWithArgs()
    util.ShowPath(path)
  },
  //下拉刷新
  onPullDownRefresh() {
    let that = this;
    let {sliderCla,options} = {...that.data};
    if(!!sliderCla){
      wx.stopPullDownRefresh()
    }else{
      wx.redirectTo({
          url:'/pages/detail/detail?id='+options.id
      })
    }
  },
  //加载评论
  onReachBottom() {
    this.getCommentList()
  },
  //分享
  onShareAppMessage: function (res) {
    let that = this;
    if(that.data.post.state<=0) return;
    let path = addr.getCurrentPageUrlWithArgs();
    if (this.data.rid) {
        path += '&rid=' + this.data.rid + '&ruid=' + app.globalData.userInfo.Id
    }
    //设置标题
    let title = !!that.data.post.Title?that.data.post.Title:app.globalData.cityName;
    try {
      wx.setStorageSync('needloadcustpage', false)
    }catch (e) {}
    return {
      title: title,
      path: path,
      success: function (res) {
        // 红包分享成功
        if (that.data.rid) {
          that.setData({
            isShareSuccess: true
          })
        }
      }
    }
  },
  //删除评论
  delComment: function (e) {
    del = 1
    if (app.checkphone()) {
      if (e.currentTarget.dataset.isowner) {
        var typename = e.currentTarget.dataset.type
        var that = this
        wx.showModal({
          title: '提示',
          content: typename == 1 ? "确定删除该评论？" : '确定删除该回复？',
          success: function (res) {
            if (res.confirm) {
              pinglun.delComment(e, that)
            }
            del = 0
          },
        })
      }
    }
  },
  //帖子请求
  async postDetailRequest(param){
    let data = await getPostDetail(param);
    if(data.isok){
        return data.post
    }else{
        log(data)
    }
  },
  //数据处理
  getPostDetail(param){
    let that = this;
    that.postDetailRequest(param).then(data => {
        log(data);
        setTitle(data);
        switch(data.PTypeId){
            case 294400:
                data.Gender = Type.Gender[data.Gender]
            break;
            case 295252://房产
                that.setData({
                    house:getHouse(data)
                })
            break;
            case 295255:
            case 295254: //求职-招聘
              data.SettlementMode = data.Salary === "1"?false:Type.Times[data.SettlementMode];
              data.Experience = Type.Experience[data.Experience];
                if(!!data.WorkTime){
                  if(data.WorkTime == '9' && data.SaleType == '7'){
                      data.WorkTime = '其他'
                  }else{
                      data.WorkTime = Type.WorkTime[data.WorkTime];
                  }
                }
                if(data.SaleType == 7){
                  data.PositionType = {
                      "1":'全职',
                      "2":'兼职'
                  }[data.PositionType];
                }
                if(data.SaleType != 7){
                    data.Gender = Type.Gender[data.Gender];
                    data.AgeRe = Type.Age[data.AgeRe]
                }
                if(!!data.Floor){
                    data.Floor = data.Floor.split(';');
                }
            break;
            case 304069: //拼车
                Reflect.set(data,'vehicleClass',data.IdentityType == 6 ? "vehicle":"man");
                let carpool = data.IdentityType == 6?getArr(Type.Carpool,{'tag':'货物重量'})(5,6):Type.Carpool;
                that.setData({
                    carpool:getCarpool(carpool,data)
                })
        }
        WxParse.wxParse('Description', 'html',data.Description, that);

        if(data.DescImgList.length === 0){
            data.DescImgList = data.AttachmentList;
        }
        that.setData({
          post:data,
          init: data.State
        })
    }).catch((err) => {
        log(err)
    })
  },
  //帖子图片预览
      viewFullPicture(e){
        let that = this;
        const {index} = {...e.currentTarget.dataset}
        let imgList = that.data.post.DescImgList;
        let urls = imgList.map(item => item.filepath)
        pictureTaps(imgList[index].filepath,urls)
    },
    //拨打电话
    call(e) {
      var that = this
        const {
            postid, phone
        } = {
            ...e.currentTarget.dataset
          }
        util.paycallpeple(postid, phone)
   
    },
    //公司导航
    navigateToLocation(){
        openLocation(this.data.post)
    },
    //申请职位
    applyForJob(){

    },
    //评论请求
    async commentListRequest(){
        let that = this;
        let {options,comment} = {...that.data};
        let param = {
            commentid:options.id,
            openId:that.openId,
            CType: comment.ctype,
            pageSize:20,
            pageIndex:comment.pageIndex
        }
        let data = await getCommentList(param);
        if(data.isok){
            that.setData({
               loadingError:true
            })
            return data.obj
        }else{
            that.setData({
                isLoading:true,
                loadingError:false
            })
        }
    },
    //获取评论
    getCommentList(){
      let that = this;
      let {isLoading,loadingAll,commentList,checkAllCommentArr,comment} = {...that.data}
      if(isLoading && loadingAll){
          that.setData({
              isLoading:false
          })
          that.commentListRequest().then(data => {
            if(data.length > 0){
                if(data.length < 5){
                    that.setData({
                        loadingAll:false
                    })
                }else{
                  let {pageIndex} = {...comment};
                  ++pageIndex;
                  that.setData({
                    'comment.pageIndex':pageIndex
                  })
                }
                data.forEach((item) => {
                    item.ContentHtml = htmljson.html2json(item.ContentHtml, 'commentContent' + item.Id);
                    let parentNickName = {};
                    if(!!item.SubCommentList && item.SubCommentList.length > 0){
                        item.SubCommentList.forEach((subItem) => {
                            Reflect.set(parentNickName,subItem.Id,subItem.NickName)
                            subItem.ContentHtml = htmljson.html2json(subItem.ContentHtml, 'commentContent' +  subItem.Id);
                        })
                        Reflect.set(item,'parentNickName',parentNickName);
                    }
                })
                commentList = [...commentList,...data];
                checkAllCommentArr = [...checkAllCommentArr,...initCheckCommentStatus(data)];
                that.setData({
                    commentList,
                    checkAllCommentArr
                })
            }else{
                that.setData({
                   loadingAll:false,
                   empty:true
                })
            }
            that.setData({
              isLoading:true
            })
          }).catch((error) => {
              log(error);
              that.setData({
                  loadingError:false,
                  content:'请求超时',
                  showTips:true
              })
          })
        }
    },
    //直接评论
    startComment(){
        let that = this;
        new Promise((resolve,reject) => {
            that.setData({
                sliderCla:'slideFromDown'
            })
            setTimeout(() => {
                resolve(1)
            },100)
        }).then((data) => {
            that.setData({
                focus:true
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
    endComment(){
        let that = this;
        new Promise((resolve,reject) => {
            that.setData({
                focus:false
            },() => {
                that.clearCommentStatus();
                resolve(1)
            })
        }).then((data) => {
            that.setData({
                sliderCla:'slideDown'
            },() => {
                setTimeout(() => {
                    that.setData({
                        sliderCla:''
                    })
                },360)
            })
        }).catch(err => {
            log(err)
        })
    },
    //子评论
    reply(e){
        let that = this;
        const {parentid,comuserid,index,subindex,nickname} = {...e.currentTarget.dataset};
        if(!!comuserid){
            that.setData({
                'comment.parentid':parentid,
                'comment.comuserid':comuserid,
                'comment.index':index
            })
        }else{
            that.setData({
                'comment.parentid':parentid,
                'comment.index':index
            })
        }
        that.setData({
            'comment.placeholder':nickname
        },() => {
            that.startComment()
        })
    },
    //动态输入
    getComment(e){
        let that = this;
        let val = e.detail.value.trim();
        that.setData({
            'comment.commentContent':val
        })
    },
    //图片上传
    chooseImage(parmas){
        uploadimg.chooseImage(parmas, this);
    },
    clearImage(parmas){
        uploadimg.clearImage(parmas, this);
    },
    //发表评论请求
    async deliverRequest(fn){
        let data = await deliverComment(fn());
        return data;
    },
    //发表评论
    deliver(){
        let that = this;
        let {commentList,
            comment:{commentContent,index,comuserid,parentid},
            items:[{content:{imageList}}]} =  {...this.data}
        if((!index &&  imageList.length === 0) && commentContent.trim().length === 0){
            tips.call(that,'请输入评论内容');
            return
        }
        if(!!index && commentContent.trim().length === 0){
            tips.call(that,'请输入评论内容');
            return 
        }
        that.deliverRequest(function(){
            return getDeliverParam.apply(that,[commentContent,imageList]);
        }).then((data) => {
          if (data.result)
          {
            tips.call(that, '评论成功');
            that.setData({
              loadingAll: true
            }, () => {
              that.getCommentList();
            })

          }
          else
          {
            app.ShowMsg(data.
              msg);


          }
           
        }).catch((err) => {
            tips.call(that,err.msg)
        })
        that.endComment()
    },

    //取消评论
    cancelComment(){
        let that = this;
        wx.showActionSheet({
            itemList: ['离开'],  
            success(res) {
                const {tapIndex} = {...res};
                if(tapIndex === 0){
                    that.endComment()
                }
            }
        })
    },
  //清除评论的状态
  clearCommentStatus(){
      let that = this;
      let {comment} = {...that.data};
      let resetComment = {
          parentid:'',
          comuserid:'',
          index:'',
          subindex:'',
          commentContent:'',
          placeholder:''
      }
      Reflect.set(resetComment,'pageIndex',comment.pageIndex);
      Reflect.set(resetComment,'ctype',comment.ctype);
      that.setData({
          comment:resetComment,
          [`items[${0}].content.imageList`]:[],
          [`items[${0}].content.imageAddUrlList`]:[]
      })
    },
    //查看评论图片
    viewCommentPic(e){
        let commentImage = [];
        const {src} = {...e.currentTarget.dataset}
        commentImage.push(src);
        pictureTaps(src,commentImage);
    },
    //查看全部评论
    checkAllComment(e){
        let that = this;
        const {index} = {...e.currentTarget.dataset};
        let {checkAllCommentArr} = {...that.data}
        let comment = checkAllCommentArr[index] === 5?100:5;
        that.setData({
            [`checkAllCommentArr[${index}]`]:comment
       })
    },
    //首页
    toIndexPage() {
       app.gotohomepage()
    },
    //个人中心
    goToPersonalCenter(){
       wx.navigateTo({
          url:'/pages/person_center/person_center'
       })
    },
    //举报
    report(){
        if (app.checkphone()) {
           app.goNewPage('../detail/shop_report?storeId=' + this.data.storeId)
        }
    },
    bottomnavswitch (e) {
        var path = e.currentTarget.dataset.url   
        wx.navigateTo({
          url: path
        })
      }
})