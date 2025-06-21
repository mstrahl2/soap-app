// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    background: {
      default: "#f7f8fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h4: {
      fontWeight: 500,
      marginBottom: 16,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        margin: "normal",
        fullWidth: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
