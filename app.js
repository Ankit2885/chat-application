const io = require('socket.io')(8000);
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

app.use('/', express.static(path.join(__dirname, "public")));
console.log(path.join(__dirname, "public"));

const users = {}; // Track users and their associated rooms

// Map of rooms and the number of users currently in the room
const rooms = {};

io.on('connection', socket => {
    console.log('A user connected: ', socket.id);

    socket.on('new-user-joined', name => {
        console.log(`${name} joined`);

        // Find a room with less than 2 users or create a new room
        let roomFound = false;
        for (let roomId in rooms) {
            if (rooms[roomId] < 2) {
                socket.join(roomId); // Join this room
                users[socket.id] = { name, roomId };
                rooms[roomId]++;
                roomFound = true;
                socket.emit('joined-room', roomId); // Notify user that they've joined a room
                socket.broadcast.to(roomId).emit('user-joined', name); // Broadcast to the room
                break;
            }
        }

        // If no room with less than 2 users was found, create a new room
        if (!roomFound) {
            const roomId = `room-${Date.now()}`;
            socket.join(roomId);
            users[socket.id] = { name, roomId };
            rooms[roomId] = 1; // The room has one user now
            socket.emit('joined-room', roomId); // Notify user that they've joined a new room
            console.log(`${name} created a new room: ${roomId}`);
        }
    });

    // Listen for messages sent by users
    socket.on('send', message => {
        const user = users[socket.id];
        if (user) {
            // Send the message only to the room the user is in
            socket.broadcast.to(user.roomId).emit('receive', { message: message, name: user.name });
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            // Broadcast to the room that the user left
            socket.broadcast.to(user.roomId).emit('leave', user.name);
            rooms[user.roomId]--;
            delete users[socket.id];
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
