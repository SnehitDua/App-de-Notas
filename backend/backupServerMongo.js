require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Reduce timeout from 30s to 5s
    family: 4, // Force IPv4 (fixes some connection issues)
  })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const NoteSchema = new mongoose.Schema({
    text: String,
    timestamp: String,
  }, { versionKey: false }); 

const Note = mongoose.model("Note", NoteSchema);

app.use(express.json());
app.use(cors());

// API to save a new note
app.post("/backup", async (req, res) => {
  const { entry } = req.body;

  if (!entry || !entry.text) {
    console.error("Invalid entry received:", entry);
    return res.status(400).json({ message: "Invalid note entry" });
  }

  try {
    const newNote = new Note(entry);
    await newNote.save();

    console.log("New note saved:", newNote);
    res.json({ message: "Note saved successfully", savedEntry: newNote });
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ message: "Failed to save note" });
  }
});

// API to retrieve all saved notes
app.get("/backup", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json({ entries: notes });
  } catch (error) {
    console.error("Error retrieving notes:", error);
    res.status(500).json({ message: "Failed to read backup" });
  }
});

// Start the server
// const HOST = "192.168.1.5"; // Replace with your actual IP if needed
// app.listen(PORT, HOST, () => {
//   console.log(`Backup server running at http://${HOST}:${PORT}`);
// });

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
  
