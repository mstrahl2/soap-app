// This runs server-side on Vercel
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Handles POST /api/create-checkout-session
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Only POST requests allowed' });
  }

  const { priceId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade-cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
