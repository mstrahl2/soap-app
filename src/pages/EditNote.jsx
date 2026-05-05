// src/pages/EditNote.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getNoteById, updateNote } from "../firebase/firestoreHelper";
import generateSoapNote from "../utils/generateSoapNote";

const noteTypes = [
  { value: "intake", label: "Intake" },
  { value: "standard", label: "SOAP Session" },
  { value: "progress", label: "Progress" },
  { value: "crisis", label: "Crisis / Risk" },
  { value: "discharge", label: "Discharge" },
];

const sessionLengths = ["15", "30", "45", "50", "53", "60", "90"];

const riskLevels = [
  { value: "none", label: "None / Not Assessed" },
  { value: "low", label: "Low Risk" },
  { value: "moderate", label: "Moderate Risk" },
  { value: "high", label: "High Risk" },
];

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNote() {
      try {
        const data = await getNoteById(id);

        if (!data) {
          setError("Note not found.");
          return;
        }

        setNote({
          title: data.title || "",
          clientName: data.clientName || "",
          sessionDate: data.sessionDate || "",
          sessionLength: data.sessionLength || "50",
          riskLevel: data.riskLevel || "none",
          noteType: data.noteType || "standard",
          rawNote: data.rawNote || "",
          formattedNote: data.formattedNote || "",
          auditSafe: data.auditSafe ?? true,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load note.");
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id]);

  const updateField = (field, value) => {
    setNote((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerate = () => {
    if (!note.rawNote?.trim()) {
      setError("Raw note cannot be empty.");
      return;
    }

    setError("");

    const metadataText =
      "Client: " +
      (note.clientName || "Not listed") +
      "\nSession Date: " +
      (note.sessionDate || "Not listed") +
      "\nSession Length: " +
      (note.sessionLength || "Not listed") +
      " minutes\nRisk Level: " +
      note.riskLevel +
      "\n\nSession Summary:\n" +
      note.rawNote;

    const formatted = generateSoapNote(
      metadataText,
      note.noteType,
      note.auditSafe
    );

    updateField("formattedNote", formatted);
  };

  const handleSave = async () => {
    if (!note.formattedNote?.trim()) {
      setError("Formatted SOAP note cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateNote(id, note);

      navigate(`/note-detail/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!note) {
    return (
      <Box maxWidth={800} mx="auto" mt={3}>
        <Alert severity="error">{error || "Note not found."}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/my-notes")}>
          Back to My Notes
        </Button>
      </Box>
    );
  }

  return (
    <Box maxWidth={900} mx="auto" mt={3}>
      <Typography variant="h4" gutterBottom>
        Edit Note
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Update the session details, edit the raw note, regenerate the SOAP note,
        or manually refine the final documentation.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Session Details
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Note Title"
              fullWidth
              value={note.title}
              onChange={(e) => updateField("title", e.target.value)}
            />

            <TextField
              label="Client Name"
              fullWidth
              value={note.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
            />

            <TextField
              label="Session Date"
              type="date"
              fullWidth
              value={note.sessionDate}
              onChange={(e) => updateField("sessionDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Session Length"
              fullWidth
              value={note.sessionLength}
              onChange={(e) => updateField("sessionLength", e.target.value)}
            >
              {sessionLengths.map((length) => (
                <MenuItem key={length} value={length}>
                  {length} minutes
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Risk Level"
              fullWidth
              value={note.riskLevel}
              onChange={(e) => updateField("riskLevel", e.target.value)}
            >
              {riskLevels.map((risk) => (
                <MenuItem key={risk.value} value={risk.value}>
                  {risk.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Note Type"
              fullWidth
              value={note.noteType}
              onChange={(e) => updateField("noteType", e.target.value)}
            >
              {noteTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={note.auditSafe}
                  onChange={(e) => updateField("auditSafe", e.target.checked)}
                />
              }
              label="Audit-Safe Mode"
            />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Raw Note
          </Typography>

          <TextField
            multiline
            minRows={7}
            fullWidth
            value={note.rawNote}
            onChange={(e) => updateField("rawNote", e.target.value)}
          />

          <Button variant="outlined" onClick={handleGenerate} sx={{ mt: 2 }}>
            Regenerate SOAP Note
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Formatted SOAP Note
          </Typography>

          <TextField
            multiline
            minRows={9}
            fullWidth
            value={note.formattedNote}
            onChange={(e) => updateField("formattedNote", e.target.value)}
          />
        </CardContent>
      </Card>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        <Button variant="outlined" onClick={() => navigate(`/note-detail/${id}`)}>
          Cancel
        </Button>

        <Button variant="text" onClick={() => navigate("/my-notes")}>
          Back to My Notes
        </Button>
      </Stack>
    </Box>
  );
}