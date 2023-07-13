# 秋蒂桌宠说明文档

## 介绍

该桌宠是基于虚拟偶像秋蒂人物形象所开发的。软件下载需要去B站关注秋蒂，找秋蒂获得软件压缩包即可！用户下载安装后就可以选择秋蒂作为自己的桌宠，与她进行聊天和互动，还可以查看日程表了解秋蒂直播的日程。

## 功能

- [x] 支持 Live2d moc/moc3

- [x] 支持 拖拽模型(单屏/双屏)

- [x] 开机自启动

- [x] 语音口型同步

- [x] 日程表

- [x] ChatGPT聊天

  

## 示例Demo

以下为秋蒂桌宠的功能示例：

### 日程表功能：

![1686841381596](https://dullwolf.oss-cn-shenzhen.aliyuncs.com/1119044963955376128.png)

![1686841420453](https://dullwolf.oss-cn-shenzhen.aliyuncs.com/1119044900071931904.png)



### 聊天功能：

![1686841493297](https://dullwolf.oss-cn-shenzhen.aliyuncs.com/1119044845223018496.png)



### 设置功能：

![1686841528605](https://dullwolf.oss-cn-shenzhen.aliyuncs.com/1119044772074356736.png)



### 隐藏功能：

![1686841612421](https://dullwolf.oss-cn-shenzhen.aliyuncs.com/1119044699496120320.png)

![1686841629957](https://dullwolf.oss-cn-shenzhen.aliyuncs.com/1119044580444995584.png)



## 鸣谢 (Thanks)

- Live2D For Web 组件 [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)
- Wallpaper [wallpaper](https://github.com/sindresorhus/wallpaper)
- Electron As Wallpaper [electron-as-wallpaper](https://github.com/meslzy/electron-as-wallpaper)

## 参考链接

1. 秋蒂的B站主页：https://space.bilibili.com/455899334

## 新增功能 -> 2023.6.28

1. 新增Bilibili直播通知
2. 新增支持用户设置调节音频音量

## 新增功能 -> 2023.7.12

1. 新增壁纸功能
2. 支持静态 / 动态壁纸
3. 新增壁纸登录功能
4. 壁纸按标签名进行分类
5. 新增壁纸投稿功能

注意事项: 动态壁纸切换静态壁纸的时候会黑屏闪烁一下才会显示静态壁纸

## 记录修复的BUG

1. 修复用户重复点击托盘图标导致多次弹出退出提示框信息
2. 点击退出程序后，禁用点击托盘图标
3. 修复点击隐藏模型后，再点击浮动图标后显示闪烁的问题
4. 修复壁纸功能应用桌面，触发多次事件的问题
5. 修复直播推送通知不显示的问题
6. v1.2.2版本存在遗漏，直播通知提醒用户点击链接，每隔一分钟推送一次，如果用户点击推送通知的区域则标记为true则下次不再推送通知，如果点击推送通知的关闭按钮不会标记为true，则每隔1分钟也会推送通知。
   v1.2.3版本已修复上面的问题，直播推送通知关闭按钮点击后会标记为true,下次不会再推送通知。

## 许可证 (License)
[BSD 2-Clause](https://raw.githubusercontent.com/kirbystudy/chatgpt-desktopPet/main_v1.2.x/LICENSE)