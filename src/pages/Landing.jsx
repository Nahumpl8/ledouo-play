import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Section } from '../components/common/Section';
import { HeroSection } from '../components/landing/HeroSection';
import { Timeline } from '../components/landing/Timeline';
import { EventsHomePreview } from '../components/common/EventsHomePreview';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { FAQChatSection } from '../components/landing/FAQChatSection';
import { useOnScrollReveal } from '../hooks/useOnScrollReveal';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Check, User } from 'lucide-react';
import loyaltyCardPreview from '@/assets/loyalty-card-preview.png';
import { VideoSection } from '../components/landing/VideoSection';

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

const LoyaltyContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.xl};
  align-items: center;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.xxl};
  }
`;

const LoyaltyImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  
  img {
    max-width: 320px;
    width: 100%;
    height: auto;
    border-radius: 24px;
    box-shadow: 
      0 25px 80px rgba(0, 0, 0, 0.15),
      0 10px 30px rgba(0, 0, 0, 0.1);
    transform: rotate(-2deg);
    transition: transform 0.4s ease;
    
    &:hover {
      transform: rotate(0deg) scale(1.02);
    }
  }
`;

const LoyaltyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const LoyaltyFeature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.white};
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

const FeatureText = styled.div`
  h4 {
    font-family: ${props => props.theme.fontPrimary};
    font-size: 1.1rem;
    color: ${props => props.theme.colors.accent};
    margin-bottom: 4px;
    font-weight: 600;
  }
  
  p {
    font-size: 0.95rem;
    color: ${props => props.theme.colors.text};
    line-height: 1.5;
    opacity: 0.85;
  }
`;

const StepsSection = styled(Section)`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl} 0;
`;

/* CTA Section */
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
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-family: ${props => props.theme.fontPrimary};
  font-size: clamp(2rem, 4vw, 3rem);
  color: ${props => props.theme.colors.white};
  margin-bottom: ${props => props.theme.spacing.md};
  font-weight: 700;
`;

const CTADescription = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.colors.white};
  margin-bottom: ${props => props.theme.spacing.xl};
  opacity: 0.95;
  line-height: 1.6;
`;

const CTAButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: center;
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 32px;
  background: ${props => props.$variant === 'secondary' ? 'transparent' : props.theme.colors.white};
  color: ${props => props.$variant === 'secondary' ? props.theme.colors.white : props.theme.colors.accent};
  border: 2px solid ${props => props.$variant === 'secondary' ? props.theme.colors.white : 'transparent'};
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    background: ${props => props.theme.colors.white};
    color: ${props => props.theme.colors.accent};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const WalletBadges = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  justify-content: center;
  margin-top: ${props => props.theme.spacing.lg};
`;

const WalletBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(5px);
`;

const loyaltyFeatures = [
  {
    title: 'Sellos Digitales',
    description: 'Acumula sellos con cada compra. 8 sellos = 1 bebida gratis.'
  },
  {
    title: 'Genera Puntos',
    description: 'Gana puntos por cada peso que gastas para subir de nivel y recibir promociones especiales.'
  },
  {
    title: 'Sin Apps Adicionales',
    description: 'Tu tarjeta vive en Apple Wallet o Google Wallet, siempre accesible.'
  },
  {
    title: 'Promociones Exclusivas',
    description: 'Recibe ofertas especiales y sorpresas directamente en tu wallet.'
  }
];

export const Landing = () => {
  useOnScrollReveal();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <PageWrapper>
      <HeroSection />

      <LoyaltySection id="lealtad" spacing="lg">
        <div className="fade-up">
          <SectionTitle>Tu Tarjeta de Lealtad Digital</SectionTitle>
          <SectionSubtitle>
            Agrega tu tarjeta a Apple Wallet o Google Wallet y lleva tus sellos siempre contigo
          </SectionSubtitle>

          <LoyaltyContent>
            <LoyaltyImageWrapper>
              <img
                src={loyaltyCardPreview}
                alt="Vista previa de la tarjeta de lealtad Le Duo con sellos"
              />
            </LoyaltyImageWrapper>

            <LoyaltyInfo>
              {loyaltyFeatures.map((feature, index) => (
                <LoyaltyFeature key={index}>
                  <FeatureIcon>
                    <Check />
                  </FeatureIcon>
                  <FeatureText>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </FeatureText>
                </LoyaltyFeature>
              ))}
            </LoyaltyInfo>
          </LoyaltyContent>
        </div>
      </LoyaltySection>

      <StepsSection id="como-funciona" >
        <div className="fade-up">
          <VideoSection />
        </div>
      </StepsSection>

      {/* Events Preview - Now with real Supabase data */}
      <EventsHomePreview/>

      {/* Testimonials Section - Real Google Reviews */}
      <TestimonialsSection />

      {/* FAQ Chat Section - Creative chat bubble design */}
      <FAQChatSection />

      <CTASection spacing="lg">
        <div className="fade-up">
          <CTAContent>
            <CTATitle>
              {user ? '¡Bienvenido de vuelta!' : '¡Únete a Le Duo Hoy!'}
            </CTATitle>
            <CTADescription>
              {user
                ? 'Accede a tu cuenta para ver tus sellos, puntos y recompensas disponibles.'
                : 'Regístrate a nuestro programa de lealtad y agrega tu tarjeta digital a Apple Wallet o Google Wallet.'
              }
            </CTADescription>

            <CTAButtons>
              {user ? (
                <CTAButton to="/app">
                  <User />
                  Ir a Mi Cuenta
                </CTAButton>
              ) : (
                <>
                  <CTAButton to="/register">
                    Regístrate Gratis a Le Duo
                  </CTAButton>
                  <CTAButton to="/app/login" $variant="secondary">
                    Ya tengo cuenta
                  </CTAButton>
                </>
              )}
            </CTAButtons>

            <WalletBadges>
              <WalletBadge>📱 Apple Wallet</WalletBadge>
              <WalletBadge>📱 Google Wallet</WalletBadge>
            </WalletBadges>
          </CTAContent>
        </div>
      </CTASection>
    </PageWrapper>
  );
};
