import expressListRoutes from "express-list-routes";
import { app } from "./app";
import http from "http";
import { Server } from "socket.io";
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: any) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.on("error", (err) => {
  console.log(`Error: ${err}`);
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  expressListRoutes(app);
});

export default io;
