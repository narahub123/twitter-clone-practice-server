import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import cors from "cors";

dotenv.config();

connectDB();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json()); // allow to parse JSON data in the request body
app.use(express.urlencoded({ extended: true })); // to parse form data in teh request body
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://twitter-react-clone-practice.netlify.app", // Netlify에서 호스팅한 프론트엔드의 URL
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // 필요한 HTTP 메서드 허용
    credentials: true, // 쿠키 및 인증 정보 포함 허용
  })
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () =>
  console.log(`Sever started at http://localhost:${PORT}`)
);
