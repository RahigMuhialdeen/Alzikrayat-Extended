# Alzikrayat — MERN Edition (Project 4: Real-Time WebSocket Track)

A full-stack photo sharing application. Users can register, log in, upload photos,
view them in a responsive gallery (grid/list), comment on photos, and delete their own photos.

**Stack:** React (Vite) · Express · MongoDB (Mongoose) · bcrypt · Joi · Multer · **Socket.io**

## Project 4 — Track D: Real-Time WebSocket (Socket.io)

### Why this track
The comment section was the most interactive part of Project 3, yet two people
looking at the same photo only saw each other's comments after a manual reload.
Socket.io fixes exactly that, and it is additive: sessions, REST routes, Joi
validation and the three-tier architecture (React ← Express ← MongoDB) are
unchanged, so every Project 3 feature keeps working.

### What was added
- **Socket.io server** attached to the same HTTP server as Express (`server/socket.js`).
- **Room per photo** (`photo:<photoId>`): events only reach clients viewing that photo.
- **Live comments:** a new comment appears instantly on every connected client of that photo page.
- **Live deletions:** deleting a comment removes it from other viewers' screens; deleting a photo tells viewers it is gone.
- **Viewer counter** ("Live · 3 people viewing") and a connection indicator with automatic re-sync after a reconnect.
- **Optional feature:** live notification on the Gallery page when another user uploads a photo.
- **Cleanup on unmount:** every listener is removed with `socket.off`, the room is left with `photo:leave`, and the shared connection is closed when no component needs it (`client/src/socket.js`).

### Security design
Clients can only *listen* and join rooms. All data-changing actions still go through
the authenticated REST endpoints (session + `requireAuth` + Joi validation); the server
broadcasts the event only after the change is saved. A client therefore cannot forge a
comment through the socket. Room IDs are validated as MongoDB ObjectIds.

### Socket events

| Event             | Direction        | Payload                       | Purpose                              |
| ----------------- | ---------------- | ----------------------------- | ------------------------------------ |
| `photo:join`      | client → server  | `photoId`                     | Join the room of the viewed photo    |
| `photo:leave`     | client → server  | `photoId`                     | Leave the room                       |
| `comment:new`     | server → room    | populated comment             | Show a new comment instantly         |
| `comment:deleted` | server → room    | `{ commentId, photoId }`      | Remove a deleted comment             |
| `photo:deleted`   | server → room    | `{ photoId }`                 | Photo removed by its owner           |
| `room:viewers`    | server → room    | `{ photoId, count }`          | Number of people viewing             |
| `photo:uploaded`  | server → all     | `{ photoId, title, uploaderId }` | Gallery notification (optional)   |

### How to test it
1. Start the server and the client (see Setup).
2. Open the same photo (`/photos/:id`) in two browsers (or one normal and one private window).
3. Log in and post a comment in one window: it appears in the other without a reload.
4. Check that the viewer counter changes when you open/close the second window.
5. Open the Gallery in two windows; upload a photo in one and watch the notice appear in the other.

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

The app runs on http://localhost:5180. Vite proxies `/api`, `/uploads` and
`/socket.io` (WebSocket) to the Express server, so start the server first.

## Environment Variables (`server/.env`)

| Variable         | Required | Description                                           |
| ---------------- | -------- | ----------------------------------------------------- |
| `MONGO_URI`      | Yes      | MongoDB connection string                             |
| `SESSION_SECRET` | Yes      | Secret used to sign session cookies                   |
| `PORT`           | No       | API port (default `5000`)                             |
| `CLIENT_URL`     | No       | Allowed CORS origin (default `http://localhost:5180`) |

Optional client variable (only for a separate deployment, in `client/.env`):
`VITE_SOCKET_URL` — URL of the Socket.io server. Not needed in development.

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

Rahig Muhialdeen Ibrahim Ramadan — Advanced Web Technologies, Project 3 (base) and Project 4 (Real-Time WebSocket track)
