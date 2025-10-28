
require('dotenv').config({ path: './.env.local' });
const { MongoClient } = require('mongodb');

const recommendedTasks = [
    // Alegría
    { mainEmotion: "Alegria", title: "Escribir un diario de gratitud", description: "Anota 3 cosas por las que te sientes agradecido hoy." },
    { mainEmotion: "Alegria", title: "Bailar con tu playlist favorita", description: "Escucha tu música preferida y baila sin juzgarte." },
    { mainEmotion: "Alegria", title: "Comparte una buena noticia", description: "Llama o envía un mensaje a alguien para contarle algo agradable que te pasó." },
    { mainEmotion: "Alegria", title: "Paseo consciente", description: "Sal a caminar disfrutando conscientemente del entorno (colores, sonidos, temperatura)." },
    { mainEmotion: "Alegria", title: "Crea tu caja de alegría", description: "Guarda recuerdos o notas que te hagan sonreír en una caja especial." },
    // Calma
    { mainEmotion: "Calma", title: "Meditación de 10 minutos", description: "Enfócate en tu respiración o en sensaciones corporales." },
    { mainEmotion: "Calma", title: "Disfruta de una bebida caliente", description: "Prepara un té o cacao y tómalo lentamente, notando su aroma y sabor." },
    { mainEmotion: "Calma", title: "Estiramientos suaves o yoga", description: "Practica con música tranquila para relajar tu cuerpo." },
    { mainEmotion: "Calma", title: "Dibuja o pinta libremente", description: "Crea mandalas u otro tipo de arte sin juzgar el resultado." },
    { mainEmotion: "Calma", title: "Lee algo inspirador", description: "Busca un fragmento de un libro o poema que te inspire serenidad." },
    // Sorpresa
    { mainEmotion: "Sorpresa", title: "Explora algo nuevo", description: "Haz una lista de cosas que te gustaría aprender y elige una para empezar a explorar." },
    { mainEmotion: "Sorpresa", title: "Observa con ojos nuevos", description: "Busca 3 detalles en un lugar conocido que nunca habías notado antes." },
    { mainEmotion: "Sorpresa", title: "Escribe sobre lo inesperado", description: "Reflexiona sobre algo que te sorprendió hoy y qué aprendiste de ello." },
    { mainEmotion: "Sorpresa", title: "Descubre nueva música", description: "Escucha un género musical o artista que nunca hayas probado." },
    { mainEmotion: "Sorpresa", title: "Actividad espontánea", description: "Camina por una ruta diferente o prueba una receta nueva sin presión por el resultado." },
    // Tristeza
    { mainEmotion: "Tristeza", title: "Permítete sentir sin juzgar", description: "Escribe una carta a tus emociones sin editarla." },
    { mainEmotion: "Tristeza", title: "Ducha consciente", description: "Imagina que el agua fluye llevándose tus emociones." },
    { mainEmotion: "Tristeza", title: "Respiración profunda", description: "Realiza respiraciones con una mano en el pecho y otra en el abdomen." },
    { mainEmotion: "Tristeza", title: "Música para acompañar tu ánimo", description: "Escucha música que valide tu estado de ánimo y te permita soltar." },
    { mainEmotion: "Tristeza", title: "Busca confort físico", description: "Abrázate a algo suave o envuélvete en una manta para sentirte cómodo." },
    // Enojo
    { mainEmotion: "Enojo", title: "Libera la tensión físicamente", description: "Escribe lo que sientes en un papel y luego rómpelo o quémalo." },
    { mainEmotion: "Enojo", title: "Técnica de respiración para calmar", description: "Inhala por 4 segundos, retén 7 y exhala en 8 para calmar la tensión." },
    { mainEmotion: "Enojo", title: "Descarga la energía", description: "Toma una almohada o peluche y estrujalo para liberar energía." },
    { mainEmotion: "Enojo", title: "Identifica tus límites", description: "Piensa qué límites se cruzaron y cómo podrías expresarlos asertivamente." },
    { mainEmotion: "Enojo", title: "Dibuja o garabatea libremente", description: "Usa el arte como una forma de soltar energía sin usar palabras." },
];

async function seedRecommendedTasks() {
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
    const tasksCollection = database.collection('recommendedtasks');

    await tasksCollection.deleteMany({});
    console.log("Tareas recomendadas existentes eliminadas.");

    const result = await tasksCollection.insertMany(recommendedTasks);
    console.log(`${result.insertedCount} tareas recomendadas han sido añadidas a la colección 'recommendedtasks'.`);

  } catch (error) {
    console.error("Error al sembrar las tareas recomendadas:", error);
  } finally {
    await client.close();
    console.log("Conexión cerrada.");
  }
}

seedRecommendedTasks();
