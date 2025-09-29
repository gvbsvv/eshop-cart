const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import routes
const partsRoutes = require('./routes/parts');
const cartRoutes = require('./routes/cart');

// Use routes
app.use('/api/parts', partsRoutes);
app.use('/api/cart', cartRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to EShop Cart API',
    endpoints: {
      parts: '/api/parts',
      cart: '/api/cart'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to get started`);
});

module.exports = app;
