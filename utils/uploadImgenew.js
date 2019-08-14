var util = require("util.js");
var addr = require("addr");
var app = getApp();
var initmun=0
function uploadFile(url, filePath, params) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: "file",
      formData: params,
      header: {
        'Content-Type': "application/x-www-form-urlencoded"
      },
      success: function (res) {
        resolve(res);
      },
      fail: function (res) {
        console.log("fff")
        console.log(res)
      }
    });
  });
}

function chooseImage(parmas, that) {
  var items = that.data.items
  var row = parmas.currentTarget.dataset.row
  var currentItem = items[row]
  var images = currentItem.content.imageList
  var maxImageCount = currentItem.content.maxImageCount
  try {
    wx.setStorageSync('needloadcustpage', false)
  }
  catch (e) {
  }
  wx.chooseImage({
    count: maxImageCount,
    success: function (res) {
      console.log()
      var totalImages = res.tempFilePaths
      if (totalImages.length < maxImageCount) {
        currentItem.content.maxImageCount = maxImageCount - totalImages.length  
      }
      // else {
      //   currentItem.content.images_full = true;
      // }
      // 上传图片并获取url保存在imageUrlList数组中
      currentItem.content.imageIdList = []
      items[row] = currentItem
      that.data.items = items
      that.setData(that.data)
      var tempimgurl = []
      for (var index = 0; index < totalImages.length; index++) {
        var imagePath = totalImages[index]
        tempimgurl.push(imagePath)
        util.showNavigationBarLoading();
        wx.showToast({
          title: '正在上传图片',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
      }
      uploadoneImg(tempimgurl, 0, currentItem, that, items, row)
    }
  })
}
function shopChooseImage(target,that) {
 var configs = that.data.uploadimgobjects
  var index = target.currentTarget.dataset.which
  var itemid = target.currentTarget.dataset.itemid
  var cutid = target.currentTarget.dataset.cutid//砍价用
  var currentItem = configs[index]
  var imgCount = currentItem.config.imageList.length
  initmun = currentItem.config.maxImageCount
  var maxImageCount = currentItem.config.maxImageCount
 
  var imagesEditeAdd = currentItem.config.imageUpdateList0
  var maxImageCount = maxImageCount - imgCount
  console.log(maxImageCount,imgCount)
  // imgCount 显示的图片列表
  // imagesEditeAdd 后面新增的图片列表
  wx.hideLoading()
  try {
    wx.setStorageSync('needloadcustpage', false)
  }
  catch (e) {
  }
  wx.chooseImage({
    count: maxImageCount,
    success: function (res) {
      var totalImages = res.tempFilePaths
      // console.log(totalImages)
      // console.log(imgCount)
      // console.log(maxImageCount)
      if ((totalImages.length + imgCount )== initmun) {
        currentItem.config.images_full = true
      } 
      // 上传图片并获取url保存在imageUrlList数组中
      configs[index] = currentItem
      that.setData({"uploadimgobjects":configs})
      var tempimgurls = []
      for (var i = 0; i < totalImages.length; i++) {
        var imagePath = totalImages[i]
        tempimgurls.push(imagePath)
        util.showNavigationBarLoading();
        wx.showToast({
          title: '正在上传图片',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
      }
      var useAttachment=0
      var tranParam=null
      if (!!currentItem.config.useAttachment)
      {
        useAttachment = currentItem.config.useAttachment
      }
      if (!!currentItem.config.tranParam) {
        tranParam = currentItem.config.tranParam
      }
      shopUploadOneImg(tempimgurls, 0, currentItem, that, configs, index, itemid, useAttachment, tranParam)      
    }
  })
}
function shopUploadOneImg(tempimgurls, index, currentItem, that, configs, currentIndex, itemid, useAttachment, tranParam) {
  var url = addr.Address.uploadImage
  var param = { index: index }
  if (1 == useAttachment)
  {
    url = addr.Address.uploadImageWithAttachment
  
  }
  if (!!tranParam)
  {
    param = Object.assign(param, tranParam);
   
  }
  uploadFile(url, tempimgurls[index], param )
    .then(function (success) {
      var json = JSON.parse(success.data)
      if (1 == useAttachment)
      {
        var path = json.path
        var imgId = json.id
        if (itemid > 0) {
          currentItem.config.imageUpdateList.push(path)
          currentItem.config.imageList.push(path)
          currentItem.config.imageIdList.push(imgId)
        }
        else {
          currentItem.config.imageList.push(path)
          currentItem.config.imageIdList.push(imgId)
        } 
  
        if (json.index < tempimgurls.length - 1) {
          shopUploadOneImg(tempimgurls, json.index + 1, currentItem, that, configs, currentIndex, itemid, useAttachment, tranParam)
        }
        else {
          configs[currentIndex] = currentItem
          that.setData({ "uploadimgobjects": configs })
          util.hideNavigationBarLoading();
          wx.hideToast()
      }
      }
      else{

        var path = json.path
        if (itemid > 0) {
          currentItem.config.imageUpdateList.push(path)
          currentItem.config.imageList.push(path)
        }
        else {
          currentItem.config.imageList.push(path)
        }

        if (json.index < tempimgurls.length - 1) {
          shopUploadOneImg(tempimgurls, json.index + 1, currentItem, that, configs, currentIndex, itemid)
        }
        else {
          configs[currentIndex] = currentItem
          that.setData({ "uploadimgobjects": configs })
          util.hideNavigationBarLoading();
          wx.hideToast()
        }
      }

    }, function (fail) {
      wx.showModal({
        title: '提示',
        content: "上传图片失败",
      })
      wx.hideToast()
      util.hideNavigationBarLoading();
    })
}
function uploadoneImg(tempimgurl, index, currentItem,that,items,row)
{
  uploadFile(addr.Address.uploadImage, tempimgurl[index], { index: index })
    .then(function (success) {
      console.log("ffff")
      console.log(success)
      var json = JSON.parse(success.data)
      var path = json.path
      currentItem.content.imageList.push(path)
      currentItem.content.imageAddUrlList.push(path)
      if (json.index < tempimgurl.length-1)
      {
        uploadoneImg(tempimgurl, json.index + 1, currentItem, that, items, row)
      }
      else{
        items[row] = currentItem
        that.data.items = items
        that.setData(that.data)
        util.hideNavigationBarLoading();
        wx.hideToast()
      }
      console.log(currentItem.content.maxImageCount, currentItem.content.imageList.length )
      if (currentItem.content.maxImageCount == currentItem.content.imageList.length) {
        currentItem.content.images_full = true 
      }

    }, function (fail) {
      wx.showModal({
        title: '提示',
        content: "上传图片失败",
      })
      console.log("上传图片失败");
      console.log(fail);
      wx.hideToast()
      util.hideNavigationBarLoading();
    })
}
function previewImage(parmas, that) {
  var items = that.data.items
  var row = parmas.currentTarget.dataset.row
  var current = parmas.target.dataset.src
  var currentItem = items[row]
  var images = currentItem.content.imageList
  wx.previewImage({
    current: current,
    urls: images
  })
}
//删除图片
function clearImage(parmas, that) {
  var items = that.data.items
  var row = parmas.currentTarget.dataset.row
  var index = parmas.target.dataset.index
  var currentItem = items[row]
  var images = currentItem.content.imageList
  var imageIds = currentItem.content.imageIdList
  var imageId = imageIds[index]
  var openId = app.globalData.userInfo.openId

  wx.showModal({
    title: '删除图片',
    content: '删除图片后无法回复，确定上传图片',
    success: function (r) {
      if (r.cancel) {
        return
      }
      //删除图片
      if (currentItem.content.imageIdList.length == 0) {
        currentItem.content.imageList.splice(index, 1);
        currentItem.content.imageAddUrlList.splice(index, 1);
        console.log("是本地的图片")
        if (currentItem.content.imageList.length < currentItem.content.currentmaxImageCount) {
          currentItem.content.images_full = false;
          currentItem.content.maxImageCount = currentItem.content.currentmaxImageCount - currentItem.content.imageList.length
        }
        items[row] = currentItem
        that.setData({
          items: items
        })
        return
      }

      if (imageId == null) {
        wx.showToast({
          title: '删除图片失败',
          icon: 'loading',
          duration: 1000
        })
        return
      }
      items[row] = currentItem
      wx.showToast({
        title: '正在删除图片',
        icon: 'loading',
        duration: 10000
      })
      wx.request({
        url: addr.Address.deleteImage,
        data: {
          imageId: imageId,
          openId: openId,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res.data)
          if (res.data.result) {

            currentItem.content.imageIdList.splice(index, 1);
            currentItem.content.imageList.splice(index, 1);
            currentItem.content.maxImageCount = currentItem.content.currentmaxImageCount - currentItem.content.imageList.length
            items[row] = currentItem
            if (currentItem.content.imageList.length + currentItem.content.imageUpdateList.length < currentItem.content.currentmaxImageCount) {
              currentItem.content.images_full = false;
            }

            that.data.items = items
            that.setData(that.data)
            wx.hideToast()
          }
          else {
            wx.showToast({
              title: '删除图片失败,请稍后重试',
              icon: 'loading',
              duration: 1000
            })
          }
        },
        fail: function () {
          wx.showToast({
            title: '删除图片失败,请稍后重试',
            icon: 'loading',
            duration: 1000
          })
        }
      })
      that.data.items = items
      that.setData(that.data)
    }
  })
}

function shopclearImage(parmas, that) {
  var configs = that.data.uploadimgobjects
  var which = parmas.currentTarget.dataset.which
  var index = parmas.target.dataset.index
  var currentItem = configs[which]
  var openId = app.globalData.userInfo.openId
  var imageIds = currentItem.config.imageIdList
    //  新增删除
  if (imageIds.length == 0) {
    currentItem.config.imageList.splice(index, 1);
    if (currentItem.config.imageList.length + currentItem.config.imageUpdateList.length  < currentItem.config.maxImageCount) {
      currentItem.config.images_full = false;
    }
    configs[which] = currentItem
    that.setData({
      "uploadimgobjects": configs
    })
    return
  }
  var imageId = imageIds[index]
  wx.showModal({
    title: '删除图片',
    content: '删除图片后无法恢复，确定删除图片',
    success: function (r) {
      if (r.cancel) {
        return
      }
      //删除图片
     
      wx.showToast({
        title: '正在删除图片',
        icon: 'loading',
        duration: 10000
      })
      wx.request({
        url: addr.Address.deleteImage,
        data: {
          imageId: imageId,
          openId: openId,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res.data)
          if (res.data.result) {
            currentItem.config.imageIdList.splice(index, 1);
            currentItem.config.imageList.splice(index, 1);
            if (currentItem.config.imageUpdateList.length + currentItem.config.imageList.length < currentItem.config.maxImageCount) {
              currentItem.config.images_full = false;
            }
            configs[which] = currentItem
            that.setData({
              "uploadimgobjects": configs
            })
            wx.hideToast()
          }
          else {
            wx.showToast({
              title: '删除图片失败,请稍后重试',
              icon: 'loading',
              duration: 1000
            })
          }
        },
        fail: function () {
          wx.showToast({
            title: '删除图片失败,请稍后重试',
            icon: 'loading',
            duration: 1000
          })
        }
      })
  
    }
  })
}
module.exports = {
  shopChooseImage: shopChooseImage,
  shopclearImage: shopclearImage,
  chooseImage: chooseImage,
  clearImage: clearImage,
  previewImage: previewImage,
};