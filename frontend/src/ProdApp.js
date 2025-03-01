import React, { useState, useEffect } from "react";
import "./LoveNotesApp.css";

const BACKUP_SERVER_URL = "https://your-backup-server.onrender.com/backup"; // Replace with Render URL

export default function LoveNotesApp() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch(BACKUP_SERVER_URL)
        .then((res) => res.json())
        .then((data) => setEntries(data.entries || []))
        .catch((err) => console.error("Failed to load backup:", err));
    };

    fetchData(); // Load initially
    const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval); // Clean up
  }, []);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const timestamp = new Date().toLocaleString();
    const newEntry = { text, timestamp };

    setEntries((prevEntries) => [...prevEntries, newEntry]);

    // Send only the new note to the backup server
    fetch(BACKUP_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    })
      .then((res) => res.json())
      .then((data) => console.log("Backup Response:", data))
      .catch((err) => console.error("Backup Error:", err));

    setText("");
  };

  const getStats = () => {
    return {
      totalEntries: entries.length,
      lastEntry: entries.length > 0 ? entries[entries.length - 1].text : "None",
    };
  };

  const formatMessages = () => {
    return entries.map((entry) => `❤️ ${entry.timestamp}\n${entry.text}\n`).join("\n");
  };

  const emailLoveLetter = () => {
    const subject = "A Love Letter Just for You 💌";
    const body = `My Love,\n\nHere are all the times I missed you and wrote to you:\n\n${formatMessages()}\n\nWith all my love,\nSnehit`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="container">
      <h1 className="title">Love Notes ❤️</h1>
      <textarea
        className="textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your feelings here..."
      />
      <button className="save-button" onClick={handleSubmit}>
        Save Love Note
      </button>

      <div className="journal">
        <h2>My Love Journal</h2>
        <p>Total Notes: {getStats().totalEntries}</p>
        <p>Last Note: {getStats().lastEntry}</p>
      </div>

      <button className="send-button" onClick={emailLoveLetter}>
        Send Love Letter 💌
      </button>
    </div>
  );
}
