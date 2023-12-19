import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseAdminService {
  private firebaseAdmin: admin.app.App;

  constructor() {
    try {
      const serviceAccount = process.env.FIREBASE_JSON ? JSON.parse(process.env.FIREBASE_JSON) : undefined;

      if (!serviceAccount) {
        //console.warn('Firebase service account key is not provided or is invalid');
        return;
      }

      if (!admin.apps.length) {
        this.firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        this.firebaseAdmin = admin.app();
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error; // Or handle this gracefully as needed
    }
  }

  getAdmin() {
    return this.firebaseAdmin;
  }

}
