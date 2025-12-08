# 🏨 DormSync – Smart Hostel & Mess Management System

DormSync is a comprehensive digital platform designed to streamline hostel operations including attendance tracking, room management, maintenance reporting, and mess coordination. It provides role-based access and automation to improve efficiency for wardens, students, and staff.

---

## 📋 Table of Contents
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [API Overview](#-api-overview)
- [Database Schema](#-database-schema)
- [Installation & Setup](#-installation--setup)

---

## 🎯 Problem Statement

Manual hostel and mess management introduces several challenges:

- ❌ Difficulty in tracking accurate attendance
- ❌ Inefficient room allocation and change request processing
- ❌ No proper maintenance issue tracking
- ❌ Mess staff struggle with meal planning due to uncertain headcount
- ❌ Lack of transparency in mess credits and refunds
- ❌ No centralized system for announcements and communication

---

## ✅ Solution

DormSync resolves these issues through a unified digital platform that automates:

- ✅ **Real-time Attendance Logging** (Entry/Exit tracking)
- ✅ **Room Allocation & Change Workflows**
- ✅ **Maintenance Issue Reporting & Tracking**
- ✅ **Mess Meal Planning with Dynamic Opt-Outs**
- ✅ **Manual Credit Redemption** (Student requests, Warden approval)
- ✅ **Digital Announcement Board**
- ✅ **Profile Management**
- ✅ **Advanced Data Handling** (Search, Sort, Filter, Pagination)

---

## 🏗️ System Architecture

```
┌─────────────┐      HTTP/REST      ┌─────────────┐      Prisma ORM      ┌─────────────┐
│   Frontend  │ ◄─────────────────► │   Backend   │ ◄──────────────────► │  PostgreSQL │
│  (Next.js)  │      JWT Auth       │  (Express)  │                      │  Database   │
└─────────────┘                     └─────────────┘                      └─────────────┘
```

**Tech Stack:**
- **Frontend**: Next.js (React) + Axios + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt.js

**Hosting:**
- Frontend → Vercel
- Backend → Render
- Database → Prisma Cloud / Neon

---

## 🚀 Key Features

### 🔐 Authentication & Authorization
- Secure JWT-based login/signup
- Role-based access control (Student, Warden, Admin)
- Student whitelist system for registration

### 🛏️ Room Management
- **Warden**: Assign/vacate rooms, view all allocations
- **Student**: View current room, submit change requests
- Block and room creation with capacity tracking

### 📅 Attendance System
- **Real-time Entry/Exit Tracking**: Wardens mark student attendance
- **Student Dashboard**: View personal attendance history
- **Warden Dashboard**: Consolidated reports with Present/Absent/Late statistics
- Date-based filtering and search

### 🛠️ Issue Reporting & Tracking
- **Students**: Report maintenance issues (Electrical, Plumbing, Cleaning, etc.)
- **Wardens**: View, filter, and update issue status (Pending → In Progress → Resolved)
- Priority levels (Low, Medium, High, Urgent)
- **Search & Filter**: By status, category, priority, student name

### 🍽️ Mess Management

**Student Features:**
- View daily mess menu
- **Opt-Out of Meals**: Skip meals to earn credits (₹40/meal)
- **Redeem Credits**: Request payouts for accumulated credits
- View opt-out history and redemption status

**Warden Features:**
- Manage mess menu
- **View Daily Opt-Outs**: Real-time list of students skipping meals (filterable by date/shift)
- **Process Redemptions**: Approve or reject student credit redemption requests
- Credits automatically refunded on rejection

### 📢 Announcements
- Wardens post notices with categories and priority
- Expiration dates for time-sensitive announcements
- Students view active announcements on dashboard

### 👤 Profile Management
- Update personal details (name, phone, department, year)
- View hostel information and attendance stats

### 🔍 Advanced Data Handling
- **Pagination**: Navigate large datasets efficiently (10 items/page)
- **Search**: Find students by name/email, issues by title/description
- **Sorting**: Sort by name, date, priority (ascending/descending)
- **Filtering**: Filter issues by status/category/priority, opt-outs by date/shift

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React, Axios, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | JWT, bcrypt.js |
| **Hosting** | Vercel (Frontend), Render (Backend) |
| **Version Control** | Git, GitHub |

---

## 📡 API Overview

### Authentication
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/signup` | POST | Register new user | Public |
| `/api/auth/login` | POST | Login user | Public |
| `/api/auth/me` | GET | Get current user | Authenticated |
| `/api/auth/update` | PUT | Update profile | Authenticated |

### User Management
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/students` | GET | Get all students (paginated, searchable) | Warden |
| `/api/auth/add-student` | POST | Add student to whitelist | Warden |

### Attendance
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/attendance` | GET | View all attendance records | Warden |
| `/api/attendance/my-attendance` | GET | View personal attendance | Student |
| `/api/attendance/mark` | POST | Mark entry/exit | Warden |

### Room Management
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/rooms/blocks` | GET/POST | Manage hostel blocks | Warden |
| `/api/rooms/rooms` | GET/POST | Manage rooms | Warden |
| `/api/rooms/allocations` | GET/POST | Manage room allocations | Warden |
| `/api/rooms/allocations/my-room` | GET | View assigned room | Student |
| `/api/rooms/requests` | GET/POST | Room change requests | Student/Warden |

### Issues
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/issues` | POST | Report maintenance issue | Student |
| `/api/issues` | GET | Get all issues (paginated, searchable) | Warden |
| `/api/issues/my-issues` | GET | Get personal issues | Student |
| `/api/issues/:id/status` | PUT | Update issue status | Warden |
| `/api/issues/:id/resolve` | PUT | Resolve issue | Warden |

### Mess Management
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/mess/menu` | GET/POST | Manage mess menu | All/Warden |
| `/api/mess/opt-out` | POST | Opt out of meal | Student |
| `/api/mess/opt-out/:id` | DELETE | Cancel opt-out | Student |
| `/api/mess/my-opt-outs` | GET | View personal opt-outs | Student |
| `/api/mess/opt-outs` | GET | View all opt-outs (filterable) | Warden |
| `/api/mess/credits` | GET | View mess credits | Student |
| `/api/mess/redemption/request` | POST | Request credit redemption | Student |
| `/api/mess/redemption/my-requests` | GET | View redemption requests | Student |
| `/api/mess/redemption/all` | GET | View all redemptions | Warden |
| `/api/mess/redemption/:id` | PUT | Process redemption (approve/reject) | Warden |

### Announcements
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/announcements` | GET/POST | View/create announcements | All/Warden |
| `/api/announcements/:id` | GET/PUT/DELETE | Manage announcement | All/Warden |

---

## 🗄️ Database Schema

### Core Models
- **User** - Authentication, roles, credits
- **Profile** - Extended user info (phone, department, year)
- **AllowedStudent** - Registration whitelist
- **Block** - Hostel blocks
- **Room** - Rooms with capacity tracking
- **RoomAllocation** - Student-room assignments
- **RoomChangeRequest** - Room change workflow
- **Attendance** - Entry/exit records
- **Issue** - Maintenance issues
- **Announcement** - Notice board
- **MessMenu** - Daily menus
- **MessOptOut** - Meal opt-outs with credits
- **MessSuggestion** - Student feedback
- **RedemptionRequest** - Credit redemption workflow

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Backend Setup
```bash
cd apps/backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dormsync"
JWT_SECRET="your-secret-key"
PORT=5000
```

Run migrations:
```bash
npx prisma db push
npx prisma generate
```

Start server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd apps/frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_BACKEND_LOCAL_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_SERVER_URL=https://your-backend-url.com
```

Start development server:
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🎓 Usage

### Default Roles
- **Student**: Register with whitelisted email, manage profile, report issues, opt-out meals
- **Warden**: Manage students, rooms, attendance, issues, mess, announcements
- **Admin**: Full system access

### Key Workflows
1. **Student Registration**: Warden adds email to whitelist → Student registers
2. **Room Allocation**: Warden assigns room → Student views assignment
3. **Attendance**: Warden marks entry/exit → Student views history
4. **Issue Reporting**: Student reports → Warden resolves
5. **Mess Opt-Out**: Student opts out → Earns credits → Requests redemption → Warden approves

---

## 🌟 Highlights

✨ **Full CRUD Operations** on all entities  
✨ **Advanced Search, Sort, Filter, Pagination** for scalability  
✨ **Real-time Data** with automatic updates  
✨ **Role-Based Access Control** for security  
✨ **Credit System** with manual redemption workflow  
✨ **Responsive UI** with modern design  

---

## 📝 Conclusion

**DormSync modernizes hostel and mess operations with automation, data-driven workflows, and clear role-based functionality. It improves administrative efficiency and enhances the daily experience for students and staff.**

---

**Built with ❤️ for better hostel management**