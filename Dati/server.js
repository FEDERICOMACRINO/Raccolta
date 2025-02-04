const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000; // Usa la porta fornita da Render o 3000 come fallback

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Inizializza Firebase Admin SDK con il Realtime Database
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://database-cac4e-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Servire i file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, "public")));

// Route per la registrazione (scrittura su Realtime Database)
app.post("/register", async (req, res) => {
  const { nome, ragione } = req.body;
  
  if (!nome || !ragione) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori!" });
  }

  try {
    // Scrive un nuovo record sotto il nodo "registrazioni"
    const ref = db.ref("registrazioni");
    await ref.push({
      nome,
      ragione,
      timestamp: new Date().toISOString()
    });
    res.status(200).json({ message: "Registrazione completata con successo!" });
  } catch (error) {
    console.error("Errore nel Realtime Database:", error);
    res.status(500).json({ message: "Errore durante la registrazione", error });
  }
});

// Route per ottenere le registrazioni salvate (lettura dal Realtime Database)
app.get("/registrazioni", async (req, res) => {
  try {
    const ref = db.ref("registrazioni");
    ref.orderByChild("timestamp").once("value", (snapshot) => {
      const data = snapshot.val();
      // Converte l'oggetto restituito in un array
      const registrazioni = [];
      for (let key in data) {
        registrazioni.push(data[key]);
      }
      // Ordina le registrazioni in ordine decrescente di timestamp
      registrazioni.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.status(200).json(registrazioni);
    });
  } catch (error) {
    console.error("Errore nel Realtime Database:", error);
    res.status(500).json({ message: "Errore nel recupero delle registrazioni", error });
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
