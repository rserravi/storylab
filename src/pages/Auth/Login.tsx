import { Box, Paper, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../state/authStore';
import { useNavigate, Link as RLink } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@demo.com');
  const [password, setPassword] = useState('demo');
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try { await login(email, password); nav('/projects'); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <Box sx={{ display:'grid', placeItems:'center', minHeight:'100vh', p:2 }}>
      <Paper sx={{ p:3, width: 360 }}>
        <Typography variant="h6" sx={{ mb:2 }}>Entrar</Typography>
        {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <TextField label="Email" fullWidth margin="dense" value={email} onChange={e=>setEmail(e.target.value)} />
          <TextField label="Contraseña" type="password" fullWidth margin="dense" value={password} onChange={e=>setPassword(e.target.value)} />
          <Button type="submit" fullWidth sx={{ mt:2 }}>Acceder</Button>
        </Box>
        <Link component={RLink} to="/register" sx={{ mt:2, display:'inline-block' }}>Crear cuenta</Link>
      </Paper>
    </Box>
  );
}
