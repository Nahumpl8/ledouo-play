import React, { useEffect } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.sm};
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radius};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: ${props => props.maxWidth || '500px'};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const Header = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.bgAlt};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text};
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.bgAlt};
  }
`;

const Body = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth,
  ...props 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose} {...props}>
      <ModalContent 
        maxWidth={maxWidth}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <Header>
            <Title>{title}</Title>
            <CloseButton onClick={onClose}>×</CloseButton>
          </Header>
        )}
        <Body>
          {children}
        </Body>
      </ModalContent>
    </Overlay>
  );
};