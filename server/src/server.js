import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initSockets } from "./features/notifications/socket.js";

const server = http.createServer(app);

initSockets(server);

server.listen(env.port, () => {
  console.log(`✅ Server running on port ${env.port}`);
});
