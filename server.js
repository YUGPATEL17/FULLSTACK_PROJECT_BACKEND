// backend/server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Lesson = require("./models/Lesson");
const Order = require("./models/Order");

// Seed data for first run (from data.js file)
const seedData = require("./data");
const seedCourses = Array.isArray(seedData)
  ? seedData
  : seedData.courses || [];

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// ---------------------
// 1. Middleware
// ---------------------
app.use(cors());
app.use(express.json());

// ---------------------
// 2. Helper functions
// ---------------------
function calculateTotal(items = []) {
  return items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
}

async function getLessonsFromDb() {
  let lessons = await Lesson.find().lean();

  // First run: if DB is empty, seed from data.js
  if (!lessons.length && seedCourses.length) {
    await Lesson.insertMany(seedCourses);
    console.log(`🌱 Seeded ${seedCourses.length} lessons into MongoDB`);
    lessons = await Lesson.find().lean();
  }

  return lessons;
}

// one handler reused for /api/courses, /courses, /lessons, /api/lessons
async function handleGetCourses(req, res) {
  try {
    const lessons = await getLessonsFromDb();
    // keep the same shape the frontend expects: { courses: [...] }
    res.json({ courses: lessons });
  } catch (err) {
    console.error("❌ Error fetching lessons:", err);
    res.status(500).json({ message: "Error fetching lessons" });
  }
}

// ---------------------
// 3. Basic route
// ---------------------
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// ---------------------
// 4. Lesson routes
// ---------------------
app.get("/api/courses", handleGetCourses);
app.get("/courses", handleGetCourses);
app.get("/api/lessons", handleGetCourses);
app.get("/lessons", handleGetCourses);

// ---------------------
// 5. Order routes
// ---------------------

// Simple test route (for browser check)
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

// Get all orders (used by Orders page)
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Create a new order (used by checkout)
app.post("/api/orders", async (req, res) => {
  try {
    const { name, phone, items, total } = req.body;

    if (!name || !phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Invalid order data. Name, phone and at least one item required.",
      });
    }

    const finalTotal =
      typeof total === "number" ? total : calculateTotal(items);

    const newOrder = await Order.create({
      name: name.trim(),
      phone: phone.trim(),
      items,
      total: finalTotal,
    });

    console.log("✅ New order received:", newOrder);

    res.status(201).json({
      message: "Order saved successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).json({ message: "Error saving order" });
  }
});

// ---------------------
// 6. Start server + connect MongoDB
// ---------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });