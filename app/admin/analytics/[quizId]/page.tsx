'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ApplicantScore {
  applicant_id: string;
  applicant_name: string;
  average_score: number;
  total_votes: number;
}

interface VoterSubmission {
  voter_name: string;
  voter_email: string;
  submitted_at: string;
}

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [analytics, setAnalytics] = useState<ApplicantScore[]>([]);
  const [voters, setVoters] = useState<VoterSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [topPercent, setTopPercent] = useState(25);
  const [middlePercent, setMiddlePercent] = useState(50);
  const [lowPercent, setLowPercent] = useState(25);

  const [tiers, setTiers] = useState<{
    top: ApplicantScore[];
    middle: ApplicantScore[];
    low: ApplicantScore[];
  }>({ top: [], middle: [], low: [] });

  useEffect(() => {
    fetchAnalytics();
    fetchVoters();
  }, [quizId]);

  useEffect(() => {
    if (analytics.length > 0) {
      calculateTiers();
    }
  }, [analytics, topPercent, middlePercent, lowPercent]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/quiz/${quizId}/analytics`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch analytics');
        return;
      }

      setAnalytics(data.analytics);
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchVoters = async () => {
    try {
      const res = await fetch(`/api/quiz/${quizId}/voters`);
      const data = await res.json();

      if (res.ok) {
        setVoters(data.voters || []);
      }
    } catch (err) {
      console.error('Failed to fetch voters');
    }
  };

  const calculateTiers = () => {
    // Sort by average score descending
    const sorted = [...analytics].sort(
      (a, b) => b.average_score - a.average_score
    );

    const total = sorted.length;
    const topCount = Math.ceil((topPercent / 100) * total);
    const middleCount = Math.ceil((middlePercent / 100) * total);

    // Slice into tiers, then randomize each tier
    const topTier = sorted.slice(0, topCount).sort(() => Math.random() - 0.5);
    const middleTier = sorted.slice(topCount, topCount + middleCount).sort(() => Math.random() - 0.5);
    const lowTier = sorted.slice(topCount + middleCount).sort(() => Math.random() - 0.5);

    setTiers({ top: topTier, middle: middleTier, low: lowTier });
  };

  const copyNames = (names: string[]) => {
    navigator.clipboard.writeText(names.join('\n'));
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
          <Typography variant="h6">Quiz Analytics</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {analytics.length === 0 ? (
          <Alert severity="info">No responses yet for this quiz.</Alert>
        ) : (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Results
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Applicant Name</TableCell>
                        <TableCell align="right">Average Score</TableCell>
                        <TableCell align="right">Total Votes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...analytics]
                        .sort((a, b) => b.average_score - a.average_score)
                        .map((app, index) => (
                          <TableRow key={app.applicant_id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{app.applicant_name}</TableCell>
                            <TableCell align="right">
                              {app.average_score.toFixed(2)}
                            </TableCell>
                            <TableCell align="right">{app.total_votes}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tier Filtering
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    label="Top %"
                    type="number"
                    value={topPercent}
                    onChange={(e) => setTopPercent(Number(e.target.value))}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                  <TextField
                    label="Middle %"
                    type="number"
                    value={middlePercent}
                    onChange={(e) => setMiddlePercent(Number(e.target.value))}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                  <TextField
                    label="Low %"
                    type="number"
                    value={lowPercent}
                    onChange={(e) => setLowPercent(Number(e.target.value))}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">Top Tier ({topPercent}%)</Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            copyNames(tiers.top.map((a) => a.applicant_name))
                          }
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {tiers.top.map((app) => (
                        <Typography key={app.applicant_id} variant="body2">
                          {app.applicant_name}
                        </Typography>
                      ))}
                    </Paper>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">Middle Tier ({middlePercent}%)</Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            copyNames(tiers.middle.map((a) => a.applicant_name))
                          }
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {tiers.middle.map((app) => (
                        <Typography key={app.applicant_id} variant="body2">
                          {app.applicant_name}
                        </Typography>
                      ))}
                    </Paper>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">Low Tier ({lowPercent}%)</Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            copyNames(tiers.low.map((a) => a.applicant_name))
                          }
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {tiers.low.map((app) => (
                        <Typography key={app.applicant_id} variant="body2">
                          {app.applicant_name}
                        </Typography>
                      ))}
                    </Paper>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Voter Submissions
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Submitted At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {voters.map((voter, index) => (
                        <TableRow key={index}>
                          <TableCell>{voter.voter_name}</TableCell>
                          <TableCell>{voter.voter_email}</TableCell>
                          <TableCell>{new Date(voter.submitted_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}
