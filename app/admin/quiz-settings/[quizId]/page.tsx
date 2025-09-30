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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';

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

  useEffect(() => {
    fetchQuiz();
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

  const handleRemoveApplicant = async (applicantId: string) => {
    if (!quiz) return;

    const updatedApplicants = quiz.selected_applicants.filter(
      (app) => app.id !== applicantId
    );

    if (updatedApplicants.length === 0) {
      setError('Quiz must have at least one applicant');
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
      } else {
        setError('Failed to update quiz');
      }
    } catch (err) {
      setError('Failed to update quiz');
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
          <Typography variant="h6">Quiz Settings - {quiz.name}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h5" gutterBottom>
          Applicants in Quiz ({quiz.selected_applicants.length})
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Year</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quiz.selected_applicants.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell>
                    <Avatar
                      src={applicant.photo}
                      alt={applicant.applicant_name}
                      sx={{ width: 40, height: 40 }}
                      variant="rounded"
                    />
                  </TableCell>
                  <TableCell>{applicant.applicant_name}</TableCell>
                  <TableCell>{applicant.year}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveApplicant(applicant.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
