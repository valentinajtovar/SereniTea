import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function testConnection() {
	try {
		const querySnapshot = await getDocs(collection(db, "test"));
		console.log("Conexión exitosa. Documentos encontrados:", querySnapshot.size);
	} catch (error) {
		console.error("Error de conexión a Firebase:", error);
	}
}

testConnection();

