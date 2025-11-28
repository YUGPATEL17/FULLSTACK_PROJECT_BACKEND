const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ----------------------
//   FILE FOR ORDERS
// ----------------------
const ORDERS_FILE = path.join(__dirname, "orders.json");

function loadOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading orders.json:", err);
    return [];
  }
}

function saveOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing orders.json:", err);
  }
}

// Make sure file exists (at least empty array)
if (!fs.existsSync(ORDERS_FILE)) {
  saveOrders([]);
  console.log("✅ Created empty orders.json file");
}

// ----------------------
//   COURSE DATA
// ----------------------
const courses = [
  {
    id: 1,
    title: "Art & Painting",
    description: "Explore your creativity with colors and brushes.",
    location: "Room 101",
    price: 20,
    spaces: 5,
    rating: 5,
    image:
      "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    title: "Music & Guitar Lessons",
    description: "Strum your way to greatness with beginner guitar sessions.",
    location: "Music Room",
    price: 25,
    spaces: 5,
    rating: 5,
    image:
      "https://images.pexels.com/photos/144428/pexels-photo-144428.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    title: "Drama & Theatre",
    description: "Act, perform, and express yourself with confidence.",
    location: "Auditorium",
    price: 22,
    spaces: 5,
    rating: 5,
    image:
      "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 4,
    title: "Coding for Kids",
    description: "Learn to build simple apps and games with code!",
    location: "Computer Lab",
    price: 28,
    spaces: 5,
    rating: 5,
    image:
      "https://images.pexels.com/photos/1811263/pexels-photo-1811263.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 5,
    title: "Robotics Club",
    description: "Build and program simple robots in a fun environment.",
    location: "Tech Lab",
    price: 25,
    spaces: 5,
    rating: 4,
    image:
      "https://images.pexels.com/photos/838640/pexels-photo-838640.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 6,
    title: "Chess Club",
    description: "Sharpen your mind with strategy and problem-solving.",
    location: "Library",
    price: 10,
    spaces: 5,
    rating: 4,
    image:
      "https://images.pexels.com/photos/59197/pexels-photo-59197.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 7,
    title: "Science Experiments",
    description: "Hands-on experiments to discover how the world works.",
    location: "Science Lab",
    price: 23,
    spaces: 5,
    rating: 5,
    image:
      "https://images.pexels.com/photos/2280551/pexels-photo-2280551.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 8,
    title: "Dance Workshop",
    description: "Learn fun routines and boost your confidence on stage.",
    location: "Dance Studio",
    price: 19,
    spaces: 5,
    rating: 4,
    image:
      "https://images.pexels.com/photos/3771837/pexels-photo-3771837.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 9,
    title: "Creative Writing",
    description: "Create stories, poems and characters from your imagination.",
    location: "Room 202",
    price: 15,
    spaces: 5,
    rating: 4,
    image:
      "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 10,
    title: "Math Puzzles Club",
    description: "Solve fun math puzzles and brain teasers together.",
    location: "Room 105",
    price: 12,
    spaces: 5,
    rating: 5,
    image:
      "https://images.pexels.com/photos/59197/pexels-photo-59197.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

// ----------------------
//   ROUTES
// ----------------------

// Simple homepage
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// Get all courses
app.get("/api/courses", (req, res) => {
  res.json({ courses });
});

// Test route for orders
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

// NEW: get all saved orders (for teacher / debugging)
app.get("/api/orders", (req, res) => {
  const orders = loadOrders();
  res.json({ orders });
});

// Receive and save an order
app.post("/api/orders", (req, res) => {
  const body = req.body || {};

  // support either "items" or "cartItems" from frontend
  const items = body.items || body.cartItems || [];

  if (!body.name || !body.phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order. Name, phone, and at least one item are required.",
    });
  }

  // calculate total from items
  const total = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const newOrder = {
    id: Date.now(), // simple unique id
    name: body.name,
    phone: body.phone,
    items,
    total,
    createdAt: new Date().toISOString(),
  };

  const orders = loadOrders();
  orders.push(newOrder);
  saveOrders(orders);

  console.log("📥 New order saved:", newOrder);

  res.json({
    success: true,
    message: "Order received and saved!",
    order: newOrder,
  });
});

// ----------------------
//   START SERVER
// ----------------------
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});