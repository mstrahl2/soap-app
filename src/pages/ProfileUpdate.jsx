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
} from "@mui/material";

const occupations = [
  "Physical Therapist",
  "Occupational Therapist",
  "Speech Therapist",
  "Mental Health Counselor",
  "Psychologist",
  "Psychiatrist",
  "Social Worker",
  "Physician",
  "Nurse",
  "Chiropractor",
  "Massage Therapist",
  "Behavioral Therapist",
];

export default function ProfileUpdate() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    preferredName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    occupation: "",
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
          setProfile((prev) => ({ ...prev, ...docSnap.data() }));
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
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!auth.currentUser) {
        setError("User not authenticated.");
        return;
      }
      const docRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(docRef, profile, { merge: true });
      setSuccess("Profile saved successfully!");
      setTimeout(() => navigate("/dashboard"), 1500); // Redirect to dashboard after save
    } catch (err) {
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        color: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="sm" sx={{ my: 6, flexGrow: 1 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Update Profile
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
              <TextField
                label="First Name"
                name="firstName"
                value={profile.firstName || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={profile.lastName || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Preferred Name"
                name="preferredName"
                value={profile.preferredName || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Address 1"
                name="address1"
                value={profile.address1 || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Address 2"
                name="address2"
                value={profile.address2 || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="City"
                name="city"
                value={profile.city || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="State"
                name="state"
                value={profile.state || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Zip Code"
                name="zipCode"
                value={profile.zipCode || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                select
                label="Occupation"
                name="occupation"
                value={profile.occupation || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                {occupations.map((occ) => (
                  <MenuItem key={occ} value={occ}>
                    {occ}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
              >
                Save Updates
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
