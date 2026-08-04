# Routes

## Authentication Routes

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

POST /api/auth/logout

---

## Note Routes

POST /api/notes

GET /api/notes

GET /api/notes/:id

PUT /api/notes/:id

DELETE /api/notes/:id

All note routes are protected using JWT Authentication.