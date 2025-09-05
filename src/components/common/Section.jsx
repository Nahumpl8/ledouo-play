import React from 'react';
import styled from 'styled-components';
import { Container } from './Container';

const StyledSection = styled.section`
  padding: ${props => {
    switch (props.spacing) {
      case 'sm': return `${props.theme.spacing.lg} 0`;
      case 'lg': return `${props.theme.spacing.xxl} 0`;
      default: return `${props.theme.spacing.xl} 0`;
    }
  }};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => {
      switch (props.spacing) {
        case 'sm': return `${props.theme.spacing.xl} 0`;
        case 'lg': return `80px 0`;
        default: return `${props.theme.spacing.xxl} 0`;
      }
    }};
  }
  
  ${props => props.background && `
    background: ${props.background};
  `}
`;

export const Section = ({ 
  children, 
  spacing = 'md',
  background,
  containerSize = 'md',
  className = '',
  ...props 
}) => {
  return (
    <StyledSection 
      spacing={spacing}
      background={background}
      className={className}
      {...props}
    >
      <Container size={containerSize}>
        {children}
      </Container>
    </StyledSection>
  );
};