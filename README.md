<p align="center">
    <img src="./assets/app_128.ico" width="100" height="100">
</p>

<div align="center">

# chatgpt-desktopPet

✨ 基于 Electron 开发的桌面宠物 ✨

如果你喜欢这个项目请点一个 ⭐ 吧

</div>

<p align="center">
    <img src="https://img.shields.io/github/package-json/v/kirbystudy/chatgpt-desktopPet?color=red&style=flat-square">
    <img src="https://img.shields.io/badge/License-BSD 2 Clause-purple.svg?style=flat-square">
    <img src="https://img.shields.io/github/stars/kirbystudy/chatgpt-desktopPet.svg" alt="stars">
    <img src="https://img.shields.io/github/forks/kirbystudy/chatgpt-desktopPet.svg" alt="forks">
</p>

## 介绍

该桌宠是基于虚拟偶像秋蒂人物形象所开发的。软件下载需要去 B 站关注秋蒂，找秋蒂获得软件压缩包即可！用户下载安装后就可以选择秋蒂作为自己的桌宠，与她进行聊天和互动，还可以查看日程表了解秋蒂直播的日程。

## 功能

- [x] 支持 Live2d moc/moc3

- [x] 支持 拖拽模型(单屏/双屏)

- [x] 开机自启动

- [x] 语音口型同步

- [x] 日程表

- [x] ChatGPT 聊天

- [x] VITS 语音合成

- [x] 壁纸功能（静态/动态）

- [ ] 社区功能（待开发）

## 示例 Demo

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

1. 秋蒂的 B 站主页：https://space.bilibili.com/455899334

## 秋蒂桌宠 V1.2.8 新增功能列表

1. 新增 Bilibili 直播通知
2. 新增支持用户设置调节音频音量
3. 新增壁纸功能
4. 支持静态 / 动态壁纸
5. 新增壁纸登录功能
6. 壁纸按标签名进行分类
7. 新增壁纸投稿功能
8. 新增分类标签和作品出处
9. 优化桌宠面板新增一张刺猬图片作为折叠按钮，点击刺猬展开功能选项。
10. 优化第一次请求接口的图片缓存到本地，使用本地图片加载，不用每次请求 OSS 存储的 URL
11. 优化页面壁纸详情信息
12. 优化限制文件大小：10M 以内
13. 新增个人中心编辑壁纸信息
14. 新增社区功能（待开发）
15. 优化用户已登录状态，点击头像会刷新用户缓存的过期时间
16. 新增 VITS 语音功能
17. 新增本地选择模型文件

## 记录修复的 BUG

1. 修复用户重复点击托盘图标导致多次弹出退出提示框信息
2. 点击退出程序后，禁用点击托盘图标
3. 修复点击隐藏模型后，再点击浮动图标后显示闪烁的问题
4. 修复壁纸功能应用桌面，触发多次事件的问题
5. 修复直播推送通知不显示的问题
6. v1.2.2 版本：直播通知每隔 5 分钟推送一次，用户点击通知区域标记为 true，下次不再推送；关闭按钮不标记，仍然每隔 1 分钟推送。v1.2.3 版本修复：关闭按钮标记为 true，不再继续推送通知。
7. Electron 版本号 v24.1.1 不兼容 win7，因此降级版本号 v21.4.4
8. 修复每次点击桌宠只触发一次语音播放
9. 修复每次点击发布投稿只触发一次事件
10. 修复个人中心编辑信息标签下拉列表叠加的问题
11. 禁用壁纸功能标题栏右键菜单

注意事项:

1. 屏幕缩放比例 100% - 150% 可拖动桌宠，其他屏幕比例禁用拖动
2. 动态壁纸切换静态壁纸的时候会黑屏闪烁一下才会显示静态壁纸

## 许可证 (License)

[BSD 2-Clause](https://raw.githubusercontent.com/kirbystudy/chatgpt-desktopPet/main_v1.2.x/LICENSE)
