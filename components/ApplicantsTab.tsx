'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Applicant {
  id: string;
  applicant_name: string;
  year: number;
  photo?: string;
}

type OrderBy = 'name' | 'year';
type Order = 'asc' | 'desc';

export default function ApplicantsTab() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [quizLink, setQuizLink] = useState('');
  const [orderBy, setOrderBy] = useState<OrderBy>('name');
  const [order, setOrder] = useState<Order>('asc');
  const [nameListDialogOpen, setNameListDialogOpen] = useState(false);
  const [nameListText, setNameListText] = useState('');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await fetch('/api/applicants');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch applicants');
        return;
      }

      setApplicants(data.applicants);
    } catch (err) {
      setError('Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === applicants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applicants.map((app) => app.id)));
    }
  };

  const handleSort = (column: OrderBy) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const sortedApplicants = [...applicants].sort((a, b) => {
    let comparison = 0;
    if (orderBy === 'name') {
      comparison = a.applicant_name.localeCompare(b.applicant_name);
    } else if (orderBy === 'year') {
      comparison = a.year - b.year;
    }
    return order === 'asc' ? comparison : -comparison;
  });

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCreateQuiz = async () => {
    if (selectedIds.size === 0) {
      setError('Please select at least one applicant');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const selectedApplicants = applicants.filter((app) =>
        selectedIds.has(app.id)
      );

      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Quiz - ${new Date().toLocaleDateString()}`,
          selectedApplicants,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create quiz');
        return;
      }

      const link = `${window.location.origin}/quiz/${data.quizId}`;
      setQuizLink(link);
      setModalOpen(true);
      setSelectedIds(new Set());
    } catch (err) {
      setError('Failed to create quiz');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(quizLink);
  };

  const handleSelectFromList = () => {
    const names = nameListText
      .split('\n')
      .map(name => name.trim().toLowerCase())
      .filter(name => name.length > 0);

    const matchedIds = new Set<string>();

    applicants.forEach(applicant => {
      const applicantNameLower = applicant.applicant_name.toLowerCase();
      if (names.some(name => applicantNameLower.includes(name) || name.includes(applicantNameLower))) {
        matchedIds.add(applicant.id);
      }
    });

    setSelectedIds(matchedIds);
    setNameListDialogOpen(false);
    setNameListText('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={`Selected: ${selectedIds.size} / ${applicants.length}`}
            color="primary"
            variant="outlined"
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleSelectAll}
          >
            {selectedIds.size === applicants.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setNameListDialogOpen(true)}
          >
            Select from List
          </Button>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={handleCreateQuiz}
          disabled={creating || selectedIds.size === 0}
        >
          {creating ? 'Creating...' : 'Create Quiz'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedIds.size === applicants.length && applicants.length > 0}
                  indeterminate={selectedIds.size > 0 && selectedIds.size < applicants.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Photo</TableCell>
              <TableCell
                onClick={() => handleSort('name')}
                sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 'bold' }}
              >
                Name {orderBy === 'name' && (order === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell
                onClick={() => handleSort('year')}
                sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 'bold' }}
              >
                Year {orderBy === 'year' && (order === 'asc' ? '↑' : '↓')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedApplicants.map((applicant) => (
              <TableRow
                key={applicant.id}
                hover
                onClick={() => toggleSelection(applicant.id)}
                sx={{ cursor: 'pointer', backgroundColor: selectedIds.has(applicant.id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit' }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.has(applicant.id)}
                    onChange={() => toggleSelection(applicant.id)}
                  />
                </TableCell>
                <TableCell>
                  {applicant.photo ? (
                    <Avatar
                      src={applicant.photo}
                      alt={applicant.applicant_name}
                      sx={{ width: 40, height: 40 }}
                      variant="rounded"
                    />
                  ) : (
                    <Avatar
                      sx={{ width: 40, height: 40, bgcolor: 'grey.400' }}
                      variant="rounded"
                    >
                      {applicant.applicant_name.charAt(0)}
                    </Avatar>
                  )}
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

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quiz Created Successfully!</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Share this link with voters:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={quizLink}
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton onClick={copyLink} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={nameListDialogOpen} onClose={() => setNameListDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Applicants from Name List</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Paste names (one per line). The system will automatically match them to applicants:
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="Aafiyah Khan&#10;Aadit Gupta&#10;Abhinav Purohit&#10;..."
            value={nameListText}
            onChange={(e) => setNameListText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNameListDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSelectFromList} variant="contained">
            Select Matches
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
