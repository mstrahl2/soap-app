// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import {
  getProfile,
  getUserFreeNotesRemaining,
  hasActiveSubscription,
} from "../firebase/firestoreHelper";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [remainingNotes, setRemainingNotes] = useState(null);
  const [hasSub, setHasSub] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            const userProfile = await getProfile();
            setProfile(userProfile);

            const tier =
              userProfile?.tier || "free";

            const sub = await hasActiveSubscription();
            setHasSub(sub);

            if (tier === "free" && !sub) {
              const remaining = await getUserFreeNotesRemaining();
              setRemainingNotes(remaining);
            } else {
              setRemainingNotes("∞");
            }

            setLoading(false);
            unsubscribe();
          }
        });
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleUpgrade = () => navigate("/upgrade-plan");
  const handleNewNote = () => navigate("/new-note");

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  const displayName = profile?.preferredName || profile?.firstName || "User";
  const licenseType = profile?.licenseType || "Not set";
  const tier = profile?.tier || "free";

  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Welcome, {displayName}.
      </Typography>

      <Typography variant="body1" gutterBottom>
        License: {licenseType}
      </Typography>

      {/* TRUST BOX */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Notes generated are assistive drafts. Always review and finalize before clinical use.
      </Alert>

      {/* PLAN CARD */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Your Plan</Typography>

          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Typography>

          {tier === "free" && !hasSub ? (
            <>
              <Typography variant="body2">
                {remainingNotes} of 15 notes remaining this month
              </Typography>

              {remainingNotes <= 3 && (
                <Typography color="error" mt={1}>
                  You're almost out of notes.
                </Typography>
              )}

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleUpgrade}
              >
                Upgrade Plan
              </Button>
            </>
          ) : (
            <Typography color="text.secondary">
              Unlimited note access active
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <Stack spacing={2}>
        <Button variant="contained" size="large" onClick={handleNewNote}>
          Create New Note
        </Button>

        <Button variant="outlined" onClick={() => navigate("/my-notes")}>
          View My Notes
        </Button>
      </Stack>
    </Box>
  );
}