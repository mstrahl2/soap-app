// src/pages/ProfileSetup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../firebase/firestoreHelper";
import {
  Box,
  Button,
  Container,
  Typography,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";

const occupations = [
  "Mental Health Therapist",
  "Physical Therapist",
  "Occupational Therapist",
  "Speech Therapist",
  "Medical Doctor",
  "Nurse Practitioner",
  "Social Worker",
  "Other",
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [occupation, setOccupation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        if (profile.occupation) {
          // Already set, redirect to dashboard
          navigate("/dashboard");
        }
      } catch {
        // If no profile, user must still select occupation
      }
      setLoading(false);
    }
    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!occupation) {
      setError("Please select your occupation.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateProfile({ occupation });
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to save occupation: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Please select your occupation to continue
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        select
        label="Occupation"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
        fullWidth
        required
        margin="normal"
      >
        {occupations.map((occ) => (
          <MenuItem key={occ} value={occ}>
            {occ}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        fullWidth
        sx={{ mt: 2 }}
      >
        {saving ? "Saving..." : "Save and Continue"}
      </Button>
    </Container>
  );
}
