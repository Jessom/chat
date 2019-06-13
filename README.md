# chat
基于express、socket.io搭建的一个简易的聊天室

## [demo](http://chat.watasi.cn)
![chat](http://qicloud.jswei.cn/chat.gif)

## 遇到的坑

### 环境
centOS7.2 + nginx1.14.2 + node10.15.0 + npm6.4.1

### 报错`400`
返回结果
```json
{
  code: 1,
  message: "Session ID unknown"
}
```

解决方法：<br>
客户端发起`socket连接请求时`，仅使用**`websocket`**模式

```javascript
var socket = io({
  "transports": ['websocket']
  // "transports": ['websocket', 'polling']
});
```

上面问题解决后，还是会报错`WebSocket connection to 'ws://chat.watasi.cn/socket.io/?EIO=3&transport=websocket' failed: Error during WebSocket handshake: Unexpected response code: 400`，这时候就需要配置`nginx`了。

### nginx配置
```bash
cd /usr/local/nginx/conf/vhost
vim chat.watasi.cn.conf
```

初始配置为


```bash
server {
  listen      80;
  server_name chat.watasi.cn;

  location / {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_set_header X-Nginx-Proxy true;
      proxy_set_header Connection "";
      proxy_set_header Origin "";
      proxy_pass http://chat;
  }
}
```
新增以下配置
```bash
server {
  
  # 其他配置

  location /socket.io/ {
    # 此处改为 socket.io 后端的 ip 和端口即可
    proxy_pass http://127.0.0.1:3000;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
  }
}
```