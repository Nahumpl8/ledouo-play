import React from 'react';
import styled, { keyframes } from 'styled-components';
import { MapPin, Instagram, Play } from 'lucide-react';

// --- Animaciones ---
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.2); }
  70% { box-shadow: 0 0 0 15px rgba(15, 23, 42, 0); }
  100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
`;

// --- Styled Components ---

const SectionWrapper = styled.section`
  padding: 5rem 0;
  background: #f8f6f3; /* Color beige suave de fondo */
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rem;

  @media (max-width: 968px) {
    flex-direction: column;
    gap: 3rem;
    text-align: center;
  }
`;

// --- Lado del Texto ---
const TextContent = styled.div`
  flex: 1;
  max-width: 500px;

  h2 {
    font-size: 3rem;
    font-weight: 800;
    color: #1f1f1f;
    margin-bottom: 1.5rem;
    line-height: 1.1;
    
    span {
      color: #2E4028; /* Verde Le Duo */
      display: block;
    }
  }

  p {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    h2 { font-size: 2.2rem; }
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  
  strong {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f1f1f;
  }
  
  span {
    font-size: 0.9rem;
    color: #888;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1f1f1f;
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    background: #000;
  }
`;

const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #1f1f1f;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f9f9f9;
    border-color: #d4d4d4;
  }
`;

// --- Lado del Video (Phone Frame) ---
const PhoneFrame = styled.div`
  position: relative;
  width: 300px;
  height: 600px;
  background: #000;
  border-radius: 40px;
  border: 8px solid #1f1f1f;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${float} 6s ease-in-out infinite;
  flex-shrink: 0;

  /* El iframe de YouTube */
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    transform: scale(1.01); /* Evita bordes blancos finos */
  }

  /* Notch del iPhone */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 25px;
    background: #1f1f1f;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    z-index: 10;
  }
  
  /* Botón de Play Decorativo (desaparece al dar click en youtube real) */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none; /* Permite clicks al video */
    box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
    z-index: 5;
    border-radius: 32px;
  }
`;

const BlobBackground = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(46,64,40,0.1) 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
  pointer-events: none;
`;

export const VideoSection = () => {
    return (
        <SectionWrapper>
            <Container>
                {/* Contenido Texto */}
                <TextContent>
                    <h2>
                        Vive la experiencia
                        <span>Le Duo</span>
                    </h2>
                    <p>
                        No somos solo una cafetería, somos tu segundo hogar.
                        Ven a probar nuestro café de especialidad o nuestro Matcha ceremonial, disfruta de un ambiente
                        relajado y déjate consentir por nuestro equipo.
                        <br /><br />
                        📍 En el corazón de la Roma Norte.
                    </p>

                    <StatsRow>
                        <StatItem>
                            <strong>5/5</strong>
                            <span>Google Reviews</span>
                        </StatItem>
                        <StatItem>
                            <strong>+2k</strong>
                            <span>Coffee Lovers</span>
                        </StatItem>
                        <StatItem>
                            <strong>100%</strong>
                            <span>Pet Friendly</span>
                        </StatItem>
                    </StatsRow>

                    <ActionButtons>
                        <PrimaryButton href="https://maps.google.com/?q=Le+Duo+Roma+Norte" target="_blank">
                            <MapPin size={18} />
                            Cómo llegar
                        </PrimaryButton>
                        <SecondaryButton href="https://instagram.com/leduomx" target="_blank">
                            <Instagram size={18} />
                            Síguenos
                        </SecondaryButton>
                    </ActionButtons>
                </TextContent>

                {/* Contenido Video */}
                <div style={{ position: 'relative' }}>
                    <BlobBackground />
                    <PhoneFrame>
                        {/* Usamos la URL de embed de YouTube. 
              Importante: ?autoplay=0&controls=0&loop=1&playlist=fMckMXYLWuw 
              para que se vea limpio.
            */}
                        <iframe
                            src="https://www.youtube.com/embed/fMckMXYLWuw?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=fMckMXYLWuw"
                        ></iframe>
                    </PhoneFrame>
                </div>

            </Container>
        </SectionWrapper>
    );
};