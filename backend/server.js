const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Le chemin interne dans le conteneur Docker (qui sera relié à ton D:)
const DB_PATH = '/app/db.json';

app.use(cors()); // Autorise Angular à parler au serveur
app.use(express.json());

// Lire les données
app.get('/api/data', (req, res) => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Impossible de lire la base de données" });
    }
});

// Sauvegarder les données (mise à jour complète pour simplifier la v1)
app.post('/api/save', (req, res) => {
    try {
        // On écrit le JSON reçu directement dans le fichier
        fs.writeFileSync(DB_PATH, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur sauvegarde" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur Jardin des Mots démarré sur le port ${PORT}`);
});