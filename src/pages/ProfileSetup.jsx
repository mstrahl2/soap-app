// src/pages/ProfileSetup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateUserProfile } from "../firebase/firestoreHelper";
import {
  Box,
  Button,
  Container,
  Typography,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { auth } from "../firebase/firebaseConfig";

const licenseTypes = [
  "LCSW",
  "LMHC",
  "LMFT",
  "LPC",
  "Psychologist",
  "Psychiatrist",
  "Registered Intern",
  "Other Mental Health Professional",
];

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [state, setState] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();

        if (profile?.profileComplete) {
          navigate("/dashboard");
          return;
        }

        setFirstName(profile?.firstName || "");
        setLastName(profile?.lastName || "");
        setPracticeName(profile?.practiceName || "");
        setLicenseType(profile?.licenseType || "");
        setState(profile?.state || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!firstName || !lastName || !licenseType || !state) {
      setError("Please complete all required fields.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("User not authenticated.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateUserProfile(user.uid, {
        firstName,
        lastName,
        practiceName,
        licenseType,
        state,
        field: "mental-health",
        profileComplete: true,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile: " + err.message);
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
        Set Up Your Mental Health Profile
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This helps tailor your documentation experience for therapy and behavioral health notes.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Practice Name"
          value={practiceName}
          onChange={(e) => setPracticeName(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="License Type"
          value={licenseType}
          onChange={(e) => setLicenseType(e.target.value)}
          fullWidth
          required
        >
          {licenseTypes.map((license) => (
            <MenuItem key={license} value={license}>
              {license}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          fullWidth
          required
          placeholder="Example: FL"
        />

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          fullWidth
        >
          {saving ? "Saving..." : "Save and Continue"}
        </Button>
      </Stack>
    </Container>
  );
}