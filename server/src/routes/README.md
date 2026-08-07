# Routes

Routes connect HTTP requests to Controllers.

Current Route Files

## authRoutes.ts

Authentication Endpoints

- Register
- Login
- Logout
- Current User

---

## noteRoutes.ts

Notes Endpoints

- Create Note
- Get Notes
- Get Note By ID
- Update Note
- Delete Note
- Pin / Unpin Note

Protected routes use Authentication Middleware.

---

# Collection Routes

POST /api/collections

GET /api/collections

PUT /api/collections/:id

DELETE /api/collections/:id

---

# Note Routes Update

GET /api/notes?collectionId=<id>

Returns notes belonging to a specific collection.