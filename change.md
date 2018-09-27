# 说明 
 所有文件是从官方的demo的编译配置部分拷贝过来，稍作修改 
 注：修改的地方全部用下面的标示注释
 ```
 /* changed*/
 ```

 目录结构：

 - build 将源文件build目录 拷贝过来少稍做修改
 - config 将源文件config目录拷贝过来少稍做修改
 - lib-changed 存放更改的模块 (mpvue-entry模块中的文件目录结构调整，将源码的resolveApp稍作修改)
 - lib-temp  因为mpvue的一些编译包都是基于webpack3的，所以项目的webpack引向此目录