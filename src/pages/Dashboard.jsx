// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import { getProfile, getUserFreeNotesRemaining } from "../firebase/firestoreHelper";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [remainingNotes, setRemainingNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const userProfile = await getProfile();
        setProfile(userProfile);

        if (userProfile.subscriptionTier === "free") {
          const remaining = await getUserFreeNotesRemaining();
          setRemainingNotes(remaining);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleUpgrade = () => {
    navigate("/my-account");
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Welcome back!
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Your Plan:</Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {profile.subscriptionTier || "free"}
          </Typography>

          {profile.subscriptionTier === "free" && (
            <>
              <Typography variant="body2" color="text.secondary" mt={1}>
                You have <strong>{remainingNotes}</strong> of 15 free notes remaining.
              </Typography>

              {remainingNotes <= 3 && (
                <Typography color="error" mt={1}>
                  You're almost out of free notes! Upgrade your plan to continue uninterrupted.
                </Typography>
              )}

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleUpgrade}
              >
                View Plans
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="body1">
            Use the tabs below to create a new SOAP note, view your notes, or update your profile.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
