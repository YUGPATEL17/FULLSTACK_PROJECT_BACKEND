const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  location: String,
  price: Number,
  spaces: Number,
  rating: Number,
  image: String,
});

module.exports = mongoose.model("Lesson", LessonSchema);