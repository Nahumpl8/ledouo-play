import React from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.colors.bgAlt};
  border-radius: ${props => props.theme.radius};
  font-size: 16px;
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text}60;
  }
  
  &:disabled {
    background: ${props => props.theme.colors.bgAlt};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  ${props => props.error && `
    border-color: #ef4444;
    
    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px #ef444420;
    }
  `}
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
  margin-top: 2px;
`;

export const Input = ({ 
  label,
  error,
  className = '',
  ...props 
}) => {
  return (
    <InputWrapper className={className}>
      {label && <Label>{label}</Label>}
      <StyledInput error={error} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
};