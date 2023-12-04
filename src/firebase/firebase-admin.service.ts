// src/services/firebase-admin.service.ts
import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseAdminService {
  private firebaseAdmin: admin.app.App;

  constructor() {
    const serviceAccount = JSON.parse(process.env.FIREBASE_JSON);

    if (!admin.apps.length) {
      this.firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      this.firebaseAdmin = admin.app();
    }
  }

  getAdmin() {
    return this.firebaseAdmin;
  }

}