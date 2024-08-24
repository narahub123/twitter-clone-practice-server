import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username })
      .select("-password")
      .select("-updatedAt");
    if (!user) return res.status(400).json({ error: "User not found" });

    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile", err.message);
  }
};

const singupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res); // add res to send cookie
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser ", err.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in loginUser", err.message);
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in logoutUser", err.message);
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToModify = await User.findById(id);

    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // unfollow user
      // 현재 유저(currentUser)의 following에서 userToModify의 아이디 제거하기
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      // userToModify의 followers에서 현재 유저(currentUser)의 아이디 제거하기
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });

      return res.status(200).json({ message: "User unfollowed successfully." });
    } else {
      // follow user
      // 현재 유저(currentUser)의 following에서 userToModify의 아이디 추가하기
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // userToModify의 followers에서 현재 유저(currentUser)의 아이디 추가하기
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

      return res.status(200).json({ message: "User followed successfully." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followUnfollowUsr", err.message);
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;
    }

    if (profilePic) {
      try {
        // when user already has old one
        if (user.profilePic) {
          await cloudinary.uploader.destroy(
            user.profilePic.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(profilePic);

        profilePic = uploadedResponse.secure_url;
      } catch (uploadError) {
        console.log("Error in cloudinary", uploadError.message);

        return res.status(500).json({ error: uploadError.message });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // password must be null
    user.password = null;

    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in updateUser", err.message);
  }
};

export {
  singupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
};
