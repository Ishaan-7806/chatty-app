import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullname, email, password, bio } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      bio: bio || "",
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      bio: newUser.bio,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.log("Error in signup controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullname } = req.body;
    const userId = req.user._id;

    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullname },
        { new: true }
      ).select("-password");
    } else {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url, bio, fullname },
        { new: true }
      ).select("-password");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// user.controller.js
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};