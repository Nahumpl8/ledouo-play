import React from 'react';
import styled from 'styled-components';

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 280px);
    gap: ${props => props.theme.spacing.lg};
  }
   
`;

const BentoCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: 24px;
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${props => props.theme.colors.bgAlt};
  min-height: 240px;
  
  @media (max-width: 678px) {
    font-size: 0.9rem;

  } 
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${props => props.theme.colors.primary} 0%, 
      ${props => props.theme.colors.secondary} 100%
    );
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
    
`;

const IconWrapper = styled.div`
  font-size: ${props => props.$large ? '4rem' : '3rem'};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  opacity: 0.9;
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  h3 {
    font-family: ${props => props.theme.fontPrimary};
    font-size: ${props => props.$large ? '2.5rem' : '1.75rem'};
    color: ${props => props.theme.colors.accent};
    margin-bottom: ${props => props.theme.spacing.sm};
    font-weight: 600;
  }
  
  p {
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    font-size: ${props => props.$large ? '1.125rem' : '1rem'};
    opacity: 0.85;
  }
`;

const BentoItem = ({ icon, title, description, size = 'medium' }) => {
  const isLarge = size === 'large';
  
  return (
    <BentoCard $size={size}>
      <IconWrapper $large={isLarge}>{icon}</IconWrapper>
      <CardContent $large={isLarge}>
        <h3>{title}</h3>
        <p>{description}</p>
      </CardContent>
    </BentoCard>
  );
};

export const BentoGrid = () => {
  return (
    <GridWrapper>
      <BentoItem
        size="large"
        icon="💰"
        title="Cashback"
        description="Acumula puntos con cada compra y canjéalos por productos gratis o descuentos especiales. Entre más visitas, más beneficios."
      />
      <BentoItem
        size="medium"
        icon="🎯"
        title="Sellos"
        description="Colecciona sellos digitales. Completa tu tarjeta y desbloquea premios exclusivos."
      />
      <BentoItem
        size="medium"
        icon="🎰"
        title="Ruleta"
        description="Gira cada semana para ganar premios sorpresa y descuentos especiales."
      />
      <BentoItem
        size="large"
        icon="🏆"
        title="Retos Especiales"
        description="Completa desafíos mensuales y retos únicos para obtener recompensas exclusivas y acceso VIP a eventos especiales."
      />
    </GridWrapper>
  );
};
