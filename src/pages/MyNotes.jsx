// src/pages/MyNotes.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import {
  getUserNotes,
  deleteNoteById,
  getProfile,
  getUserFreeNotesRemaining,
} from "../firebase/firestoreHelper";

const PAGE_SIZE = 10;

export default function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [profile, setProfile] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredNotes.length / PAGE_SIZE);

  const navigate = useNavigate();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const prof = await getProfile();
      setProfile(prof);

      const userNotes = await getUserNotes();
      setNotes(userNotes);
      applyFiltersAndSort(userNotes, selectedType, searchQuery, sortBy);

      if (prof.subscriptionTier === "free") {
        const count = await getUserFreeNotesRemaining();
        setRemaining(count);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Apply filtering and sorting
  const applyFiltersAndSort = (allNotes, typeFilter, query, sortOption) => {
    let filtered = [...allNotes];

    if (typeFilter !== "all") {
      filtered = filtered.filter((note) => note.noteType === typeFilter);
    }

    if (query.trim() !== "") {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          (note.title || "").toLowerCase().includes(q) ||
          (note.formattedNote || "").toLowerCase().includes(q) ||
          (note.noteType || "").toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortOption === "newest") {
      filtered.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } else if (sortOption === "oldest") {
      filtered.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });
    } else if (sortOption === "title-asc") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortOption === "title-desc") {
      filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    setFilteredNotes(filtered);
    setCurrentPage(1); // reset to first page on filter/sort/search change
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    applyFiltersAndSort(notes, value, searchQuery, sortBy);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFiltersAndSort(notes, selectedType, value, sortBy);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    applyFiltersAndSort(notes, selectedType, searchQuery, value);
  };

  const handleDelete = async (id) => {
    try {
      await deleteNoteById(id);
      fetchNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to delete note.");
    }
  };

  const handleExport = (note) => {
    const blob = new Blob([note.formattedNote || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${note.title || "note"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Pagination slice for current page
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Notes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {profile?.subscriptionTier === "free" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {remaining !== null
            ? `You have ${remaining} free notes remaining out of 15.`
            : "Checking note limit..."}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems="center"
      >
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select value={selectedType} label="Filter by Type" onChange={handleFilterChange}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="session">Session</MenuItem>
            <MenuItem value="progress">Progress</MenuItem>
            <MenuItem value="discharge">Discharge</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Search Notes"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
            <MenuItem value="newest">Date: Newest First</MenuItem>
            <MenuItem value="oldest">Date: Oldest First</MenuItem>
            <MenuItem value="title-asc">Title: A - Z</MenuItem>
            <MenuItem value="title-desc">Title: Z - A</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : paginatedNotes.length === 0 ? (
        <Typography>No notes found.</Typography>
      ) : (
        <Stack spacing={2}>
          {paginatedNotes.map((note) => (
            <Card key={note.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{note.title || "Untitled"}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Type: {note.noteType}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
                  {typeof note.formattedNote === "string" && note.formattedNote.length > 200
                    ? `${note.formattedNote.slice(0, 200)}...`
                    : note.formattedNote || ""}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/note-detail/${note.id}`)}
                  >
                    View
                  </Button>
                  <IconButton onClick={() => navigate(`/edit-note/${note.id}`)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(note.id)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handleExport(note)} aria-label="export">
                    <DownloadIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Typography sx={{ alignSelf: "center" }}>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Stack>
      )}
    </Box>
  );
}
