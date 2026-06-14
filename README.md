# 🏥 DocBook — Hospital Doctor Appointment Booking Application

A full-featured **Hospital Doctor Appointment Booking Platform** built with Node.js, Express, and MongoDB. Patients can check real-time doctor availability, book appointments, receive prescriptions (PDF), and access lab reports. Doctors can manage their schedules, approve/reject appointments, and issue digital prescriptions. Admins manage the entire platform — from doctor approvals to system oversight.

---

## 📌 Table of Contents

- [Features](#-features)
- [Architecture Overview](#-architecture-overview)
- [Role-Based Access](#-role-based-access)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Appointment Booking Flow](#-appointment-booking-flow)
- [Doctor Approval Workflow](#-doctor-approval-workflow)
- [Prescription & Lab Reports](#-prescription--lab-reports)
- [Family Member Management](#-family-member-management)
- [Database Models](#-database-models)
- [Seeding Doctor Availability](#-seeding-doctor-availability)
- [Security](#-security)
- [Contributors](#-contributors)
- [License](#-license)

---

## ✨ Features

### Patient
- 🔐 OTP-based registration and login
- 🔍 Search doctors by **specialty, name, fee range, and verification status**
- 📅 Check **real-time weekly availability** of any doctor
- 📆 Book appointments with **live slot confirmation** — booked slots are instantly removed from availability
- 👨‍👩‍👧‍👦 Manage **family members** (add, update, view, delete)
- 💊 View **prescriptions** issued by doctors (PDF format)
- 🧪 Access **lab reports** and medical documents
- 📷 Upload and manage **profile photo**
- 🔑 Forgot password with OTP verification

### Doctor
- 📝 Register and submit credentials for **admin approval**
- 🕐 Define **weekly availability schedule** (Mon–Sun, custom time slots)
- 📋 View and manage **booked appointments**
- 💊 Issue **digital prescriptions** to patients
- 🧾 Upload **lab reports** for patients
- 👤 Update profile (specialty, fee, bio, experience, license)
- 🚫 Cannot login until **admin verifies** the account

### Admin
- ✅ **Approve or reject** doctor registration requests
- 📊 View all **pending doctor requests** with credentials
- 👥 Manage all **patients, doctors, and system users**
- 🔒 Full platform oversight and management

---

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Patient    │     │    Doctor     │     │    Admin      │
│  (Frontend)  │     │  (Frontend)   │     │  (Frontend)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       └────────────────────┼─────────────────────┘
                            │
                     ┌──────▼───────┐
                     │  Express API  │
                     │  (Port 8042)  │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌────▼────┐ ┌──────▼──────┐
        │  Auth &   │ │  OTP &  │ │  Business   │
        │  JWT      │ │  Email  │ │  Services   │
        └─────┬─────┘ └────┬────┘ └──────┬──────┘
              │            │             │
              └────────────┼─────────────┘
                           │
                    ┌──────▼───────┐
                    │   MongoDB    │
                    │  (Mongoose)  │
                    └──────────────┘
```

---

## 🔐 Role-Based Access

| Feature | Patient | Doctor | Admin |
|---|:---:|:---:|:---:|
| Register via OTP | ✅ | ✅ | ✅ |
| Login immediately | ✅ | ❌ (pending approval) | ✅ |
| Search doctors | ✅ | ✅ | ✅ |
| Book appointment | ✅ | ❌ | ❌ |
| View prescriptions (PDF) | ✅ | ✅ | ✅ |
| View lab reports | ✅ | ✅ | ✅ |
| Issue prescriptions | ❌ | ✅ | ❌ |
| Upload lab reports | ❌ | ✅ | ❌ |
| Manage own availability | ❌ | ✅ | ❌ |
| Manage family members | ✅ | ❌ | ❌ |
| Approve/reject doctors | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | — | Runtime |
| **Express** | 5.x | HTTP framework |
| **MongoDB** | — | Database |
| **Mongoose** | 9.x | ODM |
| **JWT** | 9.x | Access + Refresh token authentication |
| **bcryptjs** | 3.x | Password hashing (salt rounds: 12) |
| **Nodemailer** | 7.x | OTP email delivery via SMTP |
| **Multer** | 2.x | File uploads (profile photos, documents) |
| **Helmet** | 8.x | Security headers |
| **CORS** | 2.x | Cross-origin resource sharing |
| **express-rate-limit** | 8.x | API rate limiting |
| **Swagger** | — | API documentation (`/api-docs`) |
| **cookie-parser** | 1.x | HTTP-only refresh token cookies |

---

## 📁 Project Structure

```
appoiment_be/
├── app.js                          # Entry point — Express app setup
├── config/
│   └── prod.json                    # All configuration (DB, SMTP, JWT, CORS)
├── db/
│   ├── index.js                     # MongoDB connection
│   └── models/
│       ├── user.js                  # User model (auth + profile)
│       ├── doctor.js                # Doctor model (availability + bookedSlots)
│       ├── patient.js               # Patient model
│       ├── superadmin.js            # Admin model
│       ├── otp.js                   # OTP model (TTL-indexed)
│       ├── RefreshToken.js          # Refresh token hashes (rotation)
│       ├── doctorRequest.js         # Doctor approval requests
│       ├── family_members.js        # Patient family members
│       └── role.js                  # Role lookup
├── auth/
│   ├── jwt.services.js             # JWT sign/verify (access + refresh)
│   └── token.service.js            # Refresh token CRUD + rotation
├── user/
│   ├── user.route.js               # All /users routes (Swagger annotations)
│   ├── controller/user.js          # User controllers (~15 methods)
│   └── services/user.js            # User CRUD service
├── doctor/
│   ├── doctor.route.js             # Doctor-specific routes
│   ├── controller/doctor.js        # Doctor controllers
│   └── services/doctor.js           # Doctor CRUD service
├── patient/
│   ├── controller/patient.js       # Patient controllers
│   └── services/patient.js         # Patient CRUD service
├── superadmin/
│   └── services/admin.js           # Admin CRUD service
├── family_member/
│   ├── family_member.route.js      # /family-members routes
│   ├── controller/family_member.js # Family member CRUD controllers
│   └── services/family_member.js   # Family member CRUD service
├── services/
│   ├── otp.js                      # OTP generation + verification
│   ├── email.js                    # Nodemailer SMTP transport
│   └── doctorRequest.js            # DoctorRequest CRUD
├── middlewares/
│   ├── auth.js                     # requireAuth + requireRole
│   ├── ratelimiter.js              # Rate limiting (100 req/15 min)
│   └── upload.js                   # Multer config (5MB, images only)
├── swagger/
│   └── swagger.js                  # Swagger/OpenAPI spec
├── scripts/
│   └── seed-availability.js        # Seed default doctor schedules
├── uploads/                        # Uploaded files (profile photos)
└── utils/
    ├── message.js                  # All response message constants
    └── global.js                    # Global utilities
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** v6+ running on `localhost:27017`
- A **Gmail account** with App Password enabled (for OTP emails)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd appoiment_be

# Install dependencies
npm install

# Start the server
npm run doc
```

Server starts at **http://localhost:8042**

### Verify

```bash
# Health check — visit Swagger docs
open http://localhost:8042/api-docs
```

---

## ⚙️ Environment Configuration

All configuration lives in `config/prod.json`:

```json
{
  "Database": {
    "URL": "mongodb://localhost:27017/express_structure",
    "dbName": "express_structure"
  },
  "App": {
    "PORT": 8042,
    "CORS_ORIGIN": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "secretkey": "<your-jwt-access-secret>",
    "refreshSecretkey": "<your-jwt-refresh-secret>",
    "accessExp": "15m",
    "refreshExp": "7d"
  },
  "SMTP": {
    "FromEmail": "your-email@gmail.com",
    "PORT": 587,
    "Secure": false,
    "Host": "smtp.gmail.com",
    "OTP_TTL_SECONDS": 600,
    "auth": {
      "user": "your-email@gmail.com",
      "Password": "your-app-password"
    }
  }
}
```

> ⚠️ **Important:** Move secrets to environment variables (`.env`) before deploying to production. Never commit real credentials to version control.

---

## 📖 API Documentation

Interactive Swagger UI is available at:

```
http://localhost:8042/api-docs
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/registerotp` | — | Send registration OTP to email |
| `POST` | `/users/registerverify` | — | Verify OTP and complete registration |
| `POST` | `/users/login` | — | Login with email + password |
| `POST` | `/users/refresh` | Cookie | Rotate refresh token, get new access token |
| `POST` | `/users/register/otp` | — | Logout (revoke refresh token) |
| `POST` | `/users/forgototp` | — | Send forgot-password OTP |
| `POST` | `/users/forgotverify` | — | Verify forgot-password OTP |
| `POST` | `/users/resetpassword` | — | Reset password with new password |

### User Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users` | — | Get all users |
| `GET` | `/users/:id` | — | Get user profile (with role-specific data) |
| `POST/PUT` | `/users/:id` | — | Update user profile |
| `POST` | `/users/:id/photo` | Multer | Upload profile photo (5MB, images only) |
| `DELETE` | `/users/:id/photo` | — | Delete profile photo |

### Doctors

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/doctors` | — | List doctors with filters |
| `GET` | `/users/:id/availability` | — | Get doctor's weekly availability |

**Query Parameters for `/users/doctors`:**

| Param | Type | Example | Description |
|---|---|---|---|
| `status` | string | `approved`, `pending`, `all` | Filter by verification status (default: `approved`) |
| `specialty` | string | `Cardiology` | Case-insensitive exact match |
| `q` | string | `gou` | Substring search on name or email |
| `minFee` | number | `200` | Minimum consultation fee |
| `maxFee` | number | `1000` | Maximum consultation fee |

### Appointments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/appointments` | ✅ | Book an appointment |

**Appointment Body:**
```json
{
  "doctorId": "64a1f2e3...",
  "day": "Mon",
  "time": "09:00",
  "date": "2026-06-15",
  "reason": "General checkup"
}
```

### Doctor Approval (Admin)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/doctor-requests` | — | List pending doctor requests |
| `POST` | `/users/doctor-requests/:id/approve` | — | Approve a doctor request |
| `POST` | `/users/doctor-requests/:id/reject` | — | Reject a doctor request |

### Family Members (Patient Only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/family-members` | ✅ Patient | Add a family member |
| `GET` | `/family-members` | ✅ Patient | Get all family members |
| `GET` | `/family-members/:id` | ✅ Patient | Get family member by ID |
| `PUT` | `/family-members/:id` | ✅ Patient | Update a family member |
| `POST` | `/family-members/delete` | ✅ Patient | Delete a family member |

---

## 🔑 Authentication Flow

```
  Patient / Admin                        Doctor
  ───────────────                        ──────
  1. POST /registerotp          1. POST /registerotp
     → OTP sent to email            → OTP sent to email

  2. POST /registerverify       2. POST /registerverify
     → User + Patient/Admin        → User + Doctor created
       created                        → DoctorRequest (pending)
     → Access + Refresh tokens      → NO tokens (pending approval)
       returned

  3. POST /login                3. Admin approves → Doctor verified
     → Access + Refresh tokens  4. POST /login
     → Refresh token in           → Access + Refresh tokens
       httpOnly cookie               returned

  ──────────────────────────────────────────────────

  Token Refresh (all roles):
  POST /users/refresh
    → Old refresh token validated + revoked
    → New access + refresh tokens issued (rotation)

  Logout (all roles):
  POST /users/register/otp
    → Refresh token revoked
    → Cookie cleared
```

---

## 📅 Appointment Booking Flow

```
Patient                                    Doctor                    System
───────                                    ──────                    ──────
1. GET /users/doctors?specialty=Cardiology
   → List of verified doctors

2. GET /users/:id/availability
   → Weekly schedule: { Mon: ['09:00','10:00',...], ... }

3. POST /users/appointments
   { doctorId, day: "Mon", time: "09:00", date: "2026-06-15" }
                                                    ┌──────────────────┐
                                                    │ Slot removed from │
                                                    │ doctor.available   │
                                                    │                    │
                                                    │ Appointment added  │
                                                    │ to doctor.booked   │
                                                    │ Slots array        │
                                                    └──────────────────┘
   ← 201 { appointment: { id, patientId, doctorId, day, time, date, status: "confirmed" } }

4. Doctor reviews appointment
5. Doctor issues prescription → Patient receives PDF
6. Doctor uploads lab report → Patient can view
```

**Real-time Availability:** When a patient books a slot, it is **instantly removed** from the doctor's `available` schedule so no other patient can book the same slot. Booked appointments are stored in the `bookedSlots` array on the Doctor model.

---

## ✅ Doctor Approval Workflow

```
                    ┌─────────────┐
                    │  Doctor      │
                    │  Registers   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ DoctorRequest│
                    │  (pending)   │
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │  APPROVED    │      │  REJECTED   │
         │  verified:   │      │  remark:    │
         │    true      │      │  "Reason"   │
         └──────┬──────┘      └──────┬──────┘
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │  Doctor can  │      │  Doctor can  │
         │  now login   │      │  NOT login   │
         └─────────────┘      └─────────────┘
```

---

## 💊 Prescription & Lab Reports

### Prescriptions
- Doctors can issue **digital prescriptions** to patients after appointments
- Prescriptions are generated in **PDF format** for the patient to download
- Includes: doctor details, patient details, medicines, dosage, instructions, and date

### Lab Reports
- Doctors can upload **lab reports** (blood tests, X-rays, MRI, etc.)
- Patients can **view and download** their lab reports
- Reports are associated with the patient and the specific appointment

> These features are part of the roadmap and are being actively developed.

---

## 👨‍👩‍👧‍👦 Family Member Management

Patients can manage family members for coordinated healthcare:

- **Add** family member (name, relation, blood group, DOB, gender, phone)
- **View** all family members
- **Update** family member details
- **Delete** family member

**Business Rules:**
- Only **patients** can manage family members (role-guarded)
- **Duplicates blocked:** same name + same relation for the same patient
- **DOB validation:** date of birth cannot be in the future
- **Deactivation blocked:** family members must remain active (status cannot be set to `false`)

---

## 🗄 Database Models

### Entity Relationship

```
┌──────────┐     1:1     ┌──────────┐
│   User   │────────────→│ Patient  │
│          │             └──────────┘
│          │     1:1     ┌──────────┐
│          │────────────→│ Doctor   │
│          │             └──────────┘
│          │     1:1     ┌──────────┐
│          │────────────→│  Admin   │
└──────────┘             └──────────┘
     │                        │
     │ 1:N                    │ 1:N
     ▼                        ▼
┌──────────┐           ┌──────────────┐
│ Family   │           │ DoctorRequest│
│ Member   │           │ (pending/    │
└──────────┘           │  approved/   │
                       │  rejected)   │
                       └──────────────┘

┌──────────┐           ┌──────────┐
│   OTP    │           │ Refresh  │
│ (TTL)    │           │  Token   │
└──────────┘           └──────────┘
```

### Key Model Details

| Model | Key Fields | Indexes |
|---|---|---|
| **User** | `email` (unique), `password`, `role`, `role_id → Role` | `email` unique |
| **Doctor** | `user_id → User`, `specialty`, `fee`, `verified`, `available` (weekly map), `bookedSlots` (array) | — |
| **Patient** | `user_id → User`, `bloodGroup`, `dateOfBirth` | — |
| **OTP** | `email`, `code`, `payload` (Mixed), `used`, `expiresAt` | `email`, `expiresAt` (TTL) |
| **RefreshToken** | `user`, `tokenHash`, `expiresAt`, `revokedAt` | `tokenHash` |
| **DoctorRequest** | `user_id`, `doctor_id`, `status`, `remark` | — |
| **FamilyMember** | `user_id`, `name`, `relation`, `bloodGroup`, `dateOfBirth` | — |
| **Role** | `name`, `status` | — |

---

## 🌱 Seeding Doctor Availability

Populate default weekly schedules for doctors who have no availability set:

```bash
node scripts/seed-availability.js
```

**Default schedule:**

| Day | Slots |
|---|---|
| Mon–Fri | 09:00, 10:00, 11:00, 14:00, 15:00 |
| Sat | 09:00, 10:00, 11:00 |
| Sun | Closed |

The seeder is **idempotent** — it only seeds doctors with empty `available` objects and skips those that already have slots defined.

---

## 🔒 Security

| Feature | Implementation |
|---|---|
| **Password Hashing** | bcryptjs with 12 salt rounds |
| **JWT Access Tokens** | 15-minute expiry, signed with secret key |
| **JWT Refresh Tokens** | 7-day expiry, stored as SHA-256 hash in DB |
| **Refresh Token Rotation** | Old token revoked on every refresh; new pair issued |
| **HTTP-Only Cookies** | Refresh token stored in `httpOnly`, `sameSite: strict` cookie |
| **Rate Limiting** | 100 requests per 15 minutes per IP (login & OTP endpoints) |
| **Security Headers** | Helmet middleware |
| **CORS** | Whitelisted origins only |
| **File Upload Safety** | Multer with 5MB limit, images-only filter |
| **OTP Expiry** | 10-minute TTL with auto-deletion |

---

## 🗺 Roadmap

- [ ] Prescription generation in **PDF format**
- [ ] Lab report upload and management
- [ ] Appointment cancellation and rescheduling
- [ ] Push notifications for appointment reminders
- [ ] Doctor dashboard with analytics
- [ ] Payment integration for consultation fees
- [ ] Telemedicine / video consultation support
- [ ] Audit logging for admin actions
- [ ] Input validation with express-validator / Joi
- [ ] Environment variable-based configuration (`.env`)
- [ ] Unit and integration tests

---

## 👥 Contributors

- **Sanket Suryavanshi** — _Author & Lead Developer_

---

## 📄 License

ISC License — See `package.json` for details.