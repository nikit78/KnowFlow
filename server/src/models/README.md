# Models

This folder contains all MongoDB models used in KnowFlow.

## Current Models

### User Model

Stores authentication and profile information.

Fields

- name
- email
- password
- avatar
- role
- isVerified

Features

- Password Hashing
- Password Comparison

---

### Note Model

Stores user notes.

Fields

- title
- content
- color
- isPinned
- tags
- user

Features

- References User Model
- Automatic timestamps
- Tag support
- Pin support