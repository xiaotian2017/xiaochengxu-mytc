 const HOST = "https://txiaowei.vzan.com/";
 // const HOST = "https://cityapi.vzan.com/";

 function doget(url, data, cb, completecb) {
   wx.request({
     url: url,
     data: data,
     success(res) {
       typeof cb == "function" && cb(res)
     },
     complete() {
       typeof completecb == "function" && completecb()
     }
   })
 }

 function getCurrentPageUrl() {
   var pages = getCurrentPages() //获取加载的页面
   var currentPage = pages[pages.length - 1] //获取当前页面的对象
   var url = currentPage.route //当前页面url
   return url
 }
 /*获取当前页带参数的url*/
 function getCurrentPageUrlWithArgs() {
   var pages = getCurrentPages() //获取加载的页面
   var currentPage = pages[pages.length - 1] //获取当前页面的对象
   var url = currentPage.route //当前页面url
   var options = currentPage.options //如果要获取url中所带的参数可以查看options
   //拼接url的参数
   var urlWithArgs = url + '?shareoper=1&' //加上分享表示来源
   for (var key in options) {
     var value = options[key]
     urlWithArgs += key + '=' + value + '&'
   }
   urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
   return urlWithArgs
 }

 function getCurrentPageUrlWithScene() {
   var pages = getCurrentPages() //获取加载的页面
   var currentPage = pages[pages.length - 1] //获取当前页面的对象
   var url = currentPage.route //当前页面url
   var options = currentPage.options //如果要获取url中所带的参数可以查看options
   var urlWithArgs = ""
   for (var key in options) {
     var value = options[key]
     urlWithArgs += key + '=' + value + '&'
   }
   urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
   return urlWithArgs
 }

 function getsceneparam(key, scene) {
   var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
   var r = scene.match(reg);
   if (r != null) return unescape(r[2]);
   return null;
 }

 function a() {}

 a.onlinepay = HOST + "IBaseData/onlinepay", //获取店铺优惠券
   a.gsvlist = HOST + "IBaseData/gsvlist", //获取店铺优惠券
   a.AddCitySub = HOST + "IBaseData/addcitysub", //同城分销添加
   a.GetXcxHeadImg = HOST + 'apiQuery/GetXcxHeadImg'; // 获取子区域
 a.CityFxPay = HOST + "IBaseData/fxpay", //同城分销下单
   a.BindFxOrigin = HOST + "IBaseData/BindFxOrigin", //绑定分销员
   a.GetFxFollowers = HOST + "IBaseData/GetFxFollowers"; //商品分销下属
 a.GetFxFollowersMain = HOST + "IBaseData/GetFxFollowersMain"; //商品分销下属
 a.GetCashList = HOST + "IBaseData/GetCashList"; //商品分销收益log
 a.GetMyFxMain = HOST + "IBaseData/GetMyFxMain"; //商品分销收益
 a.GetMyFx = HOST + "IBaseData/GetMyFx"; //分销记录
 a.RefreshPost = HOST + "apiQuery/RefreshPost"; //刷新帖子
 a.GetWechatAdv = HOST + "IBaseData/GetWechatAdv"; //获取小程序广告
 a.addshareitem = HOST + "IBaseData/addshareitem"; //分享回调
 a.Csvnum = HOST + "IBaseData/csvnum"; //券号核销 
 a.VoteTake = HOST + "vote/VoteTake"; //投票参赛页
 a.GetVoteSelfAddMain = HOST + "vote/GetVoteSelfAddMain"; //投票参赛页
 a.RefundGroup = HOST + "IBaseData/RefundGroup"; //拼团退款
 a.GetAddresse = HOST + "IBaseData/GetAddresse"; //新的下单接口 
 a.AddOrder = HOST + "IBaseData/AddOrder"; //新的下单接口 
 a.GetChargeTypeInfoList = HOST + "IBaseData/GetChargeTypeInfoList"; //获取付费配置
 a.SeePostOne = HOST + "IBaseData/SeePostOne"; //付费查看联系方式
 a.CanSeePostLink = HOST + "IBaseData/CanSeePostLink"; //付费查看联系方式
 a.RemoveAdmin = HOST + "IBaseData/RemoveAdmin"; //管理员邀请页面
 a.GetAdminInviteMain = HOST + "IBaseData/GetAdminInviteMain"; //管理员邀请页面
 a.AcceptAdminInvite = HOST + "IBaseData/AcceptAdminInvite"; //管理员接受邀请
 a.GetXcxMgrList = HOST + "IBaseData/GetXcxMgrList"; //管理员列表  
 //a.AddPostNew = HOST + "apiQuery/AddPostNew"; //发表帖子  
 a.AddPostNew = HOST + "apiQuery/SavePostNew"; // 发表帖子2019/7/11
 a.CheckStoreIsComplain = HOST + "IBaseData/CheckStoreIsComplain"; //检查商户是否已经投诉
 a.AddStoreComplaints = HOST + "IBaseData/AddStoreComplaints"; //商户投诉
 a.RefundCoupon = HOST + "IBaseData/RefundCoupon"; //优惠券退款
 a.CheckStoreGoodUse = HOST + "IBaseData/CheckStoreGoodUse"; //检查商品是否核销
 a.GetMineMain = HOST + "IBaseData/GetMineMain"; //我的获取基本数据
 a.StoreGoodUse = HOST + "IBaseData/StoreGoodUse"; //店铺商品核销
 a.BuyFreeCut = HOST + "IBaseData/BuyFreeCut"; //减价免费购买
 a.GetAddOrEditPost = HOST + "apiQuery/GetAddOrEditPost"; //减价免费购买
 a.BuyFreeCut = HOST + "IBaseData/BuyFreeCut"; //减价免费购买
 a.TurnPayOnline = HOST + "IBaseData/TurnPayOnline"; //在线付款功能开关
 a.GetGoodsTypeConfigs = HOST + "IBaseData/GetGoodsTypeConfigs"; //获取购物卡子分类
 a.UseGroup = HOST + "IBaseData/UseGroup"; //拼团核销
 a.CheckStoreGroupUse = HOST + "IBaseData/CheckStoreGroupUse"; //检查拼团是否已经核销
 a.GetHalfCardUseXcxQrCode = HOST + "IBaseData/GetHalfCardUseXcxQrCode"; //同城卡核销获取小程序二维码
 a.GetGroupXcxQrCode = HOST + "IBaseData/GetGroupXcxQrCode"; //拼团核销获取小程序二维码
 a.GetCityAreaByCityId = HOST + "IBaseData/GetCityAreaByCityId"; //查询同城的街道信息
 a.GetSharePosterQrCode = HOST + "IBaseData/GetSharePosterQrCode"; //获取海报二维码
 a.GetAddOrEditRedpack = HOST + "IBaseData/GetAddOrEditRedpack"; //编辑红包编辑页
 a.GetMgrRedpackList = HOST + "IBaseData/GetMgrRedpackList"; //我管理的红包
 a.EditRedpacket = HOST + "IBaseData/EditRedpacket"; //编辑红包
 a.AcceptClerkInvite = HOST + "IBaseData/AcceptClerkInvite"; //接受店员邀请
 a.GetClerkInvitedMain = HOST + "IBaseData/GetClerkInvitedMain"; //店员邀请页面
 a.CancelClerk = HOST + "IBaseData/CancelClerk"; //取消店员
 a.GetStoreClerk = HOST + "IBaseData/GetStoreClerk"; //获取店员
 a.AdminUseLike = HOST + "IBaseData/AdminUseLike"; //集爱心核销
 a.GetLoveQrcode = HOST + "IBaseData/GetLoveQrcode"; //获取集爱心核销二维码
 a.CheckStoreLoveUse = HOST + "IBaseData/CheckStoreLoveUse"; //检查集爱心核销成功
 a.CheckCouponUse = HOST + "IBaseData/CheckCouponUse"; //检查优惠核销成功
 a.StoreCouponUse = HOST + "IBaseData/StoreCouponUse"; //优惠核销
 a.GetCouponQrCode = HOST + "IBaseData/GetCouponQrCode"; //获取优惠核销二维码
 a.CheckStoreCutUse = HOST + "IBaseData/CheckStoreCutUse" // 检查减价核销是否已经扫码
 a.StoreCutUse = HOST + "IBaseData/StoreCutUse" //砍价使用获取二维码新
 a.GetCutQrcodeNew = HOST + "IBaseData/GetCutQrCode" //砍价使用获取二维码新
 a.GetUseGroupMain = HOST + "IBaseData/GetUseGroupMain" // 拼团核销取数据
 a.GetMyGroups = HOST + "IBaseData/GetMyGroups" // 获取我的拼团
 a.GetActivity = HOST + "IBaseData/GetActivity" // 获取店铺活动
 a.GetStoreScrollData = HOST + "IBaseData/GetStoreScrollData" // 获取店铺公告
 a.UpdateBookingFree = HOST + "IBaseData/UpdateBookingFree" // 是否开启预订
 a.UpdateBookingFreeUser = HOST + "IBaseData/UpdateBookingFreeUser" // 更新预订状态
 a.GetAddOrEditBook = HOST + "IBaseData/GetAddOrEditBook" //预订管理
 a.FreeBookList = HOST + "IBaseData/GetFreeBookingUserListByStoreId" //免费预订列表
 a.AddBooking = HOST + "IBaseData/AddBooking" //发布预订功能
 a.DelStoreLove = HOST + "IBaseData/DelStoreLove" //集爱心删除
 a.GetMyMgrStoreLove = HOST + "IBaseData/GetMyMgrStoreLove" //集爱心管理
 a.GetCouponBuyRecord = HOST + "IBaseData/GetCouponBuyRecord" //购买记录
 a.DelStoreCoupon = HOST + "IBaseData/DelStoreCoupon" //删除优惠券
 a.StopStoreCoupon = HOST + "IBaseData/StopStoreCoupon" //优惠提前结束
 a.AddLike = HOST + "IBaseData/AddLike" //添加集爱心活动
 a.GetAddOrEditLove = HOST + "IBaseData/GetAddOrEditLove" //获取集爱心进行编辑
 a.GetHeadLine = HOST + "IBaseData/GetHeadLine" //获取头条导航
 a.GetAddOrEditCut = HOST + "IBaseData/GetAddOrEditCut" //砍价编辑
 a.DelStoreCut = HOST + "IBaseData/DelStoreCut" //砍价删除
 a.GetMyMgrStoreCut = HOST + "IBaseData/GetMyMgrStoreCut" //集爱心管理获取列表
 a.GetStoreLoveList = HOST + "IBaseData/GetStoreLoveList" //集爱心消费二维码
 a.UseLove = HOST + "IBaseData/UseLove" //集爱心使用
 a.AddLoveUser = HOST + "IBaseData/AddLoveUser" //报名爱心价
 a.AddLoveOrder = HOST + "IBaseData/AddLoveOrder" //爱心价下单
 a.GetLoveRank = HOST + "IBaseData/GetLoveRank" //爱心价列表
 a.GetLoveRecord = HOST + "IBaseData/GetLoveRecord" //集爱心详情页
 a.GetLoveMain = HOST + "IBaseData/GetLoveMain" //集爱心详情页  
 a.HelpLikeUser = HOST + "IBaseData/HelpLikeUser" //集爱心
 a.GetMyStoreLoves = HOST + "IBaseData/GetMyStoreLoves" //我的爱心价列表
 a.GetLoveList = HOST + "IBaseData/GetLoveList" //爱心价列表
 a.DrawCash = HOST + "IBaseData/drawcash" //收益详情
 a.GetIncomeDetail = HOST + "IBaseData/getwalletdetail" //收益详情
 a.GetIncomeList = HOST + "IBaseData/getincomelist" //收益明细
 a.GetWalletPage = HOST + "IBaseData/getwalletpage" //我的收益
 a.GetStoreCutList = HOST + "IBaseData/GetStoreCutList" //店铺砍价活动
 a.GetShopQrcode = HOST + "IBaseData/shopxcxqrcode" //店铺二维码
 a.UseCut = HOST + "IBaseData/mubqrcode" //砍价使用
 a.CutPrice = HOST + "IBaseData/cutprice" //砍价请求
 a.GetHelpers = HOST + "IBaseData/getmubr" //砍价帮忙用户
 a.CutPay = HOST + "IBaseData/bargainpay" //砍价购买下单
 a.GetMyStoreCuts = HOST + "IBaseData/gub" //我的砍价
 a.GetStoreCuts = HOST + "IBaseData/getcitybargain" //砍价列表
 a.AddCutPrice = HOST + "IBaseData/AddCutPrice" //发布砍价
 a.ConcernShop = HOST + "IBaseData/concernshop" //关注店铺
 a.GetCutMainSelf = HOST + "IBaseData/GetCutMainSelf" //获取砍价详细页主要数据 
 a.AddBargainUser = HOST + "IBaseData/addbargainuser" //砍价参与
 a.GetCutRanking = HOST + "IBaseData/getcutranking" //获取砍价详细页帮砍用户
 a.GetCutMain = HOST + "IBaseData/GetCutMain" //获取砍价详细页主要数据 
 a.GetConcernPagePath = HOST + "IBaseData/GetConcernPagePath" //获取关注的页面
 a.ConcernPagePath = HOST + "IBaseData/ConcernPagePath" //关注某个页面
 a.BuyFreeCoupon = HOST + "IBaseData/BuyFreeCoupon" //购买免费优惠券
 a.CheckExpired = HOST + "apiQuery/checkexpired" //检查是否过期
 a.getpushpost = HOST + "apiQuery/getpushpost" //便民信息推荐
 a.GetWechatPhone = HOST + "apiQuery/AddWechatBindPhone"; //绑定微信绑定的手机号码
 a.GetIndexRecommentType = HOST + "IBaseData/GetIndexRecommentType";
 a.GetSubStoreTypeFormat = HOST + "IBaseData/GetSubStoreTypeFormat";
 a.deleteImage = HOST + "apiQuery/DeleteStoreImage"; //删除店铺图片
 a.GetAddOrEditStore = HOST + "IBaseData/GetAddOrEditStore"; //店铺编辑页
 a.GetMyStore = HOST + "IBaseData/GetMyStore"; //我的店铺
 a.GetMyStores = HOST + "IBaseData/GetMyStores"; //我的店铺列表
 a.GetStoresCouponAdv = HOST + "IBaseData/GetStoreCouponsAdv"; //优惠列表轮播图
 a.GetStoresCoupon = HOST + "IBaseData/GetStoreCoupons"; //优惠列表
 a.GetStoresByTypeSearch = HOST + "IBaseData/search"; //店铺列表页搜索店铺
 a.GetStoresByType = HOST + "IBaseData/GetStoresByType"; //获取分类下的店铺
 a.GetSubStoreTypes = HOST + "IBaseData/GetSubStoreType"; //获取店铺列表页分类
 a.GetSubStoreType = HOST + "IBaseData/GetSubStoreType"; //获取首页类别图标
 a.GetNotice = HOST + "IBaseData/GetNotice"; //获取首页公告
 a.GetBanner = HOST + "IBaseData/GetBannerAjax"; //获取轮播图
 a.GetRecommendStore = HOST + "IBaseData/GetRecommendStore"; //获取首页推荐商家
 a.GetStoreDetail = HOST + "IBaseData/GetStoreDetail"; //获取商家详情
 a.GetStrategyList = HOST + "IBaseData/GetStrategyList"; //获取商家动态
 a.GetCouponList = HOST + "IBaseData/GetCouponList"; //获取商家优惠
 a.GetBookingList = HOST + "IBaseData/GetBookingList"; //获取商家预定列表
 a.GetCommentList = HOST + "IBaseData/GetCommentList"; //获取商家评论
 a.GetBookingFreeList = HOST + "IBaseData/GetBookingFreeList"; //是否开启免费预定功能
 a.GetBookingFreeTimeList = HOST + "IBaseData/GetBookingFreeTimeList"; //查找可免费预定时间段
 a.AddBookingUserFree = HOST + "IBaseData/AddBookingUserFree"; //提交免费预定信息
 a.AddBookingUser = HOST + "IBaseData/AddBookingUser"; //提交付费预定信息
 a.GetComment = HOST + "apiQuery/GetComment"; //获取评论
 a.uploadImage = HOST + "apiQuery/uploadImageFromPost"; // 上传文件

 a.uploadImageWithAttachment = HOST + "apiQuery/uploadImageWithAttachment"; // 上传文件
 a.AddStoreComment = HOST + "apiQuery/AddStoreComment";
 a.AddHeadLineComment = HOST + "IBaseData/AddHeadComment";
 a.AddStrategyComment = HOST + "IBaseData/AddStrategyComment";
 a.loginByThirdPlatform = HOST + "apiQuery/CheckUserLogin"; //登陆微赞后台
 a.PayOnline = HOST + "IBaseData/PayOnline";

 a.GetOrderDetail = HOST + "IBaseData/GetOrderDetail";
 a.GetAreaList = HOST + "IBaseData/GetAreaListByCityInfoId"; //查询城市列表
 a.GetStreetList = HOST + "IBaseData/GetStreetListByAreaCode"; //根据区域code读取街道列表
 a.GetStoreType = HOST + "IBaseData/GetStoreType"; //查询同城店铺分类
 a.GetStoreChargeType = HOST + "IBaseData/GetStoreChargeType"; //查询同城店铺入驻收费项
 a.AddStore = HOST + "IBaseData/AddStore"; //店铺入驻
 a.AddClaim = HOST + "IBaseData/AddClaim"; //店铺认领
 a.AddStorePaytry = HOST + "IBaseData/AddStorePaytry"; //免费入驻/试用期入驻
 a.GetMyCouponUserListByUserId = HOST + "IBaseData/GetMyCouponUserListByUserId"; //我的优惠券
 a.GetMyBookingUserListByUserId = HOST + "IBaseData/GetMyBookingUserListByUserId"; //我的优惠预定
 a.GetBookingUserDetail = HOST + "IBaseData/GetBookingUserDetail"; //我的优惠预定详情
 a.GetMyBookingFreeUserListByUserId = HOST + "IBaseData/GetMyBookingFreeUserListByUserId"; //我的免费预定
 a.GetCouponDetail = HOST + "IBaseData/GetCouponDetail"; //优惠详情
 a.GetMyCouponDetail = HOST + "IBaseData/GetMyCouponDetail"; //我的优惠详情
 a.GetBookingFreeUserDetail = HOST + "IBaseData/GetBookingFreeUserDetail"; //我的免费预订详情
 a.GetQrCodeBooking = HOST + "IBaseData/GetQrCodeBooking"; //获取优惠预订二维码
 a.GetQrCodeUrl = HOST + "IBaseData/GetQrCodeUrl"; //获取同城客服二维码
 a.Senduserauth = HOST + "apiQuery/Senduserauth"; //发送验证码
 a.Submitauth = HOST + "apiQuery/Submitauth"; //提交验证
 a.UpdateUserInfo = HOST + "apiQuery/UpdateUserInfo" //修改个人信息
 a.AddPayOrder = HOST + "apiQuery/AddPayOrder";
 a.PayOrder = HOST + "apiQuery/PayOrder";
 // =================同城卡相关=================
 a.getHalfCardList = HOST + "IBaseData/GetHalfCardList"; // 同城卡列表
 a.getHalfServices = HOST + "IBaseData/GetHalfServices"; // 同城卡优惠店铺列表
 a.getArea = HOST + 'IBaseData/GetArea'; // 获取区域 可复用接口
 a.getHalfCardMain = HOST + 'IBaseData/GetHalfCardMain'; //  同城卡服务详情
 a.getMyHalfCardMain = HOST + 'IBaseData/GetMyHalfCardMain'; // 是否开通同城卡
 a.buyHalfCard = HOST + 'IBaseData/BuyHalfCard'; // 购买同城卡
 a.halfCardBuyMain = HOST + 'IBaseData/HalfCardBuyMain'; // 同城卡购买内容
 a.useCodeGetHalfCard = HOST + 'IBaseData/UseCodeGetHalfCard'; // 兑换码开卡
 a.halfCardFreeGet = HOST + 'IBaseData/HalfCardFreeGet'; // 免费领取
 a.halfCardAddOrder = HOST + 'IBaseData/HalfCardAddOrder'; // 同城卡服务抢购
 a.FreeGetHalfOffService = HOST + 'IBaseData/FreeGetHalfOffService'; // 同城卡服务抢购
 a.getHalfCardBuySuccessMain = HOST + 'IBaseData/GetHalfCardBuySuccessMain'; // 购买成功页
 a.getMyHalfCard = HOST + 'IBaseData/GetMyHalfCard'; // 同城卡订单列表页
 a.CheckStoreHalfCardUse = HOST + 'IBaseData/CheckStoreHalfCardUse'; // 检查是否已经核销同城卡
 a.GetHalfCardUseXcxQrCode = HOST + 'IBaseData/GetHalfCardUseXcxQrCode'; // 同城卡核销二维码
 a.useHalfCard = HOST + 'IBaseData/useHalfCard'; // 同城卡核销二维码页面
 a.getStoreHalfCard = HOST + 'IBaseData/GetStoreHalfCard'; // 同城卡核销二维码页面
 a.postAddDisSvcModel = HOST + 'IBaseData/PostAddDisSvcModel'; // 发布同城卡
 a.getAddDisSvcModel = HOST + 'IBaseData/GetAddDisSvcModel'; // 发布同城卡相关信息
 a.getStoreDisSvcMgrList = HOST + 'IBaseData/GetStoreDisSvcMgrList'; // 发布同城卡相关信息
 a.deleteHalfCard = HOST + 'IBaseData/DeleteHalfCard'; // 删除同城卡
 a.getBuyRecords = HOST + 'IBaseData/GetBuyRecords'; // 同城卡销售记录
 a.GetIndexData = HOST + 'IBaseData/GetIndexData'; // 同城首页数据
 a.AdminUseHalfCard = HOST + 'IBaseData/AdminUseHalfCard'; // 同城首页数据
 // =================赏金红包相关=================
 a.GetRedPacket = HOST + 'IBaseData/GetRedPacketBy'; // 赏金红包数据
 a.CheckUserRedPacket = HOST + 'IBaseData/CheckUserRedPacket'; // 判断是否已领
 a.AddRedPacketDetail = HOST + 'IBaseData/AddRedPacketDetail'; // 增加红包记录
 a.MiniAppShareRedpacket = HOST + 'IBaseData/MiniAppShareRedpacket'; // 红包分享处理接口
 a.RedPacketToUser = HOST + 'IBaseData/RedPacketToUser'; // 领取红包
 a.AddRedpacketDrawByRuId = HOST + 'IBaseData/AddRedpacketDrawByRuId'; // 给分享用户新增次数
 a.GetRedPackDetail = HOST + 'IBaseData/GetRedPackDetail'; // 红包领取记录
 a.GetStoreRedListByCity = HOST + 'IBaseData/GetStoreRedListByCity'; // 红包集合列表页
 // =================首页=================
 a.GetSaleItemData = HOST + 'IBaseData/GetSaleItemData';
 // =================贺卡=================
 a.GetBlessAddModel = HOST + 'actapi/GetBlessAddModel'; // 获取红包费率
 a.AddBless = HOST + 'actapi/AddBless'; // 新增贺卡
 a.Christmasbeeling = HOST + 'actapi/Christmasbeeling'; // 贺卡记录
 a.GetNormalRedPacket = HOST + 'actapi/GetNormalRedPacket'; // 查询红包
 a.DrawNormalRedPacket = HOST + 'IBaseData/DrawNormalRedPacket'; // 领取红包
 a.Getmybeeling = HOST + 'actapi/getmybeeling'; // 红包列表
 // =================小商城=================
 a.GetAddOrEditGood = HOST + 'IBaseData/GetAddOrEditGood'; // 获取商品回填信息
 a.GetMyMgrGoods = HOST + 'IBaseData/GetMyMgrGoods'; // 发布商品列表
 a.AddGoods = HOST + 'IBaseData/AddGoods'; // 发布或者修改商品
 a.Get_AddGoodTypeViewModel = HOST + 'IBaseData/Get_AddGoodTypeViewModel'; // 获取商品分类
 a.AddOrEditGoodsType = HOST + 'IBaseData/AddOrEditGoodsType'; // 添加/删除/修改商品分类
 a.EditGoodsTypeSort = HOST + 'IBaseData/EditGoodsTypeSort'; // 设置商品分类排序值
 a.GetFreightList = HOST + 'IBaseData/GetFreightList'; // 获取运费模板列表
 a.UpdateFreight = HOST + 'IBaseData/UpdateFreight'; // 修改、添加运费模板
 a.DeleteFreight = HOST + 'IBaseData/DeleteFreight'; // 删除运费模板 
 a.GetFreight = HOST + 'IBaseData/GetFreight'; // 获取要编辑的运费模板 
 a.DelGoodAttr = HOST + 'IBaseData/DelGoodAttr'; // 删除规格 
 a.UpdateGoodSort = HOST + 'IBaseData/UpdateGoodSort'; // 发布商品列表排序 
 a.GoodIsSell = HOST + 'IBaseData/GoodIsSell'; // 上下架商品
 a.DelGoods = HOST + 'IBaseData/DelGoods'; // 删除发布商品
 a.GetMerchantOrder = HOST + 'IBaseData/GetMerchantOrder'; // 获取商家店单列表
 a.GetDistributionInfo = HOST + 'IBaseData/GetDistributionInfo'; // 获取配送信息
 a.ConfirmDistribute = HOST + 'IBaseData/ConfirmDistribute'; // 立即发货或者确认发货
 a.GetGoodsOrder = HOST + 'IBaseData/GetGoodsOrder'; // 获取商品订单列表
 a.RefleshOrderNo = HOST + 'IBaseData/refleshOrderNo'; // 重新支付
 a.CancelGoodOrder = HOST + 'IBaseData/CancelGoodOrder'; // 取消订单
 a.ConfirmAccept = HOST + 'IBaseData/ConfirmAccept'; // 取消订单
 a.GetGoodOrderDetail = HOST + 'IBaseData/GetGoodOrderDetail'; // 商品订单详情
 a.RefundOrder = HOST + 'IBaseData/RefundOrder'; // 商品退款
 a.RefundOrderDetail = HOST + 'IBaseData/RefundOrderDetail'; // 商品退款
 a.GetMyCardOrder = HOST + 'IBaseData/GetMyCardOrder'; // 预购买订单详情
 a.GetMyCart = HOST + 'IBaseData/GetMyCart'; // 购物车订单商品信息
 a.GetBuyGoodDetail = HOST + 'IBaseData/GetBuyGoodDetail'; // 直接购买订单商品信息
 a.GoodsPay = HOST + 'IBaseData/GoodsPay'; // 下单
 a.GetGetAddresse = HOST + 'IBaseData/GetAddresse'; // 获取要编辑的收货地址
 a.ModifyAddress = HOST + 'IBaseData/ModifyAddress'; // 添加或修改收货地址
 a.GetSubArea = HOST + 'IBaseData/GetSubAreaBigCase'; // 获取子区域
 a.GetAddressList = HOST + 'actapi/GetAddressList'; // 运费列表
 a.DeleteAddress = HOST + 'actapi/DeleteAddress'; // 删除收货地址
 a.SetDefaultAddress = HOST + 'IBaseData/SetDefaultAddress'; // 设默认收货地址
 a.GoodsCartPay = HOST + 'IBaseData/GoodsCartPay'; // 购物车下单
 // =================店铺相册=================
 a.AddAlbum = HOST + 'IBaseData/AddAlbum'; // 添加相册 
 a.UpdateAlbumName = HOST + 'IBaseData/UpdateAlbumName'; // 修改相册名称 
 a.AddAlbumPic = HOST + 'IBaseData/AddAlbumPic'; // 添加相册图片 
 a.GetAlbumPic = HOST + 'IBaseData/GetAlbumPic'; // 获取相册图片 
 a.GetAlbumList = HOST + 'IBaseData/GetAlbumList'; // 相册列表 
 a.GetAlbumMain = HOST + 'IBaseData/GetAlbumMain'; // 相册列表 
 a.DelAlbum = HOST + 'IBaseData/DelAlbum'; // 相册列表 
 a.DelAlbumPic = HOST + 'IBaseData/DelAlbumPic'; // 删除相册图片
 a.GetDetailConfig = HOST + 'IBaseData/GetDetailConfig'; // 店铺皮肤编辑
 a.EditDetailConfig = HOST + 'IBaseData/EditDetailConfig'; // 店铺皮肤更新
 a.GetPicShow = HOST + 'IBaseData/GetPicShow'; // 获取店铺轮播相册


 ////////////////////////////--微赞同城信息小程序接口
 //首页
 a.GetHomeInfoData = HOST + "apiQuery/GetHomeInfoData"
 //热门推荐
 a.getpushpost = HOST + "apiQuery/getpushpost"
 //帖子列表
 a.GetPostList = HOST + "apiQuery/GetPostList"
 //加载拼车列表数据
 a.getcarpoolbottom = HOST + "apiQuery/getcarpoolbottom"
 //新的加载拼车列表数据
 a.GetCarList = HOST + "apiQuery/GetCarList"
 //加载列表数据
 a.gettplbottom = HOST + "apiQuery/gettplbottom"
 //帖子详情
 a.GetPostDetail = HOST + "apiQuery/GetPostDetail"
 //获取评论
 a.GetComment = HOST + "apiQuery/GetComment"
 //添加帖子评论
 a.AddComment = HOST + "apiQuery/AddComment"
 //举报发帖
 a.addcomplaints = HOST + "apiQuery/addcomplaints"
 //获取帖子分类
 a.getposttypeconfig = HOST + "apiQuery/getposttypeconfig"
 //修改个人中心
 a.UpdateUserInfo = HOST + "apiQuery/UpdateUserInfo"
 //获取我的发布
 a.GetMyPublish = HOST + "apiQuery/GetMyPublish"
 a.GetMyPost = HOST + "apiquery/GetMyPostList" //2019/7/11
 //继续付款
 a.continuepostpay = HOST + "apiQuery/continuepostpay"
 //根据区域id获取发帖付费信息列表
 a.getchargetypeinfolistpaytype = HOST + "apiQuery/getchargetypeinfolistpaytype"
 //发帖
 a.publish = HOST + "apiQuery/publish"
 //添加帖子
 a.addpost = HOST + "apiQuery/addpost"
 //删除帖子
 a.delpost = HOST + "apiQuery/delpost"
 //修改已付费帖子状态
 a.passpost = HOST + "apiQuery/passpost"
 //获取广告图
 a.GetImg = HOST + "apiQuery/GetImg"
 //检查是否过期
 a.CheckExpired = HOST + "apiQuery/checkexpired"
 // 获取分类页面信息
 a.get_post_select_item = HOST + "apiQuery/get_post_select_item"
 // 检查刷新收费配置
 a.checkrefleshconfig = HOST + "apiQuery/checkrefleshconfig"; // 检查刷新收费配置

 a.GetStoreStrategyList = HOST + "IBaseData/GetStoreStrategyList" //头条商家动态
 a.GetHeadlinesList = HOST + "IBaseData/GetHeadlinesList" // 头条功能
 a.GetTopHeadLine = HOST + "IBaseData/GetTopHeadLine" //获取首页头条动态
 a.GetHeadLineDetail = HOST + 'IBaseData/GetHeadLineDetail' //获取头条详情页

 a.GetHeadLineDetail = HOST + 'IBaseData/GetHeadLineDetail' //获取头条详情页
 a.GetCommonCommentList = HOST + 'IBaseData/GetCommonCommentList' //获取头条评论
 //团购
 a.GetGroupList = HOST + 'IBaseData/GetGroupList' // 获取团购列表页
 a.GetStoreGroups = HOST + 'IBaseData/GetStoreGroups' //获取店铺团购
 a.GetGroupMain = HOST + 'IBaseData/GetGroupMain' //获取团购详情
 a.GetSubGroupMain = HOST + 'IBaseData/GetSubGroupMain' // 获取子团购详情
 a.GetRecommendGroup = HOST + 'IBaseData/GetRecommendGroup' //团购推荐
 a.AddGroupOrder = HOST + 'IBaseData/AddGroupOrder' //发起团购支付
 a.AddGroup = HOST + 'IBaseData/AddGroup' //发布团购
 a.GetMyMgrGroups = HOST + 'IBaseData/AddGroupOrder' //团购管理列表页
 a.GetAddOrEditGroup = HOST + 'IBaseData/GetAddOrEditGroup' //团购编辑页
 a.DeleteStoreGroup = HOST + 'IBaseData/DeleteStoreGroup' //团购管理删除
 a.GetGroupParticipants = HOST + 'IBaseData/GetGroupParticipants' //团购参与记录
 a.GroupParticipantRecordMain = HOST + 'IBaseData/GroupParticipantRecordMain' //获取参团核销

 // 新的会员卡
 a.GetMemberConfigs = HOST + 'IBaseData/GetMemberConfigs'
 a.PayMemberOrder = HOST + 'IBaseData/PayMemberOrder'

 a.MemberCode = HOST + 'IBaseData/MemberCode'
 a.GetCityMemberVouchers = HOST + 'IBaseData/GetCityMemberVouchers'
 a.getmerbermain = HOST + '/IBaseData/getmerbermain'
 a.DrawVoucher = HOST + '/IBaseData/DrawVoucher'



 a.StorePayOnline = HOST + 'IBaseData/DoPayOnline'; // 在线支付新接口
 a.checkCityExpired = HOST + 'apiQuery/checkCityExpired'; //检查小程序是否过期
 a.checkStoreStatus = HOST + 'apiQuery/checkStoreStatus'; //检查店铺是否过期


 module.exports = {
   HOST: HOST,
   Address: a,
   getCurrentPageUrl: getCurrentPageUrl,
   getCurrentPageUrlWithArgs: getCurrentPageUrlWithArgs,
   getCurrentPageUrlWithScene: getCurrentPageUrlWithScene,
   getsceneparam: getsceneparam
 }