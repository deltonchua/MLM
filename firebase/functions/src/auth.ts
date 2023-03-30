import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateSignature } from './utils';

export const signIn = functions
  .region('asia-southeast1')
  .https.onCall(async (data) => {
    const checksumAddress = await validateSignature(data);
    const auth = admin.auth();
    const customToken = await auth.createCustomToken(checksumAddress);
    return customToken;
  });

// interface AuthInterface {
//   uid: string;
//   displayName: string | null;
//   photoURL: string | null;
//   email: string | null;
//   emailVerified: boolean;
//   phoneNumber: string | null;
// }
