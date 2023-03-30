import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { assertAuth, assertMember, convertTimestamp } from './utils';
import { CommissionInterface } from './interfaces/Commission';
import { MemberInterface } from './interfaces/Member';

export const onCommission = functions
  .region('asia-southeast1')
  .firestore.document('members/{uid}/commissions/{id}')
  .onCreate(async (snapshot, context) => {
    const { Big } = await import('big.js');
    const uid = context.params.uid;
    const { amount } = snapshot.data() as CommissionInterface;
    const ITO = amount.ito;
    const db = admin.firestore();
    const memberRef = db.doc(`members/${uid}`);
    return db.runTransaction(async (t) => {
      const member = await t.get(memberRef);
      const {
        totalCommission = 0,
        availablePayout = 0,
      } = member.data() as MemberInterface;
      const now = admin.firestore.FieldValue.serverTimestamp();
      await t.update(memberRef, {
        totalCommission: new Big(totalCommission)
          .plus(ITO)
          .round(3, 0)
          .toNumber(),
        availablePayout: new Big(availablePayout)
          .plus(ITO)
          .round(3, 0)
          .toNumber(),
        updatedAt: now,
      });
    });
    // return db.doc(`members/${uid}`).update({
    //   totalCommission: admin.firestore.FieldValue.increment(amountInITO),
    //   availablePayout: admin.firestore.FieldValue.increment(amountInITO),
    //   updatedAt: now,
    // });
  });

export const getCommissionHistory = functions
  .region('asia-southeast1')
  .https.onCall(async (_, context) => {
    const uid = assertAuth(context);
    await assertMember(uid);

    const db = admin.firestore();
    const snapshot = await db
      .collection(`members/${uid}/commissions`)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((s) => convertTimestamp(s.data()));
  });
