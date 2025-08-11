import { Box, Divider, Typography, Button } from '@mui/material';

type Props = {
  width?: number;
  open?: boolean; // visibilidad controlada por layout/responsive
};

export default function RightSidebar({ width = 320, open = true }: Props) {
  if (!open) return null;
  return (
    <Box sx={{
      width,
      borderLeft: '1px solid rgba(255,255,255,0.12)',
      position: 'fixed',
      right: 0, top: 64, bottom: 0,
      p: 2,
      overflowY: 'auto'
    }}>
      <Typography variant="subtitle1">Asistente IA (mock)</Typography>
      <Button fullWidth sx={{ mt: 1 }}>Analizar con IA</Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" sx={{ opacity: .8 }}>
        Aquí mostraremos historial, validaciones y hints. (Mock)
      </Typography>
    </Box>
  );
}
