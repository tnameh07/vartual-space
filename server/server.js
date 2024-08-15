// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { log } = require('console');

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);
const io = socketIo(server, {
  transports: ['websocket', 'polling'], // Ensure WebSocket is included
});

console.log("first");
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
console.log("client line cross");

let db;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });

    socket.on('message', (message) => {
      io.to(roomId).emit('message', message);
    });
  });
});

app.post('/create-room', async (req, res) => {
  const roomId = uuidv4(); // Generate a unique room ID
  const { date, startTime, endTime, participants } = req.body;
  
  const result = await db.collection('meetings').insertOne({
    roomId,
    date,
    startTime,
    endTime,
    participants: participants || []
  });

  res.json({ roomId });
});

//   client.connect(err => {
//   if (err) throw err;
//   db = client.db('video_conference');
//   console.log("now connected to databases");
  
//   // server.listen(3001, () => {
//   //   console.log('Server is running on port 3001');
//   // });
// });
client.connect().then(()=>{
  console.log("connected to databse")
  
}).catch((e)=> {
  console.log("fail to connect to db", e);
  
})

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});