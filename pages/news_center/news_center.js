var  addr = require("../../utils/addr.js");
var host = addr.HOST;
var util = require("../../utils/util.js");
const regeneratorRuntime = require('../../utils/runtime');
let getList = (url, param) => util.httpClient({host,addr:url,data: param})
let  c_enum
let app = getApp()

// "usingComponents":{
//     "city-nav":"components/Nav/Nav"
  // }
Page({
  data: {
    showpath: false,
    storeid:'', //店铺id
    cityid:0, //cityId
    openid:'', //openId
    newsCenterArr:['商家动态','推荐商家','便民信息','本地头条'], //tabBar
    //本地头条
    localNav:{
      localNavArr:[], 
      localNavScrollArr:[], //scrollLeft
      loadingAllArr:[], //是否加载全部
      startPosition:'', //scroll起始值
      localCurrentIndex:0//本地头条当前页
    },
    currentIndex:3, //当前页
    contentPage:[],//所有tab页面
    pageIndexArr:[1,1,1], // 1 2 3 pageIndex 
    pageScrollTop:[0,0,0], //1 2 3 scrollTop
    isLoading:false, //是否正在加载
    isLoadingAll:[],// 是否已经加载全部
    recomLocation:{  //推荐商家经纬度
      lat:0,
      lng:0
    },
    recomStoreInfo:{ //推荐商家信息
      currentphone: '',
      currentshopqrcode: '',
      currentshoptip: ''
    },
    showcallbtn:1, //
    showallbtns:{},//展开收起
    contentH:[] //内容高度
  },
  onLoad() {
    let that = this
    let {newsCenterArr,currentIndex} = {...that.data}
    app.getUserInfo((userInfo) =>{
      that.setData({
        openid:userInfo.openId,
        cityid: app.globalData.cityInfoId
      })
      wx.setNavigationBarTitle({
        title:newsCenterArr[currentIndex]
      })
      that.initContentPage()
      that.initLocalNav()
      that.getRecomLocation()
      c_enum = app.C_Enum
      that.setData({ buyversion: app.globalData.buyVersion, tongcheng_new_02: app.imgresouces.tongcheng_new_02,tongcheng_01: app.imgresouces.tongcheng_01 })
   
          if (app.globalData.userInfo.iscityowner>0) {
        that.setData({
          showpath: true
        })
      }
    })
  }, onShareAppMessage: function (res) {
    var that = this
    var path = addr.getCurrentPageUrlWithArgs()
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    return {
      title: "本地头条",
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //获取本地头条导航栏scrollLeft
  getLocalNavScrollLeft(){
    let that = this
    let {localNav:{localNavScrollArr}} = {...that.data}
    wx.createSelectorQuery().selectAll('.localNavItem').boundingClientRect((res) => {
      for (let {left} of res){
        localNavScrollArr.push(left)
      }
      that.setData({
        'localNav.localNavScrollArr':localNavScrollArr,
        'localNav.startPosition':~~(localNavScrollArr.length / 8)
      })
    }).exec()
  },
  //load导航
  async loadLocalNav(){
    let headtype
    let {localNav:{localNavArr,loadingAllArr,localCurrentIndex},currentIndex,contentPage} = {...this.data}
    let that = this,url,param
    let data = await getList(
      url = 'IBaseData/GetHeadLine',
      param = {
        cityid:app.globalData.cityInfoId
      }
    )
    if(data.Success){
      let {headlinelist} = {...data.Data}
      headlinelist.forEach((key,index) => {
        Reflect.set(key,'pageIndex',1)
        Reflect.set(key,'scrollTop',0)
        headtype = key.Id
        delete key.Id
        key["headtype"] = headtype
        loadingAllArr.push(true)
        contentPage[3].push([])
      })
      headlinelist.unshift({
        Name:'最新',
        pageIndex:1,
        scrollTop:0,
        headtype:0
      })
      contentPage[3].unshift([])
      loadingAllArr.unshift(true)
      that.setData({
        'localNav.loadingAllArr':loadingAllArr,
        'localNav.localNavArr':headlinelist,
        'contentPage[3]':contentPage[3]
      })
    }else{
      app.ShowMsg('获取本地头条出错')
    }
  },
  // 初始化导航
  initLocalNav(){
    let that = this
    that.loadLocalNav().then(() => {
      that.loadData()
      setTimeout(() => {
        that.getLocalNavScrollLeft()
      },20)
    }).catch((err) => {
      console.log(err)
    })
  },
  //初始化创建Page
  initContentPage(){
    let that = this
    let {newsCenterArr,contentPage,isLoadingAll} ={...that.data}
    newsCenterArr.forEach((key,index) => {
      contentPage.push([])
      isLoadingAll.push(true)
    })
    that.setData({
      contentPage,
      isLoadingAll
    })
  },
  //底部tabBar切换
  switchNewsCenterBar(e){
    let that = this
    const {tabbarindex} = {...e.currentTarget.dataset}
    const {currentIndex,contentPage,isLoadingAll} = {...that.data}
    if(tabbarindex === currentIndex){
      return
    }else{
      wx.setNavigationBarTitle({
        title:that.data.newsCenterArr[tabbarindex]
      })
      that.setData({
        currentIndex:tabbarindex
      })
      let currentPage = that.judegePage()
      if(tabbarindex != 3){
        if(currentPage.length == 0 &&  isLoadingAll[tabbarindex]){
          that.loadData()
        }
      }
    }
  },
  //头条tabBar
  switchLocalNav(e){
    let that = this
    const {offsetLeft} = {...e.currentTarget}
    const {localnavindex} = {...e.currentTarget.dataset}
    const {localNavArr,loadingAllArr,localNavScrollArr,startPosition,localCurrentIndex} = {...that.data.localNav}
    if(localCurrentIndex === localnavindex){
      return
    }else{
      if(localnavindex > startPosition){
        that.setData({
          'localNav.scrollLeft':localNavScrollArr[localnavindex - startPosition]
        })
      }
      that.setData({
        'localNav.localCurrentIndex':localnavindex
      })
      let currentPage = that.judegePage()
      if(currentPage.length == 0  && loadingAllArr[localnavindex]){
        that.loadData()
      }
    }
  },
  /*判断页面*/
  judegePage(){
    let that = this,currentPage
    let {localNav:{localCurrentIndex},currentIndex,contentPage} ={...that.data}
    if(currentIndex == 3){
      currentPage = contentPage[3][localCurrentIndex]
    }else{
      currentPage = contentPage[currentIndex]
    }
    return currentPage
  },
  /**初始化*/
  async initloadData(){
    let that = this
    let url,param,currentPage = []
    let {cityid,openid,localNav:{localNavArr,localCurrentIndex},currentIndex,pageIndexArr,isLoading,recomLocation} = {...that.data}
    switch(currentIndex){
      case 3:
        let {Id,pageIndex,headtype} = {...localNavArr[localCurrentIndex]}
        url = 'IBaseData/GetHeadlinesList'
        param = {
          cityid,
          openid,
          pageIndex,
          pageSize:10,
          headtype
        }
      break;
      case 0:
        pageIndex = pageIndexArr[0]
        url = 'IBaseData/GetStoreStrategyList'
        param = {
          cityid,
          openid,
          pageIndex:pageIndex
        }
      break;
      case 1:
        pageIndex = pageIndexArr[1]
        url = 'IBaseData/GetRecommendStore'
        param = {
          cityInfoId:cityid,
          PageIndex: pageIndex,
          sortType: 'default',
          pointX:recomLocation.lat,
          pointY:recomLocation.lng
        }
      break;
      case 2:
        pageIndex = pageIndexArr[2]
        url = 'apiQuery/getpushpost'
        param = {
          areacode: app.globalData.areaCode,
          PageIndex: pageIndex,
          PageSize: 10,
          value:''
        }
      break;
    }
    if(!isLoading){
        that.setData({
          isLoading:true
        })
        wx.showLoading({
          title: '加载中',
          duration:10000,
        })
        let data = await getList(
          url = url,
          param = param
        )
        return data
    }
  },
  //改变数据
  changeData(data){
    let that = this,articleArr,pageIndex
    let {localNav:{localNavArr,localCurrentIndex},currentIndex,contentPage,pageIndexArr} = {...that.data}
    if(data.Success){
      switch(currentIndex){
        case 3:
          articleArr = data.Data.listheadline
        break;
        case 0:
          articleArr = data.Data.liststrategy
        break;
        case 1:
          articleArr = data.Data.StoreList
        break;
        case 2:
          articleArr = data.postlist
        break;
      }
      if(articleArr.length != 0){
        if(currentIndex == 3){
          articleArr = [...contentPage[3][localCurrentIndex],...articleArr]
          pageIndex = localNavArr[localCurrentIndex].pageIndex + 1

          that.setData({
            [`localNav.localNavArr[${localCurrentIndex}].pageIndex`]:pageIndex,
            [`contentPage[3][${localCurrentIndex}]`]:articleArr
          })
        }else if(currentIndex == 2){
          that.regularlyPageChangeData(articleArr).then((data) => {
            articleArr = [...contentPage[2],...data]
            pageIndex = pageIndexArr[2] + 1
            that.setData({
              [`pageIndexArr[2]`]:pageIndex,
              [`contentPage[2]`]:articleArr
            })
            setTimeout(() => {
              that.getAllRects()
            },120)
          })
        }else{
          articleArr = [...contentPage[currentIndex],...articleArr]
          pageIndex = pageIndexArr[currentIndex] + 1
          that.setData({
            [`pageIndexArr[${currentIndex}]`]:pageIndex,
            [`contentPage[${currentIndex}]`]:articleArr
          })
        }
        if(articleArr.length < 10){
          that.isLoadingAll(currentIndex)
        }
      }else{
        that.isLoadingAll(currentIndex)
      }
    }
    that.setData({
      isLoading:false
    })
    wx.hideLoading()
  },
  //loadData加载数据
  loadData(e){
    let that = this
    let {localNav:{loadingAllArr,localCurrentIndex},currentIndex,isLoadingAll} = {...that.data}
    if( currentIndex == 3 ){
      if(loadingAllArr[localCurrentIndex]){
        that.initloadData().then((data) => {
          that.changeData(data)
        })
      }else{
        return 
      }
    }else{
      if(isLoadingAll[currentIndex]){
        that.initloadData().then((data) => {
          that.changeData(data)
        })
      }else{
        return 
      }
    }
  },
  //加载全部数据
  isLoadingAll(currentIndex){
    let that = this
    let {localCurrentIndex} = {...that.data.localNav}
    if(currentIndex == 3){
      that.setData({
        [`localNav.loadingAllArr[${localCurrentIndex}]`]:false
      })
    }else{
      that.setData({
        [`isLoadingAll[${currentIndex}]`]:false
      })
    }
  },
  //关注
  async followRequest(url,param){
    let data = await getList(
      url = url,
      param = param
    )
    return data
  },
  follow(e){
    let that = this
    let {storeid,index} = {...e.currentTarget.dataset}
    let {openid,contentPage} = {...that.data}
    let url = 'IBaseData/concernshop'
    let param = {
      shopid:storeid,
      openid
    }
    that.followRequest(url,param).then((data) => {
      if(data.Success){
        let concern = !contentPage[0][index].IsConcern
        that.setData({
          [`contentPage[0][${index}].IsConcern`]:concern
        })
        wx.showToast({
          icon:'success',
          title:concern?'关注成功':'取消关注成功',
          duration:1200
        })
      }
    })
  },
  //预览图片
  viewFullPic(e){
    let that = this
    const {activeindex,src} = {...e.currentTarget.dataset}
    let {contentPage} = {...that.data}
    let urls = contentPage[0][activeindex].DescImgList.map(item => item.filepath)
    app.pictureTaps(src,urls)
  },
  //返回顶部
  backTop(){
    let that = this
    let {localNav:{localCurrentIndex},currentIndex,pageScrollTop} = {...that.data}
    if(currentIndex == 3){
      that.setData({
        [`localNav.localNavArr[${localCurrentIndex}].scrollTop`]:0
      })
    }else{
      that.setData({
        [`pageScrollTop[${currentIndex}]`]:0
      })
    }
  },
  //返回首页
  backIndex(){
    app.gotohomepage()
  },
  //跳去详情页
  goToDtl: function (e) {
    var strategeId = e.currentTarget.dataset.strategeid
    wx.navigateTo({
      url: '../news_center/news_detail?t=1&hid=' + strategeId
    })
   
  },
  //动态页参加活动
  enterActive(e){
    const {ticketid} = {...e.currentTarget.dataset}
    wx.navigateTo({
      url: '../business_detail/business_detail?bid='+ticketid
    })
  },
  //获取便民信息经纬度
  getRecomLocation: function () {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log(res)
        that.setData({
          'recomLocation.lat': res.latitude,
          'recomLocation.lng': res.longitude
        })
        app.globalData.userlat = res.latitude
        app.globalData.userlng = res.longitude
      }
    })
  },
  //去推荐商家详情页
  goToRecomDtl(e){
    let that = this,tip,phone,qrcode
    let {recomStoreInfo} = {...that.data}
    const {id,vip} = {...e.currentTarget.dataset}
    if (0 == vip){  // 未开通vip店铺
      tip = '截图扫码，微信访问';
      ({phone,qrcode} = {...e.currentTarget.dataset})
      //如果是店主，显示城主二维码
      if (app.globalData.userInfo.TelePhone == phone) {
        qrcode = app.globalData.cityqrcode
        phone = app.globalData.cityphone
        tip = '扫一扫二维码,联系同城客服升级店铺，即可在小程序访问详情'
      }
      Reflect.set(recomStoreInfo,'currentphone',phone)
      Reflect.set(recomStoreInfo,'currentshopqrcode',qrcode)
      Reflect.set(recomStoreInfo,'currentshoptip',tip)
      that.setData({
        recomStoreInfo
      })
    }
    else {
      wx.navigateTo({
        url: '../business_detail/business_detail?storeid=' + id
      })
    }
  },
  //关闭弹层
  closeqrcode: function () {
    let that = this
    that.setData({
      'recomStoreInfo.currentphone': '',
      'recomStoreInfo.currentshopqrcode': ''
    })
  },
  //拨打电话
  callpeple: function (e) {
    const {phone} = {...e.currentTarget.dataset}
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  //图片预览
  pictureTap(e){
    let that = this
    const {id,src} = {...e.currentTarget.dataset}
    let postlist = that.data.contentPage[2]
    try {
      wx.setStorageSync('needloadcustpage', false)
    }
    catch (e) {
    }
    if (postlist.length > 0 && id > 0) {
      var item = postlist.filter(f => f.Id == id)
      if (item != undefined && item.length > 0 && item[0].ImgList.length > 0) {
        var urls = item[0].ImgList.map(m => m.FileFullUrl)
        app.pictureTaps(src, urls)
      }
    }
  },
  //便民信息
   async regularlyPageChangeData(arr){
    let tempdata
    for(var i = 0,len = arr.length;i<len;i++){
      tempdata = arr[i];
      if (tempdata.ImgList.length > 3) {
        tempdata.ImgList = tempdata.ImgList.slice(0, 3);
      }
      if (tempdata.pname == tempdata.cname) {
        tempdata.cname = ''
      }
      if (!!tempdata.cname) {
        tempdata.pname += ' - ' + tempdata.cname
      }
      switch(tempdata.PTypeId){
        //二手买卖 租房 车辆买卖  
        case [c_enum.UsedGoods,c_enum.Tenement,c_enum.Vehiclesales].indexOf(tempdata.PTypeId):
          tempdata.pname += {"1":"- 出售","2":"- 求购","4":"- 出租","5":"- 求租"}[tempdata.SaleType]
        break;
        //拼车
        case c_enum.Carpooling:
          if (tempdata.IsExpired == 1) {
            tempdata.pname = "拼车-已过期"
          } else {
            tempdata.pname += {"4":" - 人找车"}[tempdata.IdentityType] || " - 车找人"
            tempdata.pname += {"3":"- 临时拼车","4":"- 长期拼车"}[tempdata.PositionType]
          }
        break;
        //宠物
        case c_enum.pet:
          tempdata.pname += {"5":"- 赠送","2":"- 求领养"}[tempdata.PositionType]
        break;
        //招聘求职
        case  c_enum.Recruit:
          if (tempdata.SaleType != 7) {
            tempdata.pname = {"1":"全职招聘","2":"兼职招聘"}[tempdata.PositionType] || "招聘"
          } else {
            tempdata.pname = {"1":"求全职","2":"求兼职"}[tempdata.PositionType] || "求职"
          }
          if (tempdata.TypeId != 295254 && !!tempdata.cname) {
            tempdata.pname += " - " + tempdata.cname
          }
      }
    }
      return arr
    },
    //查看全部
    showall(e) {
      let that = this;
      let {index,domname} = {...e.currentTarget.dataset}
      let {contentH,showallbtns} = {...that.data}
      that.setData({
        [showallbtns[`${domname}`].open]:!showallbtns[`${domname}`].open,
        [`contentH[${index}]`]:!contentH[index]
      });
    },
  //获取内容高度
   getAllRects(){
    let that = this
    let {contentH} = {...that.data}
    wx.createSelectorQuery().selectAll('.hd_c_center').boundingClientRect((res) => {
      res.forEach((key,index) => {
        if(key.height > 40){
          contentH[index] = true
        }
      });
      that.setData({
        contentH
      })
    }).exec()
  },
    //点击进入详情
    bottomItemClick(e) {
      const {id,type} = {...e.currentTarget.dataset}
      var url = '../detail/detail?id=' + id + "&type=" + type
      app.goNewPage(url)
    },
    //开店
    settled(){
      var reurl = '/' + addr.getCurrentPageUrlWithArgs()
      if (app.checkphonewithurl(reurl)) {
        wx.navigateTo({
          url: '../business_ruzhu/business_ruzhu'
        })
      }
    },
    //发布
    publishInfo(e){
      const {url} = {...e.currentTarget.dataset}
      wx.navigateTo({
        url:url
      })
    },
    //阅读头条
    readArticle(e){
      const {headtype,hid} = {...e.currentTarget.dataset}
      if(headtype == 1){
        app.ShowMsg('暂不支持第三方域名,敬请期待')
      }else{
        wx.navigateTo({
          url: '../news_center/news_detail?hid='+hid 
        })
      }
    },
    hiddenTips: function () {
      var path = addr.getCurrentPageUrlWithArgs()
      util.ShowPath(path)
    }
})