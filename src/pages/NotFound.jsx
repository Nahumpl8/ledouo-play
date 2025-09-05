import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Button } from '../components/common/Button';

const NotFoundWrapper = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.bg};
`;

const NotFoundContent = styled.div`
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  
  .error-icon {
    font-size: 6rem;
    margin-bottom: ${props => props.theme.spacing.lg};
    display: block;
  }
  
  h1 {
    font-family: ${props => props.theme.fontPrimary};
    font-size: 4rem;
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  h2 {
    color: ${props => props.theme.colors.secondary};
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  p {
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    margin-bottom: ${props => props.theme.spacing.xl};
  }
  
  .actions {
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    align-items: center;
    
    @media (min-width: ${props => props.theme.breakpoints.tablet}) {
      flex-direction: row;
      justify-content: center;
    }
  }
`;

export const NotFound = () => {
  return (
    <NotFoundWrapper>
      <Section>
        <NotFoundContent>
          <span className="error-icon">☕</span>
          <h1>404</h1>
          <h2>¡Oops! Página no encontrada</h2>
          <p>
            Lo sentimos, la página que buscas no existe. 
            Puede que haya sido movida o eliminada. 
            ¿Te apetece un café mientras vuelves al inicio?
          </p>
          
          <div className="actions">
            <Button as={Link} to="/" size="lg">
              🏠 Volver al inicio
            </Button>
            <Button as="a" href="tel:+5255123456" variant="outline" size="lg">
              📞 Contactar LeDuo
            </Button>
          </div>
        </NotFoundContent>
      </Section>
    </NotFoundWrapper>
  );
};