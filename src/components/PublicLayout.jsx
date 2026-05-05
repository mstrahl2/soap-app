import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Link,
} from "@mui/material";

export default function PublicLayout() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="#f7f8fa"
      pb="64px"
    >
      <Container maxWidth="sm" sx={{ mt: 8, flexGrow: 1 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            NoteWell AI
          </Typography>

          <Typography color="text.secondary">
            Mental health documentation, simplified.
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </Container>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "#fff",
          borderTop: "1px solid #e5e7eb",
          py: 1,
          px: 2,
          textAlign: "center",
          fontSize: "0.75rem",
          color: "text.secondary",
        }}
      >
        © {new Date().getFullYear()} NoteWell AI. &nbsp;|&nbsp;
        <Link component={NavLink} to="/dashboard" underline="hover">
          Dashboard
        </Link>
        &nbsp;|&nbsp;
        <Link component={NavLink} to="/privacy-policy" underline="hover">
          Privacy
        </Link>
        &nbsp;|&nbsp;
        <Link component={NavLink} to="/terms-of-service" underline="hover">
          Terms
        </Link>
        &nbsp;|&nbsp;
        <Link component={NavLink} to="/disclaimer" underline="hover">
          Disclaimer
        </Link>
      </Box>
    </Box>
  );
}