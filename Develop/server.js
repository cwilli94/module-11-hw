const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/notes', (req, res) => {
  const notes = loadNotes();
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
    const notes = loadNotes();
    const newNote = req.body;
    newNote.id = generateNoteId();
    notes.push(newNote);
    saveNotes(notes);
    res.json({ note: newNote });
  });
  
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const notes = loadNotes();
  const index = notes.findIndex((note) => note.id === id);
  if (index !== -1) {
    notes.splice(index, 1);
    saveNotes(notes);
  }
  res.sendStatus(204);
});

// Helper functions
const loadNotes = () => {
  const dbFilePath = path.join(__dirname, 'db', 'db.json');
  if (fs.existsSync(dbFilePath)) {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

const saveNotes = (notes) => {
  const dbDirPath = path.join(__dirname, 'db');
  const dbFilePath = path.join(dbDirPath, 'db.json');

  if (!fs.existsSync(dbDirPath)) {
    fs.mkdirSync(dbDirPath);
  }

  const data = JSON.stringify(notes, null, 2);
  fs.writeFileSync(dbFilePath, data, 'utf8');
};

const generateNoteId = () => {
  return Date.now().toString();
};

// Route for notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// Route for the home page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
