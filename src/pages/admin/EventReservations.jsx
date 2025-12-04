import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Check, X, Phone, Mail, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  
  &:hover {
    color: #333;
  }
`;

const Header = styled.div`
  background: ${props => props.$gradient};
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  
  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 800;
  }
  
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  
  .value {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1e3932;
  }
  
  .label {
    font-size: 0.75rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ReservationsList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ReservationCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: grid;
  gap: 1rem;
  
  @media (min-width: 600px) {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
`;

const GuestInfo = styled.div`
  h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f1f1f;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .badge {
    font-size: 0.65rem;
    padding: 3px 8px;
    border-radius: 12px;
    background: #e0f0ff;
    color: #0066cc;
    font-weight: 600;
  }
  
  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.85rem;
    color: #666;
    
    span {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  }
  
  .payment {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    
    .method {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 8px;
      background: #f5f5f5;
      margin-right: 0.5rem;
    }
    
    .status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 600;
      
      &.pending {
        background: #fff3cd;
        color: #856404;
      }
      
      &.confirmed {
        background: #d4edda;
        color: #155724;
      }
      
      &.cancelled {
        background: #f8d7da;
        color: #721c24;
      }
    }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  
  &.confirm {
    background: #d4edda;
    color: #155724;
    
    &:hover {
      background: #c3e6cb;
    }
  }
  
  &.cancel {
    background: #f8d7da;
    color: #721c24;
    
    &:hover {
      background: #f5c6cb;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  
  h3 {
    color: #333;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #666;
    margin: 0;
  }
`;

export const EventReservations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch reservations
      const { data: reservationsData, error: resError } = await supabase
        .from('event_reservations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (resError) throw resError;
      setReservations(reservationsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const updateStatus = async (reservationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('event_reservations')
        .update({ payment_status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;
      
      toast.success(`Reservación ${newStatus === 'confirmed' ? 'confirmada' : 'cancelada'}`);
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Error al actualizar');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </Container>
      </PageWrapper>
    );
  }

  if (!event) {
    return (
      <PageWrapper>
        <Container>
          <BackButton onClick={() => navigate('/admin/events')}>
            <ArrowLeft size={18} /> Volver
          </BackButton>
          <EmptyState>
            <h3>Evento no encontrado</h3>
          </EmptyState>
        </Container>
      </PageWrapper>
    );
  }

  const confirmedCount = reservations.filter(r => r.payment_status === 'confirmed').length;
  const pendingCount = reservations.filter(r => r.payment_status === 'pending').length;

  return (
    <PageWrapper>
      <Container>
        <BackButton onClick={() => navigate('/admin/events')}>
          <ArrowLeft size={18} /> Volver a eventos
        </BackButton>

        <Header $gradient={event.image_gradient}>
          <h1>{event.title}</h1>
          <div className="meta">
            <span><Calendar size={16} /> {new Date(event.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} • {event.time}</span>
          </div>
        </Header>

        <Stats>
          <StatCard>
            <div className="value">{reservations.length}</div>
            <div className="label">Total</div>
          </StatCard>
          <StatCard>
            <div className="value">{confirmedCount}</div>
            <div className="label">Confirmados</div>
          </StatCard>
          <StatCard>
            <div className="value">{pendingCount}</div>
            <div className="label">Pendientes</div>
          </StatCard>
        </Stats>

        {reservations.length === 0 ? (
          <EmptyState>
            <h3>Sin reservaciones</h3>
            <p>Aún no hay reservaciones para este evento.</p>
          </EmptyState>
        ) : (
          <ReservationsList>
            {reservations.map(res => (
              <ReservationCard key={res.id}>
                <GuestInfo>
                  <h3>
                    <User size={18} />
                    {res.guest_name}
                    {res.user_id && <span className="badge">Cliente registrado</span>}
                  </h3>
                  <div className="contact">
                    <span><Mail size={14} /> {res.guest_email}</span>
                    <span><Phone size={14} /> {res.guest_phone}</span>
                  </div>
                  <div className="payment">
                    <span className="method">
                      {res.payment_method === 'transfer' ? '💳 Transferencia' : '💵 Efectivo'}
                    </span>
                    <span className={`status ${res.payment_status}`}>
                      {res.payment_status === 'pending' && '⏳ Pendiente'}
                      {res.payment_status === 'confirmed' && '✅ Confirmado'}
                      {res.payment_status === 'cancelled' && '❌ Cancelado'}
                    </span>
                    <span style={{ marginLeft: '0.5rem', color: '#1e3932', fontWeight: '700' }}>
                      ${res.total_amount}
                    </span>
                  </div>
                </GuestInfo>
                
                {res.payment_status === 'pending' && (
                  <Actions>
                    <ActionButton 
                      className="confirm"
                      onClick={() => updateStatus(res.id, 'confirmed')}
                    >
                      <Check size={16} /> Confirmar
                    </ActionButton>
                    <ActionButton 
                      className="cancel"
                      onClick={() => updateStatus(res.id, 'cancelled')}
                    >
                      <X size={16} /> Cancelar
                    </ActionButton>
                  </Actions>
                )}
              </ReservationCard>
            ))}
          </ReservationsList>
        )}
      </Container>
    </PageWrapper>
  );
};
