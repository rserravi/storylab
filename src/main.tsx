import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { makeTheme } from './theme';
import App from './App';
import { useUi } from './state/uiStore';

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { darkMode } = useUi();
  const theme = useMemo(() => makeTheme(darkMode ? 'dark' : 'light'), [darkMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeBridge>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeBridge>
  </React.StrictMode>
);
