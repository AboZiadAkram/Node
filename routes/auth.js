const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const verifyToken = require("../middleware/authMiddleware");
const { check, validationResult } = require('express-validator');


// User registration
router.post("/register", [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required'),
  check('email').isEmail().withMessage('Email is invalid')
], async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //Here we check if the username already exists in the database
  try {
    const { username, password, email } = req.body;

    const existing = await User.findOne({ username });

    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email  });

    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    //If either of the fields is empty, The user will be prompted to fill in all fields
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    //If all fields are filled, the user's info will be saved to the database . Ohterwise, an error will be thrown
    const user = new User({ email, username, password });
    user._id = new mongoose.Types.ObjectId();
    
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
});

// User login
router.post("/login", [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    //If either of the fields is empty, The user will be prompted to fill in all fields
    if (!username || !password) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    //If the username or the passowrd doesn't exist in the database, the user will be prompted to register
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Authentication failed! Usernamer or Password doesn't match." });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed! Usernamer or Password doesn't match." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
});

// Get user profile
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put("/me", [
  verifyToken,
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required'),
  check('email').isEmail().withMessage('Email is invalid')
], verifyToken, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password } = req.body;

    let exist = await User.findOne({ username });

    if (exist) {
      return res.status(400).json({ error: "Username already exists" });
    }

    let existMail = await User.findOne({ email });

    if (existMail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (!username || !password || !email) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    const updatedUser = { username, email, password };

    await User.findByIdAndUpdate(req.userId, updatedUser);
    
    res.json({ message: "User updated" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;