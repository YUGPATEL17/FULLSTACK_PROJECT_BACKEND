# After School Club – Backend API
Node.js + Express + MongoDB

This repository contains the backend API for the After School Club booking system.  
It provides lesson data, order handling, and database integration used by the Vue.js frontend.  
The backend is deployed on Render and uses MongoDB Atlas for cloud storage.

---

## Live API

Base URL  
https://after-school-backend-ri4h.onrender.com

Health check  
https://after-school-backend-ri4h.onrender.com/

---

## Backend Repository

https://github.com/YUGPATEL17/FULLSTACK_PROJECT_BACKEND

---

## Project Overview

The backend handles all core application logic, including:
- Retrieving lessons with search and sorting
- Tracking available spaces based on orders
- Creating and storing orders
- Seeding the database with initial lessons
- Providing endpoints used by the Vue.js frontend

Technologies used:
- Node.js  
- Express.js  
- MongoDB Atlas  
- Native MongoDB driver  
- Render for deployment  
- dotenv and CORS

---

## Folder Structure

backend/
├── server.js
├── controllers/
│   ├── courses.js
│   └── orders.js
├── routes/
│   ├── courses.js
│   └── orders.js
├── db/
│   └── connect.js
├── lessons.json
├── package.json
└── README.md

---

## Environment Variables

Create a `.env` file:

MONGO_URI=your_mongodb_connection_string
DB_NAME=afterSchoolDB
PORT=4000

(Render uses the same variable names.)

---

## Running Locally

Install dependencies:
npm install

Start the server:
node server.js

Local API:
http://localhost:4000

---

## Database Seeding

Insert default lessons by visiting:

http://localhost:4000/api/courses/import

Production seeding:
https://after-school-backend-ri4h.onrender.com/api/courses/import

---

## API Endpoints

GET /  
Health check

GET /api/courses  
Returns all lessons with support for search and sorting  
Query example: /api/courses?q=art&sortField=price&sortOrder=asc

POST /api/courses/import  
Seeds the database with default lessons

POST /api/orders  
Creates a new order and updates lesson availability

GET /api/orders  
Returns all orders

---

## Postman Collection

A full API collection is located in the frontend repository:

frontend/project_docs/after-school-api.postman_collection.json

---

## MongoDB Exports

Final database exports are stored in:

frontend/project_docs/
  mongo_lessons_export.json
  mongo_orders_export.json

---

## Deployment Information

Hosted on Render:  
https://after-school-backend-ri4h.onrender.com

Build command: npm install  
Start command: node server.js

Environment:
MONGO_URI  
DB_NAME  
PORT  

---

## Author
Yug Patel  
BSc Computer Science  
Middlesex University London