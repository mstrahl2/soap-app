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
} from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Sign Up
              </Button>
              <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                Already have an account?{" "}
                <Link component={NavLink} to="/login">
                  Log In
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
