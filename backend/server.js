const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Le chemin interne dans le conteneur Docker (qui sera relié à ton D:)
const DB_PATH = '/app/db.json';

// --- Initialisation de la base de données ---
function initializeDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        console.log("Le fichier db.json n'existe pas. Création avec les données par défaut...");
        const defaultData = {
            "profils": [
                { "id": 1, "nom": "Liam", "avatar": "🐰", "inventaire": { "carotte": 3, "tomate": 0 }, "carottes_or": 0 },
                { "id": 2, "nom": "Thomas", "avatar": "🌴", "inventaire": { "carotte": 3, "tomate": 0 }, "carottes_or": 0 }
            ],
            "listes": [
                {
                    "id": 1,
                    "nom": "Liste Démo",
                    "mots": ["âge", "changer", "danger", "genou", "genre", "jeter", "jeune", "ménage", "nuage", "passage", "village"]
                }
            ]
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
        console.log("Fichier db.json créé avec succès.");
    }
}

// Appel de la fonction d'initialisation au démarrage
initializeDatabase();
// --- Fin de l'initialisation ---

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