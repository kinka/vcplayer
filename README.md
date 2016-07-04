# vcplayer

## 简介


这又是造了一个播放器的轮子，支持的播放格式也有限，主要是hls/mp4/flv/rtmp，可同时用于点播和直播。

初衷主要是希望方便业务定制化，比如说控制栏加个按钮，播放界面加个广告等。

实现不算复杂，也有参考和借鉴其它的播放器实现，如video.js等。各模块间尽量克制，通过模块组合完成功能，上级模块通过直接调用下级模块方法完成操作，下级模块与其它模块(平级或者上级)只通过消息总线传递信息。所以模块可任意替换成实现相应接口的其它模块。

Video标签的实现即是一种体现。播放容器可以是html video标签，也可以是flash实现的插件，对于整个播放器的其它组件(模块)而言，只需要知道它能播放，有一些方法有一些消息实现交互就可以。实现细节完全控制在Video组件之内。这是我们的理想。

关于兼容性的问题，确实挺让人头疼的。目前PC上只支持到IE8+、chrome、 firefox，safari未测试；手机终端各厂商的实现差异更大，暂时未有充分测试，恐怕问题多多。

## 开发

可参考package.json中的scripts字段，比如个人开发阶段即是运行命令

		webpack-dev-server --inline --hot --config webpack.demo.config.js

浏览器中挂着http://localhost:8080/demo.html 进行测试，开发IDE当然是使用webstorm了，可以支持ES6。不过为了支持IE8，也放弃了一些语法特性，比如 getter/setter。

最终发布只有一个文件 `player.js`，运行以下命令生成：

		webpack && webpack --config webpack.demo.config.js && node publish.js

播放器使用到的图标是SVG文件，同样的，为了支持IE8也需要做些兼容。使用ImageMagick可以把SVG转化成PNG图片，img目录下有convert.bat可用于转换。其实也就一句话：

		convert.exe -background none icon.svg -resize 48x48 icon.png

而样式的自定义，直接覆盖vcplayer.css中对应的属性设置即可。

## 使用

参考demo。
页面中引入脚本文件

    <script src="//imgcache.qq.com/open/qcloud/video/vcplayer/player.js"></script>

创建播放器对象：

		var player = new vcp.Player({
                owner: 'player_container',
                autoplay: true,
                debug: true, // 调试模式会直接把flash的各种事件发送出来
                src: url,
                flash: true, // 强制使用flash
                width: width,
                height: height,
                live: true, // 是否直播模式
                listener: function(msg) {
                    if (['timeupdate', 'mediaTime', 'printLog', 'progress'].indexOf(msg.type) > -1) return; // 这些信息太多，可无视
                    console.log(msg);
                }
            });

从以上的示例代码也可以看到，所以的消息/事件都在listern中回调，可通过 `msg.type` 自行进行区分。