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

// Get the user's profile document from Firestore
export async function getProfile() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Profile not found");
  return docSnap.data();
}

// Update user profile fields (partial update)
export async function updateProfile(data) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
}

// Add a new note for the current user
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

// Update an existing note by its ID
export async function updateNoteById(noteId, data) {
  if (!noteId) throw new Error("Note ID is required");

  const docRef = doc(db, "notes", noteId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete a note by its ID
export async function deleteNoteById(noteId) {
  if (!noteId) throw new Error("Note ID is required");

  const docRef = doc(db, "notes", noteId);
  await deleteDoc(docRef);
}

// Get notes for current user, ordered newest first
export async function getUserNotes() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const q = query(
    collection(db, "notes"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc") // newest first
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get the remaining free notes count (out of limit, default 15)
export async function getUserFreeNotesRemaining(limit = 15) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const q = query(collection(db, "notes"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  const used = snapshot.docs.length;
  return Math.max(0, limit - used);
}

// Get a single note by its ID
export async function getNoteById(noteId) {
  if (!noteId) throw new Error("Note ID is required");

  const docRef = doc(db, "notes", noteId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Note not found");
  return { id: docSnap.id, ...docSnap.data() };
}
