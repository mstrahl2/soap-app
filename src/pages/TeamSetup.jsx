import React, { useEffect, useState } from 'react';
import { TextField, Button, Typography, Grid, MenuItem, Paper, Box } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDocs, setDoc } from 'firebase/firestore';

const roles = ['Member', 'Admin'];
const MAX_TEAM_MEMBERS = 4;

const TeamSetup = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleAddMember = () => {
    if (teamMembers.length >= MAX_TEAM_MEMBERS) return;
    setTeamMembers([...teamMembers, { contact: '', role: 'Member' }]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const db = getFirestore();
      const teamRef = collection(db, 'users', currentUser.uid, 'team');

      // Clear existing team
      const existing = await getDocs(teamRef);
      existing.forEach(docSnap => setDoc(doc(teamRef, docSnap.id), {}, { merge: false }));

      // Ensure only one admin (besides the purchaser)
      const adminCount = teamMembers.filter(m => m.role === 'Admin').length;
      if (adminCount > 0) throw new Error("Only one additional Admin allowed (besides yourself)");

      // Save team members
      for (const member of teamMembers) {
        if (!member.contact) continue;
        await addDoc(teamRef, {
          contact: member.contact.trim(),
          role: member.role,
          addedAt: new Date().toISOString(),
        });
      }

      // Save the purchaser as the group admin (if not already)
      const leaderRef = doc(db, 'users', currentUser.uid, 'team', currentUser.uid);
      await setDoc(leaderRef, {
        contact: currentUser.email,
        role: 'Admin',
        isOwner: true,
        addedAt: new Date().toISOString(),
      });

      alert('Team saved!');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 700, margin: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Set Up Your Team</Typography>

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Your email (Group Admin):
        </Typography>

        <TextField
          fullWidth
          value={currentUser.email}
          disabled
          sx={{ mb: 3 }}
        />

        {teamMembers.map((member, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label={`Member ${index + 1} Email or Phone`}
                value={member.contact}
                onChange={(e) => handleChange(index, 'contact', e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                select
                fullWidth
                label="Role"
                value={member.role}
                onChange={(e) => handleChange(index, 'role', e.target.value)}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        ))}

        {teamMembers.length < MAX_TEAM_MEMBERS && (
          <Button onClick={handleAddMember} variant="outlined" sx={{ mb: 2 }}>
            + Add Team Member
          </Button>
        )}

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Team'}
        </Button>
      </Paper>
    </Box>
  );
};

export default TeamSetup;
