# API Documentation

This document outlines all available endpoints in the SaaS Template API.

## Base URL
```
http://localhost:3005/api
```

## Authentication
Most endpoints require authentication via a JWT token. The token should be sent in an HTTP-only cookie named `auth_token`.

## User Endpoints

### Register User
```http
POST /users/register
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "token": "string"
}
```

### Login User
```http
POST /users/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "string",
  "organization": {
    "id": "integer",
    "name": "string"
  } | null
}
```

### Check Session
```http
GET /users/session
```

**Response:**
```json
{
  "isLoggedIn": "boolean",
  "user": {
    "id": "uuid",
    "email": "string"
  }
}
```

## Organization Endpoints

### Create Organization
```http
POST /organizations
```
**Authentication Required**

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "schemaName": "string",
  "createdBy": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Get User's Organization
```http
GET /organizations
```
**Authentication Required**

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "schemaName": "string",
  "createdBy": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Get Specific Organization
```http
GET /organizations/:id
```
**Authentication Required**

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "schemaName": "string",
  "createdBy": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Organization
```http
PUT /organizations/:id
```
**Authentication Required**

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "schemaName": "string",
  "createdBy": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "string"
}
```

### 401 Unauthorized
```json
{
  "error": "string"
}
```

### 404 Not Found
```json
{
  "error": "string"
}
```

### 500 Internal Server Error
```json
{
  "error": "string",
  "details": "string" // Only in development
}
```

## Multi-Tenant Schema Structure

Each organization gets its own PostgreSQL schema with the following tables:

### organizations
- `id`: SERIAL PRIMARY KEY
- `name`: VARCHAR(255)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### users
- `id`: UUID PRIMARY KEY
- `organization_id`: INTEGER (References organizations)
- `name`: VARCHAR(255)
- `email`: VARCHAR(255) UNIQUE
- `password`: VARCHAR(255)
- `role`: VARCHAR(50)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### messages
- `id`: UUID PRIMARY KEY
- `organization_id`: INTEGER (References organizations)
- `user_id`: UUID (References users)
- `content`: TEXT
- `metadata`: JSONB
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
