// api/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Init Firebase Admin (singleton)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Only POST requests allowed' });
  }

  const { priceId } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        priceId,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade-cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe Checkout Session Error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
