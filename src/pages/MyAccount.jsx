// src/pages/MyAccount.jsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
} from "@mui/material";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Up to 15 notes",
    features: [
      "Basic SOAP formatting",
      "Voice-to-text input",
      "Access to past notes",
    ],
  },
  {
    name: "Pro",
    price: "$9/mo",
    description: "Unlimited notes + export/share",
    features: [
      "Everything in Free",
      "Unlimited notes",
      "Export & Share",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: "$25/mo",
    description: "For small practices",
    features: [
      "Everything in Pro",
      "5 users included",
      "Shared workspace",
      "Admin panel",
    ],
  },
];

const allFeatures = Array.from(
  new Set(plans.flatMap((plan) => plan.features))
);

export default function MyAccount() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Choose Your Plan
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.name}>
            <Paper
              elevation={4}
              sx={{
                border: "2px solid transparent",
                "&:hover": {
                  borderColor: "#1976d2",
                },
                borderRadius: 3,
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Typography variant="h6" gutterBottom align="center">
                {plan.name}
              </Typography>
              <Typography
                variant="h4"
                align="center"
                sx={{ color: "#1976d2", mb: 1 }}
              >
                {plan.price}
              </Typography>
              <Typography align="center" color="text.secondary" gutterBottom>
                {plan.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box component="ul" sx={{ listStyle: "none", pl: 0, flex: 1 }}>
                {allFeatures.map((feature, i) => (
                  <Box
                    component="li"
                    key={i}
                    sx={{
                      py: 0.5,
                      color: plan.features.includes(feature)
                        ? "text.primary"
                        : "text.disabled",
                    }}
                  >
                    {plan.features.includes(feature) ? "✅ " : "— "}
                    {feature}
                  </Box>
                ))}
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
              >
                Choose {plan.name}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
