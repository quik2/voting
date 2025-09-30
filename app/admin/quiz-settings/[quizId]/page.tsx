'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Applicant {
  id: string;
  applicant_name: string;
  year: number;
  photo?: string;
}

interface QuizData {
  id: string;
  name: string;
  selected_applicants: Applicant[];
}

export default function QuizSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addSelectedIds, setAddSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuiz();
    fetchAllApplicants();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quiz/${quizId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Quiz not found');
        return;
      }

      setQuiz(data);
    } catch (err) {
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplicants = async () => {
    try {
      const res = await fetch('/api/applicants');
      const data = await res.json();
      if (res.ok) {
        setAllApplicants(data.applicants);
      }
    } catch (err) {
      console.error('Failed to fetch all applicants');
    }
  };

  const handleRemoveSelected = async () => {
    if (!quiz || selectedIds.size === 0) return;

    const updatedApplicants = quiz.selected_applicants.filter(
      (app) => !selectedIds.has(app.id)
    );

    if (updatedApplicants.length === 0) {
      setError('Quiz must have at least one rushee');
      return;
    }

    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_applicants: updatedApplicants }),
      });

      if (res.ok) {
        setQuiz({ ...quiz, selected_applicants: updatedApplicants });
        setSelectedIds(new Set());
      } else {
        setError('Failed to update quiz');
      }
    } catch (err) {
      setError('Failed to update quiz');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAddSelection = (id: string) => {
    const newSelected = new Set(addSelectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setAddSelectedIds(newSelected);
  };

  const handleAddApplicants = async () => {
    if (!quiz || addSelectedIds.size === 0) return;

    const applicantsToAdd = allApplicants.filter(a => addSelectedIds.has(a.id));
    const existingIds = new Set(quiz.selected_applicants.map(a => a.id));
    const newApplicants = applicantsToAdd.filter(a => !existingIds.has(a.id));
    const updatedApplicants = [...quiz.selected_applicants, ...newApplicants];

    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_applicants: updatedApplicants }),
      });

      if (res.ok) {
        setQuiz({ ...quiz, selected_applicants: updatedApplicants });
        setAddDialogOpen(false);
        setSearchQuery('');
        setAddSelectedIds(new Set());
      } else {
        setError('Failed to add rushees');
      }
    } catch (err) {
      setError('Failed to add rushees');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Quiz not found'}</Alert>
      </Container>
    );
  }

  const availableApplicants = allApplicants.filter(app =>
    !quiz.selected_applicants.some(selected => selected.id === app.id) &&
    app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/admin')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Voting Form Settings - {quiz.name}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Rushees in Voting Form ({quiz.selected_applicants.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedIds.size > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveSelected}
                startIcon={<DeleteIcon />}
              >
                Remove Selected ({selectedIds.size})
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => setAddDialogOpen(true)}
              startIcon={<AddIcon />}
            >
              Add Rushee
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.size === quiz.selected_applicants.length && quiz.selected_applicants.length > 0}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < quiz.selected_applicants.length}
                    onChange={() => {
                      if (selectedIds.size === quiz.selected_applicants.length) {
                        setSelectedIds(new Set());
                      } else {
                        setSelectedIds(new Set(quiz.selected_applicants.map(a => a.id)));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>Photo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quiz.selected_applicants.map((applicant) => (
                <TableRow
                  key={applicant.id}
                  hover
                  onClick={() => toggleSelection(applicant.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.has(applicant.id)}
                      onChange={() => toggleSelection(applicant.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={applicant.photo}
                      alt={applicant.applicant_name}
                      sx={{ width: 40, height: 40 }}
                      variant="rounded"
                    />
                  </TableCell>
                  <TableCell>{applicant.applicant_name}</TableCell>
                  <TableCell>
                    <Chip label={applicant.year} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Rushees to Voting Form</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            margin="dense"
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected: {addSelectedIds.size}
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={addSelectedIds.size === availableApplicants.length && availableApplicants.length > 0}
                      onChange={() => {
                        if (addSelectedIds.size === availableApplicants.length) {
                          setAddSelectedIds(new Set());
                        } else {
                          setAddSelectedIds(new Set(availableApplicants.map(a => a.id)));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Photo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Year</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableApplicants.map((applicant) => (
                  <TableRow
                    key={applicant.id}
                    hover
                    onClick={() => toggleAddSelection(applicant.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={addSelectedIds.has(applicant.id)}
                        onChange={() => toggleAddSelection(applicant.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={applicant.photo}
                        alt={applicant.applicant_name}
                        sx={{ width: 32, height: 32 }}
                        variant="rounded"
                      />
                    </TableCell>
                    <TableCell>{applicant.applicant_name}</TableCell>
                    <TableCell>
                      <Chip label={applicant.year} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialogOpen(false);
            setAddSelectedIds(new Set());
            setSearchQuery('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddApplicants}
            variant="contained"
            disabled={addSelectedIds.size === 0}
          >
            Add Selected ({addSelectedIds.size})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
