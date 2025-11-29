import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { MenuSection } from '../common/MenuSection';
// -- STYLES --
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

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
    background: linear-gradient(135deg, ${props => props.theme.colors.accent}40 0%, ${props => props.theme.colors.primary}20 100%);
    z-index: 1;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 900px;
`;

const Title = styled.h1`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.1;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Subtitle = styled.p`
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  margin-bottom: 4rem;
  opacity: 0.95;
  font-weight: 300;
  max-width: 600px;
  margin-inline: auto;
  animation: ${fadeInUp} 0.8s ease-out 0.2s backwards;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  padding: 18px 48px;
  background: white;
  color: ${props => props.theme.colors.accent};
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.4s ease;
  animation: ${fadeInUp} 0.8s ease-out 0.4s backwards;
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

// -- COMPONENT --
export const HeroSection = () => {
  return (
    <>
      <HeroWrapper>
        <Content>
          <Title>Café que Recompensa</Title>
          <Subtitle>
            Cada taza cuenta. Acumula puntos, desbloquea recompensas exclusivas
            y disfruta de beneficios únicos en cada visita.
          </Subtitle>
          <CTAButton to="/app/login">Únete Ahora</CTAButton>
        </Content>

      </HeroWrapper>
      <MenuSection />
    </>
  );
};