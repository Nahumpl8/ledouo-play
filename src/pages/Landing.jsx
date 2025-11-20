import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { HeroSection } from '../components/landing/HeroSection';
import { BentoGrid } from '../components/landing/BentoGrid';
import { Timeline } from '../components/landing/Timeline';
import { useOnScrollReveal } from '../hooks/useOnScrollReveal';

const PageWrapper = styled.main`
  background: ${props => props.theme.colors.bg};
`;

const SectionTitle = styled.h2`
  font-family: ${props => props.theme.fontPrimary};
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: ${props => props.theme.colors.accent};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 1.125rem;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const LoyaltySection = styled(Section)`
  background: ${props => props.theme.colors.bg};
`;

const StepsSection = styled(Section)`
  background: ${props => props.theme.colors.white};
`;

const BenefitsSection = styled(Section)`
  background: ${props => props.theme.colors.bgAlt};
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const BenefitCard = styled(Card)`
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.bgAlt};
  border-radius: 16px;
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.colors.primary};
  }
  
  .icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }
  
  .content {
    h4 {
      font-family: ${props => props.theme.fontPrimary};
      color: ${props => props.theme.colors.accent};
      font-size: 1.25rem;
      margin-bottom: ${props => props.theme.spacing.xs};
      font-weight: 600;
    }
    
    p {
      color: ${props => props.theme.colors.text};
      font-size: 0.95rem;
      line-height: 1.5;
      opacity: 0.85;
    }
  }
`;

const CTASection = styled(Section)`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary} 0%, 
    ${props => props.theme.colors.secondary} 100%
  );
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: ${props => props.theme.colors.white}10;
    border-radius: 50%;
    filter: blur(100px);
  }
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 2;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.xxl};
    align-items: center;
  }
`;

const CTAText = styled.div`
  color: ${props => props.theme.colors.white};
  text-align: center;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    text-align: left;
  }
  
  h2 {
    font-family: ${props => props.theme.fontPrimary};
    font-size: clamp(2rem, 4vw, 3.5rem);
    margin-bottom: ${props => props.theme.spacing.md};
    font-weight: 700;
  }
  
  p {
    font-size: 1.125rem;
    margin-bottom: ${props => props.theme.spacing.lg};
    opacity: 0.95;
    line-height: 1.6;
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 40px;
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.accent};
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  }
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    margin-top: 0;
  }
  
  .qr-box {
    width: 200px;
    height: 200px;
    background: ${props => props.theme.colors.white};
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  }
  
  p {
    color: ${props => props.theme.colors.white};
    font-size: 0.9rem;
    opacity: 0.85;
    text-align: center;
  }
`;

export const Landing = () => {
  useOnScrollReveal();

  useEffect(() => {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }, []);

  return (
    <PageWrapper>
      <HeroSection />

      <LoyaltySection id="lealtad" spacing="lg">
        <div className="fade-up">
          <SectionTitle>Tu Programa de Lealtad</SectionTitle>
          <SectionSubtitle>
            Cuatro formas de ganar recompensas con cada visita
          </SectionSubtitle>
          <BentoGrid />
        </div>
      </LoyaltySection>

      <StepsSection id="como-funciona" spacing="lg">
        <div className="fade-up">
          <SectionTitle>Cómo Funciona</SectionTitle>
          <SectionSubtitle>
            Tres pasos simples para comenzar a ganar
          </SectionSubtitle>
          <Timeline />
        </div>
      </StepsSection>

      <BenefitsSection id="beneficios" spacing="lg">
        <div className="fade-up">
          <SectionTitle>Beneficios Exclusivos</SectionTitle>
          <SectionSubtitle>
            Recompensas diseñadas para ti
          </SectionSubtitle>
          <BenefitsGrid>
            <BenefitCard>
              <span className="icon">☕</span>
              <div className="content">
                <h4>Café Gratis</h4>
                <p>Cada 10 sellos = 1 café de cortesía de tu elección</p>
              </div>
            </BenefitCard>
            
            <BenefitCard>
              <span className="icon">🍰</span>
              <div className="content">
                <h4>Descuentos Especiales</h4>
                <p>20% off en pasteles y postres todos los miércoles</p>
              </div>
            </BenefitCard>
            
            <BenefitCard>
              <span className="icon">🎁</span>
              <div className="content">
                <h4>Regalo de Cumpleaños</h4>
                <p>Sorpresa especial el día de tu cumpleaños</p>
              </div>
            </BenefitCard>
            
            <BenefitCard>
              <span className="icon">⭐</span>
              <div className="content">
                <h4>Acceso VIP</h4>
                <p>Eventos exclusivos y degustaciones para miembros</p>
              </div>
            </BenefitCard>
            
            <BenefitCard>
              <span className="icon">📱</span>
              <div className="content">
                <h4>Wallet Digital</h4>
                <p>Tu tarjeta siempre disponible en Apple/Google Wallet</p>
              </div>
            </BenefitCard>
            
            <BenefitCard>
              <span className="icon">🎯</span>
              <div className="content">
                <h4>Ofertas Personalizadas</h4>
                <p>Promociones exclusivas basadas en tus preferencias</p>
              </div>
            </BenefitCard>
          </BenefitsGrid>
        </div>
      </BenefitsSection>

      <CTASection spacing="lg">
        <div className="fade-up">
          <CTAContent>
            <CTAText>
              <h2>¡Únete a LeDuo Hoy!</h2>
              <p>
                Comienza a disfrutar de todos los beneficios de nuestro programa de lealtad. 
                Regístrate ahora y recibe puntos de bienvenida.
              </p>
              <CTAButton to="/app/login">
                Crear mi cuenta
              </CTAButton>
            </CTAText>
            
            <QRContainer>
              <div className="qr-box">📱</div>
              <p>
                También puedes registrarte escaneando<br />
                el código QR en nuestra sucursal
              </p>
            </QRContainer>
          </CTAContent>
        </div>
      </CTASection>
    </PageWrapper>
  );
};
