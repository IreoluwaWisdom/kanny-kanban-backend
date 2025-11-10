import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
    }

    let serviceAccount: admin.ServiceAccount;
    
    try {
      // Try parsing as JSON string
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT must be a valid JSON string');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

export default admin;
