import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// --- STYLED COMPONENTS ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SectionWrapper = styled.section`
  padding: 5rem 0;
  background-color: #f8f6f3;
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
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
    max-width: 600px;
    margin: 0 auto;
  }
`;

const ScrollContainer = styled.div`
  position: relative;
`;

const ScrollWrapper = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 1rem 0 2rem 0;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1e3932;
    color: white;
    border-color: #1e3932;
  }
  
  &:disabled {
    opacity: 0;
    pointer-events: none;
  }
  
  &.left { left: -22px; }
  &.right { right: -22px; }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MiniCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
  animation: ${fadeIn} 0.6s ease-out forwards;
  opacity: 0;
  flex-shrink: 0;
  width: 300px;
  scroll-snap-align: start;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 640px) {
    width: 280px;
  }
`;

const CardHeader = styled.div`
  height: 140px;
  background: ${props => props.$bg};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
`;

const DateBadge = styled.div`
  background: rgba(255,255,255,0.95);
  padding: 6px 12px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);

  span {
    display: block;
    color: #1f1f1f;
    line-height: 1;
  }
  .day { font-size: 1.2rem; font-weight: 800; }
  .month { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
`;

const TypeBadge = styled.div`
  background: ${props => props.$isExperience ? 'rgba(30, 57, 50, 0.9)' : 'rgba(0, 0, 0, 0.7)'};
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const CardTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #1e3932;
  line-height: 1.3;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  
  div { display: flex; align-items: center; gap: 5px; }
`;

const PriceTag = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e3932;
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const ViewAllBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 14px 32px;
  background-color: #2E4028;
  color: white;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(30, 57, 50, 0.2);

  &:hover {
    background-color: #152822;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(30, 57, 50, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  
  p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const month = months[date.getMonth()];
  return { day, month };
};

export const EventsHomePreview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch all active events
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .order('event_type', { ascending: true })
          .order('date', { ascending: true })
          .limit(10);

        if (error) throw error;
        
        // Filter: show open_schedule always, fixed only if date >= today
        const filteredEvents = (data || []).filter(event => {
          if (event.event_type === 'open_schedule') return true;
          return event.date >= today;
        });
        
        setEvents(filteredEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [events]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return null;
  }

  if (events.length === 0) {
    return (
      <SectionWrapper>
        <Container>
          <SectionHeader>
            <h2>Experiencias Le Duo</h2>
            <p>Conecta, aprende y disfruta. Talleres diseñados para amantes del café y el arte.</p>
          </SectionHeader>
          <EmptyState>
            <p>Próximamente nuevos talleres y experiencias</p>
            <ViewAllBtn to="/workshops">
              Ver Talleres <ArrowRight size={20} />
            </ViewAllBtn>
          </EmptyState>
        </Container>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <Container>
        <SectionHeader>
          <h2>Experiencias Le Duo</h2>
          <p>Conecta, aprende y disfruta. Talleres diseñados para amantes del café y el arte.</p>
        </SectionHeader>

        <ScrollContainer>
          <ScrollButton 
            className="left" 
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </ScrollButton>
          
          <ScrollWrapper ref={scrollRef}>
            {events.map((event, index) => {
              const isExperience = event.event_type === 'open_schedule';
              const { day, month } = formatEventDate(event.date);
              const cardBg = event.image_url 
                ? `url(${event.image_url})` 
                : event.image_gradient || 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
              
              return (
                <MiniCard key={event.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader $bg={cardBg} style={{ backgroundImage: event.image_url ? `url(${event.image_url})` : undefined, background: !event.image_url ? cardBg : undefined }}>
                    {isExperience ? (
                      <TypeBadge $isExperience>
                        <Clock size={12} /> Experiencia
                      </TypeBadge>
                    ) : (
                      <DateBadge>
                        <span className="day">{day}</span>
                        <span className="month">{month}</span>
                      </DateBadge>
                    )}
                    {!isExperience && (
                      <TypeBadge>
                        <Calendar size={12} /> Evento
                      </TypeBadge>
                    )}
                  </CardHeader>

                  <CardBody>
                    <CardTitle>{event.title}</CardTitle>
                    <MetaInfo>
                      {isExperience ? (
                        <div><Clock size={14} /> Horario flexible</div>
                      ) : (
                        <>
                          <div><Clock size={14} /> {event.time}</div>
                          <div><Calendar size={14} /> {day} {month}</div>
                        </>
                      )}
                    </MetaInfo>
                    <PriceTag>${event.price} MXN</PriceTag>
                  </CardBody>
                </MiniCard>
              );
            })}
          </ScrollWrapper>
          
          <ScrollButton 
            className="right" 
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </ScrollButton>
        </ScrollContainer>

        <ActionButtonWrapper>
          <ViewAllBtn to="/workshops">
            Ver todos los Talleres y Eventos <ArrowRight size={20} />
          </ViewAllBtn>
        </ActionButtonWrapper>

      </Container>
    </SectionWrapper>
  );
};
