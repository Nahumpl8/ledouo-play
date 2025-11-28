import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
  
  @font-face {
    font-family: 'Apollo';
    src: url('/fonts/APOLLO.otf') format('opentype'),
         url('/fonts/APOLLOItalic.otf') format('opentype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Apollo';
    src: url('/fonts/APOLLO.otf') format('opentype'),
         url('/fonts/APOLLOItalic.otf') format('opentype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.fontSecondary};
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.bg};
    line-height: 1.6;
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.fontPrimary};
    line-height: 1.2;
    margin-bottom: 0.5em;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    
    &:focus-visible {
      outline: 2px solid ${props => props.theme.colors.primary};
      outline-offset: 2px;
    }
  }

  a {
    color: inherit;
    text-decoration: none;
    
    &:focus-visible {
      outline: 2px solid ${props => props.theme.colors.primary};
      outline-offset: 2px;
    }
  }

  input, select, textarea {
    font-family: inherit;
    
    &:focus-visible {
      outline: 2px solid ${props => props.theme.colors.primary};
      outline-offset: 2px;
    }
  }

  /* Animation Keyframes */
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Reveal animation classes */
  .fade-up {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-up.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .slide-in {
    opacity: 0;
    transform: translateX(-30px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .slide-in.is-visible {
    opacity: 1;
    transform: translateX(0);
  }

  /* Hover effects */
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  }

  /* Loading skeleton */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  /* Glassmorphism effect */
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Staggered animation delays */
  .fade-up:nth-child(1) { transition-delay: 0ms; }
  .fade-up:nth-child(2) { transition-delay: 100ms; }
  .fade-up:nth-child(3) { transition-delay: 200ms; }
  .fade-up:nth-child(4) { transition-delay: 300ms; }
  .fade-up:nth-child(5) { transition-delay: 400ms; }
  .fade-up:nth-child(6) { transition-delay: 500ms; }
`;