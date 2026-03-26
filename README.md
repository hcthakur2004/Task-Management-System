# Task Management System

A full stack task tracker built with React, Express, and MongoDB. It includes JWT authentication, task CRUD, filtering, search, sorting, pagination, analytics, loading/error states, responsive design, and dark mode.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT

## Project Structure

```text
.
|-- backend
|   |-- src
|-- frontend
|   |-- src
|-- README.md
```

## Setup Steps

### 1. Clone and install

```bash
git clone https://github.com/hcthakur2004/Task-Management-System.git
cd task-manager
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `.env` files from the examples:

Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task-manager
JWT_SECRET=replace-with-a-strong-secret
CLIENT_URL=http://localhost:5173
```

Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/toggle-complete`

Supported task query params on `GET /api/tasks`:

- `page`
- `limit`
- `status`
- `priority`
- `search`
- `sortBy`
- `order`

### Analytics

- `GET /api/analytics`

## Core Features

- User signup and login with JWT
- Create, view, update, delete, and complete tasks
- Filter by status and priority
- Search by task title
- Sort by due date, priority, created date, status, or title
- Paginated task list
- Analytics for total, completed, pending, overdue, and completion percentage
- Responsive UI with dark mode
- Global backend error handling
- MongoDB indexes for common task queries

## Design Decisions

- Separated frontend and backend for clear deployment boundaries.
- Used JWT auth with protected API routes for a simple stateless auth flow.
- Built analytics with MongoDB aggregation so summary data is computed efficiently.
- Added compound indexes on task fields used in filtering and sorting.
- Used stats cards and lightweight visual bars instead of a chart dependency to keep the UI fast and simple.
- Stored auth and theme preferences in local storage for a smoother returning-user experience.

## Live Link

Not deployed yet.

## Notes

- The backend expects a running MongoDB instance.
- If you deploy, update `CLIENT_URL` and `VITE_API_URL` to match your hosted frontend/backend.
