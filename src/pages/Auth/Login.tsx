import { useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Alert, Link } from '@mui/material';
import { useAuth } from '../../state/authStore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useT } from '../../i18n';

export default function Login() {
  const t = useT();
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      nav('/projects', { replace: true });
    } catch (e: any) {
      setErr(e?.message || t('auth.error.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight:'100vh', display:'grid', placeItems:'center', p:2 }}>
      <Paper sx={{ p:3, width: 360, maxWidth: '100%' }} component="form" onSubmit={onSubmit}>
        <Typography variant="h6" sx={{ mb:2 }}>{t('auth.login.title')}</Typography>

        {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}

        <TextField
          label={t('auth.email')}
          type="email"
          fullWidth sx={{ mb:2 }}
          value={email}
          onChange={e=>setEmail(e.target.value)}
          autoComplete="email"
        />
        <TextField
          label={t('auth.password')}
          type="password"
          fullWidth sx={{ mb:2 }}
          value={password}
          onChange={e=>setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Button type="submit" fullWidth disabled={busy}>{t('auth.btn.login')}</Button>

        <Typography variant="body2" sx={{ mt:2, textAlign:'center' }}>
          <Link component={RouterLink} to="/register">{t('auth.link.toRegister')}</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
