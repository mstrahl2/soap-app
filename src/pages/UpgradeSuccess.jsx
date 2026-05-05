// src/pages/UpgradeSuccess.jsx
import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function UpgradeSuccess() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 6, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        🎉 You're upgraded!
      </Typography>

      <Typography sx={{ mb: 3 }}>
        You now have full access to NoteWell AI.
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Start creating unlimited professional SOAP notes instantly.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/new-note")}
      >
        Create Your Next Note
      </Button>

      <Box sx={{ mt: 2 }}>
        <Button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
}