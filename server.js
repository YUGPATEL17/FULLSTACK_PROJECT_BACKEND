// backend/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const courses = require("./data"); // local seed data array

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// -----------------------
// 1. Mongoose models
// -----------------------
const lessonSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  location: String,
  price: Number,
  spaces: Number,
  rating: Number,
  image: String,
});

const orderItemSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  items: [orderItemSchema],
  total: Number,
  createdAt: { type: Date, default: Date.now },
});

const Lesson = mongoose.model("Lesson", lessonSchema);
const Order = mongoose.model("Order", orderSchema);

// -----------------------
// 2. Basic health route
// -----------------------
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// -----------------------
// 3. Lessons API
// -----------------------

// Get all lessons from MongoDB
app.get("/api/courses", async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ id: 1 });
    res.json({ courses: lessons });
  } catch (err) {
    console.error("Error in GET /api/courses:", err);
    res.status(500).json({ message: "Error fetching lessons" });
  }
});

// Seed lessons into MongoDB from data.js
// Call this once in the browser: http://localhost:4000/api/courses/import
app.post("/api/courses/import", async (req, res) => {
  try {
    await Lesson.deleteMany({});
    const inserted = await Lesson.insertMany(courses);
    console.log(`✅ Imported ${inserted.length} lessons into MongoDB`);
    res.json({ message: "Lessons imported", count: inserted.length });
  } catch (err) {
    console.error("Error importing lessons:", err);
    res.status(500).json({ message: "Error importing lessons" });
  }
});

// -----------------------
// 4. Orders API
// -----------------------

// Save a new order AND reduce lesson spaces
app.post("/api/orders", async (req, res) => {
  try {
    const { name, phone, items, total } = req.body;

    if (!name || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // 4.1 Reduce spaces for each lesson in the order
    for (const item of items) {
      const lesson = await Lesson.findOne({ id: item.id });

      if (!lesson) {
        console.warn(`Lesson with id ${item.id} not found, skipping space update.`);
        continue;
      }

      // Ensure we don't go below 0
      const newSpaces = Math.max(0, lesson.spaces - item.quantity);
      lesson.spaces = newSpaces;
      await lesson.save();
    }

    // 4.2 Save the order itself
    const newOrder = new Order({ name, phone, items, total });
    await newOrder.save();

    console.log("✅ New order saved:", newOrder.toObject());

    res.status(201).json({
      message: "Order saved successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("Error in POST /api/orders:", err);
    res.status(500).json({ message: "Error saving order" });
  }
});

// Get all orders for Orders admin page
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("Error in GET /api/orders:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Simple test route (still useful)
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

// -----------------------
// 5. Start server + connect Mongo
// -----------------------
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();