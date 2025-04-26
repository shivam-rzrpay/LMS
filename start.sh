#!/bin/bash

# Start MongoDB if it's not running (using Docker)
echo "Checking if MongoDB is running..."
if ! docker ps | grep -q mongodb; then
  echo "Starting MongoDB container..."
  docker run -d -p 27017:27017 --name mongodb mongo:latest || docker start mongodb
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing root dependencies..."
  npm install
fi

if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

# Seed the database if specified
if [ "$1" == "--seed" ]; then
  echo "Seeding the database..."
  cd backend && npm run seed && cd ..
fi

# Start both servers
echo "Starting Library Management System..."
echo "------------------------------------"
echo "Frontend will be available at: http://localhost:3001"
echo "Backend API will be available at: http://localhost:5000"
echo ""
echo "Login credentials:"
echo "Admin - username: admin, password: admin123"
echo "User - username: user, password: user123"
echo "------------------------------------"
echo ""

npm start 