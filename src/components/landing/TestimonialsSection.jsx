import React, { useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Animaciones ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const SectionWrapper = styled.section`
  padding: 5rem 0;
  background: linear-gradient(180deg, #f8f6f3 0%, #fff 100%);
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.6s ease-out;

  h2 {
    font-size: 2.5rem;
    color: #1f1f1f;
    margin-bottom: 0.5rem;
    font-weight: 800;
  }
  
  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const GoogleBadge = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 16px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-decoration: none;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  
  svg {
    color: #4285f4;
  }
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 0.5rem;
  
  svg {
    color: #fbbf24;
    fill: #fbbf24;
  }
`;

// --- Nuevo Contenedor Scroll Horizontal ---
const CarouselContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ScrollTrack = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem 0.5rem; /* Padding para que la sombra no se corte */
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  /* Ocultar barra de scroll */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TestimonialCard = styled.div`
  /* Cambios clave para el carrusel */
  min-width: 350px; 
  max-width: 350px;
  flex: 0 0 auto;
  scroll-snap-align: center;
  
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${fadeIn} 0.6s ease-out forwards;
  opacity: 0;
  animation-delay: ${props => props.$delay}ms;
  
  /* Efecto al pasar el mouse */
  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    border-color: rgba(46, 64, 40, 0.2);
  }

  @media (max-width: 480px) {
    min-width: 280px;
    max-width: 280px;
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
  transition: all 0.2s ease;
  color: #1f1f1f;

  &:hover {
    background: #2E4028;
    color: white;
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${props => props.$position === 'left' && css`
    left: -20px;
    @media (max-width: 768px) { left: 0; }
  `}

  ${props => props.$position === 'right' && css`
    right: -20px;
    @media (max-width: 768px) { right: 0; }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2E4028, #5a7a4a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  
  h4 {
    font-weight: 600;
    color: #1f1f1f;
    margin: 0;
    font-size: 0.95rem;
  }
  
  span {
    font-size: 0.75rem;
    color: #888;
  }
`;

const Quote = styled.p`
  color: #444;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
  
  &::before {
    content: '"';
    font-size: 1.5rem;
    color: #2E4028;
    font-weight: 700;
  }
  
  &::after {
    content: '"';
    font-size: 1.5rem;
    color: #2E4028;
    font-weight: 700;
  }
`;

const TESTIMONIALS = [
  {
    name: "Izzi Willow",
    initials: "IW",
    time: "Hace 6 días",
    quote: "Cafe delicioso, comida rica, ambiente relajado y sillas cómodas. Gran cafesito para venir a conversar o trabajar. Recomiendo 10/10"
  },
  {
    name: "Nicole Tran",
    initials: "NT",
    time: "Hace 2 semanas",
    quote: "New cafe in Roma Norte that serves excellent matcha lattes! My friend and I tried the strawberry cheesecake matcha and it was amazing!"
  },
  {
    name: "Katia Pinto",
    initials: "KP",
    time: "Hace 4 semanas",
    quote: "El strawberry matcha está increíble, súper cremosito y con un sabor delicioso. El lugar se siente hecho con amor. Me encantó, voy a volver."
  },
  {
    name: "Priscila Robles",
    initials: "PR",
    time: "Hace 4 semanas",
    quote: "El matcha espectacular es el mejor matcha que he probado en Ciudad de México sin duda regresaré muchas veces más"
  },
  {
    name: "Claudia del Valle",
    initials: "CV",
    time: "Hace 4 semanas",
    quote: "Son súper lindos, le hicieron un osito a mi hija, el servicio y las bebidas son excelente!"
  },
  {
    name: "Monse Kuri",
    initials: "MK",
    time: "Hace 3 semanas",
    quote: "El lugar está súper lindo. El café deli y la comida también. El café de temporada me encantó (es el de nutella pídanlo)"
  }
];

export const TestimonialsSection = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 370; // Ancho de tarjeta + gap aproximado
      if (direction === 'left') {
        current.scrollLeft -= scrollAmount;
      } else {
        current.scrollLeft += scrollAmount;
      }
    }
  };

  return (
    <SectionWrapper>
      <Container>
        <SectionHeader>
          <StarsContainer>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} />
            ))}
          </StarsContainer>
          <h2>Lo que dicen nuestros clientes</h2>
          <p>Más de 20 reseñas con 5 estrellas en Google</p>
          <GoogleBadge
            href="https://goo.gl/maps/tu-link-aqui"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>5 ⭐ en Google Reviews</span>
            <ExternalLink size={14} />
          </GoogleBadge>
        </SectionHeader>

        <CarouselContainer>

          <ScrollTrack ref={scrollRef}>
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} $delay={index * 100}>
                <CardHeader>
                  <Avatar>{testimonial.initials}</Avatar>
                  <UserInfo>
                    <h4>{testimonial.name}</h4>
                    <StarsContainer>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} />
                      ))}
                    </StarsContainer>
                    <span>{testimonial.time}</span>
                  </UserInfo>
                </CardHeader>
                <Quote>{testimonial.quote}</Quote>
              </TestimonialCard>

            ))}
          </ScrollTrack>

        </CarouselContainer>
      </Container>

    </SectionWrapper>
  );
};