import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Only initialize Firebase Admin if the service account env var is set
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error('Firebase Admin initialization error:', err.message);
    console.warn('⚠️  Firebase Admin not initialized — FIREBASE_SERVICE_ACCOUNT missing or invalid');
  }
}

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized — no token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return res.status(401).json({ message: 'Unauthorized — invalid or expired token' });
  }
};