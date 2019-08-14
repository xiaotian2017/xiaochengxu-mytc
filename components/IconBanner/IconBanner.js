let app = getApp();
function isInteger(arr){
    return arr.length % 10 == 0 ? false : true
}
function isInteger(arr){
    return arr.length % 10 == 0 ? false : true
}
function getNum(arr){
    return ~~(arr.length / 10)
}
function getRemainder(arr){
    return arr.length % 10
}
function getClassifyIconBannerPage(arr,callback){
      var newArr = [],
          num = getNum(arr);
    
      for(var i = 0;i<num;i++){
          newArr[i] = [];
          for(var j = 0;j<10;j++){
              newArr[i].push(arr[10*i + j])
          }
      }
  
      if(isInteger(arr)){
          newArr.push([]) 
      }
      return callback(newArr)
}
function iconBannerPage(arr){
    return getClassifyIconBannerPage(arr,function(newArr){
   
        var num = getNum(arr),
            remainder = getRemainder(arr);
        for(var k = 0;k<remainder;k++){
            newArr[num].push(arr[10*num+k])
        }
        return newArr
    })
}
function isArray(arr){
    return Array.isArray?Array.isArray(arr):Object.prototype.toString.call(arg) === '[object Array]'
}
Component({
    properties:{
        indexItemList:{
            type:Array,
        },
    },
    methods:{
        init(){
            let that = this;
            let {indexItemList} = {...that.data};
            if (indexItemList.length>0&&!isArray(indexItemList[0])){
                if(indexItemList[0].length <= 5){
                    that.setData({
                        iconInline:true
                    })
                }else{
                    indexItemList = iconBannerPage(indexItemList)
                    that.setData({
                        indexItemList
                    })
                }
            }
        },
        //板块跳转
        IndexItemclick(e) {
            var url;
            let {typename,typeid,itemid,itemtype,selfurl} = {...e.currentTarget.dataset}
            if(itemtype == 1){
                url = '/pages/post/postlist?typeid=' + typeid
            }else if (itemtype == 4) {
                switch(itemid){
                    case 1://好店
                        url = '/pages/shopindex/shopindex';
                    break;
                    case 5://分类信息
                        url = '/pages/postindex/postindex'
                    break;
                    case 6://114
                        url = '/pages/city114/city114'
                }
            } else if (itemtype == 3) {
              url = '/'+ selfurl
            }else if (itemtype == 2 || !!typeid) {
                url = '/pages/business_list/business_list?typeid=' + typeid
            } 
            app.goNewPage(url)
        }
    }
})