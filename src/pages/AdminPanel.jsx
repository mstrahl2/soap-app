// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Alert,
  Box,
  CircularProgress,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import {
  getAllUsers,
  isAdmin,
  updateUserRole,
  updateUserTier,
  sendAdminInvite,
  updateUserAccessOverride,
} from "../firebase/firestoreHelper";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";

const roles = [
  { value: "free", label: "Free User" },
  { value: "premium", label: "Premium User" },
  { value: "admin", label: "Admin" },
];

const tiers = [
  { value: "free", label: "Free (15/mo)" },
  { value: "pro", label: "Pro (100/mo)" },
  { value: "unlimited", label: "Unlimited" },
];

const overrides = [
  { value: "none", label: "None" },
  { value: "tester", label: "Tester (Unlimited)" },
  { value: "comped", label: "Comped (Unlimited)" },
];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const authorized = await isAdmin();

        if (!authorized) {
          navigate("/dashboard");
          return;
        }

        await fetchUsers();
      } catch (err) {
        console.error(err);
        setError("Error verifying admin access.");
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = auth.currentUser?.uid;

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUserId && newRole !== "admin") {
      setError("You cannot remove your own admin access.");
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      setSuccess("User role updated.");
      setError("");
      await fetchUsers();
    } catch (err) {
      setError("Failed to update role.");
      setSuccess("");
    }
  };

  const handleTierChange = async (userId, newTier) => {
    try {
      await updateUserTier(userId, newTier);
      setSuccess("User tier updated.");
      setError("");
      await fetchUsers();
    } catch (err) {
      setError("Failed to update tier.");
      setSuccess("");
    }
  };

  const handleOverrideChange = async (userId, newOverride) => {
    try {
      await updateUserAccessOverride(userId, newOverride);
      setSuccess("Access override updated.");
      setError("");
      await fetchUsers();
    } catch (err) {
      setError("Failed to update override.");
      setSuccess("");
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      setError("Enter an email.");
      return;
    }

    try {
      await sendAdminInvite(inviteEmail.trim());
      setSuccess("Invite sent.");
      setInviteEmail("");
      setError("");
    } catch {
      setError("Failed to send invite.");
      setSuccess("");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage users, subscriptions, and access overrides.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <TextField
          label="Invite Email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSendInvite}>
          Send Invite
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Tier</TableCell>
              <TableCell>Override</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {user.email || user.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[user.firstName, user.lastName].filter(Boolean).join(" ") || "-"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {user.accessOverride === "tester" && (
                      <Chip label="Tester" color="info" size="small" />
                    )}
                    {user.accessOverride === "comped" && (
                      <Chip label="Comped" color="success" size="small" />
                    )}
                    {user.subscription?.status === "active" && (
                      <Chip label="Paid" color="primary" size="small" />
                    )}
                  </TableCell>

                  <TableCell>
                    <Select
                      value={user.role || "free"}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      size="small"
                      disabled={isCurrentUser}
                    >
                      {roles.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                          {r.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={user.tier || "free"}
                      onChange={(e) =>
                        handleTierChange(user.id, e.target.value)
                      }
                      size="small"
                    >
                      {tiers.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={user.accessOverride || "none"}
                      onChange={(e) =>
                        handleOverrideChange(user.id, e.target.value)
                      }
                      size="small"
                    >
                      {overrides.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}