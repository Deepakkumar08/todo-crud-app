const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/connectDB');
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:18000", // Enable CORS
  },
});
// TODO Model
const Todo = mongoose.model('Todo', new mongoose.Schema({
  title: String,
  description: String,
  dueTime: Date,
  status: String,
  image: String,
}));

// Middleware
app.use(express.json());
//app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
}));

//WebSocket connection
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// CRUD API
app.post('/todos', async (req, res) => {
  console.log(req,'reqqqq')
  const todo = new Todo(req.body);
  await todo.save();
  io.emit('todoCreated', todo); // Emit to all connected clients
  res.send(todo);
});

app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.send(todos);
});

app.get('/', (req,res)=>{
  res.send('Hey I am Working')
})
// Server
const PORT = process.env.PORT || 3000;
connectDB().then(()=>{
  app.listen(PORT, (req,res)=>{
      console.log('server is running at DB ' +  PORT)
  })
})
