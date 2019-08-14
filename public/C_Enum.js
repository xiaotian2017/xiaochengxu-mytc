//已退款
const ReturnPrice= -2;
//取消订单
const CancelOrder = -1;
//未付款
const NoPay = 0;
//待发货
const WaitSendGoods = 3;
//正在配送
const SendingGoods = 4;
//待收货
const GetingGoods = 5;
//已收货
const GetedGoods = 6
const None = 0
//二手物品
const UsedGoods = 286121
//租房
const Tenement = 295252
//房产交易
const Housedeal = 295253
//招聘,求职/同城直聘
const Recruit = 295254
//兼职
const Parttimejob = 295255
//车辆买卖
const Vehiclesales = 295257
//生活服务
const Lifeservice = 295258
//拼车
const Carpooling = 304069
//宠物
const pet = 304497
//批发商城
const pfsc = 304595
//活动
const Active = 304451

//商务服务
const swfw = 304548
module.exports = {
  None: None,
  //二手物品
  UsedGoods: UsedGoods,
  //租房
  Tenement: Tenement,
  //房产交易
  Housedeal: Housedeal,
  //招聘,求职/同城直聘
  Recruit: Recruit,
  //兼职
  Parttimejob: Parttimejob,
  //车辆买卖
  Vehiclesales: Vehiclesales,
  //生活服务
  Lifeservice: Lifeservice,
  //拼车
  Carpooling: Carpooling,
  //宠物
  pet: pet,
  //批发商城
  pfsc: pfsc,
  //活动
  Active: Active,
  //商务服务
  swfw: swfw,

  ReturnPrice: ReturnPrice,
  CancelOrder: CancelOrder,
  NoPay: NoPay,
  WaitSendGoods: WaitSendGoods,
  SendingGoods: SendingGoods,
  GetingGoods: GetingGoods,
  GetedGoods: GetedGoods,
}