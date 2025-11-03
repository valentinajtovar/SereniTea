import 'server-only';
import * as admin from 'firebase-admin';

type ServiceAccountLike = {
  project_id: string;
  client_email: string;
  private_key: string;
};

/**
 * Carga credenciales a partir de:
 * 1) FIREBASE_SERVICE_ACCOUNT_JSON (recomendado en Vercel)
 * 2) o variables sueltas (fallback): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
function loadCreds(): { projectId: string; clientEmail: string; privateKey: string } {
  const fromJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (fromJson) {
    try {
      const parsed = JSON.parse(fromJson) as ServiceAccountLike;
      if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON incompleto');
      }
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        // En Vercel los \n llegan escapados: normalizamos
        privateKey: parsed.private_key.replace(/\\n/g, '\n'),
      };
    } catch (e) {
      throw new Error(`No se pudo parsear FIREBASE_SERVICE_ACCOUNT_JSON: ${(e as Error).message}`);
    }
  }

  // Fallback por si prefieres 3 vars sueltas
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Faltan credenciales de Firebase Admin. Define FIREBASE_SERVICE_ACCOUNT_JSON o las 3: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }
  return { projectId, clientEmail, privateKey };
}

if (!admin.apps.length) {
  const { projectId, clientEmail, privateKey } = loadCreds();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export { admin };