import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

let isInitialized = false;

export function initializeFirebase(): void {
  if (isInitialized || admin.apps.length > 0) return;

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      logger.warn('FIREBASE_SERVICE_ACCOUNT not set - Firebase Auth will be unavailable');
      return;
    }

    let serviceAccount: admin.ServiceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch {
      logger.error('FIREBASE_SERVICE_ACCOUNT must be a valid JSON string');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    isInitialized = true;
    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Firebase Admin initialization error:', error);
  }
}

export function getFirebaseAdmin(): typeof admin | null {
  if (!isInitialized) initializeFirebase();
  if (admin.apps.length === 0) return null;
  return admin;
}

export default admin;

