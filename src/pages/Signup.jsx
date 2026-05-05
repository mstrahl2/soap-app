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
  Stack,
} from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { createUserProfile } from "../firebase/firestoreHelper";

const AGREEMENT_VERSION = "1.0";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeToTerms) {
      setError("You must read and agree before creating an account.");
      return;
    }

    try {
      setSaving(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await createUserProfile(user.uid, {
        email: user.email,
        tier: "free",
        role: "free",
        accessOverride: "none",
        agreementAccepted: true,
        agreementAcceptedAt: new Date().toISOString(),
        agreementVersion: AGREEMENT_VERSION,
        createdAt: new Date().toISOString(),
      });

      navigate("/profile-update");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Create your NoteWell AI account
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Mental health documentation, simplified.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSignup}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            fullWidth
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            fullWidth
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Box
            sx={{
              border: "1px solid #d1d5db",
              borderRadius: 1,
              p: 2,
              maxHeight: 170,
              overflowY: "auto",
              bgcolor: "#fafafa",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Important use notice
            </Typography>

            <Typography variant="body2" paragraph>
              NoteWell AI provides assistive documentation tools for mental
              health professionals. Generated content is a draft and does not
              replace clinical judgment, supervision, legal guidance, payer
              requirements, employer policies, or professional standards.
            </Typography>

            <Typography variant="body2" paragraph>
              You are responsible for reviewing, editing, and approving all
              notes before use. Do not rely on generated text as medical,
              clinical, legal, billing, or compliance advice.
            </Typography>

            <Typography variant="body2">
              By creating an account, you agree to the Terms of Service, Privacy
              Policy, and Disclaimer.
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
            }
            label="I have read and agree to the terms, privacy policy, and disclaimer."
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!agreeToTerms || saving}
          >
            {saving ? "Creating Account..." : "Sign Up"}
          </Button>
        </Stack>
      </form>

      <Box mt={2}>
        <Typography variant="body2">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Login
          </Link>
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          Review{" "}
          <Link component={RouterLink} to="/terms-of-service">
            Terms
          </Link>
          ,{" "}
          <Link component={RouterLink} to="/privacy-policy">
            Privacy
          </Link>
          , and{" "}
          <Link component={RouterLink} to="/disclaimer">
            Disclaimer
          </Link>
          .
        </Typography>
      </Box>
    </Box>
  );
}