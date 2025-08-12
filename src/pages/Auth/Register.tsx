import { useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Alert, Link } from '@mui/material';
import { useAuth } from '../../state/authStore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useT } from '../../i18n';

export default function Register() {
  const t = useT();
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register(email, password, name);
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
        <Typography variant="h6" sx={{ mb:2 }}>{t('auth.register.title')}</Typography>

        {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}

        <TextField
          label={t('auth.name')}
          fullWidth sx={{ mb:2 }}
          value={name}
          onChange={e=>setName(e.target.value)}
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth disabled={busy}>{t('auth.btn.register')}</Button>

        <Typography variant="body2" sx={{ mt:2, textAlign:'center' }}>
          <Link component={RouterLink} to="/login">{t('auth.link.toLogin')}</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
