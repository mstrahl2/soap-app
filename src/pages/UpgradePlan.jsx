// src/pages/UpgradePlan.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getProfile, updateUserProfile } from "../firebase/firestoreHelper";

export default function UpgradePlan() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        const plan = profile?.plan || "free";
        setCurrentPlan(plan);
        setSelectedPlan(plan);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ plan: selectedPlan });
      setCurrentPlan(selectedPlan);
      setSuccessMsg("Plan updated successfully!");
    } catch (err) {
      console.error("Error updating plan:", err);
    } finally {
      setSaving(false);
    }
  };

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
        Upgrade Your Plan
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Current Plan: <strong>{currentPlan}</strong>
      </Typography>

      <RadioGroup
        value={selectedPlan}
        onChange={(e) => setSelectedPlan(e.target.value)}
      >
        <FormControlLabel value="free" control={<Radio />} label="Free Plan" />
        <FormControlLabel value="pro" control={<Radio />} label="Pro Plan - For individuals" />
        <FormControlLabel value="group" control={<Radio />} label="Group Plan - For teams or practices" />
      </RadioGroup>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={handleSave}
        disabled={saving || selectedPlan === currentPlan}
      >
        {saving ? "Saving..." : "Upgrade"}
      </Button>

      {successMsg && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Button sx={{ mt: 4 }} onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </Button>
    </Container>
  );
}
