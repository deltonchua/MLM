import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  assertAuth,
  assertMember,
  convertTimestamp,
  validateAddress,
  validateSigner,
} from './utils';
import { MemberInterface } from './interfaces/Member';
import { MIN_PAYOUT, DEFAULT_ITO_PRICE } from './interfaces/Commission';

export const payout = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const axios = (await import('axios')).default;
    const { Big } = await import('big.js');
    const { address, amount, signature } = data;

    const uid = assertAuth(context);
    await assertMember(uid);
    await validateSigner(uid, signature);

    if (!address)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Payout address is not provided.'
      );
    const checksumAddress = await validateAddress(address);

    if (!amount)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Payout amount is not provided.'
      );
    if (!parseFloat(amount))
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Invalid payout amount.'
      );
    const ITO = new Big(amount).round(3, 0).toNumber();
    if (ITO < MIN_PAYOUT)
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Minimum payout amount is ${MIN_PAYOUT} ITO.`
      );

    const db = admin.firestore();
    const memberRef = db.doc(`members/${uid}`);
    const payoutRef = memberRef.collection('payout').doc();

    await db.runTransaction(async (t) => {
      const member = await t.get(memberRef);
      const {
        availablePayout = 0,
        totalPayout = 0,
      } = member.data() as MemberInterface;
      if (ITO > availablePayout)
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Insufficient commission.'
        );

      let ITOPrice = DEFAULT_ITO_PRICE;
      try {
        const res = await axios.get(
          'https://api.ampmcx.com/api/v1/ticker/ITO_USDT'
        );
        const { lastPrice } = res.data.data.ticker;
        ITOPrice = lastPrice;
      } catch (err) {
        functions.logger.error(err);
      }
      const USD = new Big(ITO).times(ITOPrice).round(2, 0).toNumber();

      const now = admin.firestore.FieldValue.serverTimestamp();
      await Promise.all([
        t.update(memberRef, {
          availablePayout: new Big(availablePayout)
            .minus(ITO)
            .round(3, 0)
            .toNumber(),
          totalPayout: new Big(totalPayout).plus(ITO).round(3, 0).toNumber(),
          // availablePayout: admin.firestore.FieldValue.increment(-ITO),
          // totalPayout: admin.firestore.FieldValue.increment(ITO),
          lastPayout: now,
          updatedAt: now,
        } as MemberInterface),
        t.set(payoutRef, {
          address: checksumAddress,
          amount: { usd: USD, ito: ITO },
          status: 'pending',
          txID: 'PENDING',
          createdAt: now,
          updatedAt: now,
        }),
      ]);
    });

    return 'Payout request submitted.';
  });

export const getPayoutHistory = functions
  .region('asia-southeast1')
  .https.onCall(async (_, context) => {
    const uid = assertAuth(context);
    await assertMember(uid);
    const db = admin.firestore();
    const snapshot = await db
      .collection(`members/${uid}/payout`)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((s) => convertTimestamp(s.data()));
  });
