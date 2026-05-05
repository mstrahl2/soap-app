import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { getProfile } from "../firebase/firestoreHelper";

export default function CancelSubscription() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const prof = await getProfile();
        if (!prof.subscription?.stripeSubscriptionId || prof.subscription.status === "canceled") {
          setError("No active subscription to cancel.");
        } else {
          setSubscription(prof.subscription);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load subscription details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Cancellation failed");
      }

      setMessage("Your subscription will be canceled at the end of the billing period.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Cancel Subscription
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      {subscription && (
        <>
          <Typography sx={{ mb: 2 }}>
            You are currently subscribed to the <strong>{subscription.planName || "active plan"}</strong>. Canceling will stop your subscription at the end of the current billing period.
          </Typography>

          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel Subscription
          </Button>
        </>
      )}
    </Box>
  );
}
