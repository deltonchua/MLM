import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  assertAuth,
  validateName,
  validateDisplayName,
  validateEmail,
  validateAutoID,
  validateImage,
  sendMail,
  convertTimestamp,
  Time,
} from './utils';
import { UserInterface } from './interfaces/User';

// export const onCreateUser = functions
//   .region('asia-southeast1')
//   .auth.user()
//   .onCreate((user) => {
//     const { uid } = user;
//     const db = admin.firestore();
//     const now = admin.firestore.FieldValue.serverTimestamp();
//     return db.doc(`users/${uid}`).set({
//       uid,
//       createdAt: now,
//       updatedAt: now,
//     });
//   });

export const getUser = functions
  .region('asia-southeast1')
  .https.onCall(async (_, context) => {
    const uid = assertAuth(context);
    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);
    const user = await userRef.get();
    if (!user.exists) {
      const now = admin.firestore.FieldValue.serverTimestamp();
      const data = {
        uid,
        createdAt: now,
        updatedAt: now,
      };
      await userRef.set(data);
      return convertTimestamp(data);
    }
    const { createdAt, updatedAt, ...rest } = user.data() as UserInterface;
    return convertTimestamp(rest);
  });

export const lookupDisplayName = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { displayName: inputDisplayName = '' } = data;
    const displayName = inputDisplayName.trim();
    const uid = assertAuth(context);
    validateDisplayName(displayName);
    const db = admin.firestore();
    const snapshot = await db
      .collection('users')
      .where('displayNameSlug', '==', displayName.toLowerCase())
      .limit(1)
      .get();
    return !snapshot.empty && snapshot.docs[0].id !== uid
      ? 'Display name is taken.'
      : 'Display name is available.';
  });

export const updateName = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { name: inputName = '', displayName: inputDisplayName = '' } = data;
    const [name, displayName] = [inputName.trim(), inputDisplayName.trim()];
    const uid = assertAuth(context);

    if (!name && !displayName)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Name and display name not provided.'
      );
    if (name) validateName(name);
    if (displayName) validateDisplayName(displayName);

    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);

    await db.runTransaction(async (t) => {
      const user = await t.get(userRef);
      if (!user.exists)
        throw new functions.https.HttpsError(
          'failed-precondition',
          'User does not exist.'
        );

      const {
        name: existingName,
        displayName: existingDisplayName,
      } = user.data() as UserInterface;

      const update: {
        [key: string]: any;
      } = {};

      if (name && name !== existingName) {
        update.name = name;
      }

      if (displayName && displayName !== existingDisplayName) {
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

      if (Object.keys(update).length === 0)
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Nothing to update.'
        );

      const now = admin.firestore.FieldValue.serverTimestamp();
      await t.update(userRef, { ...update, updatedAt: now });
    });

    return 'Update successful.';
  });

export const updateEmail = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { email: inputEmail = '' } = data;
    const email = inputEmail.trim().toLowerCase();
    const uid = assertAuth(context);

    if (!email)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email is not provided.'
      );
    validateEmail(email);

    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);

    await db.runTransaction(async (t) => {
      const user = await t.get(userRef);
      if (!user.exists)
        throw new functions.https.HttpsError(
          'failed-precondition',
          'User does not exist.'
        );

      const { email: existingEmail } = user.data() as UserInterface;
      if (email === existingEmail)
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Nothing to update.'
        );

      const snapshot = await t.get(
        db.collection('users').where('email', '==', email).limit(1)
      );
      if (!snapshot.empty)
        throw new functions.https.HttpsError(
          'already-exists',
          'Email is taken.'
        );

      const emailVerificationToken = db.collection('random').doc().id;
      const now = admin.firestore.FieldValue.serverTimestamp();
      await t.update(userRef, {
        email,
        emailVerified: false,
        emailVerificationToken,
        emailSent: now,
        updatedAt: now,
      });

      // Send verification email
      const emailVerificationURL = `${process.env.CLIENT_DOMAIN}/verify-email?t=${emailVerificationToken}`;
      await sendMail({
        to: email,
        subject: 'Verify your email',
        template: 'verify-email',
        'v:emailVerificationURL': emailVerificationURL,
      });
    });

    return `Update successful. A verification link has been sent to ${email}.`;
  });

export const sendVerificationEmail = functions
  .region('asia-southeast1')
  .https.onCall(async (_, context) => {
    const uid = assertAuth(context);
    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);
    const user = await userRef.get();
    if (!user.exists)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User does not exist.'
      );

    const { email, emailSent, emailVerified } = user.data() as UserInterface;
    if (!email)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email is not set.'
      );
    validateEmail(email);
    if (emailVerified)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email has been verified.'
      );
    if (emailSent && emailSent.toMillis() + Time.MINUTE > Date.now())
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Verification email has been sent less than a minute ago.'
      );

    const emailVerificationToken = db.collection('random').doc().id;
    const now = admin.firestore.FieldValue.serverTimestamp();
    await userRef.update({
      emailVerificationToken,
      emailSent: now,
      updatedAt: now,
    });

    // Send verification email
    const emailVerificationURL = `${process.env.CLIENT_DOMAIN}/verify-email?t=${emailVerificationToken}`;
    await sendMail({
      to: email,
      subject: 'Verify your email',
      template: 'verify-email',
      'v:emailVerificationURL': emailVerificationURL,
    });

    return `A verification link has been sent to ${email}.`;
  });

export const verifyEmail = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { token: inputToken = '' } = data;
    const token = inputToken.trim();
    const uid = assertAuth(context);

    if (!token)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Token is not provided.'
      );
    validateAutoID(token);

    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);
    const user = await userRef.get();
    if (!user.exists)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User does not exist.'
      );

    const { emailVerificationToken, emailSent } = user.data() as UserInterface;
    if (emailSent && emailSent.toMillis() + Time.DAY < Date.now())
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Verification token has expired.'
      );
    if (emailVerificationToken !== token)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Invalid verification token.'
      );

    const now = admin.firestore.FieldValue.serverTimestamp();
    await userRef.update({
      emailVerified: true,
      updatedAt: now,
    });

    return 'Email verification successful.';
  });

export const uploadPhoto = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { photo } = data;
    const uid = assertAuth(context);
    if (!photo)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Photo is not provided.'
      );
    const { imageBuffer, mimeType, extension } = validateImage(String(photo));

    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    await bucket.deleteFiles({ prefix: `user_photos/${uid}` });
    const file = bucket.file(`user_photos/${uid}-${Date.now()}.${extension}`);
    await file.save(imageBuffer, { metadata: { contentType: mimeType } });
    await file.makePublic();

    const now = admin.firestore.FieldValue.serverTimestamp();
    await db
      .doc(`users/${uid}`)
      .update({ photoURL: file.publicUrl(), updatedAt: now });

    return 'Photo upload successful.';
  });

export const onUploadPhoto = functions
  .region('asia-southeast1')
  .storage.object()
  .onFinalize(async (object) => {
    const { spawn } = await import('child-process-promise');
    const path = await import('path');
    const os = await import('os');
    const fs = await import('fs');

    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    // const auth = admin.auth();
    const db = admin.firestore();
    const bucket = admin.storage().bucket(fileBucket);

    if (
      !filePath?.startsWith('user_photos/') ||
      !contentType?.startsWith('image/')
    )
      return;
    // {
    //   return functions.logger.log('This is not a photo.');
    // }

    const fileName = path.basename(filePath);
    const uid = fileName.split('-')[0];
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
      contentType: contentType,
    };
    await bucket.file(filePath).download({
      destination: tempFilePath,
      validation: !process.env.FUNCTIONS_EMULATOR,
    });
    // functions.logger.log('Image downloaded locally to', tempFilePath);

    await spawn('convert', [
      tempFilePath,
      '-thumbnail',
      '200x200>',
      tempFilePath,
    ]);
    // functions.logger.log('Thumbnail created at', tempFilePath);

    const thumbDir = `${path.dirname(filePath)}_200`;
    await bucket.deleteFiles({ prefix: `${thumbDir}/${uid}` });

    const thumbFilePath = path.join(thumbDir, fileName);
    await bucket.upload(tempFilePath, {
      destination: thumbFilePath,
      metadata,
    });
    functions.logger.log(`Thumbnail created [${fileName}]`);

    fs.unlinkSync(tempFilePath);
    const file = bucket.file(thumbFilePath);
    await file.makePublic();

    const now = admin.firestore.FieldValue.serverTimestamp();
    return db.doc(`users/${uid}`).update({
      photoURL: file.publicUrl(),
      updatedAt: now,
    });
  });
