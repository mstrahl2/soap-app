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
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import { getNoteById } from "../firebase/firestoreHelper";

const noteTypeLabels = {
  intake: "Intake",
  standard: "SOAP Session",
  progress: "Progress",
  crisis: "Crisis / Risk",
  discharge: "Discharge",
};

function getCleanNoteText(text) {
  if (!text) return "";

  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedClean, setCopiedClean] = useState(false);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    async function fetchNote() {
      try {
        setLoading(true);
        setError("");

        const foundNote = await getNoteById(id);

        if (foundNote) {
          setNote(foundNote);
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note?.formattedNote || "");
      setCopied(true);
    } catch (err) {
      setShareError("Unable to copy to clipboard.");
    }
  };

  const handleCopyClean = async () => {
    try {
      const cleanText = getCleanNoteText(note?.formattedNote || "");
      await navigator.clipboard.writeText(cleanText);
      setCopiedClean(true);
    } catch (err) {
      setShareError("Unable to copy clean note.");
    }
  };

  const handleExport = () => {
    if (!note) return;

    const cleanText = getCleanNoteText(note.formattedNote || "");

    const blob = new Blob([cleanText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${note.title || "soap-note"}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!note) return;

    const cleanText = getCleanNoteText(note.formattedNote || "");

    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title || "SOAP Note",
          text: cleanText,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        setShareError("Sharing was cancelled or failed.");
      }
    } else {
      handleCopyClean();
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate("/my-notes")} sx={{ mt: 2 }}>
          Back to My Notes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h4">{note.title || "Untitled Note"}</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label={noteTypeLabels[note.noteType] || note.noteType || "N/A"}
            size="small"
          />

          {note.auditSafe && (
            <Chip
              label="Audit-Safe"
              color="success"
              size="small"
              variant="outlined"
            />
          )}

          {note.clientName && (
            <Chip label={`Client: ${note.clientName}`} size="small" />
          )}

          {note.sessionDate && (
            <Chip label={`Date: ${note.sessionDate}`} size="small" />
          )}

          {note.sessionLength && (
            <Chip label={`${note.sessionLength} min`} size="small" />
          )}

          {note.riskLevel && note.riskLevel !== "none" && (
            <Chip label={`Risk: ${note.riskLevel}`} size="small" />
          )}
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Paper sx={{ p: 2, mb: 2 }} elevation={2}>
        <Typography variant="subtitle2" gutterBottom>
          Raw Note
        </Typography>
        <Typography sx={{ whiteSpace: "pre-wrap" }}>
          {note.rawNote || "No raw note available."}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
        <Typography variant="subtitle2" gutterBottom>
          Formatted SOAP Note
        </Typography>
        <Typography sx={{ whiteSpace: "pre-wrap" }}>
          {note.formattedNote || "No formatted note available."}
        </Typography>
      </Paper>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button variant="contained" onClick={() => navigate(`/edit-note/${id}`)}>
          Edit
        </Button>

        <Button variant="outlined" onClick={handleCopy}>
          Copy
        </Button>

        <Button variant="outlined" onClick={handleCopyClean}>
          Copy Clean Version
        </Button>

        <Button variant="outlined" onClick={handleExport}>
          Export Clean TXT
        </Button>

        <Button variant="outlined" onClick={handleShare}>
          Share Clean
        </Button>

        <Button variant="text" onClick={() => navigate("/my-notes")}>
          Back
        </Button>
      </Stack>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Note copied with formatting!"
      />

      <Snackbar
        open={copiedClean}
        autoHideDuration={3000}
        onClose={() => setCopiedClean(false)}
        message="Clean note copied!"
      />

      <Snackbar
        open={!!shareError}
        autoHideDuration={3000}
        onClose={() => setShareError("")}
        message={shareError}
      />
    </Box>
  );
}