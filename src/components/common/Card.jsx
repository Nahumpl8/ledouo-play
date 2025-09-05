import React from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radius};
  box-shadow: ${props => props.theme.shadow};
  padding: ${props => {
    switch (props.size) {
      case 'sm': return props.theme.spacing.sm;
      case 'lg': return props.theme.spacing.xl;
      default: return props.theme.spacing.md;
    }
  }};
  transition: all 0.3s ease;
  
  ${props => props.hover && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    }
  `}
  
  ${props => props.border && `
    border: 1px solid ${props.theme.colors.bgAlt};
  `}
`;

export const Card = ({ 
  children, 
  size = 'md', 
  hover = false,
  border = false,
  className = '',
  ...props 
}) => {
  return (
    <StyledCard 
      size={size} 
      hover={hover}
      border={border}
      className={`${className} ${hover ? 'hover-lift' : ''}`}
      {...props}
    >
      {children}
    </StyledCard>
  );
};