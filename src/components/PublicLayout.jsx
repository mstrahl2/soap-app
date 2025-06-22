import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Box, Container, Card, CardContent, Typography, Link } from "@mui/material";

export default function PublicLayout() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="#f9f9f9"
      position="relative"
      pb="56px"  // reserve space for footer height
    >
      <Container maxWidth="sm" sx={{ mt: 8, flexGrow: 1 }}>
        <Card>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </Container>

      {/* Fixed footer */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "#fff",
          borderTop: "1px solid #ddd",
          py: 1,
          px: 2,
          textAlign: "center",
          userSelect: "none",
          zIndex: (theme) => theme.zIndex.appBar,
          fontSize: "0.75rem",
          color: "text.secondary",
        }}
      >
        &copy; {new Date().getFullYear()} SOAP App. All rights reserved. &nbsp;|&nbsp;
        <Link component={NavLink} to="/privacy-policy" underline="hover">
          Privacy Policy
        </Link> &nbsp;|&nbsp;
        <Link component={NavLink} to="/terms-of-service" underline="hover">
          Terms of Service
        </Link> &nbsp;|&nbsp;
        <Link component={NavLink} to="/disclaimer" underline="hover">
          Disclaimer
        </Link>
      </Box>
    </Box>
  );
}
