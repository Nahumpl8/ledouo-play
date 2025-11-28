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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active::before {
    width: 300px;
    height: 300px;
  }
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.text};
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }
        `;
      case 'secondary':
        return `
          background: ${props.theme.colors.secondary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.accent};
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.bgAlt};
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.text};
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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