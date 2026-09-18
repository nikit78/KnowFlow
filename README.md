# 🧠 KnowFlow

### AI-Powered Document Intelligence & Knowledge Management Platform

> **Turn documents into searchable, retrievable, and AI-accessible knowledge.**

KnowFlow is a full-stack knowledge management platform that combines **document management, semantic search, vector embeddings, hybrid retrieval, and Retrieval-Augmented Generation (RAG)** into a single application.

Instead of treating uploaded documents as simple files, KnowFlow processes their content into a searchable knowledge layer that users can query through both traditional search and AI-powered questions.

---

## 🚀 Why KnowFlow?

Traditional document management usually looks like:

```text
Upload → Store → Download
```

KnowFlow extends that workflow into:

```text
Upload
   ↓
Extract Text
   ↓
Normalize & Chunk
   ↓
Generate Embeddings
   ↓
Store Knowledge
   ↓
Hybrid Retrieval
   ↓
Build RAG Context
   ↓
Generate Answer
   ↓
Return Answer + Sources
```

The goal is simple:

> **Make information inside documents easier to find, understand, and use.**

---

## ✨ Core Features

### 📄 Document Management

* Upload supported documents
* Store document metadata and processing information
* View individual document details
* Preview documents securely
* Download documents securely
* Search documents
* Filter documents by metadata
* Filter by document type
* Filter by tags
* Combine multiple filters
* Pagination for document listings
* Update document metadata
* Mark documents as favorites
* Soft-delete documents
* Restore deleted documents
* Permanently delete documents
* Trash management
* Document statistics

### 🔎 Intelligent Search

KnowFlow supports more than simple keyword matching.

The search system combines:

* Keyword-based retrieval
* Semantic vector retrieval
* Hybrid ranking
* Document-level retrieval
* Chunk-level retrieval
* Search suggestions
* Tag and type filtering

This allows queries to match both **exact terms** and **conceptually related content**.

---

## 🤖 AI & RAG

The central intelligence layer of KnowFlow is its Retrieval-Augmented Generation pipeline.

Instead of asking an LLM to answer from general knowledge alone, KnowFlow first retrieves relevant information from the user's documents and uses that information as context for generation.

### RAG Flow

```text
Document
   │
   ▼
Text Extraction
   │
   ▼
Text Normalization
   │
   ▼
Document Chunking
   │
   ▼
Embedding Generation
   │
   ▼
Knowledge Storage
   │
   └───────────────┐
                   │
User Question     │
   │               │
   ▼               │
Keyword Search     │
   │               │
Semantic Search    │
   │               │
   └───────┬───────┘
           ▼
    Hybrid Ranking
           │
           ▼
    Relevant Chunks
           │
           ▼
     RAG Context
           │
           ▼
     Prompt Builder
           │
           ▼
      LLM Generation
           │
           ▼
   Grounded Answer
           │
           ▼
    Source References
```

### Verified RAG Pipeline

The implemented pipeline follows:

```text
Extraction
    ↓
Chunking
    ↓
NVIDIA Embeddings
    ↓
Semantic Retrieval
    +
Keyword Retrieval
    ↓
Hybrid Ranking
    ↓
Relevant Chunks
    ↓
RAG Context
    ↓
Prompt Construction
    ↓
NVIDIA LLM Generation
    ↓
Grounded Answer + Sources
```

The RAG workflow has been tested end-to-end through the document question-answering API.

A verified test flow produced:

* 2048-dimensional embeddings
* Retrieved document chunks
* Semantic similarity scoring
* Hybrid ranking
* Constructed RAG context
* Grounded answer generation
* Source references

---

## 🧩 Hybrid Retrieval

KnowFlow does not depend on a single retrieval strategy.

### Keyword Retrieval

Useful when the user searches for:

* Exact names
* Specific terms
* Identifiers
* Phrases
* Document-specific keywords

### Semantic Retrieval

Embeddings allow the system to retrieve content based on meaning rather than exact wording.

For example:

```text
Query:
"How can an application protect user credentials?"

Potential semantic match:
"Passwords should be securely hashed before storage."
```

The wording is different, but the underlying concept is related.

### Hybrid Retrieval

KnowFlow combines both retrieval signals.

The current retrieval strategy uses a weighted hybrid approach:

```text
Hybrid Score
    =
70% Semantic Relevance
    +
30% Keyword Relevance
```

This helps balance conceptual similarity with exact textual matches.

---

## 🏗️ System Architecture

```text
                         ┌───────────────────┐
                         │       User        │
                         └─────────┬─────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │     Next.js Frontend     │
                    │                          │
                    │ React + TypeScript       │
                    │ Tailwind CSS              │
                    │ API Client                │
                    └────────────┬─────────────┘
                                 │
                         HTTP / REST API
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │    Express Backend       │
                    │                          │
                    │ Authentication           │
                    │ Documents                 │
                    │ Search                    │
                    │ Collections               │
                    │ Notes                     │
                    │ RAG                       │
                    └────────────┬─────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
                  ▼              ▼              ▼
          ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
          │ Controllers │ │  Services   │ │  Middleware │
          │             │ │             │ │             │
          │ Request     │ │ RAG         │ │ Auth        │
          │ Handlers    │ │ Retrieval   │ │ Validation   │
          │             │ │ Embeddings  │ │ Errors       │
          │             │ │ Extraction  │ │              │
          └─────────────┘ └──────┬──────┘ └─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌──────────────┐         ┌──────────────┐
             │   MongoDB    │         │  NVIDIA API  │
             │              │         │              │
             │ Users        │         │ Embeddings   │
             │ Documents    │         │ LLM          │
             │ Chunks       │         │              │
             │ Collections  │         └──────────────┘
             │ Notes        │
             └──────────────┘
```

---

## 🧠 Backend Architecture

The backend follows a layered architecture instead of placing all business logic inside route handlers.

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models / External APIs
```

### Controllers

Controllers handle HTTP-level responsibilities such as:

* Reading request parameters
* Calling appropriate services
* Returning API responses
* Handling controller-level errors

### Services

Business logic is separated into focused services for:

* Document extraction
* Document chunking
* Embedding generation
* Embedding retry handling
* Document search
* Document retrieval
* RAG retrieval
* RAG context construction
* RAG prompt construction
* RAG answer generation
* LLM communication

This separation keeps the backend easier to maintain and test.

---

## 📦 Document Processing Pipeline

When a document is uploaded, KnowFlow processes its content through a knowledge-ingestion pipeline.

```text
Upload
  ↓
Validate File
  ↓
Extract Text
  ↓
Normalize Content
  ↓
Split Into Chunks
  ↓
Generate Embeddings
  ↓
Store Document + Knowledge Data
  ↓
Make Content Searchable
```

The resulting chunks become the primary retrieval units for semantic and RAG-based queries.

---

## 🔐 Authentication & Security

KnowFlow uses JWT-based authentication with secure cookie handling.

### Authentication Flow

```text
User
  │
  ├── Register
  │      ↓
  │   Password Hashing
  │      ↓
  │   User Created
  │
  └── Login
         ↓
      Credential Validation
         ↓
      JWT Generated
         ↓
      HttpOnly Cookie
         ↓
      Authenticated Requests
```

### Security Measures

* JWT authentication
* HttpOnly authentication cookie
* Secure cookies in production
* Password hashing with `bcryptjs`
* Protected backend routes
* User-scoped document access
* CORS configuration
* Helmet security headers
* JSON request size limit
* Cookie-based authenticated document preview
* Cookie-based authenticated document download

Protected document endpoints require authentication, including:

```text
GET /api/documents/:id/preview
GET /api/documents/:id/download
```

The frontend sends authenticated requests using browser credentials, keeping the authentication mechanism cookie-based.

---

## 👤 User Data Isolation

KnowFlow is designed around user-scoped data access.

Document-related queries are associated with the authenticated user's identity so that one user cannot simply request another user's knowledge data.

Conceptually:

```text
Authenticated User
        │
        ▼
     userId
        │
        ▼
┌─────────────────────┐
│ User-scoped Query   │
└──────────┬──────────┘
           ▼
   User's Documents
   User's Chunks
   User's Knowledge
```

This isolation is applied throughout protected document operations.

---

## 📚 Knowledge Organization

KnowFlow is more than a document uploader.

Implemented organization features include:

### Collections

Group related documents into logical collections.

### Notes

Create and manage notes within the knowledge-management workspace.

### Favorites

Mark important documents for quick access.

### Tags

Add metadata tags and filter documents using them.

### Trash

Deleted documents can be recovered before permanent deletion.

---

## 🛠️ Technology Stack

| Layer             | Technology     | Purpose                         |
| ----------------- | -------------- | ------------------------------- |
| Frontend          | Next.js 16     | Web application                 |
| UI                | React 19       | Component-based interface       |
| Language          | TypeScript     | Type-safe development           |
| Styling           | Tailwind CSS 4 | UI styling                      |
| Backend           | Node.js        | Server runtime                  |
| API               | Express 5      | REST API                        |
| Database          | MongoDB        | Application and knowledge data  |
| ODM               | Mongoose       | MongoDB schema/model layer      |
| Authentication    | JWT            | Session authentication          |
| Password Security | bcryptjs       | Password hashing                |
| OAuth             | Google Auth    | Google authentication           |
| Uploads           | Multer         | File upload handling            |
| PDF Processing    | pdf-parse      | PDF text extraction             |
| DOCX Processing   | Mammoth        | DOCX text extraction            |
| AI                | NVIDIA API     | Embeddings and LLM generation   |
| Security          | Helmet         | HTTP security headers           |
| Cross-Origin      | CORS           | Frontend/backend access control |
| Cookies           | cookie-parser  | Authentication cookie handling  |
| Deployment        | Render         | Production hosting              |

---

## 📁 Project Structure

```text
KnowFlow/
│
├── client/
│   ├── app/
│   │   ├── auth/
│   │   └── dashboard/
│   │       ├── ask/
│   │       ├── collections/
│   │       ├── documents/
│   │       ├── favorites/
│   │       ├── notes/
│   │       └── trash/
│   │
│   ├── components/
│   ├── lib/
│   ├── styles/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔌 API Overview

The backend exposes REST APIs under:

```text
/api
```

### Authentication

| Method | Endpoint             | Purpose                |
| ------ | -------------------- | ---------------------- |
| POST   | `/api/auth/register` | Register a new user    |
| POST   | `/api/auth/login`    | Login with credentials |
| POST   | `/api/auth/google`   | Google authentication  |
| GET    | `/api/auth/me`       | Get authenticated user |
| POST   | `/api/auth/logout`   | Logout                 |

### Documents

| Method | Endpoint                       | Purpose                     |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/documents`               | List documents              |
| POST   | `/api/documents/upload`        | Upload document             |
| GET    | `/api/documents/:id`           | Get document                |
| GET    | `/api/documents/:id/preview`   | Preview document            |
| GET    | `/api/documents/:id/download`  | Download document           |
| GET    | `/api/documents/search`        | Search documents            |
| GET    | `/api/documents/favorites`     | List favorite documents     |
| GET    | `/api/documents/trash`         | List deleted documents      |
| PATCH  | `/api/documents/:id/favorite`  | Toggle favorite             |
| PATCH  | `/api/documents/:id/restore`   | Restore document            |
| DELETE | `/api/documents/:id/permanent` | Permanently delete document |

### RAG

| Method | Endpoint                      | Purpose                     |
| ------ | ----------------------------- | --------------------------- |
| GET    | `/api/documents/rag/retrieve` | Retrieve relevant knowledge |
| POST   | `/api/documents/rag/ask`      | Ask a question using RAG    |

### Other Modules

| Module             | Purpose               |
| ------------------ | --------------------- |
| `/api/collections` | Collection management |
| `/api/notes`       | Notes management      |
| `/api/health`      | Backend health check  |

> The exact API implementation in the source code is the source of truth for request parameters and response schemas.

---

## 🚀 Live Deployment

KnowFlow is deployed using Render.

### Frontend

**Live Application**

https://knowflow-client.onrender.com

### Backend

**Production API**

https://knowflow-phe2.onrender.com

### Health Check

https://knowflow-phe2.onrender.com/api/health

Expected response:

```json
{
  "success": true,
  "message": "KnowFlow API is running"
}
```

---

## 💻 Local Development

### Prerequisites

Install:

* Node.js
* pnpm
* MongoDB or MongoDB Atlas
* NVIDIA API credentials for AI functionality
* Google OAuth credentials if Google authentication is enabled locally

### 1. Clone

```bash
git clone https://github.com/nikit78/KnowFlow.git
cd KnowFlow
```

### 2. Backend

```bash
cd server
pnpm install
```

Create:

```text
server/.env
```

Configure the required environment variables.

Then start the backend:

```bash
pnpm dev
```

The backend runs locally on:

```text
http://localhost:5000
```

### 3. Frontend

Open another terminal:

```bash
cd client
pnpm install
```

Create:

```text
client/.env.local
```

Configure the frontend environment variables.

Then start:

```bash
pnpm dev
```

The frontend runs locally on:

```text
http://localhost:3000
```

---

## ⚙️ Environment Variables

### Server

Use the project's existing `server/.env.example` as the source of truth for the current environment configuration.

Typical configuration includes:

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id

NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_BASE_URL=your_nvidia_api_base_url
```

### Client

Use the project's existing `client/.env.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Production

The deployed frontend uses:

```env
NEXT_PUBLIC_API_URL=https://knowflow-phe2.onrender.com/api
```

Production authentication relies on secure HttpOnly cookies.

> **Never commit `.env`, `.env.local`, API keys, JWT secrets, OAuth secrets, or other credentials to Git.**

---

## 🧪 Testing & Validation

The implemented system has been tested across the major application workflows.

### Authentication

* User registration
* Credential login
* JWT authentication
* `/auth/me`
* Logout
* Google authentication flow

### Documents

* Document upload
* Text extraction
* Document listing
* Document details
* Search
* Preview
* Download
* Favorites
* Tags
* Type filtering
* Pagination
* Trash
* Restore
* Permanent deletion

### RAG

* Text extraction
* Chunk generation
* Embedding generation
* Semantic retrieval
* Keyword retrieval
* Hybrid ranking
* RAG context construction
* Prompt construction
* LLM answer generation
* Source references

### Production

* Frontend deployed on Render
* Backend deployed on Render
* Production CORS configuration
* Production cookie authentication
* Authenticated document preview
* Authenticated document download
* Backend health check

The production Preview/Download flow specifically uses authenticated requests with credentials so protected document routes can receive the authentication cookie correctly.

---

## 🧠 Engineering Highlights

### 1. Modular RAG Design

Instead of putting the entire RAG workflow into one controller, KnowFlow separates responsibilities into focused services.

```text
Extraction
   ↓
Chunking
   ↓
Embedding
   ↓
Retrieval
   ↓
Context
   ↓
Prompt
   ↓
Answer
```

This makes individual parts easier to understand, maintain, and test.

### 2. Hybrid Retrieval

The system combines:

```text
Keyword Retrieval
       +
Semantic Retrieval
       ↓
Hybrid Ranking
```

This gives the system both exact-match and meaning-based retrieval capabilities.

### 3. Grounded Generation

The LLM is provided with retrieved document context before generating the answer.

```text
Question
   ↓
Retrieve Knowledge
   ↓
Build Context
   ↓
Generate Answer
```

This keeps document Q&A focused on retrieved application knowledge instead of treating the LLM as an unrestricted knowledge source.

### 4. Retry Handling

Embedding generation includes retry handling for transient external API failures.

This helps document processing recover from temporary AI-service failures instead of immediately failing the entire workflow.

### 5. Secure Document Access

Document preview and download are protected by backend authentication middleware.

The frontend does not bypass the authentication layer by directly exposing document URLs.

### 6. User-Scoped Data

Document operations are associated with the authenticated user, supporting isolation between users within the application.

---

## 📈 Scalability Considerations

The current architecture is suitable for continued extension, but larger workloads would require additional infrastructure.

### Current Architecture

```text
Next.js
   ↓
Express API
   ↓
MongoDB
   ↓
NVIDIA AI APIs
```

### Possible Future Scaling Architecture

```text
                 ┌───────────────┐
                 │    Clients    │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Load Balancer │
                 └───────┬───────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        API Instance 1        API Instance 2
              │                     │
              └──────────┬──────────┘
                         ▼
                   Job / Queue Layer
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       Document Workers       AI Workers
              │                     │
              └──────────┬──────────┘
                         ▼
                      MongoDB
```

Potential improvements include:

* Background document-processing jobs
* Queue-based embedding generation
* Dedicated vector database
* Redis caching
* Distributed workers
* Retrieval reranking
* Horizontal API scaling
* Better observability and monitoring

These are **future architectural directions**, not claims about the current deployment.

---

## 🗺️ Future Scope

Possible extensions include:

* [ ] Background document-processing queues
* [ ] Dedicated vector database
* [ ] Advanced retrieval reranking
* [ ] Additional document formats
* [ ] Image/document vision processing
* [ ] Conversation history for RAG
* [ ] Follow-up questions within conversations
* [ ] Improved source citations such as page-level references
* [ ] Role-Based Access Control
* [ ] Document sharing
* [ ] Collaborative workspaces
* [ ] Document versioning
* [ ] Advanced document summarization
* [ ] Improved monitoring and observability

---

## 📌 Current Status

**Status: ✅ Deployed & Functional**

KnowFlow currently provides a working full-stack implementation covering:

* Authentication
* Document management
* Search
* Knowledge organization
* Semantic retrieval
* Hybrid retrieval
* Embeddings
* RAG-based question answering
* Source-aware answers
* Secure document preview/download
* Production deployment

The project is actively structured for further AI, search, collaboration, and scalability improvements.

---

## 🔗 Project Links

| Resource             | Link                                          |
| -------------------- | --------------------------------------------- |
| 🌐 Live Application  | https://knowflow-client.onrender.com          |
| ⚙️ Backend API       | https://knowflow-phe2.onrender.com            |
| ❤️ API Health        | https://knowflow-phe2.onrender.com/api/health |
| 💻 GitHub Repository | https://github.com/nikit78/KnowFlow           |

---

## 📄 License

This project is licensed under the **MIT License**.

See [`LICENSE`](LICENSE) for details.

---

## 👨‍💻 About KnowFlow

KnowFlow was built as a full-stack engineering project focused on combining:

* Modern web development
* Backend architecture
* Document processing
* Search systems
* Vector embeddings
* Retrieval-Augmented Generation
* Secure authentication
* AI API integration
* Production deployment

The project demonstrates an approach beyond simply connecting an LLM to a UI: the system builds a complete workflow around **document ingestion, knowledge retrieval, grounded generation, security, and user-facing knowledge management**.

> **KnowFlow — from documents to knowledge.**
