require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } =  require('@apollo/server/plugin/drainHttpServer');
const bodyParser = require('body-parser');
const http = require('http');

const authRoutes = require('./routes/auth.route');
const productRoutes = require('./routes/products.route');

const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');


async function startServer() {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => console.error('MongoDB connection error:', err));
  
    // Create an Express app
    const app = express();
    
    // Create an HTTP server
    const httpServer = http.createServer(app);
  
    // Middleware
    app.use(cors());
    app.use(bodyParser.json());
  
    // REST Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
  
    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
  
    // Start the Apollo Server
    await server.start();
  
    // GraphQL Endpoint
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          // Optional: Add authentication context
          return { /* context data */ };
        },
      })
    );
  
    // Start the server
    const PORT = process.env.PORT || 4000;
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    
    console.log(`🚀 Server ready with:`);
    console.log(`- REST Endpoints at http://localhost:${PORT}/api/products`);
    console.log(`- GraphQL Playground at http://localhost:${PORT}/graphql`);
  }

  startServer().catch((error) => {
    console.error('Server failed to start:', error);
  });