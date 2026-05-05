import Stripe from "stripe";
import * as admin from "firebase-admin";
import { sendCancellationEmail } from "../src/utils/sendCancellationEmail";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const db = admin.firestore();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const userData = userSnap.data();
    const subscription = userData.subscription;

    if (!subscription?.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription found." });
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    const {
      status,
      cancel_at_period_end,
      current_period_end,
      canceled_at,
    } = updatedSubscription;

    await userRef.set(
      {
        subscription: {
          ...subscription,
          status,
          cancel_at_period_end,
          current_period_end: admin.firestore.Timestamp.fromMillis(
            current_period_end * 1000
          ),
          canceled_at: canceled_at
            ? admin.firestore.Timestamp.fromMillis(canceled_at * 1000)
            : null,
          cancelRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    if (userData.email) {
      try {
        const emailSent = await sendCancellationEmail(userData.email);

        if (!emailSent) {
          console.warn("⚠️ Cancellation email failed to send.");
        }
      } catch (emailErr) {
        console.warn("⚠️ Cancellation email error:", emailErr);
      }
    }

    return res.status(200).json({
      message: "Subscription cancellation scheduled for period end.",
    });
  } catch (err) {
    console.error("❌ Cancel Subscription Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}