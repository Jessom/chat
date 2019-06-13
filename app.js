const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http, {
  "socket.io": {
    "url": "http://chat.watasi.cn",
    "transports": ["websocket", "polling"],
    "address": "http://chat.watasi.cn"
  }
})
const port = 3005

let users = [];     // 记录所有登录的用户
let colors = [
  '#FF6600', '#FF0033', '#FF3366', '#FFCC66', '#FFCCCC', '#FFCC33', '#FF3300',
  '#FF9900', '#777777', '#99CC33', '#CCCC33', '#66CC66', '#9999FF', '#99FFCC',
  '#FFE1FF', '#FF8C69', '#FFB6C1', '#FF8C00', '#FF4500', '#FF34B3', '#FFA07A',
  '#EE9572', '#EE5C42', '#CD6600', '#CD2990', '#CD1076', '#EE7621', '#EE1289'
]


app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.sendfile('./public/index.html')
})

app.get('/public', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.sendfile('./public/index.html')
})

app.get('/public/index.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.sendfile('./public/index.html')
})

io.on('connection', socket => {
  let roomName = 'room'

  // 登录
  socket.on('login', data => {
    let username = data.username
    if(users.includes(username)) {
      io.emit('login', {code: 0, msg: '该用户已存在'})
    } else {
      socket.join(roomName, () => {
        let color = colors[Math.floor((Math.random()*colors.length))]
        socket.name = username
        users.push({
          username: username,
          color: color
        })
        
        let room = Object.keys(socket.rooms)[1]
        io.to(room).emit('uses', {users: users})
        // socket.broadcast.emit('uses', {users: users})
        socket.emit('login', {
          code: 1,
          msg: '登录成功',
          username: username,
          color: color,
          users: users
        })
      })

    }
  })


  socket.on('logout', () => {
    users.splice(users.findIndex(c => c.username === socket.name), 1)
    console.log(users);
    socket.broadcast.emit('logout', { users: users })
    socket.emit('logout', { users: users })
    socket.leave(roomName)
  })

  // 端口连接
  socket.on('disconnect', () => {
    if(socket.name != null) {
      console.log(`${socket.name}断开连接了`);
      users.splice(users.findIndex(c => c.username === socket.name), 1)
      socket.broadcast.emit('logout', { users: users })
      socket.leave(roomName)
    }
  })

  // 广播消息
  socket.on('msg', data => {
    if(!!socket.name) {
      let su = users.find(c => c.username === socket.name)
      let room = Object.keys(socket.rooms)[1]
      io.to(room).emit('msg', { ...su, msg: data })
      // socket.broadcast.emit('msg', { ...su, msg: data })
    }
  })
})

http.listen(port, () => {
  console.log(`server listen port ${port}`)
})
