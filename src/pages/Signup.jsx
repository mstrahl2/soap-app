// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { createProfile } from "../firebase/firestoreHelper";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeToTerms) {
      setError("You must agree to the terms to create an account.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await createProfile(user.uid); // creates default profile
      navigate("/profile-update");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Sign Up
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSignup}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          fullWidth
          margin="normal"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              required
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{" "}
              <Link component={RouterLink} to="/terms">
                Terms of Service
              </Link>
              ,{" "}
              <Link component={RouterLink} to="/privacy">
                Privacy Policy
              </Link>
              , and{" "}
              <Link component={RouterLink} to="/disclaimer">
                Medical Disclaimer
              </Link>
              .
            </Typography>
          }
          sx={{ mt: 2 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={!agreeToTerms}
        >
          Sign Up
        </Button>
      </form>
      <Box mt={2}>
        <Typography variant="body2">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
