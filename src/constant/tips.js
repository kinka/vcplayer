/**
 * User: anderlu
 * Date: 2016/12/5
 * Time: 16:08
 */

let __instance = (function () {
    let instance;
    return (newInstance) => {
        if (newInstance) instance = newInstance;
        return instance;
    }
}());

const tips={
    UrlEmpty:'请至少设置一种视频播放地址'

};

export class Tips{
    constructor(options){
        //this.options = options;
        //this.customTips = options.wording || {};
        if (__instance()) return __instance();
        __instance(this);
    }
    init(customTips){
        this.customTips = customTips || {};
    }
    getTips(key){
        return this.customTips[key] || tips[key];
    }
}


