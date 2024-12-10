const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'Uncategorized',
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

// Create indexes for search functionality
productSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
