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