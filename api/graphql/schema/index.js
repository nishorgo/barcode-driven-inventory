const typeDefs = `#graphql
  type Product {
    id: ID
    name: String!
    barcode: String
    category: String!
    price: Float!
    stock: Int!
    description: String
    createdAt: String
  }

  type ProductPaginationResult {
    products: [Product!]!
    currentPage: Int!
    totalPages: Int!
    totalProducts: Int!
  }

  input ProductInput {
    name: String!
    barcode: String
    category: String!
    price: Float!
    description: String
    stock: Int!
  }

  type Query {
    getAllProducts(
      category: String
      search: String
      page: Int = 1
      limit: Int = 10
    ): ProductPaginationResult
    getProductByBarcode(barcode: String!): Product
  }

  type Mutation {
    createProduct(input: ProductInput!): Product
    updateProductCategory(
      id: ID!
      category: String!
    ): Product
    scanAndSaveProduct(barcode: String!): Product
  }
`;

module.exports = typeDefs;