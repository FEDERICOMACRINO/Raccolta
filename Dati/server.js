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

// Inizializza Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://database-cac4e-default-rtdb.firebaseio.com" // Sostituisci con il tuo URL Firestore
});

const db = admin.firestore();

// Servire i file statici
app.use(express.static(path.join(__dirname, "public")));

// Route per la registrazione
app.post("/register", async (req, res) => {
  const { nome, ragione } = req.body;

  if (!nome || !ragione) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori!" });
  }

  try {
    await db.collection("registrazioni").add({
      nome,
      ragione,
      timestamp: new Date()
    });
    res.status(200).json({ message: "Registrazione completata con successo!" });
  } catch (error) {
    console.error("Errore Firestore:", error);
    res.status(500).json({ message: "Errore durante la registrazione", error });
  }
});

// Route per ottenere le registrazioni salvate
app.get("/registrazioni", async (req, res) => {
  try {
    const snapshot = await db.collection("registrazioni").orderBy("timestamp", "desc").get();
    const registrazioni = snapshot.docs.map(doc => doc.data());
    res.status(200).json(registrazioni);
  } catch (error) {
    console.error("Errore Firestore:", error);
    res.status(500).json({ message: "Errore nel recupero delle registrazioni", error });
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
