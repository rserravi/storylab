import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../state/authStore';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try { await register(email, password, name); nav('/projects', { replace: true }); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', p: 2 }}>
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Crear cuenta</Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <TextField label="Nombre" fullWidth margin="dense" value={name} onChange={e => setName(e.target.value)} />
          <TextField label="Email" fullWidth margin="dense" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Contraseña" type="password" fullWidth margin="dense" value={password} onChange={e => setPassword(e.target.value)} />
          <Button type="submit" fullWidth sx={{ mt: 2 }}>Registrarme</Button>
        </Box>
      </Paper>
    </Box>
  );
}
