# User Appointment Management System

## Overview
The User Appointment Management System is a web-based application that allows users to schedule and manage appointments with authentication and session management using JWT.

## Live Demo
The application is deployed and can be accessed via:
[User Appointment Management System](https://appointment-management-delta.vercel.app/)

## Running Locally
Follow these steps to run the application locally.

### 1. Clone Repository
```sh
git clone https://github.com/adyasena/appointment-management.git
cd appointment-management
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project's root directory and add the following configuration:
```sh
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
```

### 4. Start Local Server
```sh
npm run dev
```
Access the application at `http://localhost:3000`

## Technologies Used
- **Next.js** as the React framework
- **MongoDB Atlas** for the database
- **JWT** for authentication
- **Vercel** for deployment

