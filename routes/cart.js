const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// In-memory cart storage (in production, use a database)
let carts = {};

// Load automobile parts data
const getPartsData = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/automobileParts.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading parts data:', error);
    return [];
  }
};

// Helper function to get or create cart
const getCart = (cartId) => {
  if (!carts[cartId]) {
    carts[cartId] = {
      id: cartId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  return carts[cartId];
};

// Helper function to calculate cart totals
const calculateCartTotals = (cart) => {
  cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  cart.updatedAt = new Date();
};

// GET /api/cart/:cartId - Get cart contents
router.get('/:cartId', (req, res) => {
  try {
    const cart = getCart(req.params.cartId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
});

// POST /api/cart/:cartId/add - Add item to cart
router.post('/:cartId/add', (req, res) => {
  try {
    const { partId, quantity = 1 } = req.body;
    
    if (!partId) {
      return res.status(400).json({ error: 'Part ID is required' });
    }
    
    const parts = getPartsData();
    const part = parts.find(p => p.id === parseInt(partId));
    
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    if (!part.inStock) {
      return res.status(400).json({ error: 'Part is out of stock' });
    }
    
    const cart = getCart(req.params.cartId);
    
    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.partId === parseInt(partId));
    
    if (existingItem) {
      // Check stock availability
      if (existingItem.quantity + quantity > part.stockQuantity) {
        return res.status(400).json({ 
          error: 'Insufficient stock available',
          available: part.stockQuantity,
          requested: existingItem.quantity + quantity
        });
      }
      existingItem.quantity += quantity;
    } else {
      // Check stock availability for new item
      if (quantity > part.stockQuantity) {
        return res.status(400).json({ 
          error: 'Insufficient stock available',
          available: part.stockQuantity,
          requested: quantity
        });
      }
      
      cart.items.push({
        partId: part.id,
        name: part.name,
        description: part.description,
        manufacturer: part.manufacturer,
        price: part.price,
        quantity: quantity,
        imageUrl: part.imageUrl
      });
    }
    
    calculateCartTotals(cart);
    
    res.json({
      message: 'Item added to cart successfully',
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /api/cart/:cartId/update/:partId - Update item quantity in cart
router.put('/:cartId/update/:partId', (req, res) => {
  try {
    const { quantity } = req.body;
    const cartId = req.params.cartId;
    const partId = parseInt(req.params.partId);
    
    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    const cart = getCart(cartId);
    const itemIndex = cart.items.findIndex(item => item.partId === partId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    const parts = getPartsData();
    const part = parts.find(p => p.id === partId);
    
    if (part && quantity > part.stockQuantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock available',
        available: part.stockQuantity,
        requested: quantity
      });
    }
    
    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    calculateCartTotals(cart);
    
    res.json({
      message: 'Cart updated successfully',
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/:cartId/remove/:partId - Remove item from cart
router.delete('/:cartId/remove/:partId', (req, res) => {
  try {
    const cartId = req.params.cartId;
    const partId = parseInt(req.params.partId);
    
    const cart = getCart(cartId);
    const itemIndex = cart.items.findIndex(item => item.partId === partId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    cart.items.splice(itemIndex, 1);
    calculateCartTotals(cart);
    
    res.json({
      message: 'Item removed from cart successfully',
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// DELETE /api/cart/:cartId/clear - Clear entire cart
router.delete('/:cartId/clear', (req, res) => {
  try {
    const cart = getCart(req.params.cartId);
    cart.items = [];
    calculateCartTotals(cart);
    
    res.json({
      message: 'Cart cleared successfully',
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// POST /api/cart/:cartId/checkout - Checkout cart (simulate)
router.post('/:cartId/checkout', (req, res) => {
  try {
    const cart = getCart(req.params.cartId);
    
    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Simulate order processing
    const order = {
      orderId: 'ORD-' + Date.now(),
      items: [...cart.items],
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      orderDate: new Date(),
      status: 'confirmed'
    };
    
    // Clear cart after checkout
    cart.items = [];
    calculateCartTotals(cart);
    
    res.json({
      message: 'Order placed successfully',
      order: order,
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

module.exports = router;
