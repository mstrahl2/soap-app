// src/pages/EditNote.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const noteTypes = [
  { value: "session", label: "Session" },
  { value: "progress", label: "Progress" },
  { value: "discharge", label: "Discharge" },
];

export default function EditNote() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState("session");
  const [formattedNote, setFormattedNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNote() {
      setLoading(true);
      try {
        const docRef = doc(db, "notes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setNoteType(data.noteType || "session");
          setFormattedNote(data.formattedNote || "");
        } else {
          setError("Note not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load note.");
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const docRef = doc(db, "notes", id);
      await updateDoc(docRef, {
        title,
        noteType,
        formattedNote,
        updatedAt: new Date(),
      });
      navigate(`/note-detail/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update note.");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Note
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          label="Note Type"
          fullWidth
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          sx={{ mb: 2 }}
        >
          {noteTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Formatted Note"
          multiline
          rows={10}
          fullWidth
          value={formattedNote}
          onChange={(e) => setFormattedNote(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" type="submit">
          Save Changes
        </Button>{" "}
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </form>
    </Box>
  );
}
