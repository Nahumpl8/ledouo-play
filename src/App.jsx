import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './lib/theme';
import { GlobalStyles } from './lib/globalStyles';
import { Router } from './router';
import { initializeStorage } from './lib/storage';

// Initialize localStorage with demo data
initializeStorage();

const App = () => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router />
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
