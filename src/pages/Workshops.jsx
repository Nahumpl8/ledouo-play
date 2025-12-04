import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Clock, MapPin, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  filter: blur(60px);
  opacity: 0.5;
  animation: ${float} 20s infinite ease-in-out;
`;

const Section = styled.section`
  padding: 2rem 0 4rem 0;
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
  padding: 0 1.5rem;
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

const EventsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 1rem 24px 3rem 24px; 
  -webkit-overflow-scrolling: touch;
  width: 100%;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    overflow-x: visible;
    padding: 1rem 0;
  }
`;

const EventCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
  min-width: calc(100vw - 48px); 
  scroll-snap-align: center;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: ${fadeUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  @media (min-width: 600px) {
    min-width: 320px;
  }

  @media (min-width: 1024px) {
    min-width: auto;
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

const SpotsIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: ${props => props.$low ? '#e74c3c' : '#27ae60'};
  font-weight: 600;
  margin-top: 0.5rem;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  h3 {
    color: #333;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #666;
    margin: 0;
  }
`;

export const Workshops = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('is_active', true)
                    .gte('date', new Date().toISOString().split('T')[0])
                    .order('date', { ascending: true });

                if (error) throw error;
                setEvents(data || []);
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase();
        return { day, month };
    };

    const handleEventClick = (eventId) => {
        navigate(`/workshops/${eventId}`);
    };

    if (loading) {
        return (
            <Section>
                <LoadingWrapper>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </LoadingWrapper>
            </Section>
        );
    }

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

                {events.length === 0 ? (
                    <EmptyState>
                        <h3>No hay eventos próximos</h3>
                        <p>¡Vuelve pronto para ver nuevas experiencias!</p>
                    </EmptyState>
                ) : (
                    <EventsContainer>
                        {events.map((event, index) => {
                            const { day, month } = formatDate(event.date);
                            const lowSpots = event.spots_available <= 5;
                            
                            return (
                                <EventCard
                                    key={event.id}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    onClick={() => handleEventClick(event.id)}
                                >
                                    <CardImageArea $bgGradient={event.image_gradient}>
                                        <DateBadge>
                                            <span>{day}</span>
                                            <span>{month}</span>
                                        </DateBadge>
                                        <TagsContainer>
                                            {event.tags?.map(tag => (
                                                <Tag key={tag}>{tag}</Tag>
                                            ))}
                                        </TagsContainer>
                                    </CardImageArea>

                                    <CardBody>
                                        <EventTitle>{event.title}</EventTitle>
                                        <MetaRow>
                                            <MetaItem><Clock size={16} /> {event.time}</MetaItem>
                                            <MetaItem><MapPin size={16} /> {event.location}</MetaItem>
                                        </MetaRow>
                                        <EventDescription>{event.description}</EventDescription>
                                        
                                        <SpotsIndicator $low={lowSpots}>
                                            <Users size={14} />
                                            {event.spots_available > 0 
                                                ? `${event.spots_available} lugares disponibles`
                                                : 'Sin lugares disponibles'}
                                        </SpotsIndicator>

                                        <CardFooter>
                                            <PriceBox>
                                                <span>Por persona</span>
                                                <span>${event.price}</span>
                                            </PriceBox>
                                            <ReserveBtn onClick={(e) => { e.stopPropagation(); handleEventClick(event.id); }}>
                                                <ArrowRight size={22} />
                                            </ReserveBtn>
                                        </CardFooter>
                                    </CardBody>
                                </EventCard>
                            );
                        })}
                        <div style={{ minWidth: '1px' }}></div>
                    </EventsContainer>
                )}
            </Container>
        </Section>
    );
};
