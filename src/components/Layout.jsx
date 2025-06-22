// src/components/Layout.jsx
import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Link,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NoteIcon from "@mui/icons-material/Note";

const tabRoutes = ["/dashboard", "/new-note", "/my-notes"];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentIdx = tabRoutes.findIndex((r) =>
    location.pathname.startsWith(r)
  );
  const [tabVal, setTabVal] = React.useState(currentIdx >= 0 ? currentIdx : 0);

  React.useEffect(() => {
    const idx = tabRoutes.findIndex((r) =>
      location.pathname.startsWith(r)
    );
    if (idx >= 0 && idx !== tabVal) setTabVal(idx);
  }, [location.pathname]);

  const handleTab = (_, newVal) => {
    setTabVal(newVal);
    navigate(tabRoutes[newVal]);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        flexDirection: "column",
        display: "flex",
        pb: "100px", // Space for bottom nav + footer
      }}
    >
      {/* Top App Bar */}
      <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h5" component="h1" sx={{ userSelect: "none" }}>
            SOAP App
          </Typography>
          <Box>
            <Link
              component={NavLink}
              to="/my-account"
              color="inherit"
              underline="none"
              sx={{ mr: 2 }}
            >
              My Account
            </Link>
            <Button variant="outlined" color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Outlet />
      </Box>

      {/* Legal Footer */}
      <Box sx={{ textAlign: "center", mt: 2, mb: 10, px: 2 }}>
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

      {/* Bottom Navigation */}
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation value={tabVal} onChange={handleTab} showLabels>
          <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
          <BottomNavigationAction label="New Note" icon={<AddCircleIcon />} />
          <BottomNavigationAction label="My Notes" icon={<NoteIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
