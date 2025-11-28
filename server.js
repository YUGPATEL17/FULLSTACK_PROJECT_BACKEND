// backend/server.js

const express = require("express");
const cors = require("cors");
const { courses } = require("./data");

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());            // allow requests from frontend
app.use(express.json());    // parse JSON bodies

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Get all courses
app.get("/api/courses", (req, res) => {
  res.json(courses);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});