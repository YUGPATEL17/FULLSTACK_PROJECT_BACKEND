const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

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
    title: "Drama & Theater",
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

// Test homepage
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// Return all courses
app.get("/api/courses", (req, res) => {
  res.json({ courses });
});

// --- NEW TEST ROUTE FOR ORDERS ---
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

// Receive an order from frontend
app.post("/api/orders", (req, res) => {
  console.log("📥 New order received:", req.body);
  res.json({ success: true, message: "Order received!" });
});

// ----------------------
//   START SERVER
// ----------------------
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});