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
} from "firebase/firestore";
import { auth } from "./firebaseConfig";

const db = getFirestore();

// Save or update user profile
export async function saveUserProfile(uid, data) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  // Prevent user from updating their own role or tier unless admin
  if (
    (data.role !== undefined || data.tier !== undefined) &&
    currentUser.uid === uid
  ) {
    const profile = await getProfile();
    if (profile.role !== "admin") {
      throw new Error("Users cannot update their own role or tier");
    }
  }

  // Prevent user from updating another user's role/tier via this function
  if (
    (data.role !== undefined || data.tier !== undefined) &&
    currentUser.uid !== uid
  ) {
    throw new Error("Cannot update another user's role or tier here");
  }

  await setDoc(doc(db, "users", uid), data, { merge: true });
}

// Get the current user's profile
export async function getProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// Check if the current user is an admin (role === "admin")
export async function isAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin";
}

// Get all users (admin only)
export async function getAllUsers() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");
  const profile = await getProfile();
  if (profile.role !== "admin") throw new Error("Not authorized");

  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Update any user's role (admin only)
export async function updateUserRole(userId, newRole) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");
  const profile = await getProfile();
  if (profile.role !== "admin") throw new Error("Not authorized");

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { role: newRole });
}

// Update any user's tier (admin only)
export async function updateUserTier(userId, newTier) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");
  const profile = await getProfile();
  if (profile.role !== "admin") throw new Error("Not authorized");

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { tier: newTier });
}

// Save a new note
export async function addNote({ title, noteType, rawNote, formattedNote }) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const notesRef = collection(db, "users", user.uid, "notes");
  await addDoc(notesRef, {
    title,
    noteType,
    rawNote,
    formattedNote,
    createdAt: new Date(),
  });
}

// Get all notes for current user
export async function getNotes() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const notesRef = collection(db, "users", user.uid, "notes");
  const snapshot = await getDocs(notesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get one note by ID
export async function getNoteById(noteId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const noteRef = doc(db, "users", user.uid, "notes", noteId);
  const docSnap = await getDoc(noteRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

// Update a note by ID
export async function updateNote(noteId, data) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const noteRef = doc(db, "users", user.uid, "notes", noteId);
  await updateDoc(noteRef, data);
}

// Delete a note by ID
export async function deleteNote(noteId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const noteRef = doc(db, "users", user.uid, "notes", noteId);
  await deleteDoc(noteRef);
}

// Optional: get how many free notes user has left
export async function getUserFreeNotesRemaining() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const profile = await getProfile();
  const notesRef = collection(db, "users", user.uid, "notes");
  const snapshot = await getDocs(notesRef);
  const usedCount = snapshot.size;

  return 15 - usedCount;
}

// Alias for backward compatibility or semantic clarity
export { saveUserProfile as createUserProfile };
export { saveUserProfile as updateUserProfile };
