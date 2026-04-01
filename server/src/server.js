import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initSockets } from "./features/notifications/socket.js";

const server = http.createServer(app);

initSockets(server);

server.listen(env.port, () => {

  console.log(`✅ Server running on port ${env.port}`);
  console.log({
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
});
});
