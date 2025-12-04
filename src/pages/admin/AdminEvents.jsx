import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Edit2, Eye, Trash2, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { EventFormModal } from '@/components/admin/EventFormModal';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  color: #1f1f1f;
  margin: 0;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.5rem;
  background: #1e3932;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2a4a42;
  }
`;

const EventsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const EventCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: grid;
  grid-template-columns: 1fr;
  
  @media (min-width: 600px) {
    grid-template-columns: 120px 1fr auto;
  }
`;

const EventGradient = styled.div`
  height: 80px;
  background: ${props => props.$gradient};
  
  @media (min-width: 600px) {
    height: auto;
  }
`;

const EventInfo = styled.div`
  padding: 1.25rem;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #1f1f1f;
  }
  
  .meta {
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
  
  .status {
    margin-top: 0.75rem;
    
    span {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      
      &.active {
        background: #d4edda;
        color: #155724;
      }
      
      &.inactive {
        background: #f8d7da;
        color: #721c24;
      }
    }
  }
`;

const EventActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1.25rem;
  align-items: center;
  border-top: 1px solid #eee;
  
  @media (min-width: 600px) {
    border-top: none;
    border-left: 1px solid #eee;
    flex-direction: column;
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: ${props => props.$variant === 'danger' ? '#fee' : '#f5f5f5'};
  color: ${props => props.$variant === 'danger' ? '#c00' : '#666'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$variant === 'danger' ? '#fcc' : '#eee'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  
  h3 {
    font-size: 1.3rem;
    color: #333;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #666;
    margin: 0 0 1.5rem 0;
  }
`;

export const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success('Evento eliminado');
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Error al eliminar evento');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowFormModal(true);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>Gestión de Eventos</Title>
          <CreateButton onClick={() => { setEditingEvent(null); setShowFormModal(true); }}>
            <Plus size={20} />
            Crear Evento
          </CreateButton>
        </Header>

        {events.length === 0 ? (
          <EmptyState>
            <h3>No hay eventos</h3>
            <p>Crea tu primer evento para comenzar.</p>
            <CreateButton onClick={() => setShowFormModal(true)}>
              <Plus size={20} />
              Crear Evento
            </CreateButton>
          </EmptyState>
        ) : (
          <EventsGrid>
            {events.map(event => (
              <EventCard key={event.id}>
                <EventGradient $gradient={event.image_gradient} />
                <EventInfo>
                  <h3>{event.title}</h3>
                  <div className="meta">
                    <span><Calendar size={14} /> {formatDate(event.date)} • {event.time}</span>
                    <span><Users size={14} /> {event.spots_available}/{event.capacity}</span>
                    <span>${event.price}</span>
                  </div>
                  <div className="status">
                    <span className={event.is_active ? 'active' : 'inactive'}>
                      {event.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </EventInfo>
                <EventActions>
                  <ActionButton 
                    title="Ver reservaciones"
                    onClick={() => navigate(`/admin/events/${event.id}/reservations`)}
                  >
                    <Eye size={18} />
                  </ActionButton>
                  <ActionButton title="Editar" onClick={() => handleEdit(event)}>
                    <Edit2 size={18} />
                  </ActionButton>
                  <ActionButton 
                    $variant="danger" 
                    title="Eliminar"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 size={18} />
                  </ActionButton>
                </EventActions>
              </EventCard>
            ))}
          </EventsGrid>
        )}

        {showFormModal && (
          <EventFormModal
            event={editingEvent}
            onClose={() => { setShowFormModal(false); setEditingEvent(null); }}
            onSuccess={() => {
              setShowFormModal(false);
              setEditingEvent(null);
              fetchEvents();
            }}
          />
        )}
      </Container>
    </PageWrapper>
  );
};
