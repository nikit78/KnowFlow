# KnowFlow Backend

## Overview

KnowFlow Backend is built using Node.js, Express.js, TypeScript, and MongoDB.

It provides secure authentication and a complete Notes Management API.

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Cookie Parser
- CORS

---

## Features

### Authentication

- User Registration
- User Login
- Get Current User
- Logout
- JWT Authentication
- HTTP Only Cookies
- Password Hashing

### Notes

- Create Note
- Get All Notes
- Get Single Note
- Update Note
- Delete Note
- Pin / Unpin Notes

---

## Folder Structure

src/
config/
controllers/
middleware/
models/
routes/
utils/

---

## APIs

### Auth APIs

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

POST /api/auth/logout

---

### Notes APIs

POST /api/notes

GET /api/notes

GET /api/notes/:id

PUT /api/notes/:id

DELETE /api/notes/:id

PATCH /api/notes/:id/pin

---

## Current Status

Authentication Module ✔

Notes CRUD ✔

Pin Notes ✔

Backend Stable ✔

## 📂 Collections Module

The Collections module helps users organize notes into logical folders, making knowledge management more structured and scalable.

### Features

- Create Collection
- View All Collections
- Update Collection
- Delete Collection
- Link Notes with Collections
- Filter Notes by Collection
- Populate Collection Details in Notes

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/collections | Create Collection |
| GET | /api/collections | Get User Collections |
| PUT | /api/collections/:id | Update Collection |
| DELETE | /api/collections/:id | Delete Collection |

### Database Relationship

User

↓

Collections

↓

Notes

Each collection belongs to one user.

Each note optionally belongs to one collection.

---

# 🗑 Trash Management System

KnowFlow now supports a professional Soft Delete system similar to Gmail, Google Drive and Notion.

## Features

- Soft Delete Notes
- View Trash
- Restore Notes
- Permanently Delete Notes
- Deleted Timestamp Tracking

---

## Trash APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| DELETE | /api/notes/:id | Move Note to Trash |
| GET | /api/notes/trash | Get All Trashed Notes |
| PATCH | /api/notes/:id/restore | Restore Note |
| DELETE | /api/notes/:id/permanent | Permanently Delete Note |

---

## Soft Delete Flow

Normal Note

↓

Move to Trash

↓

Restore

OR

Permanent Delete

---

## Database Fields

```text
isDeleted

deletedAt
```

Soft Delete ensures accidental data loss is prevented while allowing users to recover deleted notes.