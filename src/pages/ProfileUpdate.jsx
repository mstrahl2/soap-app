// src/pages/ProfileUpdate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  MenuItem,
  Stack,
} from "@mui/material";

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

export default function ProfileUpdate() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    preferredName: "",
    practiceName: "",
    state: "",
    licenseType: "",
  });

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!auth.currentUser) return;

      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile((prev) => ({
            ...prev,
            ...docSnap.data(),
          }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      }

      setLoading(false);
    }

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!auth.currentUser) {
      setError("User not authenticated.");
      return;
    }

    if (!profile.firstName || !profile.lastName || !profile.licenseType || !profile.state) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      const docRef = doc(db, "users", auth.currentUser.uid);

      await setDoc(
        docRef,
        {
          ...profile,
          field: "mental-health",
          profileComplete: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile: " + err.message);
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", color: "#1a1a1a" }}>
      <Container maxWidth="sm" sx={{ my: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Update Mental Health Profile
            </Typography>

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

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={profile.firstName || ""}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  label="Last Name"
                  name="lastName"
                  value={profile.lastName || ""}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  label="Preferred Name"
                  name="preferredName"
                  value={profile.preferredName || ""}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  label="Practice Name"
                  name="practiceName"
                  value={profile.practiceName || ""}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  select
                  label="License Type"
                  name="licenseType"
                  value={profile.licenseType || ""}
                  onChange={handleChange}
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
                  name="state"
                  value={profile.state || ""}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Example: FL"
                />

                <Button type="submit" variant="contained" fullWidth>
                  Save Updates
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}