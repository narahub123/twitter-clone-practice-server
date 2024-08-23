import express from "express";
import {
  followUnfollowUser,
  loginUser,
  logoutUser,
  singupUser,
  updateUser,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/signup", singupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update/:id", protectRoute, updateUser);

export default router;
