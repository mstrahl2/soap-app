import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import { auth } from "../firebase/firebaseConfig";
import { getProfile } from "../firebase/firestoreHelper";
import dayjs from "dayjs";

export default function AccountSettings() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const prof = await getProfile();
        setProfile(prof);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleCancelSubscription = async () => {
    setStatus(null);
    setConfirmOpen(false);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to cancel subscription");
      }

      setStatus("success");

      // Re-fetch profile to update UI
      const updated = await getProfile();
      setProfile(updated);

      setTimeout(() => {
        navigate("/dashboard");
      }, 4000);
    } catch (err) {
      console.error("Cancel error:", err);
      setStatus("error");
    }
  };

  const hasActiveSubscription =
    profile?.subscription?.stripeSubscriptionId &&
    profile?.subscription?.status !== "canceled";

  const subscription = profile?.subscription || {};

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date =
      typeof timestamp === "object" && timestamp.seconds
        ? dayjs.unix(timestamp.seconds)
        : dayjs(timestamp);
    return date.format("MMMM D, YYYY");
  };

  if (loading) {
    return (
      <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      <Box mt={3}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => navigate("/profile-update")}
        >
          Update Profile
        </Button>

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mb: 2 }}
          onClick={() => navigate("/upgrade")}
        >
          Upgrade Plan
        </Button>

        {hasActiveSubscription && (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={() => setConfirmOpen(true)}
          >
            Cancel Subscription
          </Button>
        )}
      </Box>

      {/* Billing Summary */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Billing Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography>
          <strong>Plan:</strong>{" "}
          {subscription.planName ? subscription.planName : "Free"}
        </Typography>
        <Typography>
          <strong>Status:</strong>{" "}
          {subscription.status ? subscription.status : "N/A"}
        </Typography>
        {subscription.cancel_at_period_end && (
          <Typography color="warning.main">
            Subscription will end on{" "}
            <strong>{formatDate(subscription.current_period_end)}</strong>
          </Typography>
        )}
        {subscription.status === "canceled" && (
          <Typography color="error" sx={{ mt: 1 }}>
            This subscription was cancelled on{" "}
            <strong>{formatDate(subscription.cancelRequestedAt)}</strong>.
          </Typography>
        )}
      </Paper>

      {/* Alerts */}
      {status === "success" && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Subscription cancelled successfully. Redirecting to dashboard...
        </Alert>
      )}
      {status === "error" && (
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to cancel subscription. Please try again or contact support.
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel your subscription? You’ll still have
          access until the end of your billing cycle.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Keep Subscription</Button>
          <Button onClick={handleCancelSubscription} color="error">
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
