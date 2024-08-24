import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

connectDB();
const app = express();

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "10mb" })); // allow to parse JSON data in the request body
app.use(express.urlencoded({ limit: "10mb", extended: true })); // to parse form data in teh request body
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
