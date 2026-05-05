import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { auth } from "./firebaseConfig";

const db = getFirestore();

const TIER_LIMITS = {
  free: 15,
  pro: 100,
  unlimited: Infinity,
};

export async function saveUserProfile(uid, data) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const isSelf = currentUser.uid === uid;

  if ((data.role || data.tier) && isSelf) {
    const profile = await getProfile();
    if (profile?.role !== "admin") {
      throw new Error("Users cannot update their own role or tier.");
    }
  }

  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function getProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : null;
}

export async function isAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin";
}

export async function getAllUsers() {
  if (!(await isAdmin())) throw new Error("Not authorized");

  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function updateUserRole(userId, newRole) {
  if (!(await isAdmin())) throw new Error("Not authorized");
  await updateDoc(doc(db, "users", userId), { role: newRole });
}

export async function updateUserTier(userId, newTier) {
  if (!(await isAdmin())) throw new Error("Not authorized");
  await updateDoc(doc(db, "users", userId), { tier: newTier });
}

export async function getUserTier() {
  const profile = await getProfile();
  return profile?.tier?.toLowerCase?.() || "free";
}

export async function getUserMonthlyUsage() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const q = query(
    collection(db, "users", user.uid, "notes"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.filter((docSnap) => {
    const createdAt = docSnap.data().createdAt?.toDate?.();
    return createdAt && createdAt >= startOfMonth;
  }).length;
}

export async function canUserCreateNote() {
  const profile = await getProfile();

  const tier = profile?.tier?.toLowerCase?.() || "free";
  const override = profile?.accessOverride || "none";

  // 🔥 OVERRIDE LOGIC
  if (override === "tester" || override === "comped") {
    return {
      allowed: Infinity,
      used: 0,
      remaining: Infinity,
      canCreate: true,
      tier: "override",
    };
  }

  // 🔥 STRIPE ACTIVE USER
  const hasSub = await hasActiveSubscription();
  if (hasSub) {
    return {
      allowed: Infinity,
      used: 0,
      remaining: Infinity,
      canCreate: true,
      tier: "paid",
    };
  }

  // 🔥 NORMAL TIER LOGIC
  const used = await getUserMonthlyUsage();
  const allowed = TIER_LIMITS[tier] ?? 0;

  return {
    allowed,
    used,
    remaining: allowed === Infinity ? Infinity : Math.max(allowed - used, 0),
    canCreate: allowed === Infinity || used < allowed,
    tier,
  };
}

export async function addNote({
  title,
  noteType,
  rawNote,
  formattedNote,
  auditSafe,
  clientName,
  sessionDate,
  sessionLength,
  riskLevel,
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const { canCreate, tier } = await canUserCreateNote();

  if (!canCreate) {
    throw new Error(
      `Note limit reached for your current tier (${tier}). You have 0 notes remaining this month.`
    );
  }

  const notesRef = collection(db, "users", user.uid, "notes");

  await addDoc(notesRef, {
    title: title || "",
    noteType: noteType || "standard",
    rawNote: rawNote || "",
    formattedNote: formattedNote || "",
    auditSafe: auditSafe ?? true,
    clientName: clientName || "",
    sessionDate: sessionDate || "",
    sessionLength: sessionLength || "",
    riskLevel: riskLevel || "none",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getNotes() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const q = query(
    collection(db, "users", user.uid, "notes"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function getLastNote() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const q = query(
    collection(db, "users", user.uid, "notes"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

export async function getNoteById(noteId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const snap = await getDoc(doc(db, "users", user.uid, "notes", noteId));

  return snap.exists()
    ? {
        id: snap.id,
        ...snap.data(),
      }
    : null;
}

export async function updateNote(noteId, data) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  await updateDoc(doc(db, "users", user.uid, "notes", noteId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(noteId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  await deleteDoc(doc(db, "users", user.uid, "notes", noteId));
}

export async function getUserFreeNotesRemaining() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const snapshot = await getDocs(collection(db, "users", user.uid, "notes"));
  return Math.max(15 - snapshot.size, 0);
}

export async function getUserSubscription() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data().subscription || null : null;
}

export async function updateUserSubscription(subscriptionData) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  await updateDoc(doc(db, "users", user.uid), {
    subscription: subscriptionData,
  });
}

export async function updateUserAccessOverride(userId, accessOverride) {
  if (!(await isAdmin())) throw new Error("Not authorized");

  await updateDoc(doc(db, "users", userId), {
    accessOverride,
    updatedAt: serverTimestamp(),
  });
}

export async function hasActiveSubscription() {
  const sub = await getUserSubscription();
  return sub?.status === "active" && !sub.cancel_at_period_end;
}

export async function sendAdminInvite(email) {
  if (!(await isAdmin())) throw new Error("Not authorized to send invites");

  const invitesRef = collection(db, "adminInvites");

  const q = query(
    invitesRef,
    where("email", "==", email),
    where("status", "==", "pending")
  );

  const existing = await getDocs(q);

  if (!existing.empty) {
    throw new Error("An invite to this email is already pending.");
  }

  await addDoc(invitesRef, {
    email,
    status: "pending",
    invitedAt: serverTimestamp(),
  });
}

export async function getAdminInvites() {
  if (!(await isAdmin())) throw new Error("Not authorized");

  const snapshot = await getDocs(collection(db, "adminInvites"));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function updateAdminInviteStatus(inviteId, status) {
  if (!(await isAdmin())) throw new Error("Not authorized");

  await updateDoc(doc(db, "adminInvites", inviteId), {
    status,
  });
}

export { saveUserProfile as createUserProfile };
export { saveUserProfile as updateUserProfile };