# API Documentation

This document provides detailed information about all available API endpoints in the SaaS Template application.

## Authentication

The API uses JWT (JSON Web Token) for authentication. For protected endpoints, include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Base URL

All API endpoints are prefixed with `/api`

---

## User Management

### Register User
Create a new user account.

- **URL**: `/api/users/register`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Success Response** (201 Created):
```json
{
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_string"
}
```

**Error Responses**:
- `400 Bad Request`: User already exists
- `500 Internal Server Error`: Server error

---

### Login User
Authenticate a user and receive a JWT token.

- **URL**: `/api/users/login`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Success Response** (200 OK):
```json
{
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_string"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

---

### Get User Profile
Retrieve the current user's profile information.

- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response** (200 OK):
```json
{
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

## Organization Management

### Create Organization
Create a new organization and its associated database schema.

- **URL**: `/api/organizations`
- **Method**: `POST`
- **Auth Required**: Yes

**Request Body**:
```json
{
    "name": "My Organization"
}
```

**Success Response** (201 Created):
```json
{
    "id": "uuid",
    "name": "My Organization",
    "schemaName": "org_timestamp_random",
    "createdBy": "user_uuid",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### List Organizations
Get all organizations for the current user.

- **URL**: `/api/organizations`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response** (200 OK):
```json
[
    {
        "id": "uuid",
        "name": "My Organization",
        "schemaName": "org_timestamp_random",
        "createdBy": "user_uuid",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
    }
]
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### Get Organization Details
Get details of a specific organization.

- **URL**: `/api/organizations/:id`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response** (200 OK):
```json
{
    "id": "uuid",
    "name": "My Organization",
    "schemaName": "org_timestamp_random",
    "createdBy": "user_uuid",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Organization not found
- `500 Internal Server Error`: Server error

---

### Update Organization
Update an organization's details.

- **URL**: `/api/organizations/:id`
- **Method**: `PUT`
- **Auth Required**: Yes

**Request Body**:
```json
{
    "name": "Updated Organization Name"
}
```

**Success Response** (200 OK):
```json
{
    "id": "uuid",
    "name": "Updated Organization Name",
    "schemaName": "org_timestamp_random",
    "createdBy": "user_uuid",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Organization not found
- `500 Internal Server Error`: Server error

---

### Delete Organization
Delete an organization and its associated schema.

- **URL**: `/api/organizations/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes

**Success Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Organization not found
- `500 Internal Server Error`: Server error

---

## Multi-tenancy

For organization-specific endpoints, include the organization ID in the request header:

```
X-Organization-Id: <organization_uuid>
```

This header is required for all endpoints that need to operate within a specific organization's schema.

## Error Response Format

All error responses follow this format:
```json
{
    "error": "Error message description"
}
```

## Rate Limiting

Currently, there are no rate limits implemented on the API endpoints. However, it's recommended to implement appropriate rate limiting in production environments.

## Data Types

- `uuid`: A unique identifier string in UUID format
- `timestamp`: ISO 8601 formatted datetime string
- All request and response bodies are in JSON format

## Security Notes

1. All passwords are hashed using bcrypt before storage
2. JWT tokens expire after 24 hours
3. Each organization's data is isolated in its own PostgreSQL schema
4. Users can only access organizations they have created
