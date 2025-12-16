import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowLeft, Calendar, Clock, Plus, Trash2, Lock, Unlock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addDays, startOfWeek, addWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Horarios de la cafetería por día de la semana (0=domingo, 1=lunes, etc.)
const CAFE_SCHEDULE = {
  0: { start: '08:30', end: '15:00' },  // Domingo
  1: null,                               // Lunes: CERRADO
  2: { start: '08:30', end: '19:00' },  // Martes
  3: { start: '08:30', end: '19:00' },  // Miércoles
  4: { start: '08:30', end: '19:00' },  // Jueves
  5: { start: '08:30', end: '19:00' },  // Viernes
  6: { start: '08:30', end: '19:00' },  // Sábado
};

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 1rem;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  &:hover { background: #f5f5f5; }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f1f1f;
  margin: 0;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #eee;
    border-radius: 10px;
    font-size: 0.95rem;
    
    &:focus {
      outline: none;
      border-color: #1e3932;
    }
  }
`;

const DaysSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const DayButton = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 2px solid ${props => props.$selected ? '#1e3932' : '#eee'};
  background: ${props => props.$selected ? 'rgba(30, 57, 50, 0.1)' : 'white'};
  color: ${props => props.$disabled ? '#ccc' : props.$selected ? '#1e3932' : '#666'};
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-size: 0.85rem;
  
  &:hover:not(:disabled) {
    border-color: ${props => !props.$disabled && '#1e3932'};
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #1e3932;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover { background: #2a4a42; }
  &:disabled { background: #ccc; cursor: not-allowed; }
`;

const SlotsTable = styled.div`
  overflow-x: auto;
`;

const DateGroup = styled.div`
  margin-bottom: 1.5rem;
  
  h4 {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SlotsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SlotChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => {
    if (props.$blocked) return '#fee2e2';
    if (props.$hasReservations) return '#fef3c7';
    return '#d1fae5';
  }};
  color: ${props => {
    if (props.$blocked) return '#991b1b';
    if (props.$hasReservations) return '#92400e';
    return '#065f46';
  }};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const BlockModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  
  h3 { margin: 0 0 1rem 0; }
  
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #eee;
    border-radius: 10px;
    margin-bottom: 1rem;
    min-height: 80px;
    resize: none;
    
    &:focus {
      outline: none;
      border-color: #1e3932;
    }
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  
  button {
    flex: 1;
    padding: 0.75rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    
    &.cancel {
      background: #f5f5f5;
      border: none;
      color: #666;
    }
    
    &.confirm {
      background: #dc2626;
      border: none;
      color: white;
    }
    
    &.unblock {
      background: #059669;
      border: none;
      color: white;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  
  svg { margin-bottom: 1rem; opacity: 0.5; }
  h3 { margin: 0 0 0.5rem 0; color: #333; }
  p { margin: 0; }
`;

const Legend = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.8rem;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const LegendDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: ${props => props.$color};
`;

// Helper para generar slots entre dos horas
const generateTimeSlots = (startTime, endTime, intervalMinutes = 60) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const time = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    slots.push(time);
    
    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
};

export const AdminEventSlots = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Generator form
  const [selectedDays, setSelectedDays] = useState([0, 2, 3, 4, 5, 6]); // Dom, Mar-Sab
  const [weeksAhead, setWeeksAhead] = useState(4);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [capacity, setCapacity] = useState(4);
  
  // Block modal
  const [blockModal, setBlockModal] = useState(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (eventError) throw eventError;
      setEvent(eventData);
      
      // Fetch slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('experience_time_slots')
        .select('*')
        .eq('event_id', eventId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (slotsError) throw slotsError;
      setSlots(slotsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    if (CAFE_SCHEDULE[day] === null) return; // No permitir lunes
    
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleGenerate = async () => {
    if (selectedDays.length === 0) {
      toast.error('Selecciona al menos un día');
      return;
    }
    
    setGenerating(true);
    
    try {
      const today = new Date();
      const slotsToInsert = [];
      
      // Generar para las próximas X semanas
      for (let week = 0; week < weeksAhead; week++) {
        const weekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), week);
        
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const currentDate = addDays(weekStart, dayOffset);
          const dayOfWeek = currentDate.getDay();
          
          // Verificar si es un día seleccionado y tiene horario
          if (!selectedDays.includes(dayOfWeek)) continue;
          
          const schedule = CAFE_SCHEDULE[dayOfWeek];
          if (!schedule) continue;
          
          // Solo fechas futuras
          if (currentDate < today) continue;
          
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          const timeSlots = generateTimeSlots(schedule.start, schedule.end, intervalMinutes);
          
          for (const time of timeSlots) {
            // Calcular hora de fin
            const [hour, min] = time.split(':').map(Number);
            const endHour = hour + Math.floor((min + intervalMinutes) / 60);
            const endMin = (min + intervalMinutes) % 60;
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
            
            // Verificar que no pase del cierre
            if (endTime > schedule.end) continue;
            
            slotsToInsert.push({
              event_id: eventId,
              date: dateStr,
              start_time: time,
              end_time: endTime,
              capacity: capacity,
              spots_available: capacity,
              is_blocked: false
            });
          }
        }
      }
      
      if (slotsToInsert.length === 0) {
        toast.error('No hay horarios para generar');
        setGenerating(false);
        return;
      }
      
      // Insertar en batch, ignorando duplicados
      const { error } = await supabase
        .from('experience_time_slots')
        .upsert(slotsToInsert, { 
          onConflict: 'event_id,date,start_time',
          ignoreDuplicates: true 
        });
      
      if (error) throw error;
      
      toast.success(`${slotsToInsert.length} horarios generados`);
      fetchData();
    } catch (error) {
      console.error('Error generating slots:', error);
      toast.error('Error al generar horarios');
    } finally {
      setGenerating(false);
    }
  };

  const handleSlotClick = (slot) => {
    setBlockModal(slot);
    setBlockReason(slot.blocked_reason || '');
  };

  const handleBlock = async () => {
    if (!blockModal) return;
    
    try {
      const { error } = await supabase
        .from('experience_time_slots')
        .update({ 
          is_blocked: true, 
          blocked_reason: blockReason 
        })
        .eq('id', blockModal.id);
      
      if (error) throw error;
      
      toast.success('Horario bloqueado');
      setBlockModal(null);
      fetchData();
    } catch (error) {
      console.error('Error blocking slot:', error);
      toast.error('Error al bloquear');
    }
  };

  const handleUnblock = async () => {
    if (!blockModal) return;
    
    try {
      const { error } = await supabase
        .from('experience_time_slots')
        .update({ 
          is_blocked: false, 
          blocked_reason: null 
        })
        .eq('id', blockModal.id);
      
      if (error) throw error;
      
      toast.success('Horario desbloqueado');
      setBlockModal(null);
      fetchData();
    } catch (error) {
      console.error('Error unblocking slot:', error);
      toast.error('Error al desbloquear');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('¿Eliminar este horario?')) return;
    
    try {
      const { error } = await supabase
        .from('experience_time_slots')
        .delete()
        .eq('id', slotId);
      
      if (error) throw error;
      
      toast.success('Horario eliminado');
      fetchData();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Error al eliminar');
    }
  };

  // Agrupar slots por fecha
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

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
          <BackButton onClick={() => navigate('/admin/events')}>
            <ArrowLeft size={20} />
          </BackButton>
          <Title>Horarios: {event?.title}</Title>
        </Header>

        {/* Generator Card */}
        <Card>
          <CardTitle>
            <Clock size={20} />
            Generar Horarios Automáticamente
          </CardTitle>
          
          <FormGroup style={{ marginBottom: '1rem' }}>
            <label>Días disponibles (Lunes cerrado)</label>
            <DaysSelector>
              {DAY_NAMES.map((name, index) => (
                <DayButton
                  key={index}
                  $selected={selectedDays.includes(index)}
                  $disabled={CAFE_SCHEDULE[index] === null}
                  onClick={() => toggleDay(index)}
                  disabled={CAFE_SCHEDULE[index] === null}
                >
                  {name}
                  {CAFE_SCHEDULE[index] === null && ' ✕'}
                </DayButton>
              ))}
            </DaysSelector>
          </FormGroup>

          <FormGrid>
            <FormGroup>
              <label>Intervalo entre horarios</label>
              <select 
                value={intervalMinutes} 
                onChange={e => setIntervalMinutes(Number(e.target.value))}
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1.5 horas</option>
                <option value={120}>2 horas</option>
              </select>
            </FormGroup>
            
            <FormGroup>
              <label>Capacidad por horario</label>
              <input 
                type="number" 
                min="1" 
                max="20"
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
              />
            </FormGroup>
            
            <FormGroup>
              <label>Generar para</label>
              <select 
                value={weeksAhead} 
                onChange={e => setWeeksAhead(Number(e.target.value))}
              >
                <option value={1}>1 semana</option>
                <option value={2}>2 semanas</option>
                <option value={4}>4 semanas</option>
                <option value={8}>8 semanas</option>
              </select>
            </FormGroup>
          </FormGrid>

          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
            <strong>Horarios de la cafetería:</strong>
            <br />
            • Martes a Sábado: 8:30 AM - 7:00 PM
            <br />
            • Domingo: 8:30 AM - 3:00 PM
            <br />
            • Lunes: Cerrado
          </div>

          <GenerateButton onClick={handleGenerate} disabled={generating}>
            <Plus size={20} />
            {generating ? 'Generando...' : 'Generar Horarios'}
          </GenerateButton>
        </Card>

        {/* Slots List */}
        <Card>
          <CardTitle>
            <Calendar size={20} />
            Horarios Existentes ({slots.length})
          </CardTitle>

          {slots.length === 0 ? (
            <EmptyState>
              <Calendar size={48} />
              <h3>No hay horarios</h3>
              <p>Genera horarios automáticamente con el formulario de arriba.</p>
            </EmptyState>
          ) : (
            <SlotsTable>
              {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                <DateGroup key={date}>
                  <h4>
                    <Calendar size={16} />
                    {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
                  </h4>
                  <SlotsGrid>
                    {dateSlots.map(slot => (
                      <SlotChip
                        key={slot.id}
                        $blocked={slot.is_blocked}
                        $hasReservations={slot.spots_available < slot.capacity}
                        onClick={() => handleSlotClick(slot)}
                        title={slot.is_blocked ? `Bloqueado: ${slot.blocked_reason || 'Sin razón'}` : 'Click para gestionar'}
                      >
                        {slot.is_blocked ? <Lock size={14} /> : <Clock size={14} />}
                        {slot.start_time.slice(0, 5)}
                        {!slot.is_blocked && (
                          <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                            ({slot.spots_available}/{slot.capacity})
                          </span>
                        )}
                      </SlotChip>
                    ))}
                  </SlotsGrid>
                </DateGroup>
              ))}
              
              <Legend>
                <span><LegendDot $color="#d1fae5" /> Disponible</span>
                <span><LegendDot $color="#fef3c7" /> Con reservas</span>
                <span><LegendDot $color="#fee2e2" /> Bloqueado</span>
              </Legend>
            </SlotsTable>
          )}
        </Card>

        {/* Block Modal */}
        {blockModal && (
          <BlockModal onClick={() => setBlockModal(null)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <h3>
                {blockModal.is_blocked ? '🔓 Desbloquear horario' : '🔒 Bloquear horario'}
              </h3>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                {format(parseISO(blockModal.date), "EEEE d 'de' MMMM", { locale: es })} - {blockModal.start_time.slice(0, 5)}
              </p>
              
              {!blockModal.is_blocked && (
                <textarea
                  placeholder="Razón del bloqueo (ej: Día festivo, Sin personal...)"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                />
              )}
              
              {blockModal.is_blocked && blockModal.blocked_reason && (
                <p style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <strong>Razón:</strong> {blockModal.blocked_reason}
                </p>
              )}
              
              <ModalButtons>
                <button className="cancel" onClick={() => setBlockModal(null)}>
                  Cancelar
                </button>
                {blockModal.is_blocked ? (
                  <button className="unblock" onClick={handleUnblock}>
                    <Unlock size={16} style={{ marginRight: '0.5rem' }} />
                    Desbloquear
                  </button>
                ) : (
                  <button className="confirm" onClick={handleBlock}>
                    <Lock size={16} style={{ marginRight: '0.5rem' }} />
                    Bloquear
                  </button>
                )}
              </ModalButtons>
              
              <button 
                onClick={() => handleDeleteSlot(blockModal.id)}
                style={{ 
                  width: '100%', 
                  marginTop: '0.75rem', 
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} style={{ marginRight: '0.5rem' }} />
                Eliminar horario
              </button>
            </ModalContent>
          </BlockModal>
        )}
      </Container>
    </PageWrapper>
  );
};
