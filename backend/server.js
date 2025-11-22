const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

const DB_PATH = '/app/db.json';

app.use(cors());
app.use(express.json());

// --- Helper Functions ---
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading database:", err);
        throw new Error("Could not read database.");
    }
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing to database:", err);
        throw new Error("Could not write to database.");
    }
};

// --- Word List Endpoints ---

// GET all lists for a profile
app.get('/api/profils/:profilId/listes', (req, res) => {
    const { profilId } = req.params;
    const db = readDB();
    const profil = db.profils.find(p => p.id == profilId);

    if (profil) {
        res.json(profil.listes || []);
    } else {
        res.status(404).json({ error: "Profil not found" });
    }
});

// POST a new list to a profile
app.post('/api/profils/:profilId/listes', (req, res) => {
    const { profilId } = req.params;
    const newList = req.body;
    const db = readDB();
    const profilIndex = db.profils.findIndex(p => p.id == profilId);

    if (profilIndex !== -1) {
        const profil = db.profils[profilIndex];
        if (!profil.listes) {
            profil.listes = [];
        }
        // Assign a new unique ID
        const newId = profil.listes.length > 0 ? Math.max(...profil.listes.map(l => l.id)) + 1 : 1;
        newList.id = newId;

        profil.listes.push(newList);
        writeDB(db);
        res.status(201).json(newList);
    } else {
        res.status(404).json({ error: "Profil not found" });
    }
});

// PUT (update) an existing list
app.put('/api/profils/:profilId/listes/:listeId', (req, res) => {
    const { profilId, listeId } = req.params;
    const updatedList = req.body;
    const db = readDB();
    const profilIndex = db.profils.findIndex(p => p.id == profilId);

    if (profilIndex !== -1) {
        const profil = db.profils[profilIndex];
        const listIndex = profil.listes.findIndex(l => l.id == listeId);

        if (listIndex !== -1) {
            // Ensure the ID is not changed
            updatedList.id = parseInt(listeId);
            profil.listes[listIndex] = updatedList;
            writeDB(db);
            res.json(updatedList);
        } else {
            res.status(404).json({ error: "Liste not found" });
        }
    } else {
        res.status(404).json({ error: "Profil not found" });
    }
});

// DELETE a list
app.delete('/api/profils/:profilId/listes/:listeId', (req, res) => {
    const { profilId, listeId } = req.params;
    const db = readDB();
    const profilIndex = db.profils.findIndex(p => p.id == profilId);

    if (profilIndex !== -1) {
        const profil = db.profils[profilIndex];
        const listIndex = profil.listes.findIndex(l => l.id == listeId);

        if (listIndex !== -1) {
            profil.listes.splice(listIndex, 1);
            writeDB(db);
            res.status(204).send(); // No Content
        } else {
            res.status(404).json({ error: "Liste not found" });
        }
    } else {
        res.status(404).json({ error: "Profil not found" });
    }
});


// --- Original Generic Endpoints (can be removed if unused) ---
app.get('/api/data', (req, res) => {
    try {
        const data = readDB();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Impossible de lire la base de données" });
    }
});

app.post('/api/save', (req, res) => {
    try {
        writeDB(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erreur sauvegarde" });
    }
});


app.listen(PORT, () => {
    console.log(`Serveur Jardin des Mots démarré sur le port ${PORT}`);
});
