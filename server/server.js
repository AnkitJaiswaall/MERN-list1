const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/mern_list", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const listSchema = new mongoose.Schema({
  userId: String,
  title: String,
  tasks: [{ text: String }],
});

const List = mongoose.model("List", listSchema);

// Signup Route
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.create({ username, password });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // If the username is unique, create the new user
    const newUser = await User.create({ username, password });
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create List Route
app.post("/api/lists", async (req, res) => {
  try {
    const { userId, title } = req.body;
    const list = await List.create({ userId, title, tasks: [] });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Lists Route
app.get("/api/lists/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const lists = await List.find({ userId });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Task to List Route
app.post("/api/lists/:listId/tasks", async (req, res) => {
  try {
    const listId = req.params.listId;
    const { text } = req.body;
    const list = await List.findById(listId);
    list.tasks.push({ text, completed: false });
    await list.save();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove Task from List Route
app.delete("/api/lists/:listId/tasks/:taskId", async (req, res) => {
  try {
    const { listId, taskId } = req.params;
    const list = await List.findById(listId);
    list.tasks = list.tasks.filter((task) => task._id != taskId);
    await list.save();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/lists/:listId", async (req, res) => {
  try {
    const { listId } = req.params;
    const { tasks } = req.body;

    const list = await List.findByIdAndUpdate(listId, { tasks }, { new: true });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
