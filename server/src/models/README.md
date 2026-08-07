# Models

Models define the MongoDB collections.

Current Models

## User.ts

Stores

- Name
- Email
- Password
- Avatar
- Role
- Verification Status

---

## Note.ts

Stores

- Title
- Content
- Color
- Tags
- Pin Status
- Owner(User)

Models use Mongoose Schema.

---

# Collection Model

Stores folders created by users.

Fields:

- name
- description
- icon
- color
- user

Relationship:

User → Collections

---

---

# Note Model Update

The Note model now supports Trash functionality.

New Fields

```text
isDeleted

deletedAt
```

Purpose

- Soft Delete
- Trash Management
- Restore Notes
- Future Auto Cleanup Jobs

Collection Relationship

```text
User

↓

Collections

↓

Notes
```