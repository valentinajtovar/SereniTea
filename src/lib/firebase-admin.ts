// src/lib/firebase-admin.ts
import type { ServiceAccount } from 'firebase-admin';
import * as admin from 'firebase-admin';

// Evita re-inicializar en dev/hot reload
const globalAny = global as any;

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function parseServiceAccount(): ServiceAccount {
  // Viene como string JSON en Vercel
  const raw = required('FIREBASE_SERVICE_ACCOUNT_JSON');

  // Si ya viene como objeto en local, intenta parsear
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Si llega “mal escapado”, es preferible explotar explícitamente
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }

  // Asegura los saltos de línea en llave privada
  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return parsed;
}

if (!globalAny.__adminApp) {
  const creds = parseServiceAccount();
  globalAny.__adminApp = admin.initializeApp({
    credential: admin.credential.cert(creds),
  });
}

export const adminApp = globalAny.__adminApp as admin.app.App;
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
