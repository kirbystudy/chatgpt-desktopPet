# config.json 
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
    "role": [
      {
        "roleId": 1,
        "roleName": "角色名称",
        "model": "模型文件路径",
        "scale": 0.2,
        "x": 50,
        "y": 50
      },
      {
        "roleId": 2,
        "roleName": "角色名称",
        "model": "模型文件路径",
        "scale": 0.18,
        "x": 0,
        "y": 50
      }
    ]
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