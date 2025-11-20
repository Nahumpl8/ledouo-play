import React from 'react';
import styled from 'styled-components';
import { Container } from '../common/Container';
import { Link } from 'react-router-dom';

const HeroWrapper = styled.section`
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/baristaHero2.png');
    background-size: cover;
    background-position: center;
    filter: brightness(0.4);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      ${props => props.theme.colors.accent}40 0%, 
      ${props => props.theme.colors.primary}20 100%
    );
    z-index: 1;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: ${props => props.theme.colors.white};
  max-width: 900px;
  padding: ${props => props.theme.spacing.xl} 0;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.xxl} 0;
  }
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fontPrimary};
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.1;
  letter-spacing: -0.02em;
  
  animation: fadeInUp 0.8s ease-out;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Subtitle = styled.p`
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  margin-bottom: ${props => props.theme.spacing.xl};
  opacity: 0.95;
  font-weight: 300;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 18px 48px;
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.accent};
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.4s ease;
  border: 2px solid transparent;
  
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
  }
  
  &:active {
    transform: translateY(-2px) scale(1.02);
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
  
  span {
    display: block;
    width: 30px;
    height: 50px;
    border: 2px solid ${props => props.theme.colors.white};
    border-radius: 25px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      background: ${props => props.theme.colors.white};
      border-radius: 50%;
      animation: scroll 2s infinite;
    }
  }
  
  @keyframes scroll {
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
  }
`;

export const HeroSection = () => {
  return (
    <HeroWrapper>
      <Container>
        <HeroContent>
          <Title>Café que Recompensa</Title>
          <Subtitle>
            Cada taza cuenta. Acumula puntos, desbloquea recompensas exclusivas 
            y disfruta de beneficios únicos en cada visita.
          </Subtitle>
          <CTAButton to="/app/login">
            Únete Ahora
          </CTAButton>
        </HeroContent>
      </Container>
      <ScrollIndicator>
        <span />
      </ScrollIndicator>
    </HeroWrapper>
  );
};
