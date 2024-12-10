const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

// Add product (protected route)
const createProduct = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
      console.error('Error creating product:', error);
    }
}

// Get all products with optional category filter and search
const getAllProducts = async (req, res) => {
    try {
      const { category, search, page = 1, limit = 100 } = req.query;
      let query = {};
  
      // Category filter (case-insensitive)
      if (category) {
        query.category = new RegExp(`^${category}$`, 'i');
      }
  
      // Text search across name and category
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } }, 
          { category: { $regex: search, $options: 'i' } } 
        ];
      }
  
      // Query products with pagination
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      // Get total count for pagination
      const total = await Product.countDocuments(query);
  
      res.json({
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Server error' });
    }
}

// Update product category (protected route)
const updateProductCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { category },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: `Error: ${error}` });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    updateProductCategory
};