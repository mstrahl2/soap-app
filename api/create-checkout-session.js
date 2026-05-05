import Stripe from "stripe";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  try {
    const { priceId, planName = "unknown", billingPeriod = "monthly" } = req.body;
    const authHeader = req.headers.authorization;

    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId in request body" });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken.email_verified) {
      return res.status(403).json({ error: "Email must be verified before upgrading." });
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VITE_PUBLIC_BASE_URL;

    if (!baseUrl) {
      return res.status(500).json({ error: "Missing frontend base URL." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        priceId,
        planName,
        billingPeriod,
        userEmail,
      },
      success_url: `${baseUrl}/upgrade-success?plan=${planName}&billingPeriod=${billingPeriod}`,
      cancel_url: `${baseUrl}/upgrade-cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe Checkout Session Error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}