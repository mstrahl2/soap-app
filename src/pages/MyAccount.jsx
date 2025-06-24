import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getProfile, saveUserProfile } from "../firebase/firestoreHelper";

const plans = [
  {
    name: "free",
    displayName: "Free",
    price: "$0",
    description: "Up to 15 notes",
    features: [
      "Basic SOAP formatting",
      "Voice-to-text input",
      "Access to past notes",
    ],
  },
  {
    name: "pro",
    displayName: "Pro",
    price: "$9/mo",
    description: "Unlimited notes + export/share",
    features: [
      "Everything in Free",
      "Unlimited notes",
      "Export & Share",
      "Priority support",
    ],
  },
  {
    name: "group",
    displayName: "Group",
    price: "$25/mo",
    description: "For small practices",
    features: [
      "Everything in Pro",
      "5 users included",
      "Shared workspace",
      "Admin panel",
    ],
  },
];

const allFeatures = Array.from(
  new Set(plans.flatMap((plan) => plan.features))
);

export default function MyAccount() {
  const [currentPlan, setCurrentPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchCurrentPlan() {
      try {
        const profile = await getProfile();
        setCurrentPlan(profile?.plan || "free");
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setErrorMsg("Failed to load your current plan.");
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentPlan();
  }, []);

  const handleChoosePlan = async (planName) => {
    setSuccessMsg("");
    setErrorMsg("");

    if (planName === currentPlan) return;

    // For free plan, update immediately
    if (planName === "free") {
      setUpdating(true);
      try {
        await updateUserProfile({ plan: planName });
        setCurrentPlan(planName);
        setSuccessMsg("Plan updated successfully!");
      } catch (err) {
        console.error("Failed to update plan", err);
        setErrorMsg("Failed to update plan. Please try again.");
      } finally {
        setUpdating(false);
      }
      return;
    }

    // For pro or group, navigate to /upgrade for Stripe checkout flow
    window.location.href = "/upgrade";
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        My Account
      </Typography>
      <Typography align="center" sx={{ mb: 4 }}>
        Current Plan: <strong>{currentPlan}</strong>
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.name}>
            <Paper
              elevation={4}
              sx={{
                border: "2px solid transparent",
                "&:hover": {
                  borderColor: "#1976d2",
                },
                borderRadius: 3,
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Typography variant="h6" align="center" gutterBottom>
                {plan.displayName}
              </Typography>
              <Typography
                variant="h4"
                align="center"
                sx={{ color: "#1976d2", mb: 1 }}
              >
                {plan.price}
              </Typography>
              <Typography align="center" color="text.secondary" gutterBottom>
                {plan.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box component="ul" sx={{ listStyle: "none", pl: 0, flex: 1 }}>
                {allFeatures.map((feature, i) => (
                  <Box
                    component="li"
                    key={i}
                    sx={{
                      py: 0.5,
                      color: plan.features.includes(feature)
                        ? "text.primary"
                        : "text.disabled",
                    }}
                  >
                    {plan.features.includes(feature) ? "✅ " : "— "}
                    {feature}
                  </Box>
                ))}
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => handleChoosePlan(plan.name)}
                aria-label={`Choose the ${plan.displayName} plan`}
                disabled={plan.name === currentPlan || updating}
              >
                {plan.name === currentPlan
                  ? "Current Plan"
                  : updating
                  ? "Updating..."
                  : `Choose ${plan.displayName}`}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* Legal & Policy Links */}
      <Box textAlign="center">
        <Typography variant="subtitle1" gutterBottom>
          Legal & Policy Documents
        </Typography>
        <Box display="flex" justifyContent="center" gap={3} flexWrap="wrap">
          <Link href="/terms" underline="hover">
            Terms of Service
          </Link>
          <Link href="/privacy" underline="hover">
            Privacy Policy
          </Link>
          <Link href="/disclaimer" underline="hover">
            Medical Disclaimer
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
