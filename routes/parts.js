const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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

// GET /api/parts - Get automobile parts list with pagination and filtering
router.get('/', (req, res) => {
  try {
    let parts = getPartsData();
    
    // Search functionality
    const { search, manufacturer, category, minPrice, maxPrice, inStock } = req.query;
    
    if (search) {
      const searchLower = search.toLowerCase();
      parts = parts.filter(part => 
        part.name.toLowerCase().includes(searchLower) ||
        part.description.toLowerCase().includes(searchLower) ||
        part.manufacturer.toLowerCase().includes(searchLower)
      );
    }
    
    if (manufacturer) {
      parts = parts.filter(part => 
        part.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
      );
    }
    
    if (category) {
      parts = parts.filter(part => 
        part.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (minPrice) {
      parts = parts.filter(part => part.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      parts = parts.filter(part => part.price <= parseFloat(maxPrice));
    }
    
    if (inStock !== undefined) {
      const stockFilter = inStock === 'true';
      parts = parts.filter(part => part.inStock === stockFilter);
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedParts = parts.slice(startIndex, endIndex);
    
    const response = {
      parts: paginatedParts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(parts.length / limit),
        totalItems: parts.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < parts.length,
        hasPreviousPage: startIndex > 0
      }
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve parts' });
  }
});

// GET /api/parts/:id - Get automobile part details by ID
router.get('/:id', (req, res) => {
  try {
    const parts = getPartsData();
    const partId = parseInt(req.params.id);
    
    const part = parts.find(p => p.id === partId);
    
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    res.json(part);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve part details' });
  }
});

// GET /api/parts/search/:query - Search automobile parts
router.get('/search/:query', (req, res) => {
  try {
    const parts = getPartsData();
    const query = req.params.query.toLowerCase();
    
    const filteredParts = parts.filter(part => 
      part.name.toLowerCase().includes(query) ||
      part.description.toLowerCase().includes(query) ||
      part.manufacturer.toLowerCase().includes(query)
    );
    
    // Apply pagination to search results
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedResults = filteredParts.slice(startIndex, endIndex);
    
    const response = {
      query: req.params.query,
      parts: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredParts.length / limit),
        totalItems: filteredParts.length,
        itemsPerPage: limit
      }
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/parts/categories - Get all available categories
router.get('/meta/categories', (req, res) => {
  try {
    const parts = getPartsData();
    const categories = [...new Set(parts.map(part => part.category))];
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// GET /api/parts/manufacturers - Get all available manufacturers
router.get('/meta/manufacturers', (req, res) => {
  try {
    const parts = getPartsData();
    const manufacturers = [...new Set(parts.map(part => part.manufacturer))];
    res.json({ manufacturers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve manufacturers' });
  }
});

module.exports = router;
