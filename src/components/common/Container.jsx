import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div`
  width: 100%;
  max-width: ${props => {
    switch (props.size) {
      case 'sm': return '600px';
      case 'lg': return '1400px';
      case 'full': return '100%';
      default: return '1200px';
    }
  }};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.sm};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    padding: 0 ${props => props.theme.spacing.md};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    padding: 0 ${props => props.theme.spacing.lg};
  }
`;

export const Container = ({ 
  children, 
  size = 'md',
  className = '',
  ...props 
}) => {
  return (
    <StyledContainer 
      size={size}
      className={className}
      {...props}
    >
      {children}
    </StyledContainer>
  );
};