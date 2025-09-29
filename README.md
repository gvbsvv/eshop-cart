# EShop Cart - Shopping Cart Application

A REST API for managing a shopping cart for automobile parts, built with Node.js and Express.

## Features

- **Automobile Parts Management**
  - Get paginated list of automobile parts
  - Search parts by name, description, manufacturer, or price
  - Filter parts by category, manufacturer, price range, and stock status
  - Get part details by ID

- **Shopping Cart Functionality**
  - Add items to cart
  - Update item quantities
  - Remove items from cart
  - Clear entire cart
  - Checkout simulation

## API Endpoints

### Parts Endpoints
- `GET /api/parts` - Get paginated list of parts with optional filtering
- `GET /api/parts/:id` - Get part details by ID
- `GET /api/parts/search/:query` - Search parts by query
- `GET /api/parts/meta/categories` - Get all available categories
- `GET /api/parts/meta/manufacturers` - Get all available manufacturers

### Cart Endpoints
- `GET /api/cart/:cartId` - Get cart contents
- `POST /api/cart/:cartId/add` - Add item to cart
- `PUT /api/cart/:cartId/update/:partId` - Update item quantity
- `DELETE /api/cart/:cartId/remove/:partId` - Remove item from cart
- `DELETE /api/cart/:cartId/clear` - Clear entire cart
- `POST /api/cart/:cartId/checkout` - Checkout cart

## Query Parameters

### Parts Listing (`GET /api/parts`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in name, description, manufacturer
- `manufacturer` - Filter by manufacturer
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `inStock` - Filter by stock status (true/false)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Or start the production server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage Examples

### Get Parts List
```bash
curl "http://localhost:3000/api/parts?page=1&limit=5&category=Engine"
```

### Search Parts
```bash
curl "http://localhost:3000/api/parts?search=brake&inStock=true"
```

### Get Part Details
```bash
curl "http://localhost:3000/api/parts/1"
```

### Add Item to Cart
```bash
curl -X POST "http://localhost:3000/api/cart/user123/add" \
  -H "Content-Type: application/json" \
  -d '{"partId": 1, "quantity": 2}'
```

### Get Cart Contents
```bash
curl "http://localhost:3000/api/cart/user123"
```

### Update Item Quantity
```bash
curl -X PUT "http://localhost:3000/api/cart/user123/update/1" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

### Checkout Cart
```bash
curl -X POST "http://localhost:3000/api/cart/user123/checkout"
```

## Project Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── data/
│   └── automobileParts.json  # Parts data
├── routes/
│   ├── parts.js           # Parts API routes
│   └── cart.js            # Cart API routes
└── public/                # Static files (optional)
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Next Steps

1. Add database integration (MongoDB, PostgreSQL, etc.)
2. Implement user authentication
3. Add order history functionality
4. Implement payment processing
5. Add frontend interface
6. Add comprehensive testing
7. Add input validation and sanitization
8. Implement logging and monitoring
