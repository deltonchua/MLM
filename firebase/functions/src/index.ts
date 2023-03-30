import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export { signIn } from './auth';
export {
  getUser,
  lookupDisplayName,
  updateName,
  updateEmail,
  sendVerificationEmail,
  verifyEmail,
  uploadPhoto,
  onUploadPhoto,
} from './user';
export {
  signUp,
  onSignUp,
  getMember,
  getDownline,
  onUserUpdate,
} from './member';
export {
  checkout,
  onPaymentSucceeded,
  stripeWebhook,
  getPaymentHistory,
} from './stripe';
export { onCommission, getCommissionHistory } from './commission';
export { payout, getPayoutHistory } from './payout';

export const generateRandomId = functions
  .region('asia-southeast1')
  .https.onCall(() => {
    return admin.firestore().collection('random').doc().id;
  });

// export const tallyCommissionDaily = functions
//   .region('asia-southeast1')
//   .pubsub.schedule('00***')
//   .onRun(async (_) => {
//     const db = admin.firestore();
//     const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
//     const snapshot = await db
//       .collection('commission')
//       .where('createdAt', '>=', oneMonthAgo)
//       .get();
//   });
