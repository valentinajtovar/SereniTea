
const mongoose = require('mongoose');
const { Paciente } = require('../src/models/Paciente');
const { JournalEntry } = require('../src/models/JournalEntry');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dani:danicontra@cluster0.gowjicw.mongodb.net/mindful?retryWrites=true&w=majority';

const firebaseUid = "avVSbtakuGYuBqUH0ILWNIDeAmP2";

const sampleEntries = [
  {
    mainEmotion: 'Alegria',
    subEmotion: 'Feliz',
    journal: 'Hoy fue un día increíble. Me sentí muy productivo y con energía.',
    emotionEmoji: '😊',
  },
  {
    mainEmotion: 'Tristeza',
    subEmotion: 'Melancólico',
    journal: 'Me sentí un poco solo hoy. Extraño a mis amigos.',
    emotionEmoji: '😢',
  },
  {
    mainEmotion: 'Calma',
    subEmotion: 'Relajado',
    journal: 'Pasé la tarde leyendo un libro y me sentí muy en paz.',
    emotionEmoji: '😌',
  },
  {
    mainEmotion: 'Enojo',
    subEmotion: 'Frustrado',
    journal: 'Tuve un problema en el trabajo que me hizo sentir frustrado, pero pude resolverlo.',
    emotionEmoji: '😠',
  }
];

const generateEntries = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    const patient = await Paciente.findOne({ uid: firebaseUid });

    if (!patient) {
      console.log(`No se encontró al paciente con el UID: ${firebaseUid}`);
      return;
    }

    const entriesToInsert = sampleEntries.map(entry => ({
      ...entry,
      firebaseUid: patient.uid,
      patientId: patient._id,
      createdAt: new Date(),
    }));

    await JournalEntry.insertMany(entriesToInsert);
    console.log(`Se generaron ${entriesToInsert.length} entradas de diario para el paciente: ${patient.nombre}`);

  } catch (error) {
    console.error('Error al generar las entradas del diario:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
};

generateEntries();
