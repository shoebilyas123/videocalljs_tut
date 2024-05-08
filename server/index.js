const { Server } = require('socket.io');

const io = new Server(8000, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

io.on('connection', (socket) => {
  console.log('SOCKET=', socket.id);

  socket.on('room:join', (data) => {
    const { email, room } = data;
    console.log({ email, room });

    emailToSocketMap.set(email, socket.id);
    socketToEmailMap.set(socket.id, email);
    io.to(room).emit('user:joined', { email, id: socket.id });
    socket.join(room);

    io.to(socket.id).emit('room:join', { email, room });
  });
  socket.on('user:call', ({ to, offer }) => {
    io.to(to).emit('incoming:call', { offer, from: socket.id });
  });
  socket.on('call:accepted', ({ to, answer }) => {
    console.log(to, answer);
    io.to(to).emit('call:accepted', { from: socket.id, answer });
  });
  socket.on('peer:negotation:needed', ({ to, offer }) => {
    io.to(to).emit('peer:negotiation:needed', { from: socket.id, offer });
  });
  socket.on('peer:nego:done', ({ to, ans }) => {
    io.to(to).emit('peer:nego:final', { from: socket.id, ans });
  });
});
