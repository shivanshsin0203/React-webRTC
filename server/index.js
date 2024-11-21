const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: { origin: "*" },
});

const emailToPeerIdMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("userConnect", ({ email, roomId, peerId }) => {
    emailToPeerIdMap.set(email, peerId);

    // Join the room
    socket.join(roomId);

    // Notify other peers in the room
    socket.to(roomId).emit("addPeer", { email, peerId });
  });

  socket.on("disconnect", () => {
    console.log(`Socket Disconnected: ${socket.id}`);
    const email = [...emailToPeerIdMap.entries()].find(
      ([, id]) => id === socket.id
    )?.[0];
    if (email) {
      emailToPeerIdMap.delete(email);
    }
  });
});
