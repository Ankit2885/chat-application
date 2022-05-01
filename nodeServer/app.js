// Node server which will handel socket io connections

const io = require('socket.io')(8000);
const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 3000;

app.use('/', express.static(path.join(__dirname,"../public")));

const users = {};

io.on('connection', socket =>{
    socket.on('new-user-joined', name =>{
        // console.log("new user", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name)
    })
    socket.on('send', message =>{
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    })
    socket.on('disconnect', message =>{
        socket.broadcast.emit('leave', users[socket.id]);
        delete users[socket.id];
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
