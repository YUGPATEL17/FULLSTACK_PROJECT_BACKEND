// backend/server.js

const express = require("express");
const cors = require("cors");
const { courses } = require("./data");

const app = express();
const PORT = 4000;

// ----- Middleware -----
app.use(cors());
app.use(express.json()); // so we can read JSON bodies

// ----- Routes -----

// Simple health check
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// Get all courses
app.get("/api/courses", (req, res) => {
  res.json(courses);
});

// Create a new order from checkout form
app.post("/api/orders", (req, res) => {
  const { name, phone, cart } = req.body;

  // Basic validation
  if (!name || !phone || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({
      message: "Name, phone and at least one cart item are required.",
    });
  }

  // Optional: calculate total price
  const total = cart.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);

  // Log the order on the server (for your coursework evidence)
  console.log("✅ New order received:");
  console.log("Name:", name);
  console.log("Phone:", phone);
  console.log("Cart items:", cart);
  console.log("Total:", total);

  // Respond to frontend
  res.status(201).json({
    message: `Order received! Thank you, ${name}.`,
    total,
  });
});

// ----- Start server -----
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});