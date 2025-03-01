require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const backupFilePath = process.env.BACKUP_FILE_PATH || path.join(__dirname, "backup.json");

// Middleware
app.use(express.json());
app.use(cors());

// API to save backup
// app.post("/backup", async (req, res) => {
//   const { entries } = req.body;

//   if (!Array.isArray(entries)) {
//     return res.status(400).json({ message: "Entries should be an array" });
//   }

//   try {
//     let existingEntries = [];
//     try {
//       const data = await fs.readFile(backupFilePath, "utf8");
//       existingEntries = JSON.parse(data) || [];
//     } catch (error) {
//       if (error.code !== "ENOENT") throw error;
//     }

//     const updatedEntries = [...existingEntries, ...entries];

//     await fs.writeFile(backupFilePath, JSON.stringify(updatedEntries, null, 2));
//     console.log("Backup saved successfully!");
//     res.json({ message: "Backup saved successfully" });
//   } catch (error) {
//     console.error("Error writing to file:", error);
//     res.status(500).json({ message: "Failed to save backup" });
//   }
// });

app.post("/backup", async (req, res) => {
  const { entry } = req.body;

  if (!entry || !entry.text) {
    console.error("Invalid entry received:", entry);
    return res.status(400).json({ message: "Invalid note entry" });
  }

  try {
    let existingEntries = [];

    // Read existing notes
    try {
      const data = await fs.readFile(backupFilePath, "utf8");
      existingEntries = JSON.parse(data) || [];
    } catch (error) {
      if (error.code !== "ENOENT") throw error; // Ignore if file doesn't exist yet
    }

    existingEntries.push(entry); // Append only the new note

    // Save updated notes
    await fs.writeFile(backupFilePath, JSON.stringify(existingEntries, null, 2));

    console.log("New note added to backup:", entry); // Debugging log
    res.json({ message: "Note saved successfully", savedEntry: entry });
  } catch (error) {
    console.error("Error writing to file:", error);
    res.status(500).json({ message: "Failed to save note" });
  }
});

// API to retrieve backup data
app.get("/backup", async (req, res) => {
  try {
    const data = await fs.readFile(backupFilePath, "utf8");
    res.json({ entries: JSON.parse(data) || [] });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.json({ entries: [] }); // Return empty array if file doesn't exist
    }
    console.error("Error reading backup file:", error);
    res.status(500).json({ message: "Failed to read backup" });
  }
});

// Start the server
// app.listen(PORT, () => {
//   console.log(`Backup server running at http://localhost:${PORT}`);
// });
const HOST = "192.168.1.5"; // Replace with your actual IP
app.listen(PORT, HOST, () => {
  console.log(`Backup server running at http://${HOST}:${PORT}`);
});

