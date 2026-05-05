import React, { useEffect, useState } from "react";
import { Alert, CircularProgress, Box } from "@mui/material";
import { canUserCreateNote } from "../firebase/firestoreHelper";

export default function NoteUsage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const data = await canUserCreateNote();
        setUsage(data);
      } catch (err) {
        console.error("Error fetching note usage:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, []);

  if (loading) {
    return (
      <Box sx={{ my: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (!usage) return null;

  const unlimited = usage.allowed === Infinity;

  return (
    <Alert severity={unlimited ? "success" : usage.remaining <= 3 ? "warning" : "info"}>
      {unlimited
        ? "Unlimited note access is active."
        : `${usage.remaining} of ${usage.allowed} notes remaining this month.`}
    </Alert>
  );
}