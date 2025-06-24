import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function UpgradeCancelled() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        ⚠️ Upgrade Cancelled
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        It looks like your checkout was canceled. No changes were made to your plan.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/upgrade")}
        sx={{ mt: 3 }}
      >
        Try Again
      </Button>

      <Button
        onClick={() => navigate("/dashboard")}
        sx={{ mt: 2, ml: 2 }}
      >
        Go to Dashboard
      </Button>
    </Container>
  );
}
