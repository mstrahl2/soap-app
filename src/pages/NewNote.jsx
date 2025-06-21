// src/pages/NewNote.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  addNote as saveNote,
  getProfile,
  getUserFreeNotesRemaining,
} from "../firebase/firestoreHelper";

const noteTypes = [
  { value: "session", label: "Session" },
  { value: "progress", label: "Progress" },
  { value: "discharge", label: "Discharge" },
];

export default function NewNote() {
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState("session");
  const [rawNote, setRawNote] = useState("");
  const [formattedNote, setFormattedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [remaining, setRemaining] = useState(null);

  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const previousTranscriptRef = useRef("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const prof = await getProfile();
        setProfile(prof);
        if (prof.subscriptionTier === "free") {
          const count = await getUserFreeNotesRemaining();
          setRemaining(count);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleStartStop = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("")
          .trim();

        if (transcript && transcript !== previousTranscriptRef.current) {
          setRawNote((prev) => (prev.trim() + " " + transcript).trim());
          previousTranscriptRef.current = transcript;
        }
      };

      recognitionRef.current.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setSpeechActive(false);
      };

      recognitionRef.current.onend = () => {
        setSpeechActive(false);
      };
    }

    if (speechActive) {
      recognitionRef.current.stop();
    } else {
      previousTranscriptRef.current = "";
      recognitionRef.current.start();
    }

    setSpeechActive((prev) => !prev);
  };

  const handleGenerate = () => {
    if (!rawNote.trim()) {
      setError("Please enter or dictate a note first.");
      return;
    }

    setLoading(true);
    setError("");

    let formatted;

    const occupation = profile?.occupation?.toLowerCase() || "";

    if (occupation.includes("mental health") || occupation.includes("therapist")) {
      formatted = `**S (Subjective):** ${rawNote}\n\n**O (Objective):** Client appeared well-groomed and cooperative. [Add mental status observations here.]\n\n**A (Assessment):** [Include diagnostic impressions and clinical formulation.]\n\n**P (Plan):** Continue CBT weekly. Plan to address emotional regulation next session.`;
    } else if (occupation.includes("physical therapist")) {
      formatted = `**S (Subjective):** ${rawNote}\n\n**O (Objective):** ROM measured, gait observed. [Add mobility and physical findings.]\n\n**A (Assessment):** Progress consistent with rehab plan. [Add barriers or improvements.]\n\n**P (Plan):** Continue strength exercises 3x/week. Reevaluate in 2 weeks.`;
    } else if (occupation.includes("speech") || occupation.includes("slp")) {
      formatted = `**S (Subjective):** ${rawNote}\n\n**O (Objective):** Articulation and fluency assessed. [Insert therapy data.]\n\n**A (Assessment):** Client shows improvement in /s/ and /r/ sounds.\n\n**P (Plan):** Focus on multisyllabic words and sentence practice next session.`;
    } else {
      // Default SOAP note structure
      formatted = `**S (Subjective):** ${rawNote}\n\n**O (Objective):** [Add observations here]\n\n**A (Assessment):** [Add assessment here]\n\n**P (Plan):** [Add plan here]`;
    }

    setFormattedNote(formatted);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formattedNote.trim()) {
      setError("Please generate the formatted SOAP note before saving.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await saveNote({
        title,
        noteType,
        rawNote,
        formattedNote,
      });
      navigate("/my-notes");
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        New Note
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {profile?.subscriptionTier === "free" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {remaining !== null
            ? `You have ${remaining} free notes remaining out of 15.`
            : "Checking note limit..."}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Note Type"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          fullWidth
          required
        >
          {noteTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Raw Note"
          value={rawNote}
          onChange={(e) => setRawNote(e.target.value)}
          fullWidth
          multiline
          minRows={6}
        />

        <Button
          variant={speechActive ? "outlined" : "contained"}
          color="primary"
          onClick={handleStartStop}
        >
          {speechActive ? "Stop Recording" : "Start Recording"}
        </Button>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
        >
          Generate SOAP Note
        </Button>

        <TextField
          label="Formatted SOAP Note"
          value={formattedNote}
          onChange={(e) => setFormattedNote(e.target.value)}
          fullWidth
          multiline
          minRows={6}
        />

        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={loading || !formattedNote.trim()}
        >
          Save Note
        </Button>

        {loading && <CircularProgress />}
      </Stack>
    </Box>
  );
}
