var util = require("../utils/util");
var addr = require("../utils/addr");
var htmljson = require('../utils/wxParse/html2json.js');
var app = getApp();
//获取评论列表
function GetStoreComments(that, start = 1, ctype = 1) {
  var content = that.data.items[0].content
  if (start == 0) {
    content.comment = []
    content.commentdataname = []
    content.subcommentdataname = []
    content.loadMorecomment[1] = 1
  }
  var pageIndex = content.loadMorecomment[1]
  var pageSize = 5
  var storeId = that.data.storeId
  wx.request({
    url: addr.Address.GetComment,
    data: {
      openId: app.globalData.userInfo.openId,
      commentid: storeId,
      pageIndex: pageIndex,
      pageSize: pageSize,
      ctype: ctype,
    },
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      setTimeout(function () {
        wx.hideToast()
      }, 500)
      if (res.data.isok == 1) {
        content.loadMorecomment[1] = content.loadMorecomment[1] + 1
        if (!res.data.more) {
          //没有更多了
          content.loadMorecomment[0] = "都显示完了"
        }
        else {
          //没有更多了
          content.loadMorecomment[0] = "加载更多数据"
        }
        that.setData({
          items: that.data.items
        })

        var comment = res.data.obj
        if (comment.length <= 0) {
          that.data.typepl = ''
          return
        }

        //获取评论列表
        var commentContentArray = [];
        var commentdataname = content.commentdataname
        var subcommentdataname = content.subcommentdataname
        for (var i = 0; i < comment.length; i++) {
          var item = comment[i];
          var data = htmljson.html2json(item.ContentHtml, 'commentContent' + item.Id);
          commentdataname.push(data)
          //回复
          var sitemname = []
          if (item.SubCommentList.length > 0) {
            var sitem,sdata
            for (var j = 0,len = item.SubCommentList.length; j < len; j++) {
              sitem = item.SubCommentList[j]
              sdata = htmljson.html2json(sitem.ContentHtml, 'commentContent' + sitem.Id);
              sitemname.push(sdata)
            }
          }
          subcommentdataname.push(sitemname)
        }

        content.comment_num = res.data.count
        content.comment.push.apply(content.comment,comment)
        content.commentdataname = commentdataname
        content.subcommentdataname = subcommentdataname
        content.qqfacehidden = true
        if (!!that.data.typepl){
          content.pinglunhidden = true
        }
        that.data.typepl = ''
        content.imghidden = true
        content.imageList = []
        content.imageUrlList = []
        content.imageIdList = []
        content.imageAddUrlList = []
        content.contenttext = that.data.contenttext
        content.loadMorecomment[2] = false
        content.addcontemt = 0
        that.data.items[0].content = content
        that.setData({
          items: that.data.items
        })
      }
      that.data.typepl = ''
    }
  })
}

//获取子评论列表
function GetMoreSubComment(that, e) {
  var index = e.currentTarget.dataset.index
  var content = that.data.items[0].content
  wx.request({
    url: addr.Address.GetMoreSubComment,
    data: {
      id: content.comment[index].Id,
      openId: app.globalData.userInfo.openId,
    },
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      setTimeout(function () {
        wx.hideToast()
      }, 500)
      if (res.data.isok) {
        //获取子评论列表
        var sitemname = []
        var subCommentList = res.data.SubCommentList
        if (subCommentList.length > 0) {
          var sitem,sdata
          for (var j = 0,len = subCommentList; j < len; j++) {
            sitem = subCommentList[j]
            sdata = htmljson.html2json(sitem.ContentHtml, 'commentContent' + sitem.Id);
            sitemname.push(sdata)
          }
        }
        content.subcommentdataname[index] = sitemname
        content.comment[index].SubCommentList = subCommentList
        that.data.items[0].content = content

        that.setData({
          items: that.data.items
        })
      }
    }
  })
}
//qq表情数据包
function getqqfacedata(that) {
  var qqfacedata =  that.data.items[0].content.qqfacedata
  for (var i = 0; i < 100; i++) {
    var item = "background-position: left " + (i * (-29)) + "px;"
    qqfacedata.push(item)
  }
  that.setData({
    items: that.data.items
  })
}
//点击qq表情触发事件
function clickface(params, that) {
  var title = params.currentTarget.dataset.title
  var contenttext = that.data.items[0].content.contenttext
  if (contenttext == undefined) {
    contenttext = "[" + title + "]"
  }
  else {
    contenttext += "[" + title + "]"
  }
  that.data.items[0].content.contenttext = contenttext
  that.setData({
    items: that.data.items
  })
}
//点击表情图标显示表情框
function showQQface(that) {
  that.data.items[0].content.qqfacehidden = that.data.items[0].content.qqfacehidden ? false : true
  that.setData({
    items: that.data.items
  })
}
//点击显示图片上传
function showimg(that) {
  that.data.items[0].content.imghidden = that.data.items[0].content.imghidden ? false : true

  that.setData({
    items: that.data.items
  })
}
//显示输入评论框
function commentDidClick(that, params) {
  var pfloder = params.currentTarget.dataset.pfloder
  var content = that.data.items[0].content
  content.pinglunhidden = content.pinglunhidden ? false : true
  content.qqfacehidden = true
  content.parentorchild = params.currentTarget.dataset.parentorchild
  content.comuserId = params.currentTarget.dataset.comuserid
  content.imageList = []
  content.imageUrlList = []
  content.imageIdList = []
  content.imageAddUrlList = []
  content.imghidden = true
  content.images_full = false
  content.maxImageCount = 9
  content.icon = 'http://j.vzan.cc/content/city/xcx/images/tc-yh-07.png'
  content.placeholder = (pfloder == '' || pfloder==undefined ? '用户评论：' : pfloder)
  content.row = 0;
  that.data.items[0].content = content
  that.setData({
    items: that.data.items
  })
}
//评论文本域输入触发事件
function bindinput(e, that) {
  var value = e.detail.value
  that.data.items[0].content.contenttext = value
  // that.setData({
  //   items: that.data.items
  // })
}
//添加评论
function AddPostComment(e, that) {
  var data = e.currentTarget.dataset
  var item = that.data.items[0].content
  var ctype = item.ctype
  var contenttext = item.contenttext
  var commentJS
  if (data.type == "0") {
    //添加
    commentJS = {
      storeId: that.data.storeId, //店铺ID
      Content: contenttext, //:评论内容
      CType: ctype,
    }
  } else {
    commentJS = {
      storeId: that.data.storeId, //店铺ID
      Content: contenttext, //:评论内容
      ParentId: data.type, //父级评论ID
      DirectUserId: data.comuserid,//评论者Id
      CType: ctype,
    }
  }

  var url = addr.Address.AddComment
  if (ctype == 0 ) {
    url = addr.Address.AddStoreComment
  }

  var imgs = ""
  if (item.imageAddUrlList.length > 0) {
    for (var i = 0; i < item.imageAddUrlList.length; i++) {
      if (i == item.imageAddUrlList.length - 1) {
        imgs += item.imageAddUrlList[i]
      }
      else {
        imgs += item.imageAddUrlList[i] + ","
      }
    }
  }

  var commentStr = JSON.stringify(commentJS)
  //添加评论 
  wx.request({
    url: url,
    method: 'POST',
    data: {
      comment: commentStr,
      openId: app.globalData.userInfo.openId,
      imgs: imgs,
    },
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      console.log("用户点击了提交")
      if (res.data.result) {

        that.GetStoreComments(0)
        // that.data.remindBean.message = '评论成功'
        wx.showToast({
          title: '评论成功',
        })
        // util.showToast(that)
      } else {
        wx.showToast({
          title: '评论失败',
        })
        // that.data.remindBean.message = '评论失败'
        that.data.items[0].content.addcontemt = 0
        // util.showToast(that)
        // setTimeout(function () {
        //   commitBtnCanUserClick = true
        // }, 500)
      }
      console.log(that.data)
     setTimeout(() => {
        that.setData({
          [`items[${0}].content.pinglunhidden`]:true
        })
     },200)
      wx.hideToast()
    }
  })
}
//添加评论
function AddStoreComment(e, that) {
  var data = e.currentTarget.dataset
  var item = that.data.items[0].content
  var ctype = item.ctype
  var contenttext = item.contenttext
  var commentJS
  if (data.type == "0") {
    //添加
    commentJS = {
      StoreId: that.data.storeId, //店铺ID
      Content: contenttext, //:评论内容
      CType: ctype,
    }
  } else {
    commentJS = {
      StoreId: that.data.storeId, //店铺ID
      Content: contenttext, //:评论内容
      ParentId: data.type, //父级评论ID
      DirectUserId: data.comuserid,//评论者Id
      CType: ctype,
    }
  }

  var url = addr.Address.AddComment
  if (ctype == 0 ) {
    url = addr.Address.AddStoreComment
  }
  if (ctype ==4) {
    url = addr.Address.AddHeadLineComment
  }
  if (ctype == 3) {
    url = addr.Address.AddStrategyComment
  }
  var imgs = ""
  if (item.imageAddUrlList.length > 0) {
    for (var i = 0; i < item.imageAddUrlList.length; i++) {
      if (i == item.imageAddUrlList.length - 1) {
        imgs += item.imageAddUrlList[i]
      }
      else {
        imgs += item.imageAddUrlList[i] + ","
      }
    }
  }

  var commentStr = JSON.stringify(commentJS)
  //添加评论 
  wx.request({
    url: url,
    method: 'POST',
    data: {
      comment: commentStr,
      openId: app.globalData.userInfo.openId,
      imgs: imgs,
    },
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      var returnComment = res.data.obj
      if (res.data.result) {
        var commentingidx = that.data.commentingidx
        var comments = that.data.CommentList
        var comment = comments[commentingidx]
        //评论店铺
        if (data.type == "0")
        {
           returnComment.ContentHtml = htmljson.html2json(returnComment.ContentHtml, 'commentContent' + returnComment.Id)
           comments.unshift(returnComment);
        }//评论回复
        else
        {
        returnComment.ContentHtml = htmljson.html2json(returnComment.ContentHtml, 'commentContent' + returnComment.Id)
          if (comment.SubCommentList != null && comment.SubCommentList != undefined) {
            
              comment.SubCommentList.push(returnComment)
            }
            else{
              comment.SubCommentList=[]
        
              comment.SubCommentList.push(returnComment) 
            }
        }
        that.setData({
          "CommentList": comments
        }) 
      
        wx.showToast({
          title: '评论成功',
        })
       
      } else {
        wx.showToast({
          title: '评论失败',
        })
    
        that.data.items[0].content.addcontemt = 0
  
      }
      wx.hideToast()
    }
  })
}
//删除帖子
function delComment(e, that) {
  var id = e.currentTarget.dataset.parentorchild
  if(id<=0)
  {
    app.ShowMsg("删除失败，请刷新重试")
    return
  }
  //添加评论 
  wx.request({
    url: addr.Address.DeleteComment,
    method: 'POST',
    data: {
      id: id,
      TelePhone: app.globalData.userInfo.TelePhone
    },
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      
      if (res.data.result) {

        that.GetStoreComments(0)
        
      } 

      app.ShowMsg(res.data.msg)
      wx.hideToast()
    }
  })
}
//qq表情数据包
function getqqfacenamedata() {
  return ["微笑", "撇嘴", "色", "发呆", "得意", "流泪", "害羞", "闭嘴", "睡", "大哭", "尴尬", "发怒", "调皮", "呲牙", "惊讶", "难过", "酷", "冷汗", "抓狂", "吐", "偷笑", "可爱", "白眼", "傲慢", "饥饿", "困", "惊恐", "流汗", "憨笑", "大兵", "奋斗", "咒骂", "疑问", "嘘", "晕", "折磨", "哀", "骷髅", "敲打", "再见", "擦汗", "抠鼻", "鼓掌", "糗大了", "坏笑", "左哼哼", "右哼哼", "哈欠", "鄙视", "委屈", "快哭了", "阴险", "亲亲", "吓", "可怜", "菜刀", "西瓜", "啤酒", "篮球", "乒乓", "咖啡", "饭", "猪头", "玫瑰", "凋谢", "示爱", "爱心", "心碎", "蛋糕", "闪电", "炸弹", "刀", "足球", "瓢虫", "便便", "月亮", "太阳", "礼物", "拥抱", "强", "弱", "握手", "胜利", "抱拳", "勾引", "拳头", "差劲", "爱你", "no", "ok", "爱情", "飞吻", "跳跳", "发抖", "怄火", "转圈", "磕头", "回头", "跳绳", "挥手"]
}

module.exports = {
  GetStoreComments: GetStoreComments,
  GetMoreSubComment: GetMoreSubComment,
  getqqfacedata: getqqfacedata,
  clickface: clickface,
  showQQface: showQQface,
  commentDidClick: commentDidClick,
  bindinput: bindinput,
  AddStoreComment: AddStoreComment,
  AddPostComment: AddPostComment ,
  delComment: delComment,
  getqqfacenamedata: getqqfacenamedata,
  showimg: showimg
};