# Controllers

Controllers contain the business logic of the application.

Current Controllers

## authController.ts

Responsible for

- Register User
- Login User
- Logout User
- Get Current User

---

## noteController.ts

Responsible for

- Create Note
- Get All Notes
- Get Single Note
- Update Note
- Delete Note
- Pin / Unpin Note

Controllers interact with Models and return API responses.

---

# Collection Controller

Handles:

- Create Collection
- Get Collections
- Update Collection
- Delete Collection

Security:

- Every request is authenticated.
- Users can only access their own collections.

---

# Note Controller Update

New Features

- Create Note inside Collection
- Update Collection Assignment
- Populate Collection Details
- Filter Notes by Collection