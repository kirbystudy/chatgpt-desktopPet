# chatgpt-desktopPet

使用 Live2D 模型开发的 Electron 桌面宠物应用程序。用户可以将其喜欢的动漫角色或宠物放置在桌面上，并通过语音和文本与它进行互动。

## 开发 (Develop)

- 使用 `npm` 安装：

  ```shell
    npm install
  ```

- 使用 `cnpm` 安装：

  ```shell
    npm install -g cnpm --registry=https://registry.npmmirror.com
    cnpm install
  ```

- 启动方式：

  ```shell
    npm run start
  ```

- 打包方式

  ```shell
    npm run dist-win64
  ```

## 功能 (Function)

- [x] 支持 Live2d moc/moc3
- [x] 支持 拖拽模型(单屏/双屏)
- [x] 开机自启动
- [x] 语音口型同步
- [x] 日程表
- [x] ChatGPT聊天

## 鸣谢 (Thanks)

- Live2D For Web 组件 [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)
