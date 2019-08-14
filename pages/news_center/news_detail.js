let {httpClient} = require('../../utils/util.js');
let {HOST} = require('../../utils/addr');
let addr = require("../../utils/addr.js");
let regeneratorRuntime = require('../../utils/runtime');
let WxParse = require('../../utils/wxParse/wxParse.js');
let htmljson = require('../../utils/wxParse/html2json.js');
let uploadimg = require("../../utils/uploadImgenew.js");

let getArticle = (param) => httpClient({addr:HOST + 'IBaseData/GetHeadLineDetail',data:param});
let getRewardList = (param) => httpClient({addr:HOST + 'IBaseData/GetRewardList',data:param});
let getCommentList = (param) => httpClient({addr:HOST + 'IBaseData/GetCommonCommentList',data:param});
let setLike = (param) => httpClient({addr:HOST + 'IBaseData/Fabulous',data:param});
let deliverComment = (param) => httpClient({addr:HOST + 'IBaseData/AddHeadComment',method:'POST',data:param});
let addstorestrategycomment=(param) => httpClient({ addr: HOST + 'IBaseData/AddStrategyComment', method: 'POST', data: param }); 
let app = getApp();

//图标
let icon = {
    common:'http://j.vzan.cc/content/city/xcx/images/',
    viewer:'viewer.svg',
    like:'like.svg', //liked.svg
    comment:'comment.svg',
    sofa:'sofa.png',
    reward:'reward.svg', //rewarded.svg
    repost:'post-repost.svg',
    photoes:'photoes.svg',
    loading:'loading.svg'
}
function tips(content){
    this.setData({
        content,
        showTips:true
    })
}
//获取content高度
function getContentHeight(element){
  let that = this;
  wx.createSelectorQuery().select(element).boundingClientRect(function(res){
    let {height} = {...res};
    let rate = getRate(height);
    if(rate <= 0){
        that.getCommentList();
    }else{
        that.rate = rate;
    } 
  }).exec()
}
function getRate(height){
    return ~~(height / app.globalData.windowHeight)
}
//年月日
function modifyTime(time) {
    let modifyTime = /\((\d+)\)/.exec(time)
    let times = new Date(parseInt(modifyTime[1]));
    return times.getFullYear() + '-' + (times.getMonth() + 1) + '-' + times.getDate()
}
//图片预览
function previewImg(urls) {
  try {
      wx.setStorageSync('needloadcustpage', false)
  }catch (e) {}
  wx.previewImage({
      urls: urls
  })
}
//点赞
function getLikeStatus(status){
    return status?'liked.svg':'like.svg';
}
//点赞人数
function getFabulousCount(status,count){
    return status?++count:--count;
}
//赞赏
function getRewardStatus(status){
   return status?'rewarded.svg':'reward.svg';
}
//是否赞赏
function isReward(arr){
    return arr.some((value) => {
        return value.fromuser.OpenId === this.openId
    })
}
//获取评论的参数
function getDeliverParam(commentContent,imageList){
    let param = {},stringObj;
    let {options:{hid},comment:{parentid,comuserid}}= {...this.data};
    stringObj = {
        storeId:hid, //店铺ID
        Content:commentContent, //评论内容
        CType:4
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
function initCheckCommentStatus(arr){
    let len = arr.length;
    let newArr = [];
    while(len){
        --len;
        newArr.push(5);
    }
    return newArr
}
Page({
    data: {
        maskShow:'',
        getReward:false,
        likeAnim:false,
        focus:false,
        comment:{
           ctype: 4,
           pageIndex:1,
           parentid:'', //父评论
           comuserid:'',//子评论
           index:'',
           subindex:'',
           commentContent:'',
           placeholder:''
        },
        items:[{
            content:{
                maxImageCount: 1,
                currentmaxImageCount: 1,
                images_full: false,
                imageList: [],
                imageAddUrlList: []
            }
        }],
        commentList:[],
        checkAllCommentArr:[],
        isLoading:true,
        loadingError:true,
        loadingAll:true
    },
    onLoad(options){
      let that = this;
      that.setData({
        options,
        icon
      })
      let title="头条详情"
      if(!!options.t)
      {
        title="动态详情"

      }
      wx.setNavigationBarTitle({
        title: title
      })
      app.getUserInfo((userInfo) => {
         this.openId = app.globalData.userInfo.openId;
         this.cityId = app.globalData.cityInfoId;
         that.getArticle().then(() => {
            that.setData({
                init:true
            })
        })
      })
    },
    onShow(){
        this.getRewardList();
    },
    //分享
    onShareAppMessage(){
        var path = addr.getCurrentPageUrlWithArgs();
        try {
          wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        return {
          title: this.data.article.Headlines.Title,
          path: path
        }
    },
  //滚动事件
  onPageScroll(e){
    if(e.scrollTop >= (this.rate * app.globalData.windowHeight) && !this.data.getReward){
        this.getRewardList()
    }
  },
  onReachBottom(){
    this.getCommentList()
  },
  onPullDownRefresh(){
    let that = this;
    that.getArticle().then(() => {
      that.setData({
        init: true
      })
    })
  },
  //返回首页
  backIndex(){
    app.gotohomepage()
  },
  goToNewsCenter() {
    wx.navigateTo({
      url: '/pages/news_center/news_center'
    })
  },
  goToPersonalCenter(){
    wx.navigateTo({
        url:'/pages/person_center/person_center'
    })
  },
  //文章
  async getArticle(){
      let that = this;
      let {options} = {...that.data};
      let param = {
          cityid:that.cityId,
          openid:that.openId,
          hid:options.hid,
          typeid:options.t
      }
      let res = await getArticle(param);
      if(res.Success){
          let data = res.Data;
          WxParse.wxParse('Description', 'html',data.mainmodel.Headlines.Description, that);
          data.mainmodel.Headlines.CreateDate = modifyTime(data.mainmodel.Headlines.CreateDate);
          that.setData({
            'icon.like':getLikeStatus(data.mainmodel.IsFabulous),
            article:data.mainmodel
          },() => {
            getContentHeight.call(that,'.content');
          })
        
      }
  },
  //赞赏人数
  async getRewardList(){
    let that = this;
    let {options} = {...that.data}
    that.setData({
        getReward:true
    })
    let param = {
      openid:that.openId,
      cityid:that.cityId,
      itemid:options.hid,
      itemtype:1,
      pageIndex:1,
      pageSize:9
    }
    let data = await getRewardList(param);
    if(data.Success){
        that.setData({
            rewardList:data.Data,
            'icon.reward':getRewardStatus(isReward.call(that,data.Data.listReward))
        })
    }
  },
  //评论
  async commentListRequest(){
    let that = this;
    let {options,comment} = {...that.data};
    let param = {
        id:options.hid,
        cityid:that.cityId,
        openid:that.openId,
        CType: comment.ctype,
        PageSize:30,
        PageIndex:comment.pageIndex
    }
    let data = await getCommentList(param);
    if(data.Success){
      that.setData({
        loadingError:true
      })
      return data.Data.commentlist.Commentlist
    }else{
      that.setData({
          isLoading:true,
          loadingError:false
      })
    }
  },
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
                  if(!!item.SubCommentList && item.SubCommentList.length > 0){
                      item.SubCommentList.forEach((subItem) => {
                          subItem.ContentHtml = htmljson.html2json(subItem.ContentHtml, 'commentContent' +  subItem.Id)
                      })
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
        }).catch(error => {
            that.setData({
                loadingError:false,
                content:'请求超时',
                showTips:true
            })
        })
    }
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
   //图片上传
  chooseImage(parmas){
    uploadimg.chooseImage(parmas, this);
  },
  clearImage(parmas){
    uploadimg.clearImage(parmas, this);
  },
  //图片预览
  viewCommentPic(e){
      let commentImage = [];
      const {src} = {...e.currentTarget.dataset}
      commentImage.push(src);
      previewImg(commentImage);
  },
  //赞赏
  goToReward(e){
    let itemtype=1
    const {hid,typeid} = {...e.currentTarget.dataset};
    if(!!typeid)
      itemtype=2
    wx.navigateTo({
      url: '/pages/news_center/reward?itemid=' + hid + "&itemtype=" + itemtype
    })
  },
  //点赞
  async like(){
      let that = this,timer;
      let {Headlines:{Id,FabulousCount},IsFabulous} = {...that.data.article};
      let data = await setLike({         
          openid:this.openId,
          cityid:this.cityId,
          id:Id,
          t: !!that.data.options.t?2:1
      })
      if(data.Success){
          IsFabulous = !IsFabulous;  
          that.setData({
              'likeAnim':IsFabulous,
              'icon.like':getLikeStatus(IsFabulous),
              'article.IsFabulous':IsFabulous,
              'article.Headlines.FabulousCount':getFabulousCount(IsFabulous,FabulousCount)
          },() => {
                if(IsFabulous){
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                        this.setData({
                            likeAnim:false
                        })
                    },1680)
                }
          })
      }
  },
  //回复
  reply(e){
    let that = this;
    if(e.type === 'tap'){ 
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
        this.setData({
            'comment.placeholder':nickname,
            'comment.commentContent':''
        })
        let {imageList,imageAddUrlList} = {...that.data.items[0].content}
        if(imageList.length > 0){
            that.setData({
                'items[0].content.imageList':[],
                'items[0].content.imageAddUrlList':[]
            })
        }
    }
    that.setData({
        'maskShow':'fadeIn',
        'focus':true
    })
  },
  //获取输入的文字
  getComment(e){
    let that = this;
    let val = e.detail.value.trim();
    this.setData({
        'comment.commentContent':val
    })
  },
  //发表评论
  deliver(){
    let that = this;
    let {commentList,
         comment:{commentContent,index,comuserid,parentid},
         items:[{content:{imageList}}]} =  {...this.data}
    if((!index &&  imageList.length === 0) && commentContent.trim().length === 0){
        tips.call(that,'请输入评论内容');
        that.maskHide();
        return
    }
    if(!!index && commentContent.trim().length === 0){
        tips.call(that,'请输入评论内容');
        that.maskHide();
        return 
    }
    that.deliverRequest(function(){
        return getDeliverParam.apply(that,[commentContent,imageList]);
    }).then((data) => {
        data.ContentHtml = htmljson.html2json(data.ContentHtml, 'commentContent' + data.Id);
        if(!!parentid && !!comuserid){
            that.secondComment(commentList,data,index)
        }else{
            that.firstComment(commentList,data)
        }

        that.setData({
            'comment.placeholder':'',
            'comment.commentContent':''
        },() => {
            tips.call(that,'评论成功')
        })

    }).catch((err) => {
        tips.call(that,err)
    })
    that.maskHide();
  },
  //评论请求
  async deliverRequest(fn){
        var that=this
        let data=null
        if(!!that.data.options.t)
        {
          data = await addstorestrategycomment(fn());
        }
        else
        {
          data = await deliverComment(fn());
        }
        if(data.result){
            return data.obj
        }else{
            tips.call(that,'评论失败')
        }
  },
  getBlur(){
    let that = this;
    let {comment} = {...that.data};
    let {parentid,comuserid} = {...comment};
    if(!!parentid && !!comuserid){
        comment.parentid = '';
        comment.comuserid = '';
        comment.placeholder = '';
        comment.commentContent = '';
        this.setData({
            comment,
            focus:false
        })
    }
    that.maskHide();
  },
  maskHide(){
    let {comment:{commentContent},items:[{content:{imageList}}]} =  {...this.data}
    this.setData({
        'maskShow':'fadeOut'
    },() => {
        setTimeout(() => {
            this.setData({
                'maskShow':''
            })
        },160)
    })
    if(commentContent.length === 0 && imageList.length === 0){
        this.setData({
            focus:false
        })
    }
  },
  //一级评论
  firstComment(commentList,data){
    commentList.unshift(data);
    this.setData({
        commentList,
        'items[0].content.imageList':[],
        'items[0].content.imageAddUrlList': []
    })
  },
  //二级评论
  secondComment(commentList,data,index){
    if(!commentList[index].SubCommentList){
        commentList[index].SubCommentList = [];
    }
    commentList[index].SubCommentList.push(data);
    this.setData({
        [`commentList[${index}].SubCommentList`]:commentList[index].SubCommentList,
        'comment.parentid':'',
        'comment.comuserid':'',
        'comment.index':'',
        'comment.subindex':''
    })
  },
  gotoshopdetail(e)
  {
    const { storeid } = { ...e.currentTarget.dataset }
    wx.navigateTo({
      url: '/pages/business_detail/business_detail?storeid=' + storeid
    })
  }
})
