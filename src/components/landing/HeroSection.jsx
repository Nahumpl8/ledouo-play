import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, Star, Leaf, MapPin } from 'lucide-react';
import { MenuSection } from '../common/MenuSection';
import { EventsHomePreview } from '../common/EventsHomePreview';

// --- 0. DATOS DE LAS DIAPOSITIVAS ---
const SLIDES = [
  {
    id: 'coffee',
    theme: {
      primary: '#48320cff', // Café Oscuro
      accent: '#cba258',  // Dorado
      text: '#ffffff',
      blob1: '#cba258',
    },
    content: {
      badge: 'Café de Especialidad #1',
      badgeIcon: <Star size={14} fill="currentColor" />,
      titleLine1: 'El Arte del Café',
      titleLine2: 'en Cada Sorbo',
      subtitle: 'Únete a nuestra comunidad. Acumula puntos, junta sellos por cada visita y te regalamos una bebida.',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=1037', // Chica tomando café
      floatIcon1: <Coffee size={24} color="#1e3932" />,
      floatText1: '5k+ Clientes',
      floatIcon2: <Star size={24} color="#cba258" fill="#cba258" />,
      floatText2: '4.9 Rating'
    }
  },
  {
    id: 'matcha',
    theme: {
      primary: '#2E4028', // Verde Matcha Oscuro
      accent: '#9dc88d',  // Verde Matcha Claro/Pastel
      text: '#ffffff',
      blob1: '#9dc88d',
    },
    content: {
      badge: 'Origen: Shizuoka, Japón',
      badgeIcon: <MapPin size={14} />,
      titleLine1: 'Matcha Ceremonial',
      titleLine2: 'Pura Tradición',
      subtitle: 'Importado directamente de los campos de Shizuoka. Experimenta el equilibrio perfecto, antioxidantes y energía natural.',
      image: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?q=80&w=2071&auto=format&fit=crop', // Matcha whisk o bebida
      floatIcon1: <Leaf size={24} color="#2E4028" />,
      floatText1: '100% Orgánico',
      floatIcon2: <Star size={24} color="#9dc88d" fill="#9dc88d" />,
      floatText2: 'Grado A'
    }
  }
];

// --- 1. ANIMACIONES ---
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const floatDelayed = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spinSlow = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// --- 2. STYLED COMPONENTS ---

const HeroWrapper = styled.section`
  min-height: 100vh;
  position: relative;
  /* Transición suave del color de fondo */
  background-color: ${props => props.$bgColor};
  color: ${props => props.theme.colors.white};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem 2rem;
  transition: background-color 1.5s ease-in-out; 
`;

// Blobs de fondo
const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
  transition: background 1.5s ease-in-out;
`;

const Blob1 = styled(Blob)`
  top: -30%; 
  right: -10%; 
  width: 80vw; 
  height: 80vw;
  background: radial-gradient(circle, ${props => props.$color} 0%, transparent 60%);
  opacity: 0.15;
`;

const Blob2 = styled(Blob)`
  bottom: -20%; 
  left: -10%; 
  width: 60vw; 
  height: 60vw;
  background: radial-gradient(circle, #ffffff 0%, transparent 70%);
  opacity: 0.05;
  filter: blur(100px);
`;

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 4rem;
  position: relative;
  z-index: 1;

  @media (min-width: 968px) {
    grid-template-columns: 1.1fr 0.9fr;
    min-height: 90vh;
  }
`;

// --- COLUMNA IZQUIERDA (TEXTO) ---
const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
  
  @media (min-width: 968px) {
    text-align: left;
    align-items: flex-start;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  /* Color dinámico del acento */
  color: ${props => props.$accentColor};
  font-weight: 600;
  font-size: 0.9rem;
  width: fit-content;
  margin: 0 auto;
  margin-bottom: 1rem;
  animation: ${fadeInUp} 0.8s ease-out;
  transition: color 1s ease;

  @media (min-width: 968px) { margin: 0; }
`;

const HeroTitle = styled.h1`
  font-size: clamp(3rem, 6vw, 5.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0;
  /* La animación se reinicia cuando cambia la 'key' en React */
  animation: ${fadeInUp} 0.8s ease-out 0.2s backwards;

  span {
    color: ${props => props.$accentColor};
    display: block;
    transition: color 1s ease;
  }
  @media (max-width: 968px) {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.8s ease-out 0.4s backwards;

  @media (min-width: 968px) { margin: 0; }
  @media (max-width: 968px) {
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
  /* Los botones no se re-animan, se quedan fijos para buena UX */
  animation: ${fadeInUp} 0.8s ease-out 0.6s backwards;

  @media (min-width: 968px) { 
    justify-content: flex-start; 
  }
`;

const Btn = styled(Link)`
  padding: 16px 32px;
  border-radius: 50px;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 1rem;
`;

const BtnPrimary = styled(Btn)`
  background: ${props => props.$accentColor};
  color: ${props => props.$primaryColor}; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  font-size: 1.1rem;

  &:hover {
    transform: translateY(-4px);
    background: white;
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
  }

  @media (max-width: 968px) { font-size: 1rem; }
`;

const BtnSecondary = styled(Btn)`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1.1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
  }
  @media (max-width: 968px) { font-size: 1rem; }
`;

// --- COLUMNA DERECHA (VISUAL) ---
const VisualContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
  /* Animamos todo el contenedor visual al entrar */
  animation: ${fadeInUp} 1s ease-out 0.4s backwards;
  
  @media (min-width: 968px) { min-height: 600px; }
`;

const CircleBackdrop = styled.div`
  position: absolute;
  width: 80%; 
  max-width: 320px;
  aspect-ratio: 1;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  animation: ${spinSlow} 60s linear infinite;

  @media (min-width: 768px) {
    width: 90%;
    max-width: 500px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    width: 8px;
    height: 8px;
    background: ${props => props.$accentColor};
    border-radius: 50%;
    box-shadow: 0 0 15px ${props => props.$accentColor};
    transition: background 1s ease, box-shadow 1s ease;

    @media (min-width: 768px) {
      top: -5px;
      width: 10px;
      height: 10px;
      box-shadow: 0 0 20px ${props => props.$accentColor};
    }
  }
`;

const HeroImage = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 380px;
  height: 400px;
  
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  
  border-radius: 200px 200px 40px 40px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  animation: ${float} 6s ease-in-out infinite;
  
  /* Transición suave al cambiar de imagen */
  transition: background-image 1s ease-in-out;

  @media (min-width: 968px) { height: 500px; }
`;

const FloatingCard = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0.6rem 0.8rem;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #1f1f1f;
  z-index: 3;
  animation: ${fadeInUp} 0.5s ease-out;
  transform: scale(0.8);

  @media (min-width: 768px) { 
    padding: 1rem;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    gap: 1rem;
    transform: scale(1);
  }

  .icon-box {
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 1s ease;

    @media (min-width: 768px) {
      padding: 10px;
    }

    svg {
      width: 18px;
      height: 18px;

      @media (min-width: 768px) {
        width: 24px;
        height: 24px;
      }
    }
  }

  .stat-text {
    display: flex;
    flex-direction: column;
    strong { 
      font-size: 0.85rem; 
      font-weight: 800; 
      display: block; 

      @media (min-width: 768px) {
        font-size: 1.1rem;
      }
    }
    span { 
      font-size: 0.65rem; 
      color: #666; 

      @media (min-width: 768px) {
        font-size: 0.8rem;
      }
    }
  }
`;

// Wrapper animado para las cards, para que floten
const FloatWrapperLeft = styled.div`
  position: absolute; 
  bottom: 5%; 
  left: -10%; 
  z-index: 3;
  animation: ${floatDelayed} 7s ease-in-out infinite 1s;

  @media (min-width: 768px) {
    bottom: 10%;
    left: 0;
  }
`;

const FloatWrapperRight = styled.div`
  position: absolute; 
  top: 5%; 
  right: -10%; 
  z-index: 3;
  animation: ${float} 5s ease-in-out infinite 0.5s;

  @media (min-width: 768px) {
    top: 15%;
    right: 0;
  }
`;

// Indicadores de diapositiva (puntos abajo)
const SlideIndicators = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 2rem;
  justify-content: center;
  @media (min-width: 968px) { justify-content: flex-start; }
`;

const Dot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.$active ? props.$accentColor : 'rgba(255,255,255,0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover { background-color: ${props => props.$accentColor}; }
`;

// --- COMPONENTE PRINCIPAL ---

export const HeroSection = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-play del slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000); // Cambia cada 6 segundos

    return () => clearInterval(interval);
  }, []);

  const slide = SLIDES[currentSlideIndex];
  const { theme, content } = slide;

  return (
    <>
      <HeroWrapper $bgColor={theme.primary}>
        <Blob1 $color={theme.blob1} />
        <Blob2 />

        <Container>

          {/* Columna Izquierda: Texto */}
          <TextContent>
            {/* Usamos 'key' para forzar a React a reiniciar la animación fadeInUp cuando cambia el slide */}
            <div key={`text-${currentSlideIndex}`}>
              <Badge $accentColor={theme.accent}>
                {content.badgeIcon}
                <span>{content.badge}</span>
              </Badge>

              <HeroTitle $accentColor={theme.accent}>
                {content.titleLine1}
                <span>{content.titleLine2}</span>
              </HeroTitle>

              <HeroSubtitle>
                {content.subtitle}
              </HeroSubtitle>
            </div>

            <ButtonGroup>
              <BtnPrimary
                to="/menu"
                $accentColor={theme.accent}
                $primaryColor={theme.primary}
              >
                Ver Menú Le Duo
              </BtnPrimary>
              <BtnSecondary to="/eventos-talleres">
                Eventos & Talleres <ArrowRight size={20} />
              </BtnSecondary>
            </ButtonGroup>

            <SlideIndicators>
              {SLIDES.map((_, idx) => (
                <Dot
                  key={idx}
                  $active={idx === currentSlideIndex}
                  $accentColor={theme.accent}
                  onClick={() => setCurrentSlideIndex(idx)}
                />
              ))}
            </SlideIndicators>
          </TextContent>

          {/* Columna Derecha: Visual */}
          <VisualContainer>
            <CircleBackdrop $accentColor={theme.accent} />

            {/* Imagen Principal */}
            <HeroImage $bgImage={content.image} />

            {/* Tarjetas Flotantes (con key para refrescar contenido suavemente) */}
            <FloatWrapperLeft>
              <FloatingCard key={`card1-${currentSlideIndex}`}>
                <div className="icon-box" style={{ background: `${theme.accent}30` }}>
                  {content.floatIcon1}
                </div>
                <div className="stat-text">
                  <strong>{content.floatText1}</strong>
                  <span>Calidad Garantizada</span>
                </div>
              </FloatingCard>
            </FloatWrapperLeft>

            <FloatWrapperRight>
              <FloatingCard key={`card2-${currentSlideIndex}`}>
                <div className="icon-box" style={{ background: '#fff9e6' }}>
                  {content.floatIcon2}
                </div>
                <div className="stat-text">
                  <strong>{content.floatText2}</strong>
                  <span>Opiniones</span>
                </div>
              </FloatingCard>
            </FloatWrapperRight>
          </VisualContainer>

        </Container>
      </HeroWrapper>

      {/* Sección del Menú integrada abajo */}
      <MenuSection />
      <EventsHomePreview />
    </>
  );
};