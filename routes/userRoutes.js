import express from "express";
import { singupUser } from "../controllers/userController.js";

const router = express.Router();

// signup
router.post("/signup", singupUser);

// login

// update profile

export default router;
