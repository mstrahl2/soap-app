import { buffer } from "micro";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

export const config = {
  api: {
    bodyParser: false,
  },
};

async function findUserBySubscriptionId(subscriptionId) {
  const snapshot = await db
    .collection("users")
    .where("subscription.stripeSubscriptionId", "==", subscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return snapshot.docs[0];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let buf;

  try {
    buf = await buffer(req);
  } catch (err) {
    console.error("❌ Failed to read request buffer:", err);
    return res.status(400).send("Invalid request body");
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return res.status(400).send("Missing Stripe signature header");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`👉 Stripe event received: ${event.type}`);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const {
        userId,
        priceId,
        planName = "unknown",
        billingPeriod = "monthly",
        userEmail = "unknown",
      } = session.metadata || {};

      if (!userId || !priceId) {
        console.error("❗ Missing metadata: userId or priceId");
        return res.status(400).send("Missing metadata");
      }

      if (!session.subscription) {
        console.error("❌ Missing subscription ID");
        return res.status(400).send("Invalid session");
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      const subscriptionData = {
        status: session.payment_status === "paid" ? "active" : "pending",
        priceId,
        planName,
        billingPeriod,
        userEmail,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: admin.firestore.Timestamp.fromMillis(
          subscription.current_period_end * 1000
        ),
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };

      const userRef = db.collection("users").doc(userId);

      await userRef.set(
        {
          tier: planName.toLowerCase(),
          subscription: subscriptionData,
        },
        { merge: true }
      );

      console.log("✅ Subscription stored in Firestore for user:", userId);
      return res.status(200).send("Subscription recorded");
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      const userDoc = await findUserBySubscriptionId(subscription.id);

      if (!userDoc) {
        console.warn("⚠️ No user found for subscription:", subscription.id);
        return res.status(200).send("No matching user");
      }

      const isDeleted = event.type === "customer.subscription.deleted";

      await userDoc.ref.set(
        {
          tier: isDeleted ? "free" : undefined,
          subscription: {
            status: subscription.status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: subscription.current_period_end
              ? admin.firestore.Timestamp.fromMillis(
                  subscription.current_period_end * 1000
                )
              : null,
            canceled_at: subscription.canceled_at
              ? admin.firestore.Timestamp.fromMillis(
                  subscription.canceled_at * 1000
                )
              : null,
            ended_at: subscription.ended_at
              ? admin.firestore.Timestamp.fromMillis(
                  subscription.ended_at * 1000
                )
              : null,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      console.log("✅ Subscription updated from webhook:", subscription.id);
      return res.status(200).send("Subscription updated");
    }

    return res.status(200).send("Webhook received");
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res.status(500).send("Webhook handler failed");
  }
}