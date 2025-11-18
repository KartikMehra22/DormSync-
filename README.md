🏨 DormSync – Smart Hostel & Mess Management System

DormSync is a unified digital platform designed to streamline hostel operations such as attendance tracking, room management, maintenance reporting, and mess coordination. It provides role-based access and automation to improve efficiency for wardens, students, and staff.

################################################################################################################################################

# 1. Project Title

DormSync – Smart Hostel & Mess Management System

################################################################################################################################################

# 2. Problem Statement

Manual hostel and mess management introduces several challenges:

Difficulty in tracking accurate attendance
Inefficient room allocation and change request processing
No proper maintenance issue tracking
Mess staff struggle with meal planning due to uncertain headcount

################################################################################################################################################

# 3. DormSync resolves these issues through a single digital platform that automates:

Attendance logging
Room allocation and change workflows
Maintenance issue reporting & tracking
Mess meal planning with dynamic counts
Announcement publishing
Profile management

################################################################################################################################################

# 4. System Architecture

**System Flow**
Frontend → Backend (API) → Database

**# Stack Diagram**

Frontend: Next.js (React) + Axios
Backend: Node.js + Express.js
Database: PostgreSQL with Prisma ORM
Authentication: JWT

**Hosting:**

Frontend → Vercel
Backend → Render
Database → Prisma DB

################################################################################################################################################

# 5. Key Features

**🔐 Authentication & Authorization**

Secure JWT login/signup
Role-based access for: Warden, Student, Mess Staff

**🛏️ Room Management**

Wardens assign rooms
Students submit room change requests

**📅 Attendance System**

Students perform digital night check-in
Wardens view consolidated attendance reports

**🛠️ Issue Reporting**

Students raise maintenance issues
Wardens assign staff and track resolution

**🍽️ Mess Management**

Mess staff access attendance
Dynamic meal count for accurate preparation

**📢 Announcements**

Wardens post notices via digital notice board

**👤 Profile Management**

Users update details
View hostel and attendance data

################################################################################################################################################

# 6. Enhanced Data Handling

DormSync includes advanced query features for large datasets.

**Searching**
**Sorting**
**Filtering**
**Pagination**

################################################################################################################################################

# 7. Tech Stack

**Frontend**

Next.js (React)
Axios
Tailwind CSS

**Backend**

Node.js
Express.js
Database
PostgreSQL
Prisma ORM
Authentication
JWT
bcrypt.js

**Hosting**

Vercel (Frontend)
Render (Backend)
Prisma Db (PostgreSQL)

**Version Control**

Git & GitHub

################################################################################################################################################

# 8. API Overview

Authentication

Endpoint	Method	Description	Access
/api/auth/signup	POST	Register a new user	Public
/api/auth/login	POST	Login user	Public
/api/auth/logout	POST	Logout user	Authenticated

User Management
Endpoint	Method	Description	Access
/api/users	GET	Get all users (search, filter, pagination)	Warden
Attendance
Endpoint	Method	Description	Access
/api/attendance	GET	View attendance records	Warden

Maintenance Issues
Endpoint	Method	Description	Access
/api/issues	POST	Raise maintenance issue	Student
/api/issues	GET	Retrieve issues (filters supported)	Authenticated

Mess
Endpoint	Method	Description	Access
/api/mess	GET	Fetch meal count based on attendance	Mess Staff

################################################################################################################################################

# 9. Conclusion

**DormSync modernizes hostel and mess operations with automation, data-driven workflows, and clear role-based functionality.
It improves administrative efficiency and enhances the daily experience for students and staff.**