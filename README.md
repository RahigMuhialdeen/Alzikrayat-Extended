# Alzikrayat — MERN Edition

A full-stack photo sharing application. Users can register, log in, upload photos,
view them in a responsive gallery (grid/list), comment on photos, and delete their own photos.

**Stack:** React (Vite) · Express · MongoDB (Mongoose) · bcrypt · Joi · Multer

## Features

- Register / Login with bcrypt-hashed passwords and session-based authentication
- Photo upload (JPEG, PNG, WebP, max 5 MB), stored in `server/uploads/`
- Gallery with grid / list toggle and a photo detail page (`/photos/:id`)
- Comments on photos, updated instantly without page reload
- Owner-only deletion of photos (verified server-side)

## Project Structure

```
Alzikrayat/
├── client/   # React + Vite frontend
└── server/   # Express REST API + MongoDB models
```

## Prerequisites

- Node.js 18+
- A MongoDB database (local instance or MongoDB Atlas)

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env     # then edit .env with your own values
npm run dev
```

The API runs on http://localhost:5000.

### 2. Client

```bash
cd client
npm install
npm run dev
```

The app runs on http://localhost:5180. Vite proxies `/api` and `/uploads`
to the Express server, so start the server first.

## Environment Variables (`server/.env`)

| Variable         | Required | Description                                           |
| ---------------- | -------- | ----------------------------------------------------- |
| `MONGO_URI`      | Yes      | MongoDB connection string                             |
| `SESSION_SECRET` | Yes      | Secret used to sign session cookies                   |
| `PORT`           | No       | API port (default `5000`)                             |
| `CLIENT_URL`     | No       | Allowed CORS origin (default `http://localhost:5180`) |

> The `.env` file is excluded from Git. Never commit real secrets.

## API Endpoints

| Method | Route                      | Auth | Description                |
| ------ | -------------------------- | ---- | -------------------------- |
| POST   | `/api/auth/register`       | No   | Register a new user        |
| POST   | `/api/auth/login`          | No   | Log in                     |
| POST   | `/api/auth/logout`         | No   | Log out                    |
| GET    | `/api/photos`              | No   | List all photos            |
| GET    | `/api/photos/:id`          | No   | Get one photo              |
| POST   | `/api/photos`              | Yes  | Upload a photo (multipart) |
| DELETE | `/api/photos/:id`          | Yes  | Delete own photo           |
| GET    | `/api/photos/:id/comments` | No   | List comments of a photo   |
| POST   | `/api/photos/:id/comments` | Yes  | Add a comment              |
| DELETE | `/api/comments/:id`        | Yes  | Delete own comment         |

## Author

Rahig Muhialdeen Ibrahim Ramadan — Advanced Web Technologies, Project 3
