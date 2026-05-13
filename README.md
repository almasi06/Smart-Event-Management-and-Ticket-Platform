# Smart Event Management & Ticketing Platform Documentation  

## Overview  
A secure, full‑stack web application designed to modernize event booking and ticketing. The platform addresses industry challenges such as overbooking, fragmented booking processes, and limited access to real‑time insights. It provides role‑based authentication, event management (CRUD for admins), automated ticket booking with capacity validation, dashboards for analytics, and a contact management system.  

## Features  
- **User Authentication**: Registration, login, hashed passwords, and role‑based access control.  
- **Event Management**: Admins can create, update, view, and delete events with automated capacity tracking.  
- **Ticket Booking System**: Users can reserve tickets with built‑in validation to prevent overbooking.  
- **Dashboards**: Analytics for admins (popular events, booking totals) and booking history for users.  
- **Contact Management**: Enquiry submission and admin management of user queries.  
- **Search & Filtering**: Event discovery by date, category, and availability.  

## Technical Stack  
- **Node.js**: Server‑side JavaScript runtime powering backend logic.  
- **Express.js**: Web framework for routing, middleware, and server configuration.  
- **EJS**: Template engine for dynamic server‑side rendering of HTML.  
- **MongoDB**: NoSQL database for storing events, users, and bookings.  
- **Mongoose**: ODM library for schema validation and database queries.  
- **bcrypt**: Password hashing library ensuring secure authentication.  
- **express-session**: Middleware for session handling and login persistence.   
- **dotenv**: Manages environment variables securely.  
- **nodemon**: Development tool that auto‑restarts the server on code changes.  

## End-to-End Workflow (Verified)  
- **Register/Login**: Users create accounts with hashed passwords and secure sessions.  
- **Create Events**: Admins add new events with capacity limits.  
- **Book Tickets**: Users reserve tickets with automated validation.  
- **View Dashboards**: Admins track analytics and users view booking history.  
- **Manage Contacts**: Users submit enquiries and admins respond and manage records.  

## Compliance & Quality Assurance  
### Required Data Fields  
- **Users**: ID, Name, Email, Role, Password (hashed).  
- **Events**: ID, Title, Description, Date, Capacity, Category.  
- **Bookings**: ID, User Link, Event Link, Status, Date.  
- **Enquiries**: ID, User Link, Message, Date.  

## Team Members and Roles  
- **Davidzo Malapile** – Project Coordinator  
- **Jesse Connor Smith** – Frontend Development  
- **Christian Janse van Rensburg** – Security Implementation  
- **Fourie Jooste** – Backend Development  
- **Darryl Mokwele** – Database Management  

## Setup Instructions  
1. Navigate into the project directory:  
   ```bash
   cd smart-event-management-platform
   ```  
2. Install dependencies:  
   ```bash
   npm install
   ```  
3. Run in development mode:  
   ```bash
   npm run dev
   ```  
4. Start the application:  
   ```bash
   npm start
   ```  

---
