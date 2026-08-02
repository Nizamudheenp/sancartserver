const UserDB = require("../models/UserModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RegisterRequestDTO = require("../dtos/authdto/RegisterRequestDTO");
const UserResponseDTO = require("../dtos/authdto/AuthResponseDTO");
const LoginRequestDTO = require("../dtos/authdto/LoginRequestDTO");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  try {
    const registerReq = new RegisterRequestDTO(req.body);
    const userExist = await UserDB.findOne({ email: registerReq.email });
    if (userExist) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(registerReq.password, 10);
    const newUser = new UserDB({ name: registerReq.name, email: registerReq.email, password: hashed });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin, name: newUser.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: new UserResponseDTO(newUser)
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const loginReq = new LoginRequestDTO(req.body);
    const user = await UserDB.findOne({ email:loginReq.email });
    if (!user) {
      return res.status(404).json({ message: "user not found" })
    }
    const isPasswordMatches = await bcrypt.compare(loginReq.password, user.password)
    if (!isPasswordMatches) {
      return res.status(400).json({ message: 'password is incorrect' })
    }

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: new UserResponseDTO(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
