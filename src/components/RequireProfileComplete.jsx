import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProfile } from "../firebase/firestoreHelper";

export default function RequireProfileComplete({ children }) {
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    async function checkProfile() {
      try {
        const profile = await getProfile();
        // Profile completeness criteria:
        // Must have at least firstName and occupation filled
        const complete =
          profile &&
          typeof profile.firstName === "string" &&
          profile.firstName.trim() !== "" &&
          typeof profile.occupation === "string" &&
          profile.occupation.trim() !== "";

        setProfileComplete(complete);
      } catch {
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    }
    checkProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!profileComplete) {
    // Redirect to profile update page if not complete
    return <Navigate to="/profile-update" replace />;
  }

  return children;
}
