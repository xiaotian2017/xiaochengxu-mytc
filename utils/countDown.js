function vzTimer(timeArr, wxThis) {

    wxThis.intervalLabel && clearInterval(wxThis.intervalLabel);

    let day, hour, min, sec;
    let wxTimerList = wxThis.data.wxTimerList;

    wxThis.intervalLabel = setInterval(() => {
        let nowTime = new Date().getTime();

        for (let [idx, targetTime] of timeArr.entries()) {
            let t = targetTime - nowTime;
            day = Math.floor(t / 1000 / 60 / 60 / 24);
            hour = Math.floor(t / 1000 / 60 / 60 % 24);
            min = Math.floor(t / 1000 / 60 % 60);
            sec = Math.floor(t / 1000 % 60);
      
            let timespan = day > 0 ? doubleNum(day) + "天" : '';
            timespan = timespan + doubleNum(hour) + ":" + doubleNum(min) + ":" + doubleNum(sec);
            wxTimerList[idx] = timespan;
        }
        wxThis.setData({
            wxTimerList: wxTimerList
        });

    }, 1000)

}

function doubleNum(num) {
    if (num < 10) {
        return "0" + num;
    } else {
        return num + '';
    }
}

module.exports.vzTimer = vzTimer;