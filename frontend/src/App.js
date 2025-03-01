import React, { useState, useEffect } from "react";
import "./LoveNotesApp.css";

export default function LoveNotesApp() {
  const [text, setText] = useState("");
  // const [entries, setEntries] = useState(() => {
  //   const savedData = localStorage.getItem("loveNotes");
  //   return savedData ? JSON.parse(savedData) : [];
  // });

  // useEffect(() => {
  //   localStorage.setItem("loveNotes", JSON.stringify(entries));
  //   backupData(entries);
  // }, [entries]);

  const [entries, setEntries] = useState([]);

  // useEffect(() => {
  //   fetch("http://192.168.1.5:5000/backup")
  //     .then((res) => res.json())
  //     .then((data) => setEntries(data.entries || []))
  //     .catch((err) => console.error("Failed to load backup:", err));
  // }, []);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://192.168.1.5:5000/backup")
        .then((res) => res.json())
        .then((data) => setEntries(data.entries || []))
        .catch((err) => console.error("Failed to load backup:", err));
    };
  
    fetchData(); // Load initially
  
    const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
  
    return () => clearInterval(interval); // Clean up
  }, []);

  // const backupData = async (data) => {
  //   try {
  //     await fetch("http://192.168.1.5:5000/backup", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(data),
  //     });
  //   } catch (error) {
  //     console.error("Backup failed:", error);
  //   }
  // };

  // const handleSubmit = () => {
  //   if (!text.trim()) return;
  //   const timestamp = new Date().toLocaleString();
  //   const newEntry = { text, timestamp };
  //   setEntries((prevEntries) => {
  //     const updatedEntries = [...prevEntries, newEntry];
  //     localStorage.setItem("loveNotes", JSON.stringify(updatedEntries));
  
  //     // Send data to backup server
  //     fetch("http://192.168.1.5:5000/backup", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ entry: { text: newEntry.text, timestamp: newEntry.timestamp } }),
  //     })
  //       .then((res) => res.json())
  //       .then((data) => console.log("Backup Response:", data))
  //       .catch((err) => console.error("Backup Error:", err));
  
  //     return updatedEntries;
  //   });
  //   setText("");
  // };  

  const handleSubmit = () => {
    if (!text.trim()) return;
    const timestamp = new Date().toLocaleString();
    const newEntry = { text, timestamp };
  
    setEntries((prevEntries) => [...prevEntries, newEntry]);
    localStorage.setItem("loveNotes", JSON.stringify([...entries, newEntry]));
  
    // Send only the new note, not all previous ones
    fetch("http://192.168.1.5:5000/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: newEntry }),
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
        Guardar Love Note
      </button>

      <div className="journal">
        <h2>My Love Journal</h2>
        <p>Total de Notas: {getStats().totalEntries}</p>
        <p>Última Nota: {getStats().lastEntry}</p>
      </div>

      <button className="send-button" onClick={emailLoveLetter}>
        Enviar Love Letter 💌
      </button>
    </div>
  );
}
