'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Quiz {
  id: string;
  name: string;
  selected_applicants: any[];
  created_at: string;
  response_count?: number;
}

export default function QuizzesTab() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [newQuizName, setNewQuizName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch quizzes');
        return;
      }

      // Fetch response counts for each quiz
      const quizzesWithCounts = await Promise.all(
        data.quizzes.map(async (quiz: Quiz) => {
          const countRes = await fetch(`/api/quiz/${quiz.id}/response-count`);
          const countData = await countRes.json();
          return { ...quiz, response_count: countData.count || 0 };
        })
      );

      setQuizzes(quizzesWithCounts);
    } catch (err) {
      setError('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const viewAnalytics = (quizId: string) => {
    router.push(`/admin/analytics/${quizId}`);
  };

  const handleEditClick = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setNewQuizName(quiz.name);
    setEditDialogOpen(true);
  };

  const handleSaveQuizName = async () => {
    if (!editingQuiz || !newQuizName.trim()) return;

    try {
      const res = await fetch(`/api/quizzes/${editingQuiz.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newQuizName }),
      });

      if (res.ok) {
        // Update local state
        setQuizzes(quizzes.map(q =>
          q.id === editingQuiz.id ? { ...q, name: newQuizName } : q
        ));
        setEditDialogOpen(false);
      } else {
        setError('Failed to update quiz name');
      }
    } catch (err) {
      setError('Failed to update quiz name');
    }
  };

  const handleDeleteClick = (quiz: Quiz) => {
    setDeletingQuiz(quiz);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuiz) return;

    try {
      const res = await fetch(`/api/quizzes/${deletingQuiz.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Remove from local state
        setQuizzes(quizzes.filter(q => q.id !== deletingQuiz.id));
        setDeleteDialogOpen(false);
        setDeletingQuiz(null);
      } else {
        setError('Failed to delete quiz');
      }
    } catch (err) {
      setError('Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No quizzes created yet. Create your first quiz in the "Create Quiz" tab.
      </Typography>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {quizzes.map((quiz) => (
          <Grid item xs={12} md={6} lg={4} key={quiz.id}>
            <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 500, flex: 1 }}>
                    {quiz.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleEditClick(quiz)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const link = `${window.location.origin}/quiz/${quiz.id}`;
                        navigator.clipboard.writeText(link);
                      }}
                      color="primary"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(quiz)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={`${quiz.selected_applicants.length} Applicants`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${quiz.response_count || 0} Responses`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ mt: 'auto' }}>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    onClick={() => viewAnalytics(quiz.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    View Analytics
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Quiz Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Quiz Name"
            value={newQuizName}
            onChange={(e) => setNewQuizName(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuizName} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Quiz?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingQuiz?.name}"? This will permanently delete all responses and analytics data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
