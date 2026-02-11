# University Service Request Management System (USRMS)

A production-ready backend API for managing university service requests with JWT authentication, role-based access control, and comprehensive reporting capabilities.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access (Student/Admin)
- **Request Management**: Full CRUD operations for service requests with status tracking
- **Department Assignment**: Admin-only department assignment and request routing
- **Status Tracking**: Complete request lifecycle management with status history and comments
- **Analytics & Reporting**: Comprehensive reporting APIs with filtering and analytics
- **Security**: Rate limiting, input validation, NoSQL injection prevention, and secure headers

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, express-validator
- **Password Hashing**: bcryptjs

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd uni_service_req_management
```

1. Install dependencies:

```bash
npm install
```

1. Configure environment variables:
Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/usrms
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
```

1. Seed the default admin user:

```bash
npm run seed
```

Default admin credentials:

- Email: `admin@university.edu`
- Password: `admin123`

**⚠️ IMPORTANT**: Change the default admin password after first login!

1. Start the server:

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register Student

**POST** `/auth/register`

Register a new student account (students only).

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "password123",
  "studentId": "STU001"
}
```

**Response:** (201 Created)

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@university.edu",
  "studentId": "STU001",
  "role": "student",
  "token": "jwt_token_here"
}
```

#### 2. Login

**POST** `/auth/login`

Login for both students and admins.

**Request Body:**

```json
{
  "email": "admin@university.edu",
  "password": "admin123"
}
```

**Response:** (200 OK)

```json
{
  "_id": "...",
  "name": "System Admin",
  "email": "admin@university.edu",
  "role": "admin",
  "token": "jwt_token_here"
}
```

#### 3. Get Profile

**GET** `/auth/profile`

Get current user's profile (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** (200 OK)

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@university.edu",
  "role": "student",
  "studentId": "STU001",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Request Management Endpoints

All request endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

#### 4. Create Request

**POST** `/requests`

Create a new service request (Student/Admin).

**Request Body:**

```json
{
  "title": "Wi-Fi connectivity issue in hostel",
  "description": "Unable to connect to Wi-Fi in room 204, Block A",
  "category": "IT",
  "priority": "High"
}
```

**Categories:** `Fee`, `Hostel`, `IT`, `Academic`, `Other`
**Priorities:** `Low`, `Medium`, `High`

**Response:** (201 Created)

```json
{
  "_id": "...",
  "studentId": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@university.edu",
    "studentId": "STU001"
  },
  "title": "Wi-Fi connectivity issue in hostel",
  "description": "Unable to connect to Wi-Fi in room 204, Block A",
  "category": "IT",
  "priority": "High",
  "status": "Pending",
  "assignedDepartment": "",
  "statusHistory": [...],
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### 5. Get All Requests

**GET** `/requests`

Get all requests. Students see only their own requests, admins see all.

**Query Parameters:**

- `status`: Filter by status (`Pending`, `InProgress`, `Resolved`, `Rejected`)
- `category`: Filter by category
- `priority`: Filter by priority
- `department`: Filter by assigned department

**Example:** `/requests?status=Pending&category=IT`

**Response:** (200 OK)

```json
{
  "count": 2,
  "requests": [...]
}
```

#### 6. Get Request by ID

**GET** `/requests/:id`

Get a single request by ID. Students can only view their own requests.

**Response:** (200 OK)

```json
{
  "_id": "...",
  "studentId": {...},
  "title": "...",
  "description": "...",
  "category": "IT",
  "priority": "High",
  "status": "InProgress",
  "assignedDepartment": "IT Support",
  "assignedBy": {...},
  "statusHistory": [...],
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### 7. Update Request

**PUT** `/requests/:id`

Update a request (Student - owner only, and only if status is Pending).

**Request Body:**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "Medium"
}
```

**Response:** (200 OK)

#### 8. Delete Request

**DELETE** `/requests/:id`

Delete a request (Student - owner only, and only if status is Pending).

**Response:** (200 OK)

```json
{
  "message": "Request deleted successfully"
}
```

### Admin-Only Request Management

#### 9. Update Request Status

**PUT** `/requests/:id/status`

Update the status of a request with optional comment (Admin only).

**Request Body:**

```json
{
  "status": "InProgress",
  "comment": "Request has been assigned to IT team and is under investigation"
}
```

**Statuses:** `Pending`, `InProgress`, `Resolved`, `Rejected`

**Response:** (200 OK)

#### 10. Assign Department

**PUT** `/requests/:id/assign`

Assign a request to a department (Admin only).

**Request Body:**

```json
{
  "department": "IT Support"
}
```

**Response:** (200 OK)

#### 11. Get Request History

**GET** `/requests/:id/history`

Get the complete status history of a request. Students can view their own request history, admins can view all.

**Response:** (200 OK)

```json
{
  "requestId": "...",
  "title": "Wi-Fi connectivity issue",
  "statusHistory": [
    {
      "status": "Pending",
      "updatedBy": {
        "name": "John Doe",
        "email": "john@university.edu",
        "role": "student"
      },
      "comment": "Request created",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "status": "InProgress",
      "updatedBy": {
        "name": "System Admin",
        "email": "admin@university.edu",
        "role": "admin"
      },
      "comment": "Assigned to IT team",
      "updatedAt": "2024-01-01T11:00:00.000Z"
    }
  ]
}
```

### Reporting & Analytics Endpoints (Admin Only)

All reporting endpoints require admin authentication.

#### 12. Overview Statistics

**GET** `/reports/overview`

Get overall request statistics.

**Query Parameters:**

- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)

**Example:** `/reports/overview?startDate=2024-01-01&endDate=2024-12-31`

**Response:** (200 OK)

```json
{
  "total": 150,
  "pending": 30,
  "inProgress": 45,
  "resolved": 60,
  "rejected": 15
}
```

#### 13. Department-wise Statistics

**GET** `/reports/by-department`

Get request distribution by department.

**Query Parameters:** Same as overview (optional date range)

**Response:** (200 OK)

```json
[
  {
    "department": "IT Support",
    "total": 45,
    "pending": 10,
    "inProgress": 15,
    "resolved": 18,
    "rejected": 2
  },
  {
    "department": "Academic Affairs",
    "total": 32,
    "pending": 8,
    "inProgress": 10,
    "resolved": 12,
    "rejected": 2
  }
]
```

#### 14. Category-wise Statistics

**GET** `/reports/by-category`

Get request breakdown by category.

**Response:** (200 OK)

```json
[
  {
    "category": "IT",
    "total": 50,
    "pending": 12,
    "inProgress": 18,
    "resolved": 18,
    "rejected": 2
  },
  {
    "category": "Academic",
    "total": 40,
    "pending": 8,
    "inProgress": 15,
    "resolved": 15,
    "rejected": 2
  }
]
```

#### 15. Priority-wise Statistics

**GET** `/reports/by-priority`

Get request analysis by priority.

**Response:** (200 OK)

```json
[
  {
    "priority": "High",
    "total": 35,
    "pending": 8,
    "inProgress": 12,
    "resolved": 13,
    "rejected": 2
  },
  {
    "priority": "Medium",
    "total": 70,
    "pending": 15,
    "inProgress": 25,
    "resolved": 28,
    "rejected": 2
  },
  {
    "priority": "Low",
    "total": 45,
    "pending": 7,
    "inProgress": 8,
    "resolved": 19,
    "rejected": 11
  }
]
```

#### 16. Comprehensive Report

**GET** `/reports/comprehensive`

Get all statistics in a single response.

**Query Parameters:** Optional date range

**Response:** (200 OK)

```json
{
  "overview": {...},
  "byDepartment": [...],
  "byCategory": [...],
  "byPriority": [...],
  "generatedAt": "2024-01-15T12:00:00.000Z",
  "dateRange": {
    "start": "All time",
    "end": "Present"
  }
}
```

## Error Responses

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

**Common Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Security Features

1. **Rate Limiting**: 100 requests per 15 minutes per IP
2. **Input Validation**: All inputs validated using express-validator
3. **NoSQL Injection Prevention**: express-mongo-sanitize middleware
4. **Security Headers**: Helmet middleware for secure HTTP headers
5. **Password Hashing**: bcryptjs with salt rounds
6. **JWT Authentication**: 24-hour token expiry

## Project Structure

```
uni_service_req_management/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User model (Student/Admin)
│   │   └── Request.js            # Request model
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── requestController.js  # Request management logic
│   │   └── reportController.js   # Reporting & analytics logic
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── requestRoutes.js      # Request endpoints
│   │   └── reportRoutes.js       # Report endpoints
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── roleCheck.js          # Role-based access control
│   │   └── errorHandler.js       # Centralized error handling
│   ├── validators/
│   │   ├── authValidator.js      # Auth input validation
│   │   └── requestValidator.js   # Request input validation
│   └── utils/
│       ├── generateToken.js      # JWT token generation
│       └── seed.js               # Admin user seeding
├── server.js                     # Application entry point
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Project dependencies
└── README.md                     # Project documentation
```

## Testing

For comprehensive testing, it's recommended to use Postman or similar API testing tools.

### Test Flow Example

1. **Seed Admin**: `npm run seed`
2. **Login as Admin**: POST `/api/auth/login` with admin credentials
3. **Register Student**: POST `/api/auth/register` with student details
4. **Login as Student**: POST `/api/auth/login` with student credentials
5. **Create Request**: POST `/api/requests` (as student)
6. **Assign Department**: PUT `/api/requests/:id/assign` (as admin)
7. **Update Status**: PUT `/api/requests/:id/status` (as admin)
8. **View Reports**: GET `/api/reports/overview` (as admin)

## Deployment

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` with your Atlas connection string

### Deployment Platforms

This application can be deployed to:

- **Render**: [render.com](https://render.com)
- **Railway**: [railway.app](https://railway.app)
- **Heroku**: [heroku.com](https://heroku.com)
- **DigitalOcean**: [digitalocean.com](https://digitalocean.com)

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `PORT` (usually auto-assigned)
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (use a strong, random secret)
- `JWT_EXPIRE` (e.g., "24h")
- `NODE_ENV=production`

## API Endpoint Summary

Total: **23 RESTful endpoints**

### Authentication (3 endpoints)

- POST `/api/auth/register` - Register student
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get profile

### Request Management (8 endpoints)

- POST `/api/requests` - Create request
- GET `/api/requests` - Get all requests (with filtering)
- GET `/api/requests/:id` - Get request by ID
- PUT `/api/requests/:id` - Update request
- DELETE `/api/requests/:id` - Delete request
- PUT `/api/requests/:id/status` - Update status (Admin)
- PUT `/api/requests/:id/assign` - Assign department (Admin)
- GET `/api/requests/:id/history` - Get request history

### Reporting & Analytics (5 endpoints - Admin only)

- GET `/api/reports/overview` - Overview statistics
- GET `/api/reports/by-department` - Department-wise stats
- GET `/api/reports/by-category` - Category-wise stats
- GET `/api/reports/by-priority` - Priority-wise stats
- GET `/api/reports/comprehensive` - Comprehensive report

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
