import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utuils/generateToken.js";

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName });
    console.log("🚀 ~ login ~ user:", user);
    const ispassMatch = await bcrypt.compare(password, user?.password || "");
    if (!user || !ispassMatch) {
      return res.status(401).json({
        message: "unAuthorized",
      });
    }
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      userName: user.userName,
      password: user.password,

      profilePic: user.profilePic,
    });
  } catch (err) {
    console.log(err.message);

    res.status(500).json({ erroe: "internal server error" });
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ error: "logged out succssfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "internal Server Error" });
  }
};

export const signup = async (req, res) => {
  console.log(req.body);

  try {
    const { fullName, userName, password, confirmPassword, gender } = req.body;
    if (password !== confirmPassword) {
      return res.status(500).json({
        message: "password didnt match",
      });
    }

    const user = await User.findOne({ userName });
    if (user) {
      return res.status(500).json({
        message: "username is created before",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      userName,
      fullName,
      password: hashedPassword,
      gender,
      profilePic:
        gender === "male"
          ? `https://avatar.iran.liara.run/public/boy?username=${userName}`
          : `https://avatar.iran.liara.run/public/girl?username=${userName}`,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        password: newUser.password,

        profilePic: newUser.profilePic,
      });
    }
  } catch (err) {
    console.log(err.message);

    res.status(500).json({ erroe: "internal server error" });
  }
};
