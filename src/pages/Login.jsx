// src/pages/Login.jsx
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
} from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { getProfile } from "../firebase/firestoreHelper";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function postLoginRedirect() {
    try {
      const profile = await getProfile();
      if (!profile.occupation) {
        navigate("/profile-setup");
      } else {
        navigate("/dashboard");
      }
    } catch {
      navigate("/profile-setup");
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await postLoginRedirect();
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
              Welcome back
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleLogin} noValidate>
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
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Log In
              </Button>
              <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                Don't have an account?{" "}
                <Link component={NavLink} to="/signup">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: "center", bgcolor: "#f0f0f0", mt: "auto" }}>
        <Typography variant="body2">© {new Date().getFullYear()} SOAP App</Typography>
      </Box>
    </Box>
  );
}
