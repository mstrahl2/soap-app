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
  const [errorMsg, setErrorMsg] = useState("");

  // Load user profile on mount to get current plan
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        const plan = profile?.plan || "free";
        setCurrentPlan(plan);
        setSelectedPlan(plan);
      } catch (err) {
        console.error("Failed to load profile", err);
        setErrorMsg("Failed to load your subscription plan.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Map plan keys to Stripe price IDs
  const priceIdMap = {
    pro: "price_1RczPNRvfrmnvHuYe5qqGK0F",
    group: "price_1RczQKRvfrmnvHuYJXkaNLq2",
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    // If user selects free plan, just update profile immediately (no Stripe checkout)
    if (selectedPlan === "free") {
      setSaving(true);
      try {
        await updateUserProfile({ plan: selectedPlan });
        setCurrentPlan(selectedPlan);
        setSuccessMsg("Plan updated successfully!");
      } catch (err) {
        console.error("Error updating plan:", err);
        setErrorMsg("Failed to update plan. Please try again.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // For Pro or Group plans, initiate Stripe Checkout session
    try {
      setSaving(true);
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId: priceIdMap[selectedPlan] }),
      });

      const data = await res.json();

      if (data?.url) {
        // Redirect to Stripe Checkout page
        window.location.href = data.url;
      } else {
        setErrorMsg("Failed to start checkout. Please try again.");
        setSaving(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMsg("An error occurred during checkout. Please try again.");
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
        <FormControlLabel
          value="pro"
          control={<Radio />}
          label="Pro Plan – For individuals"
        />
        <FormControlLabel
          value="group"
          control={<Radio />}
          label="Group Plan – For teams or practices"
        />
      </RadioGroup>

      {errorMsg && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={handleSave}
        disabled={saving || selectedPlan === currentPlan}
      >
        {saving ? "Processing..." : "Upgrade"}
      </Button>

      <Button sx={{ mt: 4 }} onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </Button>
    </Container>
  );
}
