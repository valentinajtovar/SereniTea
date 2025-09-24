import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// --- CONFIGURACIÓN DE FIREBASE ---
// ¡IMPORTANTE! Pega aquí la configuración de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- INICIALIZACIÓN DE FIREBASE ---
console.log("🚀 Inicializando la app de Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- LECTURA DEL ARCHIVO JSON ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Ajusta la ruta para que apunte al archivo JSON en la raíz del proyecto
const jsonPath = resolve(__dirname, '../journal_entries_seed.json');
const entries = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// --- FUNCIÓN DE IMPORTACIÓN ---
async function importEntries() {
  console.log(`🌱 Empezando la importación de ${entries.length} registros desde journal_entries_seed.json...`);
  
  const entriesCollection = collection(db, 'journal_entries');

  for (const entry of entries) {
    try {
      // Convierte el objeto de fecha del JSON a un Timestamp de Firestore
      const firestoreTimestamp = new Timestamp(entry.createdAt._seconds, entry.createdAt._nanoseconds);
      
      const docToCreate = {
          userId: entry.userId,
          mainEmotion: entry.mainEmotion,
          subEmotion: entry.subEmotion,
          journal: entry.journal,
          emotionEmoji: entry.emotionEmoji,
          createdAt: firestoreTimestamp,
      };

      await addDoc(entriesCollection, docToCreate);
      console.log(`✅ Registro de '${entry.mainEmotion}' importado correctamente.`);

    } catch (error) {
      console.error(`❌ Error importando el registro de '${entry.mainEmotion}':`, error);
    }
  }

  console.log('\n✨ ¡Importación completada! ✨');
  // Es importante salir del proceso para que el script no se quede colgado
  process.exit(0);
}

// --- EJECUTAR LA FUNCIÓN ---
importEntries();
