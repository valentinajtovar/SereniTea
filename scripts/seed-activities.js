const fs = require('fs');
const path = require('path');
const dotenvPath = fs.existsSync(path.resolve('.env.local'))
  ? '.env.local'
  : '.env';
require('dotenv').config({ path: dotenvPath });   // 👈 CARGA .env.local

console.log('dotenv file:', dotenvPath);
console.log('MONGODB_URI?', process.env.MONGODB_URI ? 'OK' : 'MISSING');
console.log('MONGODB_DB?', process.env.MONGODB_DB || '(no definido)');

const { MongoClient } = require('mongodb');

function normCity(s) {
  return (s || '').toLocaleLowerCase();
}

async function run() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    console.error('❌ MONGODB_URI no está definido');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  // Si MONGODB_DB no está, usa el de la URI; si tampoco, caerá en "test"
  const db = client.db(dbName);
  console.log('✅ Conectado a Mongo');
  console.log('➡️  Usando base de datos:', db.databaseName);

  const col = db.collection('discover_activities');

  // Índices idempotentes
  await col.createIndex({ cityNorm: 1 });
  await col.createIndex({ tags: 1 });
  await col.createIndex({ moods: 1 });
  await col.createIndex({ createdAt: -1 });

  const now = new Date();

  // === 20 actividades (5 por ciudad) ===
  const docs = [
    // Bogotá
    { title: 'Mindfulness bajo los árboles en El Virrey', city: 'Bogotá',
      description: 'Práctica guiada de respiración 4-7-8 y exploración sensorial.',
      tags: ['mindfulness','naturaleza','respiración'], moods: ['ansiedad','estrés','triste'],
      durationMin: 45, where: 'Parque El Virrey', when: 'Sábados 9:00 am', organizer: 'Serenitea Labs' },
    { title: 'Journaling y té al atardecer', city: 'Bogotá',
      description: 'Escritura libre guiada + té herbal para integración emocional.',
      tags: ['journaling','reflexión','autoconocimiento'], moods: ['triste','neutral','ansiedad'],
      durationMin: 60, where: 'Mirador de La Calera', when: 'Viernes 5:30 pm', organizer: 'Serenitea Labs' },
    { title: 'Caminata consciente por senderos urbanos', city: 'Bogotá',
      description: 'Caminata lenta con anclajes sensoriales y observación.',
      tags: ['naturaleza','ejercicio','atención_plena'], moods: ['estrés','neutral'],
      durationMin: 50, where: 'Quebrada La Vieja (inicial)', when: 'Domingos 8:00 am', organizer: 'Serenitea Labs' },
    { title: 'Taller creativo de collage emocional', city: 'Bogotá',
      description: 'Exploración artística de identidad emocional.',
      tags: ['arte','creatividad','autoconocimiento'], moods: ['triste','neutral'],
      durationMin: 90, where: 'MAMBO', when: 'Sábados 3:00 pm', organizer: 'Serenitea Labs' },
    { title: 'Yoga suave para liberar tensión', city: 'Bogotá',
      description: 'Secuencia lenta para espalda alta + respiración diafragmática.',
      tags: ['yoga','respiración','movimiento'], moods: ['ansiedad','estrés'],
      durationMin: 60, where: 'Centro Cultural GGM', when: 'Martes 7:00 am', organizer: 'Serenitea Labs' },

    // Medellín
    { title: 'Caminata consciente por el Arví', city: 'Medellín',
      description: 'Ruta suave con pausas de respiración y observación.',
      tags: ['naturaleza','ejercicio','respiración'], moods: ['estrés','ansiedad'],
      durationMin: 70, where: 'Parque Arví (entrada)', when: 'Domingos 8:00 am', organizer: 'Serenitea Labs' },
    { title: 'Acuarela: emociones en color', city: 'Medellín',
      description: 'Uso de color y agua para procesar emociones.',
      tags: ['arte','creatividad'], moods: ['triste','neutral'],
      durationMin: 90, where: 'MAMM', when: 'Sábados 2:00 pm', organizer: 'Serenitea Labs' },
    { title: 'Yoga restaurativo', city: 'Medellín',
      description: 'Relajación profunda y liberación miofascial.',
      tags: ['yoga','relajación','movimiento'], moods: ['ansiedad','estrés'],
      durationMin: 75, where: 'El Poblado - Yoga Interior', when: 'Martes 7:30 pm', organizer: 'Serenitea Labs' },
    { title: 'Música y respiración', city: 'Medellín',
      description: 'Exploración sonora + respiración guiada.',
      tags: ['música','sensorial','respiración'], moods: ['estrés','triste'],
      durationMin: 60, where: 'Casa de la Música', when: 'Viernes 6:00 pm', organizer: 'Serenitea Labs' },
    { title: 'Club de lectura reflexiva', city: 'Medellín',
      description: 'Lectura compartida y conversación honesta.',
      tags: ['lectura','reflexión','social'], moods: ['neutral','triste'],
      durationMin: 90, where: 'Biblioteca Pública Piloto', when: 'Domingos 4:00 pm', organizer: 'Serenitea Labs' },

    // Cali
    { title: 'Yoga y respiración al amanecer', city: 'Cali',
      description: 'Movimiento lento + respiración profunda con vista a la ciudad.',
      tags: ['yoga','respiración','movimiento'], moods: ['ansiedad','estrés'],
      durationMin: 60, where: 'Cerro de las Tres Cruces (base)', when: 'Sábados 6:30 am', organizer: 'Serenitea Labs' },
    { title: 'Caminata suave por senderos verdes', city: 'Cali',
      description: 'Recorrido ligero con pausas sensoriales.',
      tags: ['naturaleza','ejercicio','atención_plena'], moods: ['neutral','estrés'],
      durationMin: 50, where: 'Farallones (entrada controlada)', when: 'Domingos 8:00 am', organizer: 'Serenitea Labs' },
    { title: 'Danza libre para soltar emoción', city: 'Cali',
      description: 'Movimiento expresivo para liberar tensión.',
      tags: ['danza','movimiento','expresión'], moods: ['triste','ansiedad','estrés'],
      durationMin: 75, where: 'Casa Cultural La Merced', when: 'Viernes 7:00 pm', organizer: 'Serenitea Labs' },
    { title: 'Meditación con cuencos tibetanos', city: 'Cali',
      description: 'Relajación profunda por vibración sonora.',
      tags: ['meditación','relajación','sonido'], moods: ['ansiedad','triste'],
      durationMin: 45, where: 'Centro Cultural de Cali', when: 'Domingos 5:00 pm', organizer: 'Serenitea Labs' },
    { title: 'Grupo de escritura para autocuidado', city: 'Cali',
      description: 'Ejercicios cortos de escritura guiada.',
      tags: ['journaling','reflexión','autoconocimiento'], moods: ['triste','neutral'],
      durationMin: 80, where: 'Biblioteca Jorge Garcés', when: 'Sábados 11:00 am', organizer: 'Serenitea Labs' },

    // Barranquilla
    { title: 'Respiración oceánica al amanecer', city: 'Barranquilla',
      description: 'Respiración diafragmática frente al mar para calmar la mente.',
      tags: ['respiración','naturaleza','mindfulness'], moods: ['ansiedad','estrés'],
      durationMin: 40, where: 'Malecón del Río (costera)', when: 'Sábados 6:00 am', organizer: 'Serenitea Labs' },
    { title: 'Círculo de conversación y apoyo', city: 'Barranquilla',
      description: 'Espacio seguro para compartir experiencias.',
      tags: ['social','reflexión','comunidad'], moods: ['triste','neutral'],
      durationMin: 90, where: 'Biblioteca Piloto del Caribe', when: 'Domingos 3:00 pm', organizer: 'Serenitea Labs' },
    { title: 'Taller de tejido y calma', city: 'Barranquilla',
      description: 'Actividad manual repetitiva para inducir relajación.',
      tags: ['manualidades','relajación','paciencia'], moods: ['ansiedad','estrés','triste'],
      durationMin: 80, where: 'Casa Cultural Barrio Abajo', when: 'Miércoles 4:00 pm', organizer: 'Serenitea Labs' },
    { title: 'Danza caribe para liberar energía', city: 'Barranquilla',
      description: 'Movimiento libre con ritmos afrocaribeños.',
      tags: ['danza','expresión','energía'], moods: ['neutral','triste','ansiedad'],
      durationMin: 60, where: 'Escuela Distrital de Arte', when: 'Viernes 7:30 pm', organizer: 'Serenitea Labs' },
    { title: 'Meditación guiada con viento y costa', city: 'Barranquilla',
      description: 'Meditación sensorial con sonido del viento y oleaje.',
      tags: ['meditación','sensorial','naturaleza'], moods: ['triste','estrés'],
      durationMin: 45, where: 'Bocas de Ceniza (zona segura)', when: 'Domingos 7:30 am', organizer: 'Serenitea Labs' },
  ].map(d => ({
    ...d,
    cityNorm: normCity(d.city),
    createdAt: now,
    updatedAt: now,
  }));

  // Upsert por (title, cityNorm)
  let upserts = 0;
  for (const d of docs) {
    const r = await col.updateOne(
      { title: d.title, cityNorm: d.cityNorm },
      { $set: d },
      { upsert: true }
    );
    if (r.upsertedId || r.modifiedCount) upserts++;
  }

  const count = await col.countDocuments();
  console.log(`✅ Seed completo. Docs en colección: ${count} (upserts en esta corrida: ${upserts})`);

  await client.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed falló:', err);
  process.exit(1);
});