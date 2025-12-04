import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReservationModal } from '@/components/events/ReservationModal';
import { toast } from 'sonner';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const HeroSection = styled.div`
  height: 300px;
  background: ${props => props.$gradient};
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 2rem;
  
  @media (min-width: 768px) {
    height: 400px;
    padding: 3rem;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const HeroContent = styled.div`
  z-index: 1;
  color: white;
  max-width: 800px;
`;

const TagsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(4px);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EventTitle = styled.h1`
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const ContentSection = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  
  .icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    color: #1e3932;
  }
  
  .label {
    font-size: 0.75rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f1f1f;
  }
`;

const DescriptionSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #1f1f1f;
  }
  
  p {
    color: #666;
    line-height: 1.8;
    margin: 0;
    white-space: pre-wrap;
  }
`;

const ReserveButton = styled.button`
  width: 100%;
  padding: 1.25rem;
  background: #1e3932;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(30, 57, 50, 0.3);
  
  &:hover {
    background: #2a4a42;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

export const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          toast.error('Evento no encontrado');
          navigate('/workshops');
          return;
        }
        
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        toast.error('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  if (loading) {
    return (
      <LoadingWrapper>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </LoadingWrapper>
    );
  }

  if (!event) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <PageWrapper>
      <HeroSection $gradient={event.image_gradient}>
        <BackButton onClick={() => navigate('/workshops')}>
          <ArrowLeft size={20} />
        </BackButton>
        <HeroContent>
          {event.tags?.length > 0 && (
            <TagsRow>
              {event.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagsRow>
          )}
          <EventTitle>{event.title}</EventTitle>
        </HeroContent>
      </HeroSection>

      <ContentSection>
        <InfoGrid>
          <InfoCard>
            <div className="icon"><Calendar size={20} /></div>
            <div className="label">Fecha</div>
            <div className="value">{formatDate(event.date)}</div>
          </InfoCard>
          <InfoCard>
            <div className="icon"><Clock size={20} /></div>
            <div className="label">Hora</div>
            <div className="value">{event.time}</div>
          </InfoCard>
          <InfoCard>
            <div className="icon"><MapPin size={20} /></div>
            <div className="label">Lugar</div>
            <div className="value">{event.location}</div>
          </InfoCard>
          <InfoCard>
            <div className="icon"><Users size={20} /></div>
            <div className="label">Disponibles</div>
            <div className="value">{event.spots_available}/{event.capacity}</div>
          </InfoCard>
        </InfoGrid>

        <DescriptionSection>
          <h2>Acerca del evento</h2>
          <p>{event.long_description || event.description}</p>
        </DescriptionSection>

        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '1.5rem', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Precio por persona
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e3932' }}>
            ${event.price}
          </div>
        </div>

        <ReserveButton 
          onClick={() => setShowReservationModal(true)}
          disabled={event.spots_available <= 0}
        >
          <Ticket size={22} />
          {event.spots_available > 0 ? 'Reservar Ahora' : 'Sin lugares disponibles'}
        </ReserveButton>
      </ContentSection>

      {showReservationModal && (
        <ReservationModal 
          event={event}
          onClose={() => setShowReservationModal(false)}
          onSuccess={() => {
            setShowReservationModal(false);
            // Refresh event data
            window.location.reload();
          }}
        />
      )}
    </PageWrapper>
  );
};
