# Library Management System

A comprehensive web application for managing library resources including books, movies, memberships, and transactions.

## Quick Start

The easiest way to start the application is to use the included start script:

```bash
# Install dependencies and start the application
./start.sh

# If you want to seed the database with sample data
./start.sh --seed
```

This script will:
1. Start MongoDB using Docker if it's not running
2. Install all necessary dependencies
3. Seed the database with sample data (if --seed is specified)
4. Start both the backend and frontend servers

## Features

- **User Authentication**: Separate login interfaces for admin and regular users
- **Book/Movie Management**: Add, edit, delete, and search for books and movies
- **Membership Management**: Create and manage user memberships
- **Transaction Handling**: Issue books, return books, and manage fines
- **Reporting**: Generate and view various reports including all books, active issues, and overdue returns

## Default Login Credentials

- Admin:
  - Username: admin
  - Password: admin123

- Regular User:
  - Username: user
  - Password: user123

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React.js, React Bootstrap
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB with Mongoose ODM

## Project Structure

```
library_management_system/
│
├── backend/               # Backend Node.js/Express code
│   ├── middleware/        # Middleware functions
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── seed/              # Seed data scripts
│   ├── server.js          # Entry point for the backend
│   └── .env               # Environment variables
│
└── frontend/              # Frontend React code
    ├── public/            # Static files
    └── src/               # React source code
        ├── components/    # React components
        │   ├── admin/     # Admin-specific components
        │   ├── auth/      # Authentication components
        │   ├── layout/    # Layout components
        │   ├── reports/   # Report components
        │   ├── shared/    # Shared components
        │   └── user/      # User-specific components
        ├── context/       # React context (for state management)
        ├── App.js         # Main App component
        └── index.js       # Entry point for the frontend
```

## Manual Installation

If you prefer to manually set up the application:

### Prerequisites

- Node.js (v14.x or higher)
- MongoDB (v4.x or higher)

### Setup

1. Install root dependencies:
   ```
   npm install
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables:
   - Rename `.env.example` to `.env` and update the required values

4. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

5. Seed the database:
   ```
   cd ../backend
   npm run seed
   ```

## Running the Application Manually

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

This project was created based on requirements provided in the technical coding document. 