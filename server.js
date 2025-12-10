// backend/server.js
"use strict";

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

// IMPORTANT: data.js probably exports { courses: [...] }
const { courses } = require("./data"); // local seed data array

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "afterSchoolDB";

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set in .env");
  process.exit(1);
}

// -----------------------
// 1. MongoDB connection
// -----------------------
let db;
let lessonsCollection;
let ordersCollection;
let client; // keep reference to reuse

async function connectToMongo() {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();

    db = client.db(DB_NAME);
    lessonsCollection = db.collection("lessons");
    ordersCollection = db.collection("orders");

    console.log("✅ Connected to MongoDB Atlas (DB:", DB_NAME, ")");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

// -----------------------
// 2. Basic health route
// -----------------------
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// -----------------------
// 3. Lessons API
// -----------------------

// GET lessons with optional search + sort
// Examples:
//   /api/courses
//   /api/courses?q=math
//   /api/courses?q=club&sortField=price&sortOrder=desc
app.get("/api/courses", async (req, res) => {
  try {
    const { q, sortField, sortOrder } = req.query;

    // 3.1 Build search filter
    const filter = {};

    if (q && q.trim() !== "") {
      const searchText = q.trim();
      const searchRegex = new RegExp(searchText, "i"); // case-insensitive

      // If q looks like a number, try to match price/spaces as well
      const numericValue = Number(searchText);
      const numericFilters = [];
      if (!isNaN(numericValue)) {
        numericFilters.push({ price: numericValue });
        numericFilters.push({ spaces: numericValue });
      }

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        ...numericFilters,
      ];
    }

    // 3.2 Build sort options
    const allowedFields = ["id", "title", "location", "price", "spaces"];
    const fieldToSort = allowedFields.includes(sortField) ? sortField : "id";
    const order = sortOrder === "desc" ? -1 : 1; // default asc

    const sortOptions = { [fieldToSort]: order };

    // 3.3 Query MongoDB
    const lessons = await lessonsCollection
      .find(filter)
      .sort(sortOptions)
      .toArray();

    // 3.4 Return lessons
    res.json({ courses: lessons });
  } catch (err) {
    console.error("Error in GET /api/courses:", err);
    res.status(500).json({ message: "Error fetching lessons" });
  }
});

// Seed lessons into MongoDB from data.js
// Call this once (locally or on Render):
//   POST http://localhost:4000/api/courses/import
//   POST https://your-render-url.onrender.com/api/courses/import
app.post("/api/orders", async (req, res) => {
  try {
    const { name, phone, total, items } = req.body;

    // --- VALIDATION STARTS HERE ---
    const nameRegex = /^[A-Za-z ]+$/;        // only letters + spaces
    const phoneRegex = /^[0-9]{10,15}$/;     // numbers only, length 10-15

    if (!nameRegex.test(name)) {
      return res.status(400).json({ error: "Name must contain letters only." });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Phone must be numbers only (10–15 digits)." });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must include at least one item." });
    }
    // --- VALIDATION ENDS HERE ---

    const db = client.db(DB_NAME);
    const ordersCollection = db.collection("orders");

    const order = {
      name,
      phone,
      total,
      items,
      createdAt: new Date()
    };

    const result = await ordersCollection.insertOne(order);

    res.status(201).json({
      message: "Order saved successfully",
      order: { _id: result.insertedId, ...order }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while saving order" });
  }
});

// -----------------------
// 4. Orders API
// -----------------------

// Save a new order AND reduce lesson spaces
app.post("/api/orders", async (req, res) => {
  try {
    const { name, phone, items, total } = req.body;

    // --- Validation rules ---
    const nameRegex = /^[A-Za-z\s]+$/; // letters + spaces only
    const phoneRegex = /^[0-9]+$/;     // digits only

    // Basic presence checks
    if (
      !name ||
      !phone ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Name must be letters + spaces only
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Invalid name. Name must contain letters and spaces only.",
      });
    }

    // Phone must be numbers only
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone. Phone must contain digits only.",
      });
    }

    // --- 4.1 Reduce spaces for each lesson in the order ---
    for (const item of items) {
      const lesson = await lessonsCollection.findOne({ id: item.id });

      if (!lesson) {
        console.warn(
          `⚠️ Lesson with id ${item.id} not found, skipping space update.`
        );
        continue;
      }

      const currentSpaces = lesson.spaces || 0;
      const newSpaces = Math.max(0, currentSpaces - item.quantity);

      await lessonsCollection.updateOne(
        { id: item.id },
        { $set: { spaces: newSpaces } }
      );
    }

    // --- 4.2 Save the order itself ---
    const orderDoc = {
      name,
      phone,
      items,
      total,
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(orderDoc);
    const savedOrder = { _id: result.insertedId, ...orderDoc };

    console.log("✅ New order saved:", savedOrder);

    res.status(201).json({
      message: "Order saved successfully",
      order: savedOrder,
    });
  } catch (err) {
    console.error("Error in POST /api/orders:", err);
    res.status(500).json({ message: "Error saving order" });
  }
});

// Get all orders for Orders admin page
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ orders });
  } catch (err) {
    console.error("Error in GET /api/orders:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// -----------------------
// 5. Start server
// -----------------------
async function startServer() {
  await connectToMongo();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();