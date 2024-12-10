const typeDefs = `#graphql
  type Product {
    id: ID
    name: String!
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
  }

  type Mutation {
    createProduct(input: ProductInput!): Product
    updateProductCategory(
      id: ID!
      category: String!
    ): Product
  }
`;

module.exports = typeDefs;