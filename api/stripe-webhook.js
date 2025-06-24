// api/stripe-webhook.js

import { buffer } from 'micro';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const firestore = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('👉 Received event:', JSON.stringify(event, null, 2));

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id || session.metadata?.userId;
    const priceId = session.metadata?.price_id || session.metadata?.priceId;

    console.log('🧾 Metadata received:', { userId, priceId });

    if (!userId || !priceId) {
      console.error('❌ Missing metadata: userId or priceId', { session });
      return res.status(400).send('Missing metadata userId or priceId');
    }

    const priceIdToPlan = {
      'price_1RczPNRvfrmnvHuYe5qqGK0F': 'pro',
      'price_1RczQKRvfrmnvHuYJXkaNLq2': 'group',
    };

    const plan = priceIdToPlan[priceId];

    if (!plan) {
      console.error('❌ Unknown priceId:', priceId);
      return res.status(400).send('Unknown priceId');
    }

    try {
      await firestore.collection('users').doc(userId).update({ plan });
      console.log(`✅ Updated user ${userId} to plan: ${plan}`);
    } catch (err) {
      console.error('❌ Firestore update failed:', err.message);
      return res.status(500).send('Failed to update user plan');
    }
  }

  res.status(200).send('Webhook received');
}
