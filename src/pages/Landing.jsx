import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Section } from '../components/common/Section';
import { HeroSection } from '../components/landing/HeroSection';
import { BentoGrid } from '../components/landing/BentoGrid';
import { Timeline } from '../components/landing/Timeline';
import { useOnScrollReveal } from '../hooks/useOnScrollReveal';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Clock, MapPin } from 'lucide-react';

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

const ExperiencesSection = styled(Section)`
  background: ${props => props.theme.colors.bgAlt};
`;

const ExperiencesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ExperienceCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  }
`;

const ExperienceGradient = styled.div`
  height: 160px;
  background: ${props => props.$gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`;

const ExperienceContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const ExperienceTitle = styled.h3`
  font-family: ${props => props.theme.fontPrimary};
  font-size: 1.4rem;
  color: ${props => props.theme.colors.accent};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ExperienceDescription = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.md};
  opacity: 0.85;
`;

const ExperienceMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.secondary};
  
  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.theme.colors.primary};
  }
`;

const ExperienceFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ExperiencePrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.accent};
`;

const ExperienceButton = styled(Link)`
  padding: 10px 20px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: scale(1.05);
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
    background: ${props => props.theme.colors.primary}20;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 400px;
    height: 400px;
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.08);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    transform: translateY(-2px) scale(1.05);
  }
`;

const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    margin-top: 0;
  }
`;

const WalletIconBox = styled.div`
  width: 180px;
  height: 180px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.8) 100%
  );
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  backdrop-filter: blur(10px);
  
  svg {
    width: 80px;
    height: 80px;
    color: ${props => props.theme.colors.accent};
  }
`;

const WalletBadges = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  justify-content: center;
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

const WalletText = styled.p`
  color: ${props => props.theme.colors.white};
  font-size: 0.95rem;
  opacity: 0.9;
  text-align: center;
  max-width: 250px;
`;

export const Landing = () => {
  useOnScrollReveal();
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);

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

  // Cargar experiencias (eventos tipo open_schedule)
  useEffect(() => {
    const fetchExperiences = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (data) {
        setExperiences(data);
      }
    };
    
    fetchExperiences();
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

      {experiences.length > 0 && (
        <ExperiencesSection id="experiencias" spacing="lg">
          <div className="fade-up">
            <SectionTitle>Experiencias Le Duo</SectionTitle>
            <SectionSubtitle>
              Talleres, eventos y actividades únicas para disfrutar
            </SectionSubtitle>
            <ExperiencesGrid>
              {experiences.slice(0, 6).map((exp) => (
                <ExperienceCard key={exp.id}>
                  <ExperienceGradient $gradient={exp.image_gradient || 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'}>
                    {exp.tags?.[0] === 'Creativo' ? '🎨' : 
                     exp.tags?.[0] === 'Relax' ? '🧘' :
                     exp.tags?.[0] === 'Gastronomía' ? '👨‍🍳' : '✨'}
                  </ExperienceGradient>
                  <ExperienceContent>
                    <ExperienceTitle>{exp.title}</ExperienceTitle>
                    <ExperienceDescription>
                      {exp.description?.slice(0, 100)}{exp.description?.length > 100 ? '...' : ''}
                    </ExperienceDescription>
                    <ExperienceMeta>
                      {exp.duration_minutes && (
                        <MetaItem>
                          <Clock />
                          {exp.duration_minutes} min
                        </MetaItem>
                      )}
                      <MetaItem>
                        <MapPin />
                        {exp.location || 'Le Duo'}
                      </MetaItem>
                    </ExperienceMeta>
                    <ExperienceFooter>
                      <ExperiencePrice>${exp.price} MXN</ExperiencePrice>
                      <ExperienceButton to={`/workshops/${exp.id}`}>
                        Ver horarios
                      </ExperienceButton>
                    </ExperienceFooter>
                  </ExperienceContent>
                </ExperienceCard>
              ))}
            </ExperiencesGrid>
          </div>
        </ExperiencesSection>
      )}

      <CTASection spacing="lg">
        <div className="fade-up">
          <CTAContent>
            <CTAText>
              <h2>¡Únete a LeDuo Hoy!</h2>
              <p>
                Regístrate a nuestro programa de lealtad y agrega tu tarjeta digital 
                a Apple Wallet o Google Wallet. Acumula sellos con cada compra.
              </p>
              <CTAButton to="/register">
                Regístrate al programa
              </CTAButton>
            </CTAText>
            
            <WalletContainer>
              <WalletIconBox>
                <Smartphone />
              </WalletIconBox>
              <WalletBadges>
                <WalletBadge>🍎 Apple Wallet</WalletBadge>
                <WalletBadge>📱 Google Wallet</WalletBadge>
              </WalletBadges>
              <WalletText>
                Tu tarjeta siempre disponible en tu teléfono, sin apps adicionales
              </WalletText>
            </WalletContainer>
          </CTAContent>
        </div>
      </CTASection>
    </PageWrapper>
  );
};