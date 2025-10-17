# 🎓 College Portal Management System

## Project Overview

The College Portal Management System is a comprehensive, role-based web application designed to streamline academic, administrative, and student life within a college setting. It provides dedicated dashboards for **Students, Faculty/Staff, and Administrators**, focusing on features like user management, attendance tracking, and student placement assistance.

The application is built using a modern **MERN stack-like architecture** (React/Vite Frontend, Node.js/Express Backend, and PostgreSQL Database).

## ✨ Key Features

### 💻 User Management & Security

  * **Role-Based Access Control (RBAC):** Separate experiences and access permissions for Admin, Faculty/Staff, and Students.
  * **Secure Authentication:** User registration and login protected by **Bcrypt** password hashing and **JWT** (JSON Web Tokens).
  * **Robust Validation:** Comprehensive server-side validation ensures data integrity, including checks for existing usernames/emails and valid department/division IDs.

### 📊 Dashboard & Tracking Modules

  * **Dedicated Dashboards:** Separate landing pages for each role (Admin, Student, Staff).
  * **Attendance Tracker:** Allows Faculty/Staff to mark attendance for specific sessions and lets Students view their personalized attendance summary.
  * **Upcoming Tasks/Deadlines:** A core feature on the student dashboard showing upcoming assignments, exams, and important dates (REQ-8).
  * **Placement Tracker (Planned):** A dedicated module (summarized on the dashboard) for students to log and track their job/internship applications, interviews, and offer status (REQ-10, REQ-11).

### ⚙️ Administrative Tools

  * **User Management:** (Admin Only) Tools for managing and assigning roles to users.
  * **Department Management:** (Admin Only) Tools for managing academic departments and divisions.
  * **Reports Dashboard:** (Admin Only) Provides data visualization and reports on key metrics (e.g., overall attendance trends).

## 🚀 Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React** (with Vite), **TypeScript** | Fast, modern interface development. |
| **Styling** | **Tailwind CSS** | Utility-first framework for rapid, consistent styling (Dark Theme focused). |
| **Animations** | **Framer Motion** | Used for smooth transitions and modern UI effects. |
| **Backend** | **Node.js** with **Express.js** | Robust RESTful API server. |
| **Database** | **PostgreSQL** (via `pg` pool) | Reliable, relational database for structured academic data. |
| **Security** | **Bcrypt.js**, **jsonwebtoken** | Industry-standard security for passwords and session management. |

## 🛠️ Installation and Setup

### Prerequisites

You must have the following installed on your system:

  * Node.js (v16+)
  * npm or yarn
  * PostgreSQL database instance

### 1\. Database Setup

1.  Create a new PostgreSQL database (e.g., `college_portal_db`).
2.  Set up your database tables (`USER`, `STUDENT`, `FACULTY`, `DEPARTMENT`, `DIVISION`, etc.). *(Note: You may need to provide the SQL schema here).*

### 2\. Backend Setup (`/server` directory)

1.  Navigate to your server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `/server` directory and add your configuration:
    ```env
    PORT=5000
    JWT_SECRET=YOUR_VERY_STRONG_SECRET_KEY
    # PostgreSQL Connection Details
    DB_USER=your_db_user
    DB_HOST=localhost
    DB_DATABASE=college_companion
    DB_PASSWORD=your_db_password
    DB_PORT=5432
    ```
4.  Start the backend server:
    ```bash
    npm start # or node server.js
    ```

### 3\. Frontend Setup (`/client` directory)

1.  Navigate to your client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `/client` directory (for Vite configuration):
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    ```
4.  Start the frontend application:
    ```bash
    npm run dev
    ```

The application should now be running in your browser, typically at `http://localhost:5173`.

## 🤝 Contribution

If you would like to contribute, please feel free to fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License. 

-----

**Developed by: tanyajha29**
