// src/components/ErrorBoundary.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You could log error info to a service here
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    // Optional: reload the page or reset component state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please try refreshing the page or come back later.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Reload
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
