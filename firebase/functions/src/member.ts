import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  assertAuth,
  assertMember,
  validateSigner,
  validateName,
  validateDisplayName,
  validateEmail,
  validateUID,
  sendMail,
  convertTimestamp,
  Time,
} from './utils';
import { UserInterface } from './interfaces/User';
import {
  MemberInterface,
  RefInterface,
  DownlineInterface,
} from './interfaces/Member';
import { CommissionInterface } from './interfaces/Commission';

export const signUp = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const {
      name: inputName = '',
      displayName: inputDisplayName = '',
      email: inputEmail = '',
      referralID: inputReferralID = '',
      signature,
    } = data;
    const [name, displayName, email, referralID] = [
      inputName.trim(),
      inputDisplayName.trim(),
      inputEmail.trim().toLowerCase(),
      inputReferralID.trim(),
    ];

    const uid = assertAuth(context);
    await assertMember(uid, false);
    await validateSigner(uid, signature);

    if (!name)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Name is not provided.'
      );
    validateName(name);

    if (!displayName)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Display name is not provided.'
      );
    validateDisplayName(displayName);

    if (!email)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email is not provided.'
      );
    validateEmail(email);

    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);
    const memberRef = db.doc(`members/${uid}`);

    const update: {
      [key: string]: any;
    } = {};

    await db.runTransaction(async (t) => {
      const [user, member] = await Promise.all([
        t.get(userRef),
        t.get(memberRef),
      ]);

      if (member.exists)
        throw new functions.https.HttpsError(
          'already-exists',
          'Member already registered.'
        );
      if (!user.exists)
        throw new functions.https.HttpsError(
          'failed-precondition',
          'User does not exist.'
        );

      const {
        name: existingName,
        displayName: existingDisplayName,
        email: existingEmail,
        photoURL,
      } = user.data() as UserInterface;

      if (name !== existingName) {
        update.name = name;
      }

      if (displayName !== existingDisplayName) {
        const snapshot = await t.get(
          db
            .collection('users')
            .where('displayNameSlug', '==', displayName.toLowerCase())
            .limit(1)
        );
        if (!snapshot.empty)
          throw new functions.https.HttpsError(
            'already-exists',
            'Display name is taken.'
          );
        update.displayName = displayName;
        update.displayNameSlug = displayName.toLowerCase();
      }

      if (email !== existingEmail) {
        const snapshot = await t.get(
          db.collection('users').where('email', '==', email).limit(1)
        );
        if (!snapshot.empty)
          throw new functions.https.HttpsError(
            'already-exists',
            'Email is taken.'
          );
        update.email = email;
        update.emailVerified = false;
      }

      const memberUpdate: { [key: string]: any } = {
        uid,
        name: update.name || existingName,
        displayName: update.displayName || existingDisplayName,
        referralID: uid.slice(0, 10),
      };
      if (photoURL) memberUpdate.photoURL = photoURL;
      const referralIDPattern = /^0x[a-fA-F0-9]{8}$/;
      if (
        referralID &&
        referralIDPattern.test(referralID) &&
        !uid.startsWith(referralID)
      ) {
        const snapshot = await t.get(
          db
            .collection('members')
            .where('referralID', '==', referralID)
            .limit(1)
        );
        if (!snapshot.empty) {
          const referrer = snapshot.docs[0].data() as MemberInterface;
          memberUpdate.referredBy = {
            uid: referrer.uid,
            referralID,
            name: referrer.name,
            displayName: referrer.displayName,
          } as RefInterface;
          if (referrer.photoURL) {
            memberUpdate.referredBy.photoURL = referrer.photoURL;
          }
          const upline = referrer.upline || [];
          memberUpdate.upline = [...upline.slice(-8), referrer.uid];
        }
      }

      const now = admin.firestore.FieldValue.serverTimestamp();

      await Promise.all([
        t.update(userRef, {
          ...update,
          member: true,
          updatedAt: now,
        }),
        t.set(memberRef, {
          ...memberUpdate,
          joined: now,
          createdAt: now,
          updatedAt: now,
        }),
      ]);

      if (update.email) {
        const emailVerificationToken = db.collection('random').doc().id;
        await t.update(userRef, {
          emailVerificationToken,
          emailSent: now,
        });

        // Send verification email
        const emailVerificationURL = `${process.env.CLIENT_DOMAIN}/verify-email?t=${emailVerificationToken}`;
        await sendMail({
          to: email,
          subject: 'Verify your email',
          template: 'verify-email',
          'v:emailVerificationURL': emailVerificationURL,
        });
      }
    });

    return `Sign up successful.${
      update.email
        ? ' A verification link has been sent to ' + update.email + '.'
        : ''
    }`;
  });

export const onSignUp = functions
  .region('asia-southeast1')
  .firestore.document('members/{uid}')
  .onCreate(async (snapshot) => {
    const {
      uid,
      referralID,
      name,
      displayName,
      photoURL,
      referredBy,
      joined,
    } = snapshot.data() as MemberInterface;
    const auth = admin.auth();
    await auth.setCustomUserClaims(uid, { member: true });
    if (!referredBy) return;
    const update: DownlineInterface = {
      uid,
      referralID,
      name,
      displayName,
      joined,
    };
    if (photoURL) update.photoURL = photoURL;
    const db = admin.firestore();
    return db.doc(`members/${referredBy.uid}/downline/${uid}`).set(update);
  });

export const getMember = functions
  .region('asia-southeast1')
  .https.onCall(async (_, context) => {
    const { Big } = await import('big.js');
    const uid = assertAuth(context);
    await assertMember(uid);

    const db = admin.firestore();
    const memberRef = db.doc(`members/${uid}`);
    const [member, downline, commissions] = await Promise.all([
      memberRef.get(),
      memberRef.collection('downline').orderBy('joined', 'desc').get(),
      memberRef
        .collection('commissions')
        // .where('createdAt', '>=', Date.now() - Time.MONTH)
        .orderBy('createdAt', 'desc')
        .get(),
    ]);
    if (!member.exists) return null;
    const {
      upline,
      createdAt,
      updatedAt,
      ...rest
    } = member.data() as MemberInterface;
    const comm = commissions.docs.map((c) => c.data() as CommissionInterface);
    const now = Date.now();
    const [weeklyCommission, monthlyCommission] = [Time.WEEK, Time.MONTH].map(
      (t) => {
        const h = comm.filter((c) => c.createdAt.toMillis() >= now - t);
        return h.reduce(
          (a, b) => new Big(a).plus(b.amount.ito).round(3, 0).toNumber(),
          0
        );
      }
    );

    return {
      ...convertTimestamp(rest),
      downline: downline.docs.map((d) => convertTimestamp(d.data())),
      weeklyCommission,
      monthlyCommission,
    };
  });

export const getDownline = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { id } = data;

    const uid = assertAuth(context);
    await assertMember(uid);
    await validateUID(id);

    const db = admin.firestore();
    const snapshot = await db.doc(`members/${uid}/downline/${id}`).get();
    if (!snapshot.exists)
      throw new functions.https.HttpsError(
        'not-found',
        'No recruit by this ID.'
      );
    const recruit = snapshot.data() as DownlineInterface;

    const downline = await db
      .collection(`members/${id}/downline`)
      .orderBy('joined', 'desc')
      .get();
    return {
      ...convertTimestamp(recruit),
      downline: downline.docs.map((d) => convertTimestamp(d.data())),
    };
  });

export const onUserUpdate = functions
  .region('asia-southeast1')
  .firestore.document('users/{uid}')
  .onUpdate((change, context) => {
    const uid = context.params.uid;
    const { name, displayName, photoURL } = change.before.data();
    const {
      name: newName,
      displayName: newDisplayName,
      photoURL: newPhotoURL,
    } = change.after.data();
    const update: {
      [key: string]: any;
    } = {};
    if (name !== newName) update.name = newName;
    if (displayName !== newDisplayName) update.displayName = newDisplayName;
    if (photoURL !== newPhotoURL) update.photoURL = newPhotoURL;
    if (Object.keys(update).length === 0) return;

    const db = admin.firestore();
    const memberRef = db.doc(`members/${uid}`);
    return db.runTransaction(async (t) => {
      const member = await t.get(memberRef);
      if (!member.exists) return;
      const snapshot = await t.get(db.collection(`members/${uid}/downline`));
      const now = admin.firestore.FieldValue.serverTimestamp();
      const downlineUpdate = snapshot.docs.map((d) => {
        const data: {
          [key: string]: any;
        } = { updatedAt: now };
        if (update.name) data['referredBy.name'] = update.name;
        if (update.displayName)
          data['referredBy.displayName'] = update.displayName;
        if (update.photoURL) data['referredBy.photoURL'] = update.photoURL;
        return t.update(db.doc(`members/${d.id}`), data);
      });
      const promises = [
        t.update(memberRef, { ...update, updatedAt: now }),
        ...downlineUpdate,
      ];
      const { referredBy } = member.data() as MemberInterface;
      if (referredBy)
        promises.push(
          t.update(db.doc(`members/${referredBy.uid}/downline/${uid}`), update)
        );
      await Promise.all(promises);
    });
  });
