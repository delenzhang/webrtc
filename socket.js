const SocketIO = require('socket.io')
const socketIO = new SocketIO({
  path: '/websocket'
})

let userRoom = {
  list: [],
  add(user) {
    this.list.push(user)
    return this
  },
  del(id) {
    this.list = this.list.filter(u => u.id !== id)
    return this
  },
  sendAllUser(name, data) {
    this.list.forEach(({ id }) => {
      console.log('>>>>>', id)
      socketIO.to(id).emit(name, data)
    })
    return this
  },
  sendTo(id) {
    return (eventName, data) => {
      socketIO.to(id).emit(eventName, data)
    }
  },
  findName(id) {
    return this.list.find(u => u.id === id).name
  }
}

socketIO.on('connection', function(socket) {
  console.log('连接加入.', socket.id)

  socket.on('addUser', function(data) {
    console.log(data.name, '加入房间')
    let user = {
      id: socket.id,
      name: data.name,
      calling: false
    }
    userRoom.add(user).sendAllUser('updateUserList', userRoom.list)
  })

  socket.on('sendMessage', ({ content }) => {
    console.log('转发消息：', content)
    userRoom.sendAllUser('updateMessageList', { userId: socket.id, content, user: userRoom.findName(socket.id) })
  })

  socket.on('iceCandidate', ({ id, iceCandidate }) => {
    console.log('转发信道')
    userRoom.sendTo(id)('iceCandidate', { iceCandidate, id: socket.id })
  })

  socket.on('offer', ({id, offer}) => {
    console.log('转发offer')
    userRoom.sendTo(id)('called', { offer, id: socket.id, name: userRoom.findName(socket.id)})
  })

  socket.on('answer', ({id, answer}) => {
    console.log('接受视频');
    userRoom.sendTo(id)('answer', {answer})
  })

  socket.on('rejectCall', id => {
    console.log('转发拒接视频')
    userRoom.sendTo(id)('callRejected')
  })

  socket.on('disconnect', () => {
    // 断开删除
    console.log('连接断开', socket.id)
    userRoom.del(socket.id).sendAllUser('updateUserList', userRoom.list)
  })
})

module.exports = socketIO
