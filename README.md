# My Books Backend

A NestJS-based e-commerce backend application for managing books, shopping carts, and orders with Redis caching and MongoDB storage.

## Description

This is a RESTful API built with NestJS that provides functionality for:
- Browsing and searching books
- Managing shopping carts with Redis
- Creating and processing orders
- Real-time stock management

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB (Mongoose)
- **Cache**: Redis
- **Language**: TypeScript
- **Testing**: Jest
- **Validation**: class-validator & class-transformer

## Project Structure

```
src/
├── books/           # Book management module
├── carts/           # Shopping cart module
├── orders/          # Order processing module
├── redis/           # Redis service module
├── common/          # Shared constants and utilities
├── app.module.ts    # Root application module
└── main.ts          # Application entry point
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Redis (local or cloud instance)
- npm or yarn

## Installation

```bash
$ npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/my-books
REDIS_URL=redis://localhost:6379
PORT=3000
```

## Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Books
- `GET /books` - Get list of available books

### Carts
- `POST /carts/add` - Add item to cart
- `PATCH /carts/:cartId` - Update cart
- `GET /carts/:cartId` - Get cart details
- `GET /carts/:cartId/checkout` - Get checkout summary

### Orders
- `POST /orders/create` - Create new order

## Testing

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov

# e2e tests
$ npm run test:e2e

# watch mode
$ npm run test:watch
```

## Code Quality

```bash
# run linter
$ npm run lint

# format code
$ npm run format
```

## Features

### Books Module
- Fetch available books from database
- Check stock availability
- Retrieve books by multiple IDs

### Carts Module
- Create new shopping cart
- Add items to cart with quantity
- Validate stock availability
- Calculate cart totals with shipping cost
- Generate checkout summaries
- Redis-based cart storage for performance

### Orders Module
- Create orders from cart
- Calculate order totals including shipping
- Order status tracking (pending, paying, completed, cancelled)
- Integration with payment sessions

### Redis Module
- Centralized Redis client management
- Get, set, and delete operations
- TTL support for cache expiration

## Architecture Highlights

- **Modular Design**: Each feature is encapsulated in its own module
- **Repository Pattern**: Separation of data access logic
- **Service Layer**: Business logic isolation
- **DTOs**: Request/response validation and transformation
- **Comprehensive Testing**: Unit tests for all services, repositories, and controllers

## Development

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** with strict null checks
- **Jest** for testing with mocking support

## License

This project is UNLICENSED.

## Author

Built with NestJS framework.
