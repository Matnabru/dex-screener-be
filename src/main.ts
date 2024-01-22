import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
dotenv.config();

async function bootstrap() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_JSON);
  if(!serviceAccount) throw new Error("Provide firebase service account in .env")
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
