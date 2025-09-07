import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { useOnScrollReveal } from '../hooks/useOnScrollReveal';
// import logo from '../assets/images/logo-leduo.png';
const logo = '/lovable-uploads/3eb489f6-f1b0-4d84-8bbc-971d4d1b45b0.png';
const barista = '/baristaHero.png';

const Hero = styled.section`
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.bg} 0%, ${props => props.theme.colors.bgAlt} 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="coffee" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="%23${props => props.theme.colors.primary.replace('#', '')}" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23coffee)"/></svg>');
    opacity: 0.3;
  }

`;

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: ${props => props.theme.spacing.xl};
  position: relative;
  z-index: 2;
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const HeroText = styled.div`
  text-align: center;
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    text-align: left;
  }
  
  h1 {
    font-family: ${props => props.theme.fontPrimary};
    font-size: clamp(2.5rem, 5vw, 4rem);
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.md};
    line-height: 1.1;
  }
  
  .subtitle {
    font-size: clamp(1.1rem, 2vw, 1.4rem);
    color: ${props => props.theme.colors.secondary};
    margin-bottom: ${props => props.theme.spacing.lg};
    font-weight: 300;
  }
  
  .description {
    font-size: 1.1rem;
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.xl};
    line-height: 1.6;
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    h1 {
      font-size: clamp(2rem, 6vw, 3rem);
    }
    .subtitle {
      font-size: clamp(1rem, 3vw, 1.2rem);
    }
  } 

  @media (min-width: ${props => props.theme.breakpoints.mobile}) {
    h1 {
      font-size: 2.4rem;
    }
    .subtitle {
      font-size: 1.6rem;
    }
    .description {
      font-size: 1rem;
    }
  }
`;

const HeroImage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  scale: 1.4;
  
  img {
    max-width: 100%;
    height: auto;
    max-height: 400px;
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    scale: 1;
  }
`;

const LoyaltySection = styled(Section)`
  background: ${props => props.theme.colors.white};
`;

const SectionTitle = styled.h2`
  font-family: ${props => props.theme.fontPrimary};
  font-size: clamp(2rem, 4vw, 3rem);
  color: ${props => props.theme.colors.primary};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const LoyaltyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const LoyaltyCard = styled(Card)`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  gap: ${props => props.theme.spacing.sm};
  
  .icon {
    font-size: 3rem;
    display: block;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  h3 {
    color: ${props => props.theme.colors.primary};
    font-size: 1.8rem;
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
      font-size: 1.4rem;
    }
  }
  
  p {
    color: ${props => props.theme.colors.text};
    line-height: 1.5;
    font-size: 1rem;
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
      font-size: 0.9rem;
    }
  }
`;

const StepsSection = styled(Section)`
  background: ${props => props.theme.colors.bgAlt};
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    gap: 10px;
  }
  
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: ${props => props.theme.radius};
  font-weight: 500;
  font-size: 18px;
  transition: all 0.3s ease;
  text-decoration: none;
  border: 2px solid transparent;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    font-size: 16px;
    padding: 10px 18px;
  }
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.text};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadow};
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;  

const StepCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.sm};
  }
  
  
  .step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
    font-size: 1.5rem;
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
      font-size: 1.4rem;
    }
  }
  
  p {
    color: ${props => props.theme.colors.text};
    line-height: 1.5;
    font-size: 1rem;
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
      font-size: 0.9rem;
    }
  }
`;

const BenefitsSection = styled(Section)`
  background: ${props => props.theme.colors.white};
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    gap: 10px;
  }

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const BenefitCard = styled(Card)`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  
  .icon {
    font-size: 2rem;
    flex-shrink: 0;
  }
  
  .content {
    h4 {
      color: ${props => props.theme.colors.primary};
      margin-bottom: 4px;
      font-size: 1.6rem;
      @media (max-width: ${props => props.theme.breakpoints.mobile}) {
        font-size: 1.4rem;
      }
    }
    
    p {
      color: ${props => props.theme.colors.text};
      font-size: 0.9rem;
      line-height: 1.4;
      @media (max-width: ${props => props.theme.breakpoints.mobile}) {
        font-size: 0.8rem;
      }
    }
  }
`;

const CTASection = styled(Section)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  color: ${props => props.theme.colors.white};
  text-align: center;
  
  h2 {
    color: ${props => props.theme.colors.white};
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: ${props => props.theme.spacing.lg};
    opacity: 0.9;
  }
  
  .qr-placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    background: ${props => props.theme.colors.white};
    border-radius: ${props => props.theme.radius};
    margin: ${props => props.theme.spacing.lg} 0;
    font-size: 3rem;
    color: ${props => props.theme.colors.primary};
  }
`;

export const Landing = () => {
  useOnScrollReveal();

  return (
    <main>
      <Hero>
        <Section spacing="lg">
          <HeroContent>
            <HeroText className="fade-up">
              <h1>Bienvenido a LeDuo</h1>
              <p className="subtitle">Café artesanal con beneficios que crecen contigo</p>
              <p className="description">
                Descubre nuestro programa de lealtad único: gana puntos, colecciona sellos, 
                gira la ruleta y desbloquea recompensas increíbles con cada visita.
              </p>
              <Button as="a" href="#como-funciona" size="sm">
                Conoce cómo funciona
              </Button>
            </HeroText>
            <HeroImage className="fade-up">
              <img src={barista} alt="LeDuo Coffee" />
            </HeroImage>
          </HeroContent>
        </Section>
      </Hero>

      <LoyaltySection id="lealtad">
        <div className="fade-up">
          <SectionTitle>Tu programa de lealtad LeDuo</SectionTitle>
          <LoyaltyGrid>
            <LoyaltyCard hover>
              <span className="icon">💰</span>
              <h3>Cashback</h3>
              <p>Gana puntos con cada compra y canjéalos por productos gratis o descuentos especiales.</p>
            </LoyaltyCard>
            
            <LoyaltyCard hover>
              <span className="icon">🎯</span>
              <h3>Sellos</h3>
              <p>Colecciona sellos por cada visita o por monto de compra. Completa la tarjeta y gana premios.</p>
            </LoyaltyCard>
            
            <LoyaltyCard hover>
              <span className="icon">🎰</span>
              <h3>Ruleta Semanal</h3>
              <p>Gira la ruleta cada semana o después de cierto número de visitas para ganar premios sorpresa.</p>
            </LoyaltyCard>
            
            <LoyaltyCard hover>
              <span className="icon">🏆</span>
              <h3>Retos Especiales</h3>
              <p>Completa retos mensuales y desafíos especiales para desbloquear recompensas exclusivas.</p>
            </LoyaltyCard>
          </LoyaltyGrid>
        </div>
      </LoyaltySection>

      <StepsSection id="como-funciona">
        <div className="fade-up">
          <SectionTitle>¿Cómo funciona?</SectionTitle>
          <StepsGrid>
            <StepCard className="slide-in">
              <div className="step-number">1</div>
              <h3>Regístrate</h3>
              <p>Escanea el código QR y registrate en nuestra sucursal LeDuo en Coahhuila #111, Roma Norte, CDMX.</p>
            </StepCard>
            
            <StepCard className="slide-in">
              <div className="step-number">2</div>
              <h3>Acumula puntos</h3>
              <p>Con cada compra ganas puntos automáticamente. Mientras más visitas, más beneficios.</p>
            </StepCard>
            
            <StepCard className="slide-in">
              <div className="step-number">3</div>
              <h3>Disfruta recompensas</h3>
              <p>Canjea puntos, gira la ruleta y disfruta de beneficios exclusivos para miembros.</p>
            </StepCard>
          </StepsGrid>
        </div>
      </StepsSection>

      <BenefitsSection id="beneficios">
        <div className="fade-up">
          <SectionTitle>Beneficios exclusivos</SectionTitle>
          <BenefitsGrid>
            <BenefitCard hover>
              <span className="icon">☕</span>
              <div className="content">
                <h4>Café gratis</h4>
                <p>Cada 10 sellos = 1 café de cortesía</p>
              </div>
            </BenefitCard>
            
            <BenefitCard hover>
              <span className="icon">🍰</span>
              <div className="content">
                <h4>Descuentos especiales</h4>
                <p>20% off en pasteles los miércoles</p>
              </div>
            </BenefitCard>
            
            <BenefitCard hover>
              <span className="icon">🎁</span>
              <div className="content">
                <h4>Cumpleaños especial</h4>
                <p>Regalo sorpresa en tu cumpleaños</p>
              </div>
            </BenefitCard>
            
            <BenefitCard hover>
              <span className="icon">⭐</span>
              <div className="content">
                <h4>Acceso VIP</h4>
                <p>Eventos exclusivos para miembros</p>
              </div>
            </BenefitCard>
            
            <BenefitCard hover>
              <span className="icon">📱</span>
              <div className="content">
                <h4>App móvil</h4>
                <p>Guarda tu tarjeta en Apple/Google Wallet</p>
              </div>
            </BenefitCard>
            
            <BenefitCard hover>
              <span className="icon">🎯</span>
              <div className="content">
                <h4>Ofertas personalizadas</h4>
                <p>Promociones basadas en tus gustos</p>
              </div>
            </BenefitCard>
          </BenefitsGrid>
        </div>
      </BenefitsSection>

      <CTASection>
        <div className="fade-up">
          <h2>¡Únete a LeDuo hoy!</h2>
          <p>Regístrate escaneando el código QR en nuestra caja y comienza a disfrutar de todos los beneficios.</p>
          <div className="qr-placeholder">
            📱
          </div>
          <p style={{fontSize: '1rem', opacity: 0.8}}>
            Disponible en nuestras sucursales • Roma Norte, CDMX
          </p>
          <Button as={Link} to="/app/login" variant="secondary" size="lg">
            Ingresar a mi cuenta
          </Button>
        </div>
      </CTASection>
    </main>
  );
};