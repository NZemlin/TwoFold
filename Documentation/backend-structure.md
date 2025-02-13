# Backend Structure

## Overview
This document outlines the structure and architecture of the TwoFold backend, including user authentication, database schema, API endpoints, and security measures.

---

## Technologies
- **Framework**: Node.js with Express.js.
- **Database**: Supabase (PostgreSQL).
- **Authentication**: JWT (JSON Web Tokens).
- **API Design**: RESTful APIs with JSON payloads.

---

## File Structure
### High-Level Structure
- **`/server`**: Contains all backend source code.
  - **`/controllers`**: Handles request logic (e.g., user, video controllers).
  - **`/models`**: Database models (e.g., User, TimelinePost).
  - **`/routes`**: API routes.
  - **`/services`**: Business logic (e.g., timeline post processing).
  - **`/utils`**: Helper functions (e.g., authentication, file upload).
  
---

## Database Schema
### Users Table
- **`userId`**: Primary key (UUID).
- **`email`**: User email (unique).
- **`passwordHash`**: Hashed password.
- **`profileInfo`**: JSON object for additional user details (e.g., name, profile picture).
- **`partnerId`**: Foreign key linking to the Users table (nullable).

### Couples Table
- **`coupleId`**: Primary key (UUID).
- **`user1Id`**: Foreign key linking to the Users table.
- **`user2Id`**: Foreign key linking to the Users table.
- **`createdAt`**: Timestamp of when the couple was created.

### Timeline Posts Table
- **`postId`**: Primary key (UUID).
- **`coupleId`**: Foreign key linking to the Couples table.
- **`content`**: Text content of the post.
- **`type`**: Type of post (e.g., "text", "image").
- **`createdAt`**: Timestamp of when the post was created.

### Affection Gestures Table
- **`id`**: Primary key (UUID).
- **`coupleId`**: Foreign key linking to the Couples table.
- **`senderId`**: Foreign key linking to the Users table.
- **`receiverId`**: Foreign key linking to the Users table.
- **`type`**: Type of gesture (enum: "hug", "kiss").
- **`createdAt`**: Timestamp of when the gesture was sent.
- **`updatedAt`**: Timestamp of last update.

### Hints Table
- **`id`**: Primary key (UUID).
- **`coupleId`**: Foreign key linking to the Couples table.
- **`creatorId`**: Foreign key linking to the Users table.
- **`content`**: Text content of the hint.
- **`category`**: Category of hint (enum: "gift", "date_night", "experience", "other").
- **`linkUrl`**: Optional URL for external reference.
- **`isFulfilled`**: Boolean indicating if hint is completed.
- **`fulfilledAt`**: Timestamp of when hint was marked as fulfilled.
- **`createdAt`**: Timestamp of creation.
- **`updatedAt`**: Timestamp of last update.

---

## API Endpoints
### User Endpoints
- **POST `/api/users/signup`**: Create a new user.
  - Request Body: `{ email, password }`
  - Response: `{ userId, email }`
- **POST `/api/users/login`**: Log in a user.
  - Request Body: `{ email, password }`
  - Response: `{ token, userId }`
- **GET `/api/users/profile`**: Get user profile.
  - Response: `{ userId, email, profileInfo }`
- **PUT `/api/users/profile`**: Update user profile.
  - Request Body: `{ email, password, profileInfo }`
  - Response: `{ userId, email, profileInfo }`

### Timeline Posts Endpoints
- **POST `/api/timeline/create`**: Create a new timeline post.
  - Request Body: `{ coupleId, content, type }`
  - Response: `{ postId, coupleId, content, type, createdAt }`
- **GET `/api/timeline/:coupleId`**: Get timeline posts for a couple.
  - Response: `{ postId, coupleId, content, type, createdAt }`
- **PUT `/api/timeline/:postId/edit`**: Edit a timeline post.
  - Request Body: `{ content, type }`
  - Response: `{ postId, coupleId, content, type, createdAt }`
- **DELETE `/api/timeline/:postId`**: Delete a timeline post.
  - Response: `{ message: "Post deleted" }`

### Affection Gestures Endpoints
- **POST `/api/affection/send`**: Send an affection gesture.
  - Request Body: `{ coupleId, receiverId, type }`
  - Response: `{ id, coupleId, senderId, receiverId, type, createdAt }`
- **GET `/api/affection/:coupleId`**: Get affection history for a couple.
  - Response: Array of `{ id, senderId, receiverId, type, createdAt }`
- **GET `/api/affection/stats/:coupleId`**: Get affection statistics.
  - Response: `{ totalHugs, totalKisses, lastGesture }`

### Hints Endpoints
- **POST `/api/hints/create`**: Create a new hint.
  - Request Body: `{ coupleId, content, category, linkUrl }`
  - Response: `{ id, coupleId, content, category, linkUrl, createdAt }`
- **GET `/api/hints/:coupleId`**: Get all hints for a couple.
  - Response: Array of `{ id, creatorId, content, category, linkUrl, isFulfilled, fulfilledAt }`
- **PUT `/api/hints/:hintId/fulfill`**: Mark a hint as fulfilled.
  - Response: `{ id, isFulfilled, fulfilledAt }`
- **PUT `/api/hints/:hintId`**: Update a hint.
  - Request Body: `{ content, category, linkUrl }`
  - Response: `{ id, content, category, linkUrl, updatedAt }`
- **DELETE `/api/hints/:hintId`**: Delete a hint.
  - Response: `{ message: "Hint deleted" }`

---

## Authentication
### JWT (JSON Web Tokens)
- **Signup**: Generate a JWT when a user signs up.
- **Login**: Verify user credentials and generate a JWT.
- **Middleware**: Use JWT middleware to protect routes (e.g., `/api/timeline`).

### Password Hashing
- Use **bcrypt** to hash passwords before storing them in the database.

---

## Security Measures
### Environment Variables
- Store sensitive data (e.g., database URLs, API keys) in `.env` files.
- Use `dotenv` to load environment variables in development.

### Input Validation
- Validate all user inputs to prevent SQL injection and other attacks.
- Use libraries like `joi` or `express-validator`.

### Rate Limiting
- Use `express-rate-limit` to limit the number of requests from a single IP address.

### Row Level Security (RLS)
Row Level Security is implemented in Supabase to ensure data privacy and access control at the database level.

#### Users Table Policies
- **View Own Profile**: Users can only view their own profile
  ```sql
  auth.uid() = id
  ```
- **Update Own Profile**: Users can only update their own profile
  ```sql
  auth.uid() = id
  ```

#### Couples Table Policies
- **View Own Couple**: Users can only view couples they're a part of
  ```sql
  auth.uid() = user1_id OR auth.uid() = user2_id
  ```

#### Timeline Posts Policies
- **View**: Users can view posts from their couple
- **Create**: Users can create posts for their couple
- **Update**: Users can update any post in their couple
- **Delete**: Users can delete any post in their couple
- All policies check:
  ```sql
  EXISTS (
    SELECT 1 FROM couples
    WHERE id = timeline_posts.couple_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
  ```

#### Affection Gestures Policies
- **View**: Users can view all gestures in their couple
  ```sql
  EXISTS (
    SELECT 1 FROM couples
    WHERE id = affection_gestures.couple_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
  ```
- **Create**: Users can only send gestures as themselves
  ```sql
  -- Must be in the couple AND be the sender
  EXISTS (
    SELECT 1 FROM couples
    WHERE id = affection_gestures.couple_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
  AND auth.uid() = sender_id
  ```

#### Hints Policies
- **View**: Users can view all hints in their couple
- **Create**: Users can create hints for their couple (must be creator)
- **Update**: Users can update any hint in their couple
- **Delete**: Users can only delete hints they created
- Base couple check for all operations:
  ```sql
  EXISTS (
    SELECT 1 FROM couples
    WHERE id = hints.couple_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
  ```
- Additional creator check for delete:
  ```sql
  auth.uid() = creator_id
  ```

These policies ensure that:
1. Users can only access data related to their own couple
2. Certain operations (like sending gestures or deleting hints) require additional ownership verification
3. All data access is authenticated and authorized at the database level

---

## Error Handling
### Global Error Handler
- Use Express.js middleware to catch and handle errors globally.
- Log errors with sufficient context for debugging.

### Custom Error Classes
- Create custom error classes (e.g., `NotFoundError`, `ValidationError`) for better error handling.

---

## Testing
### Unit Tests
- Write unit tests for controllers and services using Jest.

### Integration Tests
- Test API endpoints using Supertest.
