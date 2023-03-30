import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const assertAuth = (context: functions.https.CallableContext) => {
  if (!context.auth)
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Unauthenticated.'
    );

  return context.auth.uid;
};

export const assertAppCheck = (context: functions.https.CallableContext) => {
  if (context.app === undefined)
    throw new functions.https.HttpsError(
      'failed-precondition',
      'App Check verification failed.'
    );
};

export const assertMember = async (uid: string, member = true) => {
  const auth = admin.auth();
  const { customClaims } = await auth.getUser(uid);
  const isMember = customClaims?.member;

  if (member && !isMember)
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not a member.'
    );
  if (!member && isMember)
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Non-members only.'
    );

  return customClaims;
};

export const validateAddress = async (address: string) => {
  const { isAddress, getAddress } = await import('@ethersproject/address');
  if (!isAddress(address))
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invalid Ethereum address.'
    );
  return getAddress(address);
};

interface MessageInterface {
  domain: {
    chainId: number;
    name: string;
    version: string;
  };
  types: {
    Message: {
      name: string;
      type: string;
    }[];
  };
  value: {
    action: string;
    address: string;
    timestamp: number;
  };
}

interface SignatureInterface {
  address: string;
  message: MessageInterface;
  signature: string;
}

export const validateSignature = async ({
  address,
  message,
  signature,
}: SignatureInterface) => {
  const { utils } = await import('ethers');
  const checksumAddress = await validateAddress(address);

  try {
    const { domain, types, value } = message;
    if (utils.verifyTypedData(domain, types, value, signature) !== address)
      throw new Error('Invalid signer');

    const now = Date.now();
    const { timestamp = 0 } = value;
    if (now > timestamp + 3 * 60_000 || timestamp > now)
      throw new Error('Invalid timestamp');
  } catch (err) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invalid signature.'
    );
  }

  return checksumAddress;
};

export const validateSigner = async (
  uid: string,
  signature: SignatureInterface
) => {
  const checksumAddress = await validateSignature(signature);
  if (uid !== checksumAddress)
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Signer is not authenticated.'
    );
};

export const validateName = (name: string) => {
  if (name.length < 4 || name.length > 40)
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invalid name format.'
    );
};

export const validateDisplayName = (displayName: string) => {
  const displayNamePattern = /^[a-zA-Z0-9]{4,20}$/;
  if (!displayNamePattern.test(displayName))
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invalid display name format.'
    );
};

export const validateEmail = (email: string) => {
  const emailPattern = /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/;
  if (!emailPattern.test(email))
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invalid email format.'
    );
};

export const sendMail = async (data: { [key: string]: any }) => {
  const formData = (await import('form-data')).default;
  const Mailgun = (await import('mailgun.js')).default;
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY as string,
  });
  try {
    await mg.messages.create(process.env.MAIL_DOMAIN as string, {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      ...data,
      'o:testmode': 'true',
    });
  } catch (err) {
    functions.logger.error(err);
    throw new functions.https.HttpsError('internal', 'Mail delivery error.');
  }
};

export const validateImage = (image: string, maxSize = 1_000_000) => {
  if (image.length * (3 / 4) > maxSize)
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Max file size exceeded.'
    );
  // const fileMatch = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  const imageMatch = image.match(
    /data:(image\/(png|jpeg|gif|svg\+xml));base64,.*/
  );
  if (!imageMatch)
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not an image.'
    );
  const mimeType = imageMatch[1];
  const extension = imageMatch[2];
  const base64EncodedImageString = image.replace(
    /^data:image\/\w+;base64,/,
    ''
  );
  const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');

  return { imageBuffer, mimeType, extension };
};

export const validateUID = async (uid: string) => {
  const { isAddress } = await import('@ethersproject/address');
  if (!isAddress(uid))
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invalid user ID.'
    );
};

export const validateAutoID = async (autoID: string) => {
  const autoIDPattern = /^[A-Za-z0-9]{20}$/;
  if (!autoIDPattern.test(autoID))
    throw new functions.https.HttpsError('failed-precondition', 'Invalid ID.');
};

// export const removeTimestamp = (data: { [key: string]: any }) => {
//   Object.entries(data).forEach((e) => {
//     const time = e[1]?.toMillis?.();
//     if (time) delete data[e[0]];
//   });
//   return data;
// };

export const convertTimestamp = (data: { [key: string]: any }) => {
  Object.entries(data).forEach((e) => {
    const time = e[1]?.toMillis?.();
    if (time) data[e[0]] = time;
  });
  return data;
};

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const month = 30 * day;

export enum Time {
  SECOND = second,
  MINUTE = minute,
  HOUR = hour,
  DAY = day,
  WEEK = week,
  MONTH = month,
}
