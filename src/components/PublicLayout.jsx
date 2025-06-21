import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container, Card, CardContent, Typography } from "@mui/material";

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
          <Typography variant="body2" color="textSecondary">
            &copy; {new Date().getFullYear()} SOAP App. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
