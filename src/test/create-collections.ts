import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "@/lib/firebase"; // Usa tu configuración existente

const db = getFirestore(app);

// Crear usuario
async function crearUsuario() {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      name: "Laura",
      email: "laura@email.com",
      role: "paciente"
    });
    console.log("Usuario creado con ID:", docRef.id);
  } catch (e) {
    console.error("Error al crear usuario:", e);
  }
}

// Crear tarea
async function crearTarea() {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      title: "Completar registro",
      status: "pendiente",
      userId: "ID_DEL_USUARIO" // Relaciona la tarea con el usuario
    });
    console.log("Tarea creada con ID:", docRef.id);
  } catch (e) {
    console.error("Error al crear tarea:", e);
  }
}

crearUsuario();
crearTarea();