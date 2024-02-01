import admin from 'firebase-admin';
import dotenv from 'dotenv';


dotenv.config();


const serviceAccountContent = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountContent)
  });

export const verifyToken = async (req, res, next) => {
    let idToken;
  const authHeader = req.headers.Authorization || req.headers.authorization;
  if(authHeader){
    idToken =authHeader.split(" ")[1];
    console.log(`token is : ${idToken}`);
    try {
       const decodedToken = await admin.auth().verifyIdToken(idToken);
       if(decodedToken){
         req.user = decodedToken;
          return next();
       }else{
           res.status(401).json({message: 'Unauthorized'})
       }
    } catch (error) {
      console.error('Firebase Auth Error:', error);
    }
  }
};
