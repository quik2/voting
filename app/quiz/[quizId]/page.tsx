'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Rating,
  CircularProgress,
  Alert,
  LinearProgress,
  Grid,
  TextField,
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

function getClassYear(gradYear: number): string {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const academicYear = currentMonth >= 8 ? currentYear : currentYear - 1;
  const yearsUntilGrad = gradYear - academicYear;

  if (yearsUntilGrad === 4) return 'Freshman';
  if (yearsUntilGrad === 3) return 'Sophomore';
  if (yearsUntilGrad === 2) return 'Junior';
  if (yearsUntilGrad === 1) return 'Senior';
  return `Class of ${gradYear}`;
}

export default function QuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [ratings, setRatings] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [showNameForm, setShowNameForm] = useState(true);
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load cached progress
    const cachedProgress = localStorage.getItem(`quiz_progress_${quizId}`);
    if (cachedProgress) {
      setRatings(JSON.parse(cachedProgress));
    }

    // Check if name/email already saved
    const cachedName = localStorage.getItem(`quiz_voter_name_${quizId}`);
    const cachedEmail = localStorage.getItem(`quiz_voter_email_${quizId}`);
    if (cachedName && cachedEmail) {
      setVoterName(cachedName);
      setVoterEmail(cachedEmail);
      setShowNameForm(false);
    }

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

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName.trim() || !voterEmail.trim()) {
      setError('Please enter your name and email');
      return;
    }
    localStorage.setItem(`quiz_voter_name_${quizId}`, voterName);
    localStorage.setItem(`quiz_voter_email_${quizId}`, voterEmail);
    setShowNameForm(false);
    setError('');
  };

  const handleRatingChange = (applicantId: string, value: number | null) => {
    const newRatings = { ...ratings, [applicantId]: value };
    setRatings(newRatings);
    localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify(newRatings));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Find the first unanswered applicant
    const firstUnanswered = quiz.selected_applicants.find((app) =>
      !ratings.hasOwnProperty(app.id)
    );

    if (firstUnanswered) {
      // Scroll to the first unanswered applicant
      const element = document.getElementById(`applicant-${firstUnanswered.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the card briefly
        element.style.animation = 'pulse 1s ease-in-out';
      }
      setError('Please provide a rating (or skip) for all applicants before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName,
          voterEmail,
          ratings,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit quiz');
        return;
      }

      // Clear cached progress
      localStorage.removeItem(`quiz_progress_${quizId}`);
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit quiz');
    } finally {
      setSubmitting(false);
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

  if (error && !quiz) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Thank You!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your votes have been recorded successfully.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (showNameForm) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            Before You Begin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please enter your information to start voting
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleNameSubmit}>
            <TextField
              fullWidth
              label="Your Name"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Your Email"
              type="email"
              value={voterEmail}
              onChange={(e) => setVoterEmail(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              Start Voting
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  if (!quiz) return null;

  const ratedCount = Object.values(ratings).filter((r) => r !== undefined).length;

  // Filter and sort applicants
  const filteredApplicants = quiz.selected_applicants
    .filter((app) => app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // First sort by class (Freshman first = highest year number)
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      // Then sort alphabetically by first name within the same class
      const aFirstName = a.applicant_name.split(' ')[0].toLowerCase();
      const bFirstName = b.applicant_name.split(' ')[0].toLowerCase();
      return aFirstName.localeCompare(bFirstName);
    });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', py: { xs: 3, sm: 4 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 3 } }}>
        <Typography
          variant="h4"
          align="center"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: '#1976d2'
          }}
        >
          {quiz.name}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <TextField
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              width: { xs: '100%', sm: 400 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
            {filteredApplicants.map((applicant) => (
              <Grid item xs={12} sm={6} lg={4} key={applicant.id}>
                <Card
                  id={`applicant-${applicant.id}`}
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    border: ratings[applicant.id] !== undefined ? '2px solid #4caf50' : 'none',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
                      '50%': { transform: 'scale(1.02)', boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                      '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
                    }
                  }}
                >
              <Box
                sx={{
                  height: 350,
                  minHeight: 350,
                  maxHeight: 350,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {applicant.photo ? (
                  <Box
                    component="img"
                    src={applicant.photo}
                    alt={applicant.applicant_name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                ) : (
                  <Typography variant="h6" color="text.secondary">
                    No Photo
                  </Typography>
                )}
              </Box>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  {applicant.applicant_name}
                </Typography>
                <Chip
                  label={getClassYear(applicant.year)}
                  size="small"
                  color="primary"
                  sx={{ mb: 2, width: 'fit-content' }}
                />

                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Rating
                      value={ratings[applicant.id] === null ? 0 : (ratings[applicant.id] || 0)}
                      onChange={(_, value) => handleRatingChange(applicant.id, value)}
                      size="large"
                      sx={{
                        '& .MuiRating-icon': {
                          fontSize: { xs: '3rem', sm: '2.5rem' },
                        },
                        '& .MuiRating-iconEmpty': {
                          fontSize: { xs: '3rem', sm: '2.5rem' },
                        },
                      }}
                    />
                  </Box>
                  <Button
                    fullWidth
                    variant={ratings[applicant.id] === null ? 'contained' : 'outlined'}
                    size="medium"
                    onClick={() => handleRatingChange(applicant.id, null)}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    Abstain
                  </Button>
                </Box>
              </CardContent>
            </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ minWidth: { xs: '100%', sm: 250 }, borderRadius: 2, maxWidth: 400 }}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
