import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Section } from '../components/common/Section';
import { HeroSection } from '../components/landing/HeroSection';
import { Timeline } from '../components/landing/Timeline';
import { useOnScrollReveal } from '../hooks/useOnScrollReveal';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Clock, MapPin, Check, ChevronDown, User } from 'lucide-react';
import loyaltyCardPreview from '@/assets/loyalty-card-preview.png';
import * as Accordion from '@radix-ui/react-accordion';

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

/* FAQ Styles */
const FAQSection = styled(Section)`
  background: ${props => props.theme.colors.white};
`;

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const StyledAccordion = styled(Accordion.Root)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const AccordionItem = styled(Accordion.Item)`
  background: ${props => props.theme.colors.bg};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  
  &[data-state='open'] {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
`;

const AccordionHeader = styled(Accordion.Header)`
  margin: 0;
`;

const AccordionTrigger = styled(Accordion.Trigger)`
  width: 100%;
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: ${props => props.theme.fontPrimary};
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.accent};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.theme.colors.primary};
    transition: transform 0.3s ease;
  }
  
  &[data-state='open'] svg {
    transform: rotate(180deg);
  }
`;

const AccordionContent = styled(Accordion.Content)`
  padding: 0 ${props => props.theme.spacing.lg} ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  line-height: 1.7;
  
  &[data-state='open'] {
    animation: slideDown 0.3s ease;
  }
  
  &[data-state='closed'] {
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
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
    background: ${props => props.$variant === 'secondary' ? props.theme.colors.white : props.theme.colors.white};
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

const faqData = [
  {
    question: '¿Cómo funciona el programa de lealtad?',
    answer: 'Cada vez que compras en Le Duo, recibes un sello digital en tu tarjeta. Al acumular 8 sellos, obtienes una bebida gratis de tu elección. Además, ganas puntos de cashback en cada compra que puedes canjear por descuentos.'
  },
  {
    question: '¿Cómo agrego mi tarjeta a mi celular?',
    answer: 'Después de registrarte, podrás descargar tu tarjeta digital a Apple Wallet (iPhone) o Google Wallet (Android). La tarjeta se actualiza automáticamente cada vez que compras, sin necesidad de apps adicionales.'
  },
  {
    question: '¿Cuántos sellos necesito para una bebida gratis?',
    answer: '¡Solo 8 sellos! Cada compra te da un sello, y cuando llegues a 8, tu próxima bebida es completamente gratis. Los sellos se reinician después de canjear tu recompensa.'
  },
  {
    question: '¿Qué pasa si pierdo mi teléfono?',
    answer: 'No te preocupes, tus sellos y puntos están guardados en tu cuenta. Solo inicia sesión desde otro dispositivo y vuelve a agregar tu tarjeta a tu wallet. Todo estará igual.'
  },
  {
    question: '¿Cómo canjeo mis puntos de cashback?',
    answer: 'Los puntos de cashback se acumulan con cada compra. Puedes usarlos para obtener descuentos en tus siguientes pedidos. Solo muestra tu tarjeta digital al momento de pagar.'
  },
  {
    question: '¿El programa tiene algún costo?',
    answer: '¡No! El programa de lealtad de Le Duo es completamente gratuito. Solo regístrate y comienza a ganar sellos y puntos con cada compra.'
  }
];

const loyaltyFeatures = [
  {
    title: 'Sellos Digitales',
    description: 'Acumula sellos con cada compra. 8 sellos = 1 bebida gratis.'
  },
  {
    title: 'Cashback en Puntos',
    description: 'Gana puntos por cada peso que gastas para canjear por descuentos.'
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
  const [experiences, setExperiences] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth state
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

      <FAQSection id="faq" spacing="lg">
        <div className="fade-up">
          <SectionTitle>Preguntas Frecuentes</SectionTitle>
          <SectionSubtitle>
            Todo lo que necesitas saber sobre nuestro programa de lealtad
          </SectionSubtitle>
          
          <FAQContainer>
            <StyledAccordion type="single" collapsible>
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionHeader>
                    <AccordionTrigger>
                      {faq.question}
                      <ChevronDown />
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </StyledAccordion>
          </FAQContainer>
        </div>
      </FAQSection>

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
                    Regístrate Gratis
                  </CTAButton>
                  <CTAButton to="/login" $variant="secondary">
                    Ya tengo cuenta
                  </CTAButton>
                </>
              )}
            </CTAButtons>
            
            <WalletBadges>
              <WalletBadge>🍎 Apple Wallet</WalletBadge>
              <WalletBadge>📱 Google Wallet</WalletBadge>
            </WalletBadges>
          </CTAContent>
        </div>
      </CTASection>
    </PageWrapper>
  );
};
