import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Star, ExternalLink } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

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

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TestimonialCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out forwards;
  opacity: 0;
  animation-delay: ${props => props.$delay}ms;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
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
          <p>Más de 50 reseñas con 5 estrellas en Google</p>
          <GoogleBadge 
            href="https://maps.app.goo.gl/fi40qnXXHMUvjxNO5" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span>4.9 ⭐ en Google Reviews</span>
            <ExternalLink size={14} />
          </GoogleBadge>
        </SectionHeader>

        <TestimonialsGrid>
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
        </TestimonialsGrid>
      </Container>
    </SectionWrapper>
  );
};
