import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import { AdminPanelSettings, Person } from '@mui/icons-material';
import { BudgetAllocationFeature } from './BudgetAllocationFeature';

/**
 * Demo page for Budget Allocation Feature
 * This page allows testing the feature in both user and admin modes
 */
export function BudgetAllocationDemo() {
  const [mode, setMode] = useState<'user' | 'admin'>('user');

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h3" gutterBottom>
            Budget Allocation Feature - Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Phase 1.2: UX Prototype with Mocked Data
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            This is a prototype using mocked data. All mutations (create, edit,
            delete) will only log to the browser console.
          </Alert>

          {/* Mode selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              View Mode:
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, newMode) => newMode && setMode(newMode)}
              size="small"
            >
              <ToggleButton value="user">
                <Person sx={{ mr: 1 }} />
                User View
              </ToggleButton>
              <ToggleButton value="admin">
                <AdminPanelSettings sx={{ mr: 1 }} />
                Admin View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Paper>

        {/* Budget Allocation Feature */}
        <BudgetAllocationFeature
          isAdmin={mode === 'admin'}
          currentPersonId="550e8400-e29b-41d4-a716-446655440000"
        />
      </Container>
    </Box>
  );
}
