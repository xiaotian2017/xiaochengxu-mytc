const c_enum = require('../../public/C_Enum');
Component({
    properties:{
    },
    ready(){
        
    },
    methods:{
        judgeType(){
            if(tempdata.pname == tempdata.cname) {
                tempdata.cname = ''
            }
            if(!!tempdata.cname) {
                tempdata.pname += ' - ' + tempdata.cname
            }
            switch (tempdata.PTypeId) {
                //二手买卖 租房 车辆买卖  
                case[c_enum.UsedGoods, c_enum.Tenement, c_enum.Vehiclesales].indexOf(tempdata.PTypeId):
                    tempdata.pname += { "1": "- 出售",
                                        "2": "- 求购", 
                                        "4": "- 出租", 
                                        "5": "- 求租" }[tempdata.SaleType]
                  break;
                //拼车
                case c_enum.Carpooling:
                  if (tempdata.IsExpired == 1) {
                    tempdata.pname = "拼车-已过期"
                  } else {
                    tempdata.pname += { "4": " - 人找车" }[tempdata.IdentityType] || " - 车找人"
                    tempdata.pname += { "3": "- 临时拼车", "4": "- 长期拼车" }[tempdata.PositionType]
                  }
                  break;
                //宠物
                case c_enum.pet:
                  tempdata.pname += { "5": "- 赠送", "2": "- 求领养" }[tempdata.PositionType]
                  break;
                //招聘求职
                case c_enum.Recruit:
                  if (tempdata.SaleType != 7) {
                    tempdata.pname = { "1": "全职招聘", "2": "兼职招聘" }[tempdata.PositionType] || "招聘"
                  } else {
                    tempdata.pname = { "1": "求全职", "2": "求兼职" }[tempdata.PositionType] || "求职"
                  }
                  if (tempdata.TypeId != 295254 && !!tempdata.cname) {
                    tempdata.pname += " - " + tempdata.cname
                }
            }
        }
    }
})