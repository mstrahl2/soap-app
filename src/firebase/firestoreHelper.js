// src/firebase/firestoreHelper.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export async function getProfile() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Profile not found");
  return docSnap.data();
}

export async function updateProfile(data) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
}

export async function addNote(noteData) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const notesCollection = collection(db, "notes");
  const newNote = {
    ...noteData,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(notesCollection, newNote);
  return docRef.id;
}

export async function updateNoteById(noteId, data) {
  if (!noteId) throw new Error("Note ID is required");

  const docRef = doc(db, "notes", noteId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNoteById(noteId) {
  if (!noteId) throw new Error("Note ID is required");

  const docRef = doc(db, "notes", noteId);
  await deleteDoc(docRef);
}

export async function getUserNotes() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const q = query(
    collection(db, "notes"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getUserFreeNotesRemaining(limit = 15) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const q = query(collection(db, "notes"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  const used = snapshot.docs.length;
  return Math.max(0, limit - used);
}

export async function getNoteById(noteId) {
  if (!noteId) throw new Error("Note ID is required");

  const docRef = doc(db, "notes", noteId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Note not found");
  return { id: docSnap.id, ...docSnap.data() };
}

// Accept optional occupation string, can be empty
export async function createUserProfile(occupation = "") {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const profileRef = doc(db, "users", user.uid);
  const existing = await getDoc(profileRef);
  if (!existing.exists()) {
    await setDoc(profileRef, {
      uid: user.uid,
      email: user.email,
      subscriptionTier: "free",
      occupation,
      createdAt: new Date().toISOString(),
    });
  }
}
