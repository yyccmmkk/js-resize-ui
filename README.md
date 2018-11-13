# js-resize-ui
对页面元素进行缩放操作，支持按下ctrl 后同比例缩放，及任意缩放

建议使用webpack 引入ts 模块，或者对ts文件进行编译 tsc- xxxx.ts 后使用，详见typescript 官网

源码使用，引入rxjs进行事件流处理，只对最新浏览器进行测试，肯定不支持IE8，自行进行兼容处理，

------
1 下载后，运行命令：npm i 安装依赖

2 依赖安装成功后，运行命令，node server

3 打开本地浏览器：http://localhost:3030/

可以看到demo 例子：
本组件只提供了缩放功能，及回调 move end 
demo 例子中引用了拖动组件  ../extern/reference-line.ts 如无需可自行删除
