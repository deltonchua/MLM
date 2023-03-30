/*
 * Copyright 2020 Stripe, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { CustomerData } from './interfaces';
import * as logs from './logs';
import { assertAuth, convertTimestamp } from '../utils';
import { UserInterface } from '../interfaces/User';
import { MemberInterface } from '../interfaces/Member';
import {
  DEFAULT_ITO_PRICE,
  BUYER_COMMISSION_RATE,
  UPLINE_COMMISSION_RATE,
} from '../interfaces/Commission';

const apiVersion = '2020-08-27';
const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion,
  // Register extension as a Stripe plugin
  // https://stripe.com/docs/building-plugins#setappinfo
  //   appInfo: {
  //     name: 'Firebase firestore-stripe-payments',
  //     version: '0.2.4',
  //   },
});

/**
 * Create a customer object in Stripe.
 */
const createCustomerRecord = async ({
  uid,
  email,
  phone,
}: {
  uid: string;
  email?: string;
  phone?: string;
}) => {
  try {
    logs.creatingCustomer(uid);
    const customerData: CustomerData = {
      metadata: {
        firebaseUID: uid,
      },
    };
    if (email) customerData.email = email;
    if (phone) customerData.phone = phone;
    const customer = await stripe.customers.create(customerData);
    // Add a mapping record in Cloud Firestore.
    const customerRecord = {
      ...customer,
      stripeID: customer.id,
      stripeLink: `https://dashboard.stripe.com${
        customer.livemode ? '' : '/test'
      }/customers/${customer.id}`,
    };
    await admin.firestore().doc(`customers/${uid}`).set(customerRecord);
    logs.customerCreated(customer.id, customer.livemode);
    return customerRecord;
  } catch (error) {
    logs.customerCreationError(error as Error, uid);
    return null;
  }
};

interface InputLineItem {
  price: string;
  quantity: number;
}

const validateLineItems = (items: InputLineItem[]) => {
  Array.from(items).forEach((i) => {
    const { price, quantity } = i;
    if (typeof price !== 'string' || typeof quantity !== 'number')
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Invalid line item.'
      );
  });
};

/**
 * Create a CheckoutSession.
 */
export const checkout = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { lineItems } = data;
    const uid = assertAuth(context);

    if (!lineItems || Array.from(lineItems).length === 0)
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No line items.'
      );
    validateLineItems(lineItems);

    const db = admin.firestore();
    const sessionsRef = db.collection(`customers/${uid}/checkout_sessions`);
    let checkoutID;

    try {
      let customerRecord: any = (await db.doc(`customers/${uid}`).get()).data();
      if (!customerRecord?.stripeID) {
        const user = await db.doc(`users/${uid}`).get();
        const { email, phoneNumber } = user.data() as UserInterface;
        customerRecord = await createCustomerRecord({
          uid,
          email,
          phone: phoneNumber,
        });
      }

      // Get shipping countries
      const shippingCountries: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
        (
          await admin.firestore().doc('products/shipping_countries').get()
        ).data()?.['allowed_countries'] ?? [];
      const sessionCreateParams: Stripe.Checkout.SessionCreateParams = {
        billing_address_collection: 'required',
        shipping_address_collection: { allowed_countries: shippingCountries },
        shipping_rates: [],
        customer: customerRecord.stripeID,
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.CLIENT_DOMAIN}/store/checkout`,
        cancel_url: `${process.env.CLIENT_DOMAIN}/store/cart`,
        locale: 'auto',
        // automatic_tax: { enabled: true },
        customer_update: { name: 'auto', address: 'auto', shipping: 'auto' },
      };
      checkoutID = sessionsRef.doc().id;
      const session = await stripe.checkout.sessions.create(
        sessionCreateParams,
        { idempotencyKey: checkoutID }
      );
      const now = admin.firestore.FieldValue.serverTimestamp();
      await sessionsRef.doc(checkoutID).set({
        ...session,
        createdAt: now,
        updatedAt: now,
      });
      logs.checkoutSessionCreated(checkoutID);
      return { url: session.url };
    } catch (error) {
      if (checkoutID) {
        logs.checkoutSessionCreationError(checkoutID, error as Error);
        await sessionsRef
          .doc(checkoutID)
          .update({ error: { message: (error as Error).message } });
      }
      throw new functions.https.HttpsError(
        'internal',
        (error as Error).message
      );
    }
  });

/**
 * Create a Product record in Firestore based on a Stripe Product object.
 * @param {Stripe.Product} product
 */
const createProductRecord = async (product: Stripe.Product): Promise<void> => {
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.doc(`products/${product.id}`).set(
    {
      ...product,
      createdAt: new admin.firestore.Timestamp(product.created, 0),
      updatedAt: now,
    },
    { merge: true }
  );
  logs.firestoreDocCreated('products', product.id);
};

/**
 * Create a price (billing price plan) and insert it into a subcollection in Products.
 * @param {Stripe.Price} price
 */
const insertPriceRecord = async (price: Stripe.Price): Promise<void> => {
  if (price.billing_scheme === 'tiered')
    // Tiers aren't included by default, we need to retireve and expand.
    price = await stripe.prices.retrieve(price.id, { expand: ['tiers'] });
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.doc(`products/${price.product}/prices/${price.id}`).set(
    {
      ...price,
      createdAt: new admin.firestore.Timestamp(price.created, 0),
      updatedAt: now,
    },
    { merge: true }
  );
  logs.firestoreDocCreated('prices', price.id);
};

/**
 * Insert tax rates into the products collection in Cloud Firestore.
 * @param {Stripe.TaxRate} taxRate
 */
const insertTaxRateRecord = async (taxRate: Stripe.TaxRate): Promise<void> => {
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.doc(`products/tax_rates/tax_rates/${taxRate.id}`).set(
    {
      ...taxRate,
      createdAt: new admin.firestore.Timestamp(taxRate.created, 0),
      updatedAt: now,
    },
    { merge: true }
  );
  logs.firestoreDocCreated('tax_rates', taxRate.id);
};

/**
 * Add PaymentIntent objects to Cloud Firestore for one-time payments.
 * @param {Stripe.PaymentIntent} payment
 * @param {Stripe.Checkout.Session} checkoutSession
 */
const insertPaymentRecord = async (
  payment: Stripe.PaymentIntent,
  checkoutSession?: Stripe.Checkout.Session
) => {
  // Get customer by stripeID from Firestore
  const db = admin.firestore();
  const customersSnap = await db
    .collection('customers')
    .where('stripeID', '==', payment.customer)
    .get();
  if (customersSnap.size !== 1) {
    throw new Error('Customer not found!');
  }
  if (checkoutSession) {
    const lineItems = await stripe.checkout.sessions.listLineItems(
      checkoutSession.id
    );
    const prices = [];
    for (const item of lineItems.data) {
      prices.push(
        db.doc(`poducts/${item.price?.product}/prices/${item.price?.id}`)
      );
    }
    (payment as any).prices = prices;
    (payment as any).items = lineItems.data;
  }
  // Write invoice to a subcollection on the customer doc.
  const now = admin.firestore.FieldValue.serverTimestamp();
  await customersSnap.docs[0].ref
    .collection('payments')
    .doc(payment.id)
    .set(
      {
        ...payment,
        createdAt: new admin.firestore.Timestamp(payment.created, 0),
        updatedAt: now,
      },
      { merge: true }
    );
  logs.firestoreDocCreated('payments', payment.id);
};

export const onPaymentSucceeded = functions
  .region('asia-southeast1')
  .firestore.document('customers/{uid}/payments/{paymentID}')
  .onWrite(async (change, context) => {
    const axios = (await import('axios')).default;
    const { Big } = await import('big.js');
    const uid = context.params.uid;
    const paymentID = context.params.paymentID;
    const payment = change.after.data();

    if (payment?.status !== 'succeeded') return;

    const { amount_received = 0, items = [] } = payment;
    if (!amount_received || Array.from(items).length === 0) return;

    const db = admin.firestore();
    const memberRef = db.doc(`members/${uid}`);
    const member = await memberRef.get();
    if (!member.exists) return;

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
    const USD = new Big(amount_received).div(1e2).round(2, 0).toNumber();
    const ITO = new Big(USD).div(ITOPrice).round(3, 0).toNumber();

    const { upline } = member.data() as MemberInterface;
    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();
    if (upline) {
      upline.forEach((u) => {
        batch.set(db.collection(`members/${u}/commissions`).doc(), {
          paymentID,
          rate: UPLINE_COMMISSION_RATE,
          amount: {
            usd: new Big(USD)
              .times(UPLINE_COMMISSION_RATE)
              .round(2, 0)
              .toNumber(),
            ito: new Big(ITO)
              .times(UPLINE_COMMISSION_RATE)
              .round(3, 0)
              .toNumber(),
          },
          items,
          createdAt: now,
          updatedAt: now,
        });
      });
    }
    batch.set(memberRef.collection('commissions').doc(), {
      paymentID,
      rate: BUYER_COMMISSION_RATE,
      amount: {
        usd: new Big(USD).times(BUYER_COMMISSION_RATE).round(2, 0).toNumber(),
        ito: new Big(ITO).times(BUYER_COMMISSION_RATE).round(3, 0).toNumber(),
      },
      items,
      createdAt: now,
      updatedAt: now,
    });
    await batch.commit();
    return functions.logger.log(
      `Commissions created for payment [${paymentID}] `
    );
  });

/**
 * Delete Product or Price object from Cloud Firestore.
 * @param {Stripe.Product | Stripe.Price} pr
 */
const deleteProductOrPrice = async (pr: Stripe.Product | Stripe.Price) => {
  const db = admin.firestore();
  if (pr.object === 'product') {
    await db.doc(`products/${pr.id}`).delete();
    logs.firestoreDocDeleted('products', pr.id);
  }
  if (pr.object === 'price') {
    await db
      .doc(`products/${(pr as Stripe.Price).product}/prices/${pr.id}`)
      .delete();
    logs.firestoreDocDeleted('prices', pr.id);
  }
};

/**
 * A webhook handler function for the relevant Stripe events.
 */
export const stripeWebhook = functions
  .region('asia-southeast1')
  .https.onRequest(async (req: functions.https.Request, res) => {
    const relevantEvents = new Set([
      'product.created',
      'product.updated',
      'product.deleted',
      'price.created',
      'price.updated',
      'price.deleted',
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed',
      'tax_rate.created',
      'tax_rate.updated',
      'payment_intent.processing',
      'payment_intent.succeeded',
      'payment_intent.canceled',
      'payment_intent.payment_failed',
    ]);
    let event: Stripe.Event;

    // Instead of getting the `Stripe.Event`
    // object directly from `req.body`,
    // use the Stripe webhooks API to make sure
    // this webhook call came from a trusted source
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers['stripe-signature'] as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (error) {
      logs.badWebhookSecret(error as Error);
      res.status(401).send('Webhook Error: Invalid Secret');
      return;
    }

    if (relevantEvents.has(event.type)) {
      logs.startWebhookEventProcessing(event.id, event.type);
      try {
        switch (event.type) {
          case 'product.created':
          case 'product.updated':
            await createProductRecord(event.data.object as Stripe.Product);
            break;
          case 'price.created':
          case 'price.updated':
            await insertPriceRecord(event.data.object as Stripe.Price);
            break;
          case 'product.deleted':
            await deleteProductOrPrice(event.data.object as Stripe.Product);
            break;
          case 'price.deleted':
            await deleteProductOrPrice(event.data.object as Stripe.Price);
            break;
          case 'tax_rate.created':
          case 'tax_rate.updated':
            await insertTaxRateRecord(event.data.object as Stripe.TaxRate);
            break;
          case 'checkout.session.completed':
          case 'checkout.session.async_payment_succeeded':
          case 'checkout.session.async_payment_failed': {
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;
            if (checkoutSession.mode === 'payment') {
              const paymentIntentId = checkoutSession.payment_intent as string;
              const paymentIntent = await stripe.paymentIntents.retrieve(
                paymentIntentId
              );
              await insertPaymentRecord(paymentIntent, checkoutSession);
            }
            break;
          }
          case 'payment_intent.processing':
          case 'payment_intent.succeeded':
          case 'payment_intent.canceled':
          case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            await insertPaymentRecord(paymentIntent);
            break;
          }
          default:
            logs.webhookHandlerError(
              new Error('Unhandled relevant event!'),
              event.id,
              event.type
            );
        }
        logs.webhookHandlerSucceeded(event.id, event.type);
      } catch (error) {
        logs.webhookHandlerError(error as Error, event.id, event.type);
        res.json({
          error: 'Webhook handler failed. View function logs in Firebase.',
        });
        return;
      }
    }

    // Return a response to Stripe to acknowledge receipt of the event.
    res.json({ received: true });
  });

export const getPaymentHistory = functions
  .region('asia-southeast1')
  .https.onCall(async (_, context) => {
    const uid = assertAuth(context);

    const db = admin.firestore();
    const snapshot = await db
      .collection(`customers/${uid}/payments`)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs
      .map((s) => convertTimestamp(s.data()))
      .filter((d) => d.status === 'succeeded')
      .map((m) => {
        const { id, amount, updatedAt, items } = m;
        return { id, amount, updatedAt, items };
      });
  });
