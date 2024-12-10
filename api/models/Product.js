const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
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
    required: true,
    trim: true
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be less than 0'],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be less than 0'],
  }
}, { timestamps: true });

// Create indexes for search functionality
productSchema.index({ name: 'text', category: 'text' });
productSchema.index({ barcode: 1 });

module.exports = mongoose.model('Product', productSchema);
