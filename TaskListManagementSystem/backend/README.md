# Task Management Backend API

A Node.js + Express backend API for the Task Management System, integrated with MongoDB Atlas.

## 📋 Features

- **RESTful API** for task management
- **MongoDB Atlas** integration using Mongoose
- **CRUD Operations** for tasks:
  - Create tasks
  - Get all tasks
  - Get single task
  - Update tasks (full or partial)
  - Delete tasks
- **CORS** enabled for frontend integration
- **Error handling** and validation

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Navigate to the backend folder:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file:**
   Create a `.env` file in the `backend` folder with the following content:

   ```env
   MONGODB_URI="..."
   PORT=3000
   FRONTEND_URL=http://localhost:5500
   ```

   **Important:** Replace `YOUR_PASSWORD` with your actual MongoDB Atlas password.

4. **Start the server:**

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

5. **Verify the server is running:**
   - Open your browser and visit: `http://localhost:3000/api/health`
   - You should see: `{"success":true,"message":"Task Management API is running",...}`

## 📁 Project Structure

```
backend/
├── server.js          # Main Express server file
├── db.js              # MongoDB connection configuration
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (create this)
├── models/
│   └── Task.js       # Task Mongoose model/schema
└── routes/
    └── tasks.js      # Task API routes
```

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### 1. Health Check

```
GET /api/health
```

Returns server status.

**Response:**

```json
{
  "success": true,
  "message": "Task Management API is running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

#### 2. Get All Tasks

```
GET /api/tasks
```

Retrieves all tasks, sorted by creation date (newest first).

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Complete project",
      "description": "Finish the task management system",
      "status": "pending",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

#### 3. Get Single Task

```
GET /api/tasks/:id
```

Retrieves a single task by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Complete project",
    "description": "Finish the task management system",
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

#### 4. Create Task

```
POST /api/tasks
Content-Type: application/json
```

Creates a new task.

**Request Body:**

```json
{
  "title": "New Task",
  "description": "Optional description",
  "status": "pending"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "New Task",
    "description": "Optional description",
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

#### 5. Update Task (Full)

```
PUT /api/tasks/:id
Content-Type: application/json
```

Updates all fields of a task.

**Request Body:**

```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "completed"
}
```

#### 6. Update Task (Partial)

```
PATCH /api/tasks/:id
Content-Type: application/json
```

Updates specific fields of a task. Only include fields you want to update.

**Request Body Examples:**

```json
// Update title only
{
  "title": "New Title"
}

// Toggle completion status
{
  "status": "completed"
}

// Update multiple fields
{
  "title": "New Title",
  "status": "completed"
}
```

#### 7. Delete Task

```
DELETE /api/tasks/:id
```

Deletes a task by ID.

**Response:**

```json
{
  "success": true,
  "data": {},
  "message": "Task deleted successfully"
}
```

## 📝 Task Model Schema

```javascript
{
  title: String (required, max 200 chars),
  description: String (optional, max 1000 chars),
  status: String (enum: ['pending', 'completed'], default: 'pending'),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
# MongoDB Atlas Connection String
MONGODB_URI="..."

# Server Port
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5500
```

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `<PASSWORD>` with your database password
5. Add your connection string to `.env`

## 🐛 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 CORS Configuration

The backend is configured to accept requests from:

- `http://localhost:5500` (default VS Code Live Server port)
- Or the URL specified in `FRONTEND_URL` environment variable

To change this, update the `FRONTEND_URL` in your `.env` file.

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB object modeling
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Update `FRONTEND_URL` to your production frontend URL
3. Ensure MongoDB Atlas allows connections from your server IP
4. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name task-api
   ```

## 📞 Support

If you encounter any issues:

1. Check that MongoDB Atlas is accessible
2. Verify your `.env` file has the correct connection string
3. Ensure the port (3000) is not already in use
4. Check the console for error messages

## 📄 License

ISC
