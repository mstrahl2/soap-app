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
} from "@mui/material";
import {
  getAllUsers,
  isAdmin,
  updateUserRole,
  updateUserTier,
} from "../firebase/firestoreHelper";
import { useNavigate } from "react-router-dom";

const roles = ["free", "premium", "admin"];
const tiers = ["Free", "Pro", "Team"];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const authorized = await isAdmin();
        if (!authorized) {
          navigate("/dashboard");
        } else {
          fetchUsers();
        }
      } catch (err) {
        setError("Error verifying admin access.");
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setLoading(false);
    } catch (err) {
      setError("Failed to load users.");
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setSuccess("User role updated.");
      setError("");
      fetchUsers();
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
      fetchUsers();
    } catch (err) {
      setError("Failed to update tier.");
      setSuccess("");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Change Role</TableCell>
              <TableCell>Tier</TableCell>
              <TableCell>Change Tier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email || user.id}</TableCell>
                <TableCell>{user.role || "free"}</TableCell>
                <TableCell>
                  <Select
                    value={user.role || "free"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    size="small"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>

                <TableCell>{user.tier || "Free"}</TableCell>
                <TableCell>
                  <Select
                    value={user.tier || "Free"}
                    onChange={(e) => handleTierChange(user.id, e.target.value)}
                    size="small"
                  >
                    {tiers.map((tier) => (
                      <MenuItem key={tier} value={tier}>
                        {tier}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
