const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware per servire i file statici dalla cartella 'public'
app.use(express.static('public'));

// Route per la registrazione
app.post('/register', (req, res) => {
    const { nome, ragione } = req.body;

    if (!nome || !ragione) {
        return res.status(400).json({ message: 'Tutti i campi sono obbligatori!' });
    }

    // Creazione dell'oggetto utente
    const userData = { nome, ragione };

    // Legge il file JSON e aggiorna i dati
    fs.readFile('registrazioni.json', (err, data) => {
        let jsonData = [];
        if (!err) {
            try {
                jsonData = JSON.parse(data);
            } catch (error) {
                return res.status(500).json({ message: 'Errore nella lettura del database' });
            }
        }

        jsonData.push(userData);

        fs.writeFile('registrazioni.json', JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Errore durante la registrazione' });
            }
            res.status(200).json({ message: 'Registrazione completata con successo!' });
        });
    });
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});
