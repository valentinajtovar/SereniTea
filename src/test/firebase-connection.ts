import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function verificarConexion() {
  try {
    const querySnapshot = await getDocs(collection(db, "user"));
    querySnapshot.forEach((doc) => {
      console.log("Documento encontrado:", doc.id, doc.data());
    });
    console.log("Conexión exitosa. Total documentos:", querySnapshot.size);
  } catch (error) {
    console.error("Error de conexión a Firestore:", error);
  }
}

verificarConexion();