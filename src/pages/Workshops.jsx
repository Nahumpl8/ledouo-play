import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Clock, MapPin, ArrowRight, Users, Calendar, Filter, X } from 'lucide-react';
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
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
  
  @media (min-width: 1024px) {
    padding: 4rem 0;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 2rem;
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

// Filters
const FiltersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  justify-content: center;
  animation: ${fadeUp} 0.6s ease forwards;
  animation-delay: 0.1s;
  opacity: 0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  border: 2px solid ${props => props.$active ? '#1e3932' : '#e0e0e0'};
  background: ${props => props.$active ? '#1e3932' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1e3932;
    background: ${props => props.$active ? '#1e3932' : 'rgba(30, 57, 50, 0.05)'};
  }
`;

const PriceDropdown = styled.div`
  position: relative;
`;

const PriceButton = styled(FilterButton)`
  min-width: 140px;
  justify-content: space-between;
`;

const PriceMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  padding: 0.5rem;
  min-width: 160px;
  z-index: 100;
  
  button {
    width: 100%;
    padding: 0.6rem 1rem;
    border: none;
    background: ${props => props.$active ? 'rgba(30, 57, 50, 0.1)' : 'transparent'};
    text-align: left;
    font-size: 0.85rem;
    cursor: pointer;
    border-radius: 8px;
    
    &:hover {
      background: rgba(30, 57, 50, 0.1);
    }
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.8rem;
  border: none;
  background: #f0f0f0;
  color: #666;
  font-size: 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
  }
`;

// Grid
const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const EventCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: ${fadeUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.2);
  }
`;

const CardImageArea = styled.div`
  height: 160px;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => props.$bgGradient};
  background-size: cover;
  background-position: center;
  
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
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  text-align: center;
  color: #1f1f1f;
  z-index: 2;

  span:first-child { display: block; font-size: 1.2rem; font-weight: 800; line-height: 1; }
  span:last-child { display: block; font-size: 0.6rem; text-transform: uppercase; font-weight: 700; margin-top: 2px; letter-spacing: 0.5px; }
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
  z-index: 2;
`;

const CardBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const EventTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.6rem 0;
  line-height: 1.2;
  color: #1f1f1f;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: #555;
  font-weight: 500;
`;

const MetaItem = styled.span`
  display: flex; align-items: center; gap: 4px;
  svg { color: #1e3932; }
`;

const EventDescription = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  border-top: 1px solid rgba(0,0,0,0.06);
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const PriceBox = styled.div`
  span:first-child { display: block; font-size: 0.65rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  span:last-child { font-size: 1.2rem; font-weight: 800; color: #1e3932; }
`;

const ReserveBtn = styled.button`
  width: 42px;
  height: 42px;
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
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.$low ? '#e74c3c' : '#27ae60'};
  font-weight: 600;
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

const PRICE_RANGES = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: '$0 - $200', min: 0, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: '$500+', min: 500, max: Infinity },
];

export const Workshops = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'fixed', 'open_schedule'
  const [priceFilter, setPriceFilter] = useState(PRICE_RANGES[0]);
  const [showPriceMenu, setShowPriceMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .order('event_type', { ascending: true })
          .order('date', { ascending: true });

        if (error) throw error;
        
        // Filter: show open_schedule always, fixed only if date >= today
        const filtered = (data || []).filter(event => {
          if (event.event_type === 'open_schedule') return true;
          return event.date >= today;
        });
        
        setEvents(filtered);
        setFilteredEvents(filtered);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];
    
    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(e => e.event_type === typeFilter);
    }
    
    // Price filter
    result = result.filter(e => e.price >= priceFilter.min && e.price < priceFilter.max);
    
    setFilteredEvents(result);
  }, [events, typeFilter, priceFilter]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const handleEventClick = (eventId) => {
    navigate(`/workshops/${eventId}`);
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setPriceFilter(PRICE_RANGES[0]);
  };

  const hasActiveFilters = typeFilter !== 'all' || priceFilter.label !== 'Todos';

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
          <SectionTitle>Talleres y Experiencias</SectionTitle>
          <SectionDesc>
            Experiencias únicas diseñadas para aprender, crear y conectar.
          </SectionDesc>
        </HeaderWrapper>

        <FiltersWrapper>
          <FilterButton 
            $active={typeFilter === 'all'} 
            onClick={() => setTypeFilter('all')}
          >
            Todos
          </FilterButton>
          <FilterButton 
            $active={typeFilter === 'fixed'} 
            onClick={() => setTypeFilter('fixed')}
          >
            <Calendar size={16} /> Eventos
          </FilterButton>
          <FilterButton 
            $active={typeFilter === 'open_schedule'} 
            onClick={() => setTypeFilter('open_schedule')}
          >
            <Clock size={16} /> Experiencias
          </FilterButton>
          
          <PriceDropdown>
            <PriceButton 
              $active={priceFilter.label !== 'Todos'}
              onClick={() => setShowPriceMenu(!showPriceMenu)}
            >
              <Filter size={16} />
              {priceFilter.label}
            </PriceButton>
            {showPriceMenu && (
              <PriceMenu>
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      setPriceFilter(range);
                      setShowPriceMenu(false);
                    }}
                    style={{ background: priceFilter.label === range.label ? 'rgba(30, 57, 50, 0.1)' : 'transparent' }}
                  >
                    {range.label}
                  </button>
                ))}
              </PriceMenu>
            )}
          </PriceDropdown>
          
          {hasActiveFilters && (
            <ActiveFilters>
              <ClearButton onClick={clearFilters}>
                <X size={14} /> Limpiar filtros
              </ClearButton>
            </ActiveFilters>
          )}
        </FiltersWrapper>

        {filteredEvents.length === 0 ? (
          <EmptyState>
            <h3>No hay eventos que coincidan</h3>
            <p>Intenta ajustar los filtros o vuelve pronto para ver nuevas experiencias.</p>
          </EmptyState>
        ) : (
          <EventsGrid>
            {filteredEvents.map((event, index) => {
              const isExperience = event.event_type === 'open_schedule';
              const { day, month } = formatDate(event.date);
              const lowSpots = event.spots_available <= 5;
              const cardBg = event.image_url || event.image_gradient;
              
              return (
                <EventCard
                  key={event.id}
                  style={{ animationDelay: `${index * 80}ms` }}
                  onClick={() => handleEventClick(event.id)}
                >
                  <CardImageArea 
                    $bgGradient={event.image_url ? `url(${event.image_url})` : event.image_gradient}
                    style={event.image_url ? { backgroundImage: `url(${event.image_url})` } : {}}
                  >
                    {isExperience ? (
                      <TypeBadge $isExperience>
                        <Clock size={12} /> Experiencia
                      </TypeBadge>
                    ) : (
                      <DateBadge>
                        <span>{day}</span>
                        <span>{month}</span>
                      </DateBadge>
                    )}
                    {!isExperience && (
                      <TypeBadge>
                        <Calendar size={12} /> Evento
                      </TypeBadge>
                    )}
                  </CardImageArea>

                  <CardBody>
                    <EventTitle>{event.title}</EventTitle>
                    <MetaRow>
                      {isExperience ? (
                        <MetaItem><Clock size={14} /> Horario flexible</MetaItem>
                      ) : (
                        <MetaItem><Clock size={14} /> {event.time}</MetaItem>
                      )}
                      <MetaItem><MapPin size={14} /> {event.location}</MetaItem>
                    </MetaRow>
                    <EventDescription>{event.description}</EventDescription>
                    
                    {!isExperience && (
                      <SpotsIndicator $low={lowSpots}>
                        <Users size={12} />
                        {event.spots_available > 0 
                          ? `${event.spots_available} lugares`
                          : 'Agotado'}
                      </SpotsIndicator>
                    )}

                    <CardFooter>
                      <PriceBox>
                        <span>Por persona</span>
                        <span>${event.price}</span>
                      </PriceBox>
                      <ReserveBtn onClick={(e) => { e.stopPropagation(); handleEventClick(event.id); }}>
                        <ArrowRight size={20} />
                      </ReserveBtn>
                    </CardFooter>
                  </CardBody>
                </EventCard>
              );
            })}
          </EventsGrid>
        )}
      </Container>
    </Section>
  );
};
