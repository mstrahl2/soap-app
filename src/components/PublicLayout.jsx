// src/components/PublicLayout.jsx
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
      justifyContent="center"
      alignItems="center"
      bgcolor="#f9f9f9"
    >
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} SOAP App. All rights reserved.
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={1}>
            <Link component={NavLink} to="/privacy-policy" underline="hover">
              Privacy Policy
            </Link>
            &nbsp;|&nbsp;
            <Link component={NavLink} to="/terms-of-service" underline="hover">
              Terms of Service
            </Link>
            &nbsp;|&nbsp;
            <Link component={NavLink} to="/disclaimer" underline="hover">
              Disclaimer
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
