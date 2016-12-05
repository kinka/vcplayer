/**
 * User: anderlu
 * Date: 2016/12/5
 * Time: 16:08
 */

const tips={
    UrlEmpty:'请至少设置一种视频播放地址'

};

export class Tips{
    constructor(options){
        this.options = options;
        this.customTips = options.wording;
    }
    getTips(key){
        return this.customTips[key] || tips[key];
    }
}


