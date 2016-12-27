export const PlayStates = {
    IDLE    :'IDLE', //从未开始播放的初始状态，播放后不会回到这个状态
    PLAYING : 'PLAYING',
    PAUSED  : 'PAUSED',
    STOP    : 'STOP'
};

export const SeekStates = {
    IDLE    :'IDLE', //从未seek时的初始状态，seek后不可逆
    SEEKING : 'SEEKING',
    SEEKED  : 'SEEKED'
};

// default||'' 显示默认控件，none 不显示控件，system 显示系统控件
export const ControlsStates={
    'DEFAULT' : 'default',//显示默认控件,可以样式定制
    'NONE' : 'none',// 隐藏控件，pc端除外
    'SYSTEM' : '' //显示系统控件，
};