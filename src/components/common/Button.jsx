import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${props => {
    switch (props.size) {
      case 'sm': return '8px 16px';
      case 'lg': return '16px 32px';
      default: return '12px 24px';
    }
  }};
  border-radius: ${props => props.theme.radius};
  font-weight: 500;
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return '14px';
      case 'lg': return '18px';
      default: return '16px';
    }
  }};
  transition: all 0.3s ease;
  text-decoration: none;
  border: 2px solid transparent;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.text};
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadow};
          }
        `;
      case 'secondary':
        return `
          background: ${props.theme.colors.secondary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.accent};
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadow};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          border-color: ${props.theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.primary};
            color: ${props.theme.colors.white};
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadow};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.bgAlt};
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.text};
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadow};
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  as = 'button',
  ...props 
}) => {
  return (
    <StyledButton 
      as={as} 
      variant={variant} 
      size={size} 
      {...props}
    >
      {children}
    </StyledButton>
  );
};