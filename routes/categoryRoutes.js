const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');

// Create a new category
router.post("/", [verifyToken, check('name').notEmpty().withMessage('Name is required')], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const newCategory = new Category({
        name: req.body.name,
        user: req.userId,
    });

    try {
        const savedCategory = await newCategory.save();
        res.json({ message: "Category created", category: savedCategory });
    } catch (error) {
        next(error);
    }
});

// Get all categories
router.get("/categories", verifyToken, async (req, res, next) => {
    try {
        const categories = await Category.find({ user: req.userId });
        res.json({ message: "Categories fetched", categories });
    } catch (error) {
        next(error);
    }
});

// Get one category
router.get("/:id", verifyToken, async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category fetched", category });
    } catch (error) {
        next(error);
    }
});

// Update one category
router.put("/:id", [verifyToken, check('name').notEmpty().withMessage('Name is required')], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const updatedCategory = { name: req.body.name, user: req.userId };

    try {
        const category = await Category.findByIdAndUpdate(req.params.id, updatedCategory, { new: true });
        res.json({ message: "Category updated", category });
    } catch (error) {
        next(error);
    }
});

// Delete one category
router.delete("/:id", verifyToken, async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category deleted", category });
    } catch (error) {
        next(error);
    }
});

module.exports = router;