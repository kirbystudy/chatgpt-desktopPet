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

## 基础使用 (Basic Use)

  1. config文件夹下创建config.json文件，配置参数需自行填写
  ```json
  {
    "gpt": {
      "url": "chatgpt接口",
      "ruleType": "规则类型"
    },
    "feedBack": {
      "url": "留言反馈接口"
    },
    "live2d": {
      "model": "",
      "path": "模型文件路径",
      "x": 0,
      "y": 50,
      "scale": 0.1
    },
    "vits": {
      "intro": "VITS 配置参数需加群获取，群号：691432604",
      "header": {
        "uid": "",
        "token": ""
      },
      "getUrlAllMod": "",
      "getUrlByText2Hash": "",
      "getUrlByHashCode": "",
      "getUrlAllTask": ""
    },
    "bilibili": [
      {
        "roomId": "bilibili 房间号",
        "username": "主播名字"
      }
    ]
  }
  ```

  2. 项目目录下创建model文件夹，放置live2d模型文件，然后在config.json文件里填写模型文件路径即可。
  
## 功能 (Function)

- [x] 支持 Live2d moc/moc3
- [x] 支持 拖拽模型(单屏/双屏)
- [x] 开机自启动
- [x] 语音口型同步
- [x] ChatGPT聊天
- [x] VITS语音合成
- [x] Bilibili直播通知

## 鸣谢 (Thanks)

- Live2D For Web 组件 [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)
