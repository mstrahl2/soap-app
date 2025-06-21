// src/pages/NoteDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Snackbar,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNote() {
      setLoading(true);
      try {
        const docRef = doc(db, "notes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNote(docSnap.data());
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

  const handleExport = () => {
    const blob = new Blob([note.formattedNote || ""], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${note.title || "note"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title || "SOAP Note",
          text: note.formattedNote || "",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(note.formattedNote || "");
        setCopied(true);
      } catch (err) {
        alert("Unable to copy to clipboard.");
      }
    }
  };

  if (loading)
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {note.title || "Untitled Note"}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Type: {note.noteType || "N/A"}
      </Typography>

      <Typography sx={{ whiteSpace: "pre-wrap", mb: 4 }}>
        {note.formattedNote || "No content available."}
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="contained"
          onClick={() => navigate(`/edit-note/${id}`)}
        >
          Edit
        </Button>
        <Button variant="outlined" onClick={handleExport}>
          Export
        </Button>
        <Button variant="outlined" onClick={handleShare}>
          Share
        </Button>
        <Button variant="text" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Stack>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Note copied to clipboard!"
      />
    </Box>
  );
}
