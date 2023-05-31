// 获取屏幕信息的函数
module.exports.getScreenInfo = function(callback) {
    // 获取屏幕信息对象
    var screenInfo = {
        width: window.screen.width,                 // 屏幕宽度
        height: window.screen.height,               // 屏幕高度
        scalingFactor: window.devicePixelRatio      // 缩放级别
    }

    // 调用回调函数并传递屏幕信息
    callback(screenInfo)
}