# 🎟️ Event Booking API

A RESTful API for an Event Booking application built with **Node.js, Express.js, MongoDB, and Mongoose**.

The API provides authentication, event management, category management, event booking, reviews, saved events, notifications, and user profile management.

---

## 🚀 Features

* 🔐 User authentication with JWT
* 🔑 Password hashing using bcrypt
* 🔄 Forgot & reset password
* 🌐 Google OAuth authentication
* 👤 User profile management
* 🖼️ Profile avatar upload
* 🎫 Event CRUD operations
* 📂 Category CRUD operations
* 🎟️ Event booking
* ✏️ Update and cancel bookings
* ⭐ Event reviews
* 🔖 Save events for later
* 🔔 User notifications
* 📄 Pagination
* 🛡️ Role-based authorization
* 🛡️ Helmet security headers
* 🚦 Rate limiting
* 🗜️ Response compression
* 🌐 CORS support
* ✅ Request validation with Zod
* 🧪 Jest testing

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT**
* **bcrypt**
* **Passport.js**
* **Google OAuth 2.0**
* **Zod**
* **Multer**
* **Jest**
* **Helmet**
* **express-rate-limit**
* **Compression**
* **Cookie Parser**

---

## 📁 Project Structure

```text
Event-Booking/
│
├── __test__/             # Tests
├── config/               # Configuration files
├── controller/           # Controllers / business logic
├── middleware/           # Authentication, validation, upload, etc.
├── models/               # Mongoose models
├── routes/               # API routes
├── schema/               # Zod validation schemas
├── utils/                # Utility functions
├── uploads/              # Uploaded images
│
├── app.js
├── package.json
└── package-lock.json
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECERT=your_jwt_secret
FRONTEND_URL=http://localhost:5500
```

For Google OAuth, add the required Google credentials:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
```

> Never commit your `.env` file to GitHub.

---

## ▶️ Running the Project

Start the server:

```bash
npm start
```

For development:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

---

# 🔐 Authentication

Protected endpoints require authentication.

For JWT authentication, send the token through the authorization header:

```http
Authorization: Bearer <your-token>
```

Some authentication flows also use HTTP-only cookies.

---

# 📚 API Documentation

Base URL:

```text
http://localhost:5000/api
```

---

## 🔐 Authentication APIs

Base route:

```text
/api/auth
```

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| POST   | `/register`              | Register a new user    |
| POST   | `/login`                 | Login                  |
| POST   | `/forgot-password`       | Request password reset |
| POST   | `/reset-password/:token` | Reset password         |
| GET    | `/google`                | Login with Google      |
| GET    | `/google/callback`       | Google OAuth callback  |

> Exact authentication endpoint names should match the routes defined in `authRoute.js`.

---

# 👤 User Profile

Base route:

```text
/api/users
```

| Method | Endpoint                   | Auth | Description                |
| ------ | -------------------------- | ---- | -------------------------- |
| GET    | `/profile`                 | 🔒   | Get current user's profile |
| PATCH  | `/profile`                 | 🔒   | Update name/avatar         |
| PATCH  | `/profile/change-password` | 🔒   | Change password            |
| DELETE | `/profile`                 | 🔒   | Delete account             |

### Update Profile

```http
PATCH /api/users/profile
```

The request uses `multipart/form-data`.

Example:

```text
name: Reem
avatar: <image>
```

---

# 🎫 Events

Base route:

```text
/api/events
```

| Method | Endpoint | Auth | Role  | Description      |
| ------ | -------- | ---- | ----- | ---------------- |
| GET    | `/`      | ❌    | —     | Get all events   |
| POST   | `/`      | 🔒   | Admin | Create event     |
| GET    | `/:id`   | 🔒   | —     | Get single event |
| PATCH  | `/:id`   | 🔒   | Admin | Update event     |
| DELETE | `/:id`   | 🔒   | Admin | Delete event     |

### Pagination

Events support pagination:

```http
GET /api/events?page=1&limit=10
```

Example response:

```json
{
  "status": "success",
  "data": {
    "events": []
  }
}
```

---

# 📂 Categories

Base route:

```text
/api/category
```

| Method | Endpoint | Auth | Role  | Description         |
| ------ | -------- | ---- | ----- | ------------------- |
| GET    | `/`      | ❌    | —     | Get all categories  |
| POST   | `/`      | 🔒   | Admin | Create category     |
| GET    | `/:id`   | ❌    | —     | Get single category |
| PATCH  | `/:id`   | 🔒   | Admin | Update category     |
| DELETE | `/:id`   | 🔒   | Admin | Delete category     |

Categories also support pagination:

```http
GET /api/category?page=1&limit=10
```

---

# 🎟️ Bookings

Base route:

```text
/api/booking
```

| Method | Endpoint | Auth | Role | Description                 |
| ------ | -------- | ---- | ---- | --------------------------- |
| POST   | `/:id`   | 🔒   | User | Book an event               |
| GET    | `/`      | 🔒   | User | Get current user's bookings |
| PATCH  | `/:id`   | 🔒   | User | Update booking              |
| DELETE | `/:id`   | 🔒   | User | Cancel booking              |

### Create Booking

```http
POST /api/booking/:eventId
```

Request body:

```json
{
  "numberOfSeats": 2
}
```

The API checks:

* Event exists
* Requested seats are available
* User has not already booked the event

When a booking is created, the event's `availableSeats` is decreased automatically.

When a booking is cancelled, the seats are returned to the event.

---

# ⭐ Reviews

Base route:

```text
/api/review
```

| Method | Endpoint | Auth | Description                |
| ------ | -------- | ---- | -------------------------- |
| POST   | `/:id`   | 🔒   | Add review to an event     |
| GET    | `/`      | 🔒   | Get current user's reviews |
| PATCH  | `/:id`   | 🔒   | Update review              |
| DELETE | `/:id`   | 🔒   | Delete review              |

### Add Review

```http
POST /api/review/:eventId
```

Request body:

```json
{
  "rating": 5,
  "comment": "Amazing event!"
}
```

A user must have a booking for the event before they can review it.

A user can only create one review per event.

---

# 🔖 Save for Later

Base route:

```text
/api/saved-events
```

| Method | Endpoint | Auth | Description        |
| ------ | -------- | ---- | ------------------ |
| POST   | `/:id`   | 🔒   | Save an event      |
| GET    | `/`      | 🔒   | Get saved events   |
| DELETE | `/:id`   | 🔒   | Remove saved event |

### Get Saved Events

Pagination is supported:

```http
GET /api/saved-events?page=1&limit=10
```

A user cannot save the same event more than once.

---

# 🔔 Notifications

Base route:

```text
/api/notification
```

| Method | Endpoint | Auth | Description                    |
| ------ | -------- | ---- | ------------------------------ |
| GET    | `/`      | 🔒   | Get user notifications         |
| PATCH  | `/:id`   | 🔒   | Mark one notification as read  |
| PATCH  | `/`      | 🔒   | Mark all notifications as read |
| DELETE | `/:id`   | 🔒   | Delete notification            |

### Notification Structure

```json
{
  "user": "userId",
  "type": "booking",
  "message": "Your booking has been created successfully",
  "isRead": false
}
```

---

# 🖼️ Uploaded Files

Uploaded images are served through:

```text
/uploads/<filename>
```

Example:

```text
http://localhost:5000/uploads/avatar.jpg
```

---

# 🛡️ Security

The API includes several security measures:

* **Helmet** for HTTP security headers
* **CORS** configuration
* **JWT authentication**
* **Role-based authorization**
* **bcrypt password hashing**
* **Rate limiting**
* **HTTP-only cookies where applicable**
* **Input validation with Zod**
* **Compression**

---

# ❌ Error Response Format

The API generally follows a consistent response structure.

Example:

```json
{
  "status": "fail",
  "message": "Event not found"
}
```

Validation errors return a `400` response.

Authentication/authorization errors return appropriate `401` or `403` responses.

---

# 🧪 Testing

Tests are located in:

```text
__test__/
```

Run the test suite using the configured Jest command in `package.json`.

---

# 📌 Notes

* Admin-only operations require an authenticated admin user.
* User-specific resources are restricted to the authenticated user.
* Users cannot review an event unless they have booked it.
* Users cannot book the same event more than once.
* Users cannot save the same event more than once.
* Categories cannot be deleted while they are being used by events.
* Event seat availability is updated automatically when bookings are created, updated, or cancelled.

---

## 👩‍💻 Author

**Reem Ahmed**

Computer Science Student & Software Developer
