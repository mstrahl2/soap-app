// src/AppWrapper.jsx
import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import theme from "./theme";

export default function AppWrapper() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
