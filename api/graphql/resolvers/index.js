const Product = require('../../models/Product');
const axios = require('axios');

const resolvers = {
  Query: {
    getAllProducts: async (_, { category, search, page = 1, limit = 10 }) => {
      try {
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

        return {
          products,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        };
      } catch (error) {
        throw new Error('Server error while fetching products');
      }
    },
    getProductByBarcode: async (_, { barcode }) => {
      try {
        const product = await Product.findOne({ barcode });
        if (!product) {
          throw new Error('Product not found');
        }
        return product;
      } catch (error) {
        throw new Error('Error fetching product by barcode');
      }
    }
  },
  Mutation: {
    createProduct: async (_, { input }) => {
      try {
        const product = new Product(input);
        await product.save();
        return product;
      } catch (error) {
        throw new Error('Server error while creating product');
      }
    },
    updateProductCategory: async (_, { id, category }) => {
      try {
        const product = await Product.findByIdAndUpdate(
          id,
          { category },
          { new: true, runValidators: true }
        );

        if (!product) {
          throw new Error('Product not found');
        }

        return product;
      } catch (error) {
        throw new Error('Server error while updating product category');
      }
    },
    scanAndSaveProduct: async (_, { barcode }) => {
      try {
        // Check if product already exists
        let product = await Product.findOne({ barcode });
        if (product) {
          return product;
        }

        // Fetch product from external API
        const response = await axios.get(`https://products-test-aci.onrender.com/product/${barcode}`);
        const productData = response.data;

        // Create new product with data from API
        product = new Product({
          name: productData.name || 'Unknown Product',
          barcode: barcode,
          category: 'Uncategorized',
          price: productData.price || 0,
          description: productData.description || '',
          stock: 0
        });

        await product.save();
        return product;
      } catch (error) {
        throw new Error('Error scanning and saving product');
      }
    }
  }
};

module.exports = resolvers;