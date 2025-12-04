import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Clock, MapPin, X, ArrowRight } from 'lucide-react';

// --- DATOS ---
const EVENTS_DATA = [
    {
        id: 1,
        title: "Taller de Velas Aromáticas",
        date: "14 OCT",
        time: "17:00 HRS",
        price: "$450",
        description: "Crea tu propia vela con aceites esenciales y flores secas mientras disfrutas de un Latte ilimitado.",
        imageColor: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        tags: ["Creativo", "Relax"]
    },
    {
        id: 2,
        title: "Cata de Café: Orígenes",
        date: "21 OCT",
        time: "18:00 HRS",
        price: "$350",
        description: "Un viaje sensorial por los granos de Chiapas, Veracruz y Oaxaca guiado por nuestros baristas expertos.",
        imageColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        tags: ["Cata", "Educativo"]
    },
    {
        id: 3,
        title: "Arte Latte Básico",
        date: "28 OCT",
        time: "16:30 HRS",
        price: "$600",
        description: "Aprende la técnica correcta de vaporización de leche y crea tu primer corazón en el café.",
        imageColor: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
        tags: ["Barista", "Práctico"]
    },
    {
        id: 4,
        title: "Cerámica & Matcha",
        date: "04 NOV",
        time: "17:00 HRS",
        price: "$550",
        description: "Moldea tu propia taza de cerámica mientras degustas nuestra selección de bebidas matcha.",
        imageColor: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
        tags: ["Arte", "Matcha"]
    }
];

// --- STYLED COMPONENTS ---

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
`;

const BackgroundBlobs = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
`;

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(60px); /* Blur un poco más definido */
  opacity: 0.5;
  animation: ${float} 20s infinite ease-in-out;
`;

const Section = styled.section`
  padding: 2rem 0 4rem 0; /* Menos padding top en móvil */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
  
  @media (min-width: 1024px) {
    padding: 4rem 0;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  /* Quitamos padding lateral del container en móvil para controlar el scroll nosotros */
  padding: 0; 
  position: relative;
  z-index: 1;

  @media (min-width: 1024px) {
    padding: 0 20px;
  }
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1.5rem; /* Padding solo para el texto */
  animation: ${fadeUp} 0.6s ease forwards;
`;

const Subtitle = styled.span`
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #1e3932;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  margin-top: 0;
  color: #1f1f1f;
`;

const SectionDesc = styled.p`
  max-width: 500px;
  margin: 0 auto;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
`;

// --- CONTENEDOR DE EVENTOS ---
const EventsContainer = styled.div`
  display: flex;
  gap: 1.5rem; /* Espacio entre tarjetas */
  
  /* LÓGICA MÓVIL: SCROLL SNAP */
  overflow-x: auto;
  scroll-snap-type: x mandatory; /* Efecto imán obligatorio */
  
  /* Padding lateral IMPORTANTE para que la primera y última tarjeta no toquen el borde */
  padding: 1rem 24px 3rem 24px; 
  
  -webkit-overflow-scrolling: touch;
  width: 100%;
  
  /* Ocultar scrollbar */
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  /* Desktop Grid */
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    overflow-x: visible;
    padding: 1rem 0;
  }
`;

const EventCard = styled.div`
  /* --- GLASSMORPHISM MEJORADO --- */
  background: rgba(255, 255, 255, 0.7); /* Un poco más opaco para legibilidad */
  backdrop-filter: blur(20px); /* Más borroso atrás */
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9); /* Borde blanco brillante */
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15); /* Sombra difusa */
  
  /* --- TAMAÑO MÓVIL "FULL CARD" --- */
  /* Calculamos el ancho: 100% de la pantalla MENOS el padding del contenedor (24px * 2 = 48px) */
  min-width: calc(100vw - 48px); 
  scroll-snap-align: center; /* Se detiene siempre en el centro */
  
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  opacity: 0;
  animation: ${fadeUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  @media (min-width: 600px) {
    min-width: 320px; /* Tablet: tamaño fijo */
  }

  @media (min-width: 1024px) {
    min-width: auto; /* Desktop: grid auto */
    &:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 20px 50px -10px rgba(0,0,0,0.2);
    }
  }
`;

const CardImageArea = styled.div`
  height: 180px;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  background: ${props => props.$bgGradient};
  
  /* Sutil overlay brillante para efecto vidrio */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
    pointer-events: none;
  }
`;

const DateBadge = styled.div`
  background: rgba(255,255,255,0.95);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  padding: 0.6rem 0.9rem;
  border-radius: 14px;
  text-align: center;
  color: #1f1f1f;
  z-index: 2;

  span:first-child { display: block; font-size: 1.3rem; font-weight: 800; line-height: 1; }
  span:last-child { display: block; font-size: 0.65rem; text-transform: uppercase; font-weight: 700; margin-top: 2px; letter-spacing: 0.5px; }
`;

const TagsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  z-index: 2;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  color: #fff;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255,255,255,0.5);
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

const CardBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const EventTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.8rem 0;
  line-height: 1.2;
  color: #1f1f1f;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
`;

const MetaItem = styled.span`
  display: flex; align-items: center; gap: 5px;
  svg { color: #1e3932; }
`;

const EventDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  border-top: 1px solid rgba(0,0,0,0.06);
  padding-top: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const PriceBox = styled.div`
  span:first-child { display: block; font-size: 0.7rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  span:last-child { font-size: 1.3rem; font-weight: 800; color: #1e3932; }
`;

const ReserveBtn = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1f1f1f;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);

  &:hover {
    background: #1e3932;
    transform: scale(1.05) rotate(-10deg);
  }
`;

// --- MODAL ---
const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #fff;
  width: 100%;
  max-width: 380px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  animation: ${fadeUp} 0.3s ease-out forwards;
`;

const CloseModalBtn = styled.button`
  position: absolute; top: 1rem; right: 1rem;
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(4px);
  border: none; border-radius: 50%;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: white; z-index: 10;
  &:hover { background: rgba(255,255,255,0.5); }
`;

export const Workshops = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);

    return (
        <Section>
            <BackgroundBlobs>
                <Blob style={{ top: '-10%', left: '-20%', width: '500px', height: '500px', background: '#e0c3fc' }} />
                <Blob style={{ top: '30%', right: '-20%', width: '400px', height: '400px', background: '#8ec5fc', animationDelay: '-7s' }} />
                <Blob style={{ bottom: '-10%', left: '10%', width: '350px', height: '350px', background: '#f5576c', animationDelay: '-15s' }} />
            </BackgroundBlobs>

            <Container>
                <HeaderWrapper>
                    <Subtitle>Eventos Le Duo</Subtitle>
                    <SectionTitle>Próximos Talleres</SectionTitle>
                    <SectionDesc>
                        Experiencias únicas diseñadas para aprender, crear y conectar.
                    </SectionDesc>
                </HeaderWrapper>

                <EventsContainer>
                    {EVENTS_DATA.map((event, index) => (
                        <EventCard
                            key={event.id}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <CardImageArea $bgGradient={event.imageColor}>
                                <DateBadge>
                                    <span>{event.date.split(' ')[0]}</span>
                                    <span>{event.date.split(' ')[1]}</span>
                                </DateBadge>
                                <TagsContainer>
                                    {event.tags.map(tag => (
                                        <Tag key={tag}>{tag}</Tag>
                                    ))}
                                </TagsContainer>
                            </CardImageArea>

                            <CardBody>
                                <EventTitle>{event.title}</EventTitle>
                                <MetaRow>
                                    <MetaItem><Clock size={16} /> {event.time}</MetaItem>
                                    <MetaItem><MapPin size={16} /> Centro</MetaItem>
                                </MetaRow>
                                <EventDescription>{event.description}</EventDescription>

                                <CardFooter>
                                    <PriceBox>
                                        <span>Por persona</span>
                                        <span>{event.price}</span>
                                    </PriceBox>
                                    <ReserveBtn onClick={() => setSelectedEvent(event)}>
                                        <ArrowRight size={22} />
                                    </ReserveBtn>
                                </CardFooter>
                            </CardBody>
                        </EventCard>
                    ))}
                    {/* Espaciador final para que la última card se pueda centrar bien */}
                    <div style={{ minWidth: '1px' }}></div>
                </EventsContainer>
            </Container>

            {/* Modal */}
            {selectedEvent && (
                <ModalOverlay onClick={() => setSelectedEvent(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <CloseModalBtn onClick={() => setSelectedEvent(null)}><X size={20} /></CloseModalBtn>
                        <div style={{ padding: '2rem 1.5rem 1rem', background: selectedEvent.imageColor }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1f1f1f' }}>{selectedEvent.title}</h3>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ marginTop: 0, color: '#666', fontSize: '0.9rem' }}>Ingresa tus datos para reservar.</p>
                            <button
                                onClick={() => { alert('Reserva enviada'); setSelectedEvent(null); }}
                                style={{ width: '100%', padding: '14px', background: '#1e3932', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                            >
                                Confirmar Reserva
                            </button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Section>
    );
};