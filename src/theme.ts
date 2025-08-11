import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: { mode: 'dark' }, // togglearemos más adelante
  components: {
    MuiButton: { defaultProps: { variant: 'contained' } }
  }
});

export default theme;
