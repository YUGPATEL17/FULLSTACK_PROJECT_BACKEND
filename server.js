// backend/server.js

require("dotenv").config();           // load .env file

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 4000;

// ----------------------
// 1. MongoDB connection
// ----------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// ----------------------
// 2. Middleware
// ----------------------
app.use(cors());
app.use(express.json());

// ----------------------
// 3. Course data (still local file for now)
// ----------------------
const courses = require("./data"); // data.js exports the array

// ----------------------
// 4. Orders helper functions (orders.json file)
// ----------------------
const ordersFilePath = path.join(__dirname, "orders.json");

function readOrdersFromFile() {
  try {
    if (!fs.existsSync(ordersFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(ordersFilePath, "utf8");
    if (!fileData.trim()) return [];
    return JSON.parse(fileData);
  } catch (err) {
    console.error("Error reading orders.json:", err);
    return [];
  }
}

function writeOrdersToFile(orders) {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error("Error writing orders.json:", err);
  }
}

// ----------------------
// 5. Routes
// ----------------------

// Health check
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// Get all courses
app.get("/api/courses", (req, res) => {
  res.json({ courses });
});

// Get all orders (for Orders page)
app.get("/api/orders", (req, res) => {
  const orders = readOrdersFromFile();
  res.json({ orders });
});

// Simple test route to check orders API
app.get("/api/orders/test", (req, res) => {
  res.json({
    message: "Orders test endpoint working ✅",
    exampleOrder: {
      name: "Test User",
      phone: "07123456789",
      items: [{ id: 1, title: "Art & Painting", quantity: 2, price: 10 }],
      total: 20,
    },
  });
});

// Place an order
app.post("/api/orders", (req, res) => {
  const { name, phone, items, total } = req.body;

  if (!name || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const newOrder = {
    id: Date.now(),
    name,
    phone,
    items,
    total,
    createdAt: new Date().toISOString(),
  };

  const orders = readOrdersFromFile();
  orders.push(newOrder);
  writeOrdersToFile(orders);

  console.log("✅ New order received:", newOrder);

  res.status(201).json({
    message: "Order received and stored",
    order: newOrder,
  });
});

// ----------------------
// 6. Start server
// ----------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});