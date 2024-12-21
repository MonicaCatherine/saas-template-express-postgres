# SaaS Template with Express and PostgreSQL

A multi-tenant SaaS application template using Express.js and PostgreSQL with schema-based multi-tenancy.

## Features

- User Authentication
- Organization Management
- Schema-based Multi-tenancy
- PostgreSQL Database
- JWT Authentication

## Project Structure

```
src/
├── config/         # Configuration files
├── models/         # Database models
├── middleware/     # Custom middleware
├── routes/         # API routes
└── services/       # Business logic
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values
4. Create a PostgreSQL database
5. Run the application:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users
- POST /api/users/register
- POST /api/users/login

### Organizations
- POST /api/organizations
- GET /api/organizations
- GET /api/organizations/:id

## Multi-tenancy

This template uses schema-based multi-tenancy. Each organization gets its own PostgreSQL schema, providing strong data isolation between tenants.

## License

ISC
