const http = require('http')
const app = require('../app')
const socketIO = require('../socket.js')


const server = http.createServer(app.callback())

socketIO.attach(server)
const port = 3003;
server.listen(port, '0.0.0.0' ,() => {
  console.log('server start on 127.0.0.1:' + port)
})
