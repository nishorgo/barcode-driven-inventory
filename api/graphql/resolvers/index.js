const Product = require('../../models/Product');

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
    }
  },
  Mutation: {
    createProduct: async (_, { input }) => {
      try {
        // Validation can be added here or in Mongoose schema
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
    }
  }
};

module.exports = resolvers;