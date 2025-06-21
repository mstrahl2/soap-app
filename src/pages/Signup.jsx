// src/pages/Signup.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Link,
  Alert,
  MenuItem,
  Divider,
} from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { saveUserProfile } from "../firebase/firestoreHelper";

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

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [occupation, setOccupation] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserProfile(user.uid, {
        occupation,
        subscriptionTier: "free",
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Optional: create profile for Google users if needed here
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            SOAP App
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Create an account
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSignup} noValidate>
              <TextField
                label="Email"
                fullWidth
                type="email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Password"
                fullWidth
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <TextField
                label="Occupation"
                select
                fullWidth
                margin="normal"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
              >
                {occupations.map((occ) => (
                  <MenuItem key={occ} value={occ}>
                    {occ}
                  </MenuItem>
                ))}
              </TextField>
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Sign Up
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Button variant="outlined" fullWidth onClick={handleGoogleSignIn}>
              Sign up with Google
            </Button>

            <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
              Already have an account?{" "}
              <Link component={NavLink} to="/login">
                Log In
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: "center", bgcolor: "#f0f0f0", mt: "auto" }}>
        <Typography variant="body2">© {new Date().getFullYear()} SOAP App</Typography>
      </Box>
    </Box>
  );
}
