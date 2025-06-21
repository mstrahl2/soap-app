// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Typography, CircularProgress, Box } from "@mui/material";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [uid]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (!profile)
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        No profile data found. Please update your profile.
      </Typography>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Profile Information
      </Typography>
      <Typography>
        <strong>First Name:</strong> {profile.firstName || "-"}
      </Typography>
      <Typography>
        <strong>Last Name:</strong> {profile.lastName || "-"}
      </Typography>
      <Typography>
        <strong>Preferred Name:</strong> {profile.preferredName || "-"}
      </Typography>
      <Typography>
        <strong>Address 1:</strong> {profile.address1 || "-"}
      </Typography>
      <Typography>
        <strong>Address 2:</strong> {profile.address2 || "-"}
      </Typography>
      <Typography>
        <strong>City:</strong> {profile.city || "-"}
      </Typography>
      <Typography>
        <strong>State:</strong> {profile.state || "-"}
      </Typography>
      <Typography>
        <strong>Zip Code:</strong> {profile.zipCode || "-"}
      </Typography>
      <Typography>
        <strong>Occupation:</strong> {profile.occupation || "-"}
      </Typography>
    </Box>
  );
}
