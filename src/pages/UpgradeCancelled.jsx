// src/pages/UpgradeCancelled.jsx
import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function UpgradeCancelled() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 6, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Upgrade Cancelled
      </Typography>

      <Typography sx={{ mb: 3 }}>
        No worries — your plan hasn’t changed.
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        You can upgrade anytime to unlock faster documentation and save hours each week.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/upgrade-plan")}
      >
        View Plans Again
      </Button>

      <Box sx={{ mt: 2 }}>
        <Button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
}