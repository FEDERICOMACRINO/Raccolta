const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const serviceAccountPath = '/etc/secrets/clienti';
if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ Il file delle credenziali non esiste:", serviceAccountPath);
    process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://clienti-4d59f-default-rtdb.firebaseio.com/"
});
const db = admin.database();

app.post("/register", async (req, res) => {
    const { nome, ragione, indirizzo, telefono, giaCliente } = req.body;
    if (!nome || !ragione || !indirizzo || !telefono) {
        return res.status(400).json({ message: "Tutti i campi sono obbligatori!" });
    }
    try {
        const ref = db.ref("registrazioni");
        await ref.push({
            nome,
            ragione,
            indirizzo,
            telefono,
            giaCliente,
            timestamp: new Date().toISOString()
        });
        res.status(200).json({ message: "Registrazione completata con successo!" });
    } catch (error) {
        console.error("Errore nel Realtime Database:", error);
        res.status(500).json({ message: "Errore durante la registrazione", error });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server in ascolto sulla porta ${PORT}`);
});
