
require('dotenv').config({ path: './.env.local' });
const { MongoClient } = require('mongodb');

// Lista de pacientes a corregir
const patientsToFix = [
    {
        email: "mongo@gmail.com",
        correctUid: "dmzY0dJt4yRMMhwe78a5DD7DNd63"
    },
    {
        email: "valentina@gmail.com",
        correctUid: "VVNNSWfurMRHN6kQsD4cfZdLkL62"
    }
];

async function fixPatientUids() {
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
        const patientsCollection = database.collection('pacientes');

        for (const patient of patientsToFix) {
            console.log(`Buscando paciente con correo: ${patient.email}`);
            
            const filter = { correo: patient.email };
            const update = { $set: { firebaseUid: patient.correctUid } };

            const result = await patientsCollection.updateOne(filter, update);

            if (result.matchedCount === 0) {
                console.log(` -> No se encontró paciente con el correo ${patient.email}. No se realizaron cambios.`);
            } else if (result.modifiedCount === 0) {
                console.log(` -> Paciente encontrado, pero el firebaseUid ya era correcto. No se realizaron cambios.`);
            } else {
                console.log(` -> ¡Éxito! Se ha corregido el firebaseUid para ${patient.email}.`);
            }
        }

    } catch (error) {
        console.error("Error durante el proceso de corrección:", error);
    } finally {
        await client.close();
        console.log("\nProceso finalizado. Conexión con MongoDB cerrada.");
    }
}

fixPatientUids();
