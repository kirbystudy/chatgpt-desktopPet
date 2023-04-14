const express = require('express');
const app = express();

const port = 3000; // 指定要使用的端口号
const directory = './'; // 指定要托管的目录路径

// 指定要托管的静态文件目录
app.use(express.static(directory));

// 启动服务器并监听指定端口
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
