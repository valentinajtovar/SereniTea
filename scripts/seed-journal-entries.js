
require('dotenv').config({ path: './.env.local' });
const { MongoClient } = require('mongodb');

// Datos de los usuarios a los que se les asignarán las entradas del diario
const users = [
    {
        firebaseUid: "dmzY0dJt4yRMMhwe78a5DD7DNd63",
        patientId: "68ec78b95efb56cc8bc99849"
    },
    {
        firebaseUid: "VVNNSWfurMRHN6kQsD4cfZdLkL62",
        patientId: "69001470d1fdaaf16ebbf823"
    }
];

// Entradas de diario de ejemplo
const journalEntries = [
    {
        firebaseUid: users[0].firebaseUid,
        patientId: users[0].patientId,
        mainEmotion: "Alegria",
        subEmotion: "Feliz",
        journal: "Hoy fue un día increíble. Recibí una buena noticia en el trabajo y me sentí muy valorado. Después, salí a caminar por el parque y el clima estaba perfecto. Pequeños momentos que suman mucho.",
        emotionEmoji: "😊",
        createdAt: new Date("2024-07-25T12:30:00Z"),
    },
    {
        firebaseUid: users[0].firebaseUid,
        patientId: users[0].patientId,
        mainEmotion: "Tristeza",
        subEmotion: "Melancólico",
        journal: "Me desperté sintiéndome un poco bajo de ánimos. Extraño a mi familia. A veces la distancia se siente más que otros días. Escuché música nostálgica, lo que probablemente no ayudó.",
        emotionEmoji: "😢",
        createdAt: new Date("2024-07-24T09:00:00Z"),
    },
    {
        firebaseUid: users[1].firebaseUid,
        patientId: users[1].patientId,
        mainEmotion: "Calma",
        subEmotion: "Relajado",
        journal: "Hoy me dediqué el día a mí. Medité por la mañana, leí un libro que tenía pendiente y me preparé una taza de té sin prisas. Necesitaba un día así para recargar energías. Me siento en paz.",
        emotionEmoji: "😌",
        createdAt: new Date("2024-07-23T18:00:00Z"),
    },
    {
        firebaseUid: users[1].firebaseUid,
        patientId: users[1].patientId,
        mainEmotion: "Enojo",
        subEmotion: "Frustrado",
        journal: "Tuve una discusión por un malentendido. Me sentí frustrado porque no lograba comunicar mi punto de vista. Aunque ya pasó, todavía siento un poco de tensión.",
        emotionEmoji: "😠",
        createdAt: new Date("2024-07-22T20:15:00Z"),
    }
];

async function seedJournalEntries() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("Error: MONGODB_URI no está definido en .env.local");
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Conectado a MongoDB Atlas");

        const database = client.db();
        const journalCollection = database.collection('journalentries'); // El nombre de la colección es usualmente el plural del modelo

        // IDs de los usuarios para la consulta
        const userFirebaseUids = users.map(u => u.firebaseUid);

        // Eliminar entradas existentes para estos usuarios para evitar duplicados
        const deleteResult = await journalCollection.deleteMany({ firebaseUid: { $in: userFirebaseUids } });
        console.log(`${deleteResult.deletedCount} entradas de diario existentes fueron eliminadas para los usuarios especificados.`);

        // Insertar las nuevas entradas de diario
        const insertResult = await journalCollection.insertMany(journalEntries);
        console.log(`${insertResult.insertedCount} nuevas entradas de diario han sido añadidas.`);

    } catch (error) {
        console.error("Error al cargar las entradas del diario en la base de datos:", error);
    } finally {
        await client.close();
        console.log("Conexión con MongoDB cerrada.");
    }
}

seedJournalEntries();
