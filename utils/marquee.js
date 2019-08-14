

export default {
  getWidth: (str) => {
    let pre= [].reduce.call(str, (pre, cur, index, arr) => {
      if (str.charCodeAt(index) > 255) {// charCode大于255是汉字
        pre++;
      } else {
        pre +=28;
      }
 
      return pre;
    }, 0);
    
    pre += 600;
    return pre;
  },
  getDuration: (str) => {// 保留，根据文字长度设置时间
    return this.getWidth() /10;
  }
}