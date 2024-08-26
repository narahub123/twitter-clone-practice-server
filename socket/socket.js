// 필요한 모듈을 가져옵니다.
// `Server`는 Socket.IO의 서버 부분을 초기화하는 데 사용됩니다.
import { Server } from "socket.io";
// `http` 모듈은 Node.js 내장 모듈로, HTTP 서버를 생성하는 데 사용됩니다.
import http from "http";
// `express`는 Node.js의 웹 애플리케이션 프레임워크로, 서버를 간편하게 설정할 수 있게 도와줍니다.
import express from "express";

// `express` 인스턴스를 생성합니다. 이 인스턴스를 통해 라우팅 및 미들웨어 설정을 할 수 있습니다.
const app = express();

// HTTP 서버를 생성합니다. `app` 인스턴스를 전달하여 Express와 통합합니다.
const server = http.createServer(app);

// Socket.IO 서버를 초기화합니다. HTTP 서버와 통합하고, CORS 옵션을 설정합니다.
const io = new Server(server, {
  cors: {
    // 허용된 클라이언트의 출처를 정의합니다. 클라이언트는 'http://localhost:3000'에서만 접근 가능합니다.
    origin: "http://localhost:3000",
    // 허용된 HTTP 메소드를 정의합니다. 여기서는 GET과 POST 메소드만 허용합니다.
    methods: ["GET", "POST"],
  },
});

// 유저의 socketId를 얻는 방법
export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {}; // userId, socketId

// 클라이언트가 Socket.IO 서버에 연결되었을 때 실행될 이벤트 리스너를 설정합니다.
io.on("connection", (socket) => {
  // 클라이언트가 연결될 때마다 콘솔에 메시지를 출력합니다. 클라이언트의 소켓 ID도 출력됩니다.
  console.log("user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // [1, 2, 3, 4, 5]

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// 서버, Socket.IO 인스턴스, Express 앱 인스턴스를 외부에서 사용할 수 있도록 내보냅니다.
export { io, server, app };
