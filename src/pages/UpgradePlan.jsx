// src/pages/UpgradePlan.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Chip,
  Box,
  Alert,
} from "@mui/material";
import {
  getProfile,
  hasActiveSubscription,
} from "../firebase/firestoreHelper";

export default function UpgradePlan() {
  const [profile, setProfile] = useState(null);
  const [hasSub, setHasSub] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const p = await getProfile();
      const sub = await hasActiveSubscription();

      setProfile(p);
      setHasSub(sub);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleUpgrade = async (plan) => {
    setProcessing(true);

    try {
      const token = await auth.currentUser.getIdToken();

      const priceMap = {
        pro: import.meta.env.VITE_STRIPE_PRICE_PRO,
        unlimited: import.meta.env.VITE_STRIPE_PRICE_UNLIMITED,
      };

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceMap[plan],
          planName: plan,
        }),
      });

      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Upgrade failed");
    }

    setProcessing(false);
  };

  if (loading) return <CircularProgress />;

  const tier = profile?.tier || "free";
  const override = profile?.accessOverride;

  // 🔥 FULL ACCESS (tester / comped / paid)
  if (override === "tester" || override === "comped" || hasSub) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography variant="h4" gutterBottom>
          You're all set
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          You already have full access to NoteWell AI.
        </Alert>

        <Button variant="contained" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Upgrade Your Plan
      </Typography>

      <Typography align="center" color="text.secondary" mb={4}>
        Save hours of documentation every week with NoteWell AI
      </Typography>

      <Grid container spacing={3}>
        {/* FREE */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Free</Typography>
              <Typography variant="h4">$0</Typography>
              <Typography>15 notes/month</Typography>

              <Button fullWidth disabled>
                {tier === "free" ? "Current Plan" : "Included"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* PRO */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: "2px solid #1976d2" }}>
            <CardContent>
              <Chip label="Most Popular" color="primary" sx={{ mb: 1 }} />

              <Typography variant="h6">Pro</Typography>
              <Typography variant="h4">$9/mo</Typography>

              <Typography>100 notes/month</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Perfect for regular client load
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={processing}
                onClick={() => handleUpgrade("pro")}
              >
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* UNLIMITED */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Unlimited</Typography>
              <Typography variant="h4">$19/mo</Typography>

              <Typography>Unlimited notes</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Best for high-volume clinicians
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={processing}
                onClick={() => handleUpgrade("unlimited")}
              >
                Go Unlimited
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}