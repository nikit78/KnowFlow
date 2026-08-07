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

# Note Model Update

The Note model now supports:

- collectionId

Relationship:

Collection → Notes

Each note can belong to one collection.