const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: { origin: "*" },
});

const rooms = {}; // Map of roomId -> list of peers
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
const emailToPeerIdMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("userConnect", ({ roomId, email, peerId }) => {
    // Save mappings
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    emailToPeerIdMap.set(email, peerId);

    // Add user to the room
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ email, peerId });

    // Join the socket room
    socket.join(roomId);

    // Notify others in the room about the new participant
    socket.to(roomId).emit("addPeer", { email, peerId });

    // Send the updated list of peers to the new user
    io.to(socket.id).emit("roomPeers", { peers: rooms[roomId].filter((p) => p.peerId !== peerId) });
  });

  socket.on("disconnect", () => {
    const email = socketIdToEmailMap.get(socket.id);
    const peerId = emailToPeerIdMap.get(email);

    if (email && peerId) {
      // Remove user from all rooms they belong to
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter((peer) => peer.peerId !== peerId);

        // Notify the remaining participants
        socket.to(roomId).emit("removePeer", { peerId });
      }

      // Cleanup mappings
      emailToSocketIdMap.delete(email);
      socketIdToEmailMap.delete(socket.id);
      emailToPeerIdMap.delete(email);
    }
  });
});
