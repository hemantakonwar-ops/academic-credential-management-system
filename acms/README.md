# 🎓 ACMS — Academic Credential Management System

A secure, cloud-backed digital vault for students to upload, organize, and manage their academic credentials.

**Developed by:** Arnabmoy Sankriti · Kaushik Darji · Harish Gohain · Hemanta Konwar  
**Institution:** Gauhati University, Dept. of Information Technology, CSE  
**Version:** ACMS SRS v1.0 | May 2026

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), Tailwind CSS, Axios, React Router v6, Context API |
| Backend | Node.js v18+ with Express.js, RESTful JSON API |
| Database | MongoDB 6.x (Atlas) with Mongoose ODM |
| File Storage | Cloudinary (signed/temporary URLs) |
| Auth | JWT (jsonwebtoken) + bcrypt (10 salt rounds) |
| File Handling | Multer (multipart/form-data, memory storage) |
| Security | Helmet.js, CORS, express-rate-limit |
| Validation | express-validator |
| Email | Nodemailer + SendGrid |
| API Docs | Swagger / OpenAPI 3.0 |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
acms/
├── client/                   # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── common/       # ProtectedRoute, AdminRoute
│       │   └── layout/       # Sidebar, AdminSidebar
│       ├── pages/
│       │   ├── admin/        # AdminDashboard, AdminUsers, AdminCategories, AdminAuditLogs
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Documents.jsx
│       │   ├── DocumentDetail.jsx
│       │   ├── Upload.jsx
│       │   ├── Profile.jsx
│       │   ├── ForgotPassword.jsx
│       │   └── ResetPassword.jsx
│       ├── context/          # AuthContext (Context API)
│       ├── services/         # api.js, documentService.js
│       └── index.css         # Tailwind + design system
├── server/                   # Express.js backend
│   ├── config/               # db.js, cloudinary.js, swagger.js
│   ├── controllers/          # auth, user, document, admin, category
│   ├── middleware/            # auth, upload, validate, errorHandler
│   ├── models/               # User, Document, Category, AuditLog
│   ├── routes/               # auth, users, documents, categories, admin
│   ├── services/             # cloudinaryService, auditService, emailService
│   └── utils/                # seeder.js
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── .dockerignore
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB 6.x)
- Cloudinary account
- SendGrid account (for emails)

### 1. Clone & Install

```bash
git clone https://github.com/hemantakonwar-ops/academic-credential-management-system.git
cd academic-credential-management-system/acms

# Server
cd server
cp .env.example .env   # Edit with your actual credentials
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env` with your actual values:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/acms
JWT_SECRET=your_256bit_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_key
EMAIL_FROM=noreply@acms.edu
CLIENT_URL=http://localhost:5173
```

### 3. Run Development

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/docs
- Health check: http://localhost:5000/health

### 4. Docker (Production)

```bash
docker-compose up --build
```

---

## 📋 API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new student |
| POST | `/api/auth/login` | — | Login → JWT |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| POST | `/api/auth/reset-password` | — | Reset with token |
| GET | `/api/users/me` | Student | Profile + stats |
| PUT | `/api/users/me` | Student | Update profile |
| PUT | `/api/users/me/password` | Student | Change password |
| DELETE | `/api/users/me` | Student | Delete account |
| GET | `/api/documents` | Student | List (search, filter) |
| POST | `/api/documents` | Student | Upload (multipart) |
| GET | `/api/documents/:id` | Student | View + signed URL |
| PUT | `/api/documents/:id` | Student | Edit metadata |
| DELETE | `/api/documents/:id` | Student | Permanent delete |
| GET | `/api/categories` | Student | Active categories |
| GET | `/api/admin/stats` | Admin | System overview |
| GET | `/api/admin/users` | Admin | User list |
| PUT | `/api/admin/users/:id/status` | Admin | Suspend/reactivate |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| PUT | `/api/admin/categories` | Admin | Add/deactivate |
| GET | `/api/admin/audit-logs` | Admin | Filterable logs |

---

## 🎨 UI Screens

1. **Landing Page** — Hero, features, about, CTA, footer
2. **Auth Pages** — Login, Register, Forgot Password, Reset Password
3. **Student Dashboard** — Stats, recent uploads, sidebar nav
4. **Upload** — Drag-and-drop, category chips, progress bar
5. **Document Library** — Search, category filters, grid/list view, pagination
6. **Document Detail** — PDF/image preview, metadata, edit, danger zone
7. **Profile** — Personal info, change password, delete account
8. **Admin Dashboard** — System stats, quick actions
9. **Admin Users** — Search, table, suspend/activate/delete
10. **Admin Categories** — Add/toggle categories
11. **Admin Audit Logs** — Filterable event timeline

---

## 🔒 Security

- JWT with 256-bit secret, 24h expiry
- bcrypt hashing (10 salt rounds)
- Helmet.js headers
- CORS configured
- Rate limiting (5 login attempts/15 min, 100 general/15 min)
- Server-side MIME + extension validation
- Signed/expiring Cloudinary URLs
- Ownership enforcement on all document routes
- Admin cannot access student document files (metadata only)
- No stack traces in production responses

---

## 📊 Database Schema

- **Users**: fullName, email, passwordHash, role, institution, profilePicture, isActive
- **Documents**: userId, title, category, institutionName, remarks, fileUrl, filePublicId, fileType, fileSizeBytes
- **Categories**: name, isActive
- **AuditLogs**: userId, action, ipAddress, timestamp, details

Indexes: email (unique), documents.userId, compound (userId+category), compound (userId+uploadDate), text (title+remarks)

---

## 🔮 Future Enhancements

- Blockchain-based credential verification
- QR code document verification
- AI-based auto document classification
- TOTP-based MFA (Google Authenticator)
- Password-protected shareable links
- Bulk upload with batch metadata
- React Native mobile apps
- DigiLocker API integration

---

## 📄 License

Academic project — Gauhati University, Dept. of IT/CSE
