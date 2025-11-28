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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  ${props => props.hover && `
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 25px 60px rgba(0,0,0,0.2);
    }
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: ${props.theme.radius};
      background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    
    &:hover::after {
      opacity: 1;
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