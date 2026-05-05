// src/pages/MyNotes.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getNotes, deleteNote } from "../firebase/firestoreHelper";

const noteTypeLabels = {
  intake: "Intake",
  standard: "SOAP Session",
  progress: "Progress",
  crisis: "Crisis / Risk",
  discharge: "Discharge",
};

function getCleanNoteText(text) {
  if (!text) return "";

  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getPreview(text) {
  if (!text) return "No formatted note available.";
  return text.length > 180 ? text.substring(0, 180) + "..." : text;
}

export default function MyNotes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [viewMode, setViewMode] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotes();
      setNotes(data);
      setFilteredNotes(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  };

  const clientNames = useMemo(() => {
    const names = notes
      .map((note) => note.clientName?.trim())
      .filter(Boolean);

    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [notes]);

  useEffect(() => {
    let updated = [...notes];

    if (filterType !== "all") {
      updated = updated.filter((note) => note.noteType === filterType);
    }

    if (clientFilter !== "all") {
      updated = updated.filter((note) => note.clientName === clientFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();

      updated = updated.filter(
        (note) =>
          note.title?.toLowerCase().includes(searchLower) ||
          note.clientName?.toLowerCase().includes(searchLower) ||
          note.formattedNote?.toLowerCase().includes(searchLower) ||
          note.rawNote?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredNotes(updated);
  }, [search, filterType, clientFilter, notes]);

  const groupedByClient = useMemo(() => {
    const grouped = {};

    filteredNotes.forEach((note) => {
      const client = note.clientName?.trim() || "No Client Name";

      if (!grouped[client]) {
        grouped[client] = [];
      }

      grouped[client].push(note);
    });

    return grouped;
  }, [filteredNotes]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    try {
      await deleteNote(id);
      fetchNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to delete note.");
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      alert("Copied to clipboard");
    } catch (err) {
      alert("Unable to copy note.");
    }
  };

  const handleCopyClean = async (text) => {
    try {
      await navigator.clipboard.writeText(getCleanNoteText(text || ""));
      alert("Clean note copied");
    } catch (err) {
      alert("Unable to copy clean note.");
    }
  };

  const renderNoteCard = (note) => (
    <Card key={note.id}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="h6">
              {note.title || "Untitled Note"}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={noteTypeLabels[note.noteType] || note.noteType || "N/A"}
                size="small"
              />

              {note.auditSafe && (
                <Chip
                  label="Audit-Safe"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}

              {note.clientName && (
                <Chip label={`Client: ${note.clientName}`} size="small" />
              )}

              {note.sessionDate && (
                <Chip label={`Date: ${note.sessionDate}`} size="small" />
              )}
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {getPreview(note.formattedNote)}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              variant="contained"
              onClick={() => navigate(`/note-detail/${note.id}`)}
            >
              View
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/edit-note/${note.id}`)}
            >
              Edit
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => handleCopy(note.formattedNote)}
            >
              Copy
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => handleCopyClean(note.formattedNote)}
            >
              Copy Clean
            </Button>

            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => handleDelete(note.id)}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">My Notes</Typography>

        <Button variant="contained" onClick={() => navigate("/new-note")}>
          New Note
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          label="Search Notes or Client"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Note Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="intake">Intake</MenuItem>
          <MenuItem value="standard">SOAP Session</MenuItem>
          <MenuItem value="progress">Progress</MenuItem>
          <MenuItem value="crisis">Crisis / Risk</MenuItem>
          <MenuItem value="discharge">Discharge</MenuItem>
        </TextField>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          select
          label="Client History"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          sx={{ minWidth: 260 }}
        >
          <MenuItem value="all">All Clients</MenuItem>
          {clientNames.map((client) => (
            <MenuItem key={client} value={client}>
              {client}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="View"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="all">All Notes</MenuItem>
          <MenuItem value="client">Group by Client</MenuItem>
        </TextField>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : filteredNotes.length === 0 ? (
        <Typography color="text.secondary">No notes found.</Typography>
      ) : viewMode === "client" ? (
        <Stack spacing={3}>
          {Object.entries(groupedByClient).map(([client, clientNotes]) => (
            <Box key={client}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <Typography variant="h6">{client}</Typography>
                <Typography color="text.secondary">
                  {clientNotes.length} note{clientNotes.length === 1 ? "" : "s"}
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {clientNotes.map((note) => renderNoteCard(note))}
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack spacing={2}>
          {filteredNotes.map((note) => renderNoteCard(note))}
        </Stack>
      )}
    </Box>
  );
}