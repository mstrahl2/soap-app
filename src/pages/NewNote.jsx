// src/pages/NewNote.jsx
import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  Paper,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { addNote as saveNote, getLastNote } from "../firebase/firestoreHelper";
import generateSoapNote from "../utils/generateSoapNote";

const noteTypes = [
  { value: "intake", label: "Intake" },
  { value: "standard", label: "SOAP Session" },
  { value: "progress", label: "Progress" },
  { value: "crisis", label: "Crisis / Risk" },
  { value: "discharge", label: "Discharge" },
];

const templates = [
  {
    name: "Intake",
    noteType: "intake",
    rawNote:
      "Client presented for intake session. Reviewed history, symptoms, current concerns, strengths, stressors, and goals for treatment.",
  },
  {
    name: "Session",
    noteType: "standard",
    rawNote:
      "Client discussed current symptoms, recent stressors, emotional functioning, coping skills, and progress toward treatment goals.",
  },
  {
    name: "Progress",
    noteType: "progress",
    rawNote:
      "Reviewed progress toward treatment goals, current functioning, symptom changes, barriers, and continued areas of clinical focus.",
  },
  {
    name: "Crisis",
    noteType: "crisis",
    rawNote:
      "Client presented with elevated distress. Risk and protective factors were assessed. Session focused on stabilization, safety planning, and immediate coping strategies.",
  },
  {
    name: "Discharge",
    noteType: "discharge",
    rawNote:
      "Reviewed discharge readiness, progress toward goals, remaining needs, coping supports, relapse prevention strategies, and recommended follow-up care.",
  },
];

function cleanDictationText(text) {
  if (!text) return "";

  let cleaned = text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();

  if (cleaned && !/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function NewNote() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionLength, setSessionLength] = useState("50");
  const [riskLevel, setRiskLevel] = useState("none");

  const [noteType, setNoteType] = useState("standard");
  const [rawNote, setRawNote] = useState("");
  const [interimText, setInterimText] = useState("");
  const [formattedNote, setFormattedNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [auditSafe, setAuditSafe] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const recognitionRef = useRef(null);

  const applyTemplate = (template) => {
    setTitle(template.name);
    setNoteType(template.noteType);
    setRawNote(template.rawNote);
    setFormattedNote("");
    setInterimText("");
    setError("");
    setSuccess("");
  };

  const handleUseLast = async () => {
    try {
      const last = await getLastNote();

      if (!last) {
        setError("No previous session found.");
        setSuccess("");
        return;
      }

      setTitle(last.title || "");
      setClientName(last.clientName || "");
      setSessionDate("");
      setSessionLength(last.sessionLength || "50");
      setRiskLevel(last.riskLevel || "none");
      setNoteType(last.noteType || "standard");
      setRawNote(last.rawNote || "");
      setFormattedNote("");
      setAuditSafe(last.auditSafe ?? true);
      setInterimText("");
      setError("");
      setSuccess("Last session loaded.");
    } catch (err) {
      console.error(err);
      setError("Failed to load last session.");
      setSuccess("");
    }
  };

  const setupRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Try Chrome on desktop."
      );
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        setRawNote((prev) => {
          const combined = `${prev} ${finalTranscript}`.trim();
          return cleanDictationText(combined);
        });
      }

      setInterimText(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setError("Voice dictation had an issue. Stop and start recording again.");
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      setInterimText("");
    };

    return recognition;
  };

  const handleRecord = () => {
    setError("");
    setSuccess("");

    if (!recognitionRef.current) {
      recognitionRef.current = setupRecognition();
    }

    if (!recognitionRef.current) return;

    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }

    try {
      recognitionRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      setError("Recording is already starting. Try again in a second.");
    }
  };

  const handleCleanRawNote = () => {
    setRawNote((prev) => cleanDictationText(prev));
    setError("");
    setSuccess("Dictation cleaned.");
  };

  const handleClearDictation = () => {
    setRawNote("");
    setInterimText("");
    setFormattedNote("");
    setError("");
    setSuccess("");
  };

  const handleGenerate = () => {
    const cleanedRaw = cleanDictationText(rawNote);

    if (!cleanedRaw.trim()) {
      setError("Enter or speak a note first.");
      setSuccess("");
      return;
    }

    setRawNote(cleanedRaw);
    setError("");
    setSuccess("");

    const metadataText =
      "Client: " +
      (clientName || "Not listed") +
      "\nSession Date: " +
      (sessionDate || "Not listed") +
      "\nSession Length: " +
      (sessionLength || "Not listed") +
      " minutes\nRisk Level: " +
      riskLevel +
      "\n\nSession Summary:\n" +
      cleanedRaw;

    const formatted = generateSoapNote(metadataText, noteType, auditSafe);
    setFormattedNote(formatted);
    setSuccess("SOAP note generated.");
  };

  const handleCopyFormatted = async () => {
    if (!formattedNote.trim()) {
      setError("Generate a SOAP note before copying.");
      setSuccess("");
      return;
    }

    try {
      await navigator.clipboard.writeText(formattedNote);
      setError("");
      setSuccess("SOAP note copied.");
    } catch (err) {
      console.error(err);
      setError("Unable to copy note.");
      setSuccess("");
    }
  };

  const handleSave = async () => {
    if (!formattedNote.trim()) {
      setError("Generate the SOAP note before saving.");
      setSuccess("");
      return;
    }

    try {
      await saveNote({
        title,
        noteType,
        rawNote,
        formattedNote,
        auditSafe,
        clientName,
        sessionDate,
        sessionLength,
        riskLevel,
      });

      navigate("/my-notes");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save note.");
      setSuccess("");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h4">New Note</Typography>
        {recording && <Chip label="Recording" color="error" size="small" />}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quick Start
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="contained" onClick={handleUseLast}>
            Use Last Session
          </Button>

          {templates.map((template) => (
            <Button
              key={template.name}
              variant="outlined"
              onClick={() => applyTemplate(template)}
            >
              {template.name}
            </Button>
          ))}
        </Stack>
      </Paper>

      <Stack spacing={2}>
        <TextField
          label="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />

        <TextField
          label="Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Session Date"
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          select
          label="Session Length"
          value={sessionLength}
          onChange={(e) => setSessionLength(e.target.value)}
          fullWidth
        >
          <MenuItem value="15">15 minutes</MenuItem>
          <MenuItem value="30">30 minutes</MenuItem>
          <MenuItem value="45">45 minutes</MenuItem>
          <MenuItem value="50">50 minutes</MenuItem>
          <MenuItem value="53">53 minutes</MenuItem>
          <MenuItem value="60">60 minutes</MenuItem>
          <MenuItem value="90">90 minutes</MenuItem>
        </TextField>

        <TextField
          select
          label="Risk Level"
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value)}
          fullWidth
        >
          <MenuItem value="none">None / Not Assessed</MenuItem>
          <MenuItem value="low">Low Risk</MenuItem>
          <MenuItem value="moderate">Moderate Risk</MenuItem>
          <MenuItem value="high">High Risk</MenuItem>
        </TextField>

        <TextField
          select
          label="Note Type"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          fullWidth
        >
          {noteTypes.map((note) => (
            <MenuItem key={note.value} value={note.value}>
              {note.label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant={recording ? "contained" : "outlined"}
          color={recording ? "error" : "primary"}
          onClick={handleRecord}
        >
          {recording ? "Stop Recording" : "Start Voice Dictation"}
        </Button>

        {interimText && <Alert severity="info">Hearing: {interimText}</Alert>}

        <TextField
          label="Raw Note / Dictation"
          multiline
          minRows={7}
          value={rawNote}
          onChange={(e) => setRawNote(e.target.value)}
          fullWidth
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="outlined" onClick={handleCleanRawNote}>
            Clean Dictation
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleClearDictation}
          >
            Clear Dictation
          </Button>
        </Stack>

        <Button variant="contained" onClick={handleGenerate}>
          Generate SOAP Note
        </Button>

        <TextField
          label="Formatted SOAP Note"
          multiline
          minRows={8}
          value={formattedNote}
          onChange={(e) => setFormattedNote(e.target.value)}
          fullWidth
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={handleCopyFormatted}
            disabled={!formattedNote.trim()}
          >
            Copy SOAP Note
          </Button>

          <Button variant="contained" color="success" onClick={handleSave}>
            Save Note
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}