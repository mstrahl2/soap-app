import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../firebase/firestoreHelper";

export default function UpgradeSuccess() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpdatedPlan() {
      try {
        const profile = await getProfile();
        setPlan(profile?.plan || "free");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setPlan("free");
      } finally {
        setLoading(false);
      }
    }

    fetchUpdatedPlan();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#fff",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        🎉 Upgrade Successful!
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your plan has been upgraded to: <strong>{plan}</strong>.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/dashboard")}
        sx={{ mt: 3 }}
      >
        Go to Dashboard
      </Button>
    </Container>
  );
}
