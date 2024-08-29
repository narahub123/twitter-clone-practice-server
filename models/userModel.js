import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },

    username: { type: String, required: true, unique: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      minLength: 6,
      required: true,
    },

    profilePic: {
      type: String,
      default: "",
    },

    followers: {
      type: [String], // array of String
      default: [],
    },

    following: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
    },

    isFroze: {
      type: Boolean,
      default: false,
    },
  },
  {
    // createdAt과 updatedAt 필드를 자동으로 추가
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
