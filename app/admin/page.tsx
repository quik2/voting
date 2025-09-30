'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  CircularProgress,
} from '@mui/material';
import Cookies from 'js-cookie';
import ApplicantsTab from '@/components/ApplicantsTab';
import QuizzesTab from '@/components/QuizzesTab';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) {
      router.push('/signin');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSignOut = () => {
    Cookies.remove('auth_token');
    router.push('/signin');
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
          <Tab label="Create Quiz" />
          <Tab label="View Quizzes" />
        </Tabs>

        {currentTab === 0 && <ApplicantsTab />}
        {currentTab === 1 && <QuizzesTab />}
      </Container>
    </Box>
  );
}
