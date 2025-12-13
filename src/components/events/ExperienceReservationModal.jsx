import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, User, Mail, Phone, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #1e3932 0%, #2d5a4e 100%);
  padding: 1.5rem;
  position: relative;
  
  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: white;
    padding-right: 2rem;
  }
  
  p {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
    color: rgba(255,255,255,0.8);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.3);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  
  &:hover {
    background: rgba(255,255,255,0.5);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const StepDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$active ? '#1e3932' : '#ddd'};
  transition: background 0.3s;
`;

const CalendarContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  
  button {
    background: #f0f0f0;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      background: #e0e0e0;
    }
    
    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #999;
  padding: 0.5rem 0;
`;

const DayButton = styled.button`
  aspect-ratio: 1;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.$available ? 'pointer' : 'default'};
  background: ${props => {
    if (props.$selected) return '#1e3932';
    if (props.$available) return '#f0f7f5';
    return 'transparent';
  }};
  color: ${props => {
    if (props.$selected) return 'white';
    if (props.$available) return '#1e3932';
    if (props.$disabled) return '#ccc';
    return '#333';
  }};
  
  &:hover {
    ${props => props.$available && !props.$selected && 'background: #e0f0ec;'}
  }
`;

const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const TimeSlot = styled.button`
  padding: 0.75rem;
  border: 2px solid ${props => props.$selected ? '#1e3932' : '#eee'};
  background: ${props => props.$selected ? '#f0f7f5' : 'white'};
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    border-color: #1e3932;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: #eee;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  
  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
  
  input {
    width: 100%;
    padding: 0.9rem 1rem 0.9rem 3rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-size: 1rem;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: #1e3932;
    }
  }
`;

const SelectedInfo = styled.div`
  background: #f0f7f5;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .icon {
    width: 48px;
    height: 48px;
    background: #1e3932;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .info {
    .date {
      font-weight: 700;
      color: #1e3932;
    }
    
    .time {
      font-size: 0.85rem;
      color: #666;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: #1e3932;
    color: white;
    
    &:hover {
      background: #2a4a42;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: #f0f0f0;
    color: #333;
    
    &:hover {
      background: #e0e0e0;
    }
  }
`;

const NoSlotsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  
  .icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
  
  p {
    margin: 0;
    line-height: 1.6;
  }
`;

export const ExperienceReservationModal = ({ event, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchAvailableSlots();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profile) {
          setFormData({
            name: profile.name || '',
            email: profile.email || session.user.email || '',
            phone: profile.phone || ''
          });
        }
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('experience_time_slots')
        .select('*')
        .eq('event_id', event.id)
        .eq('is_blocked', false)
        .gte('date', today)
        .gt('spots_available', 0)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getAvailableDates = () => {
    return [...new Set(availableSlots.map(slot => slot.date))];
  };

  const getSlotsForDate = (date) => {
    return availableSlots.filter(slot => slot.date === date);
  };

  const formatDateFull = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-MX', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long'
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${minutes} ${period}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const isDateAvailable = (day) => {
    if (!day) return false;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return getAvailableDates().includes(dateStr);
  };

  const isDatePast = (day) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSelectDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!selectedSlot) {
      toast.error('Por favor selecciona un horario');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('experience_reservations')
        .insert({
          event_id: event.id,
          time_slot_id: selectedSlot.id,
          user_id: user?.id || null,
          guest_name: formData.name,
          guest_email: formData.email,
          guest_phone: formData.phone,
          spots_reserved: 1
        });

      if (error) throw error;

      // Update spots available
      await supabase
        .from('experience_time_slots')
        .update({ spots_available: selectedSlot.spots_available - 1 })
        .eq('id', selectedSlot.id);

      toast.success('¡Reservación confirmada!', {
        description: `Tu experiencia está programada para el ${formatDateFull(selectedDate)} a las ${formatTime(selectedSlot.start_time)}`
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error creating reservation:', err);
      toast.error('Error al crear la reservación');
    } finally {
      setLoading(false);
    }
  };

  const canPrevMonth = () => {
    const today = new Date();
    return currentMonth.getMonth() > today.getMonth() || currentMonth.getFullYear() > today.getFullYear();
  };

  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (loadingSlots) {
    return (
      <Overlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p style={{ marginTop: '1rem', color: '#666' }}>Cargando horarios disponibles...</p>
          </div>
        </ModalContent>
      </Overlay>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <Overlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <CloseButton onClick={onClose}><X size={20} /></CloseButton>
            <h2>{event.title}</h2>
            <p>Experiencia con horario abierto</p>
          </ModalHeader>
          <ModalBody>
            <NoSlotsMessage>
              <div className="icon">📅</div>
              <p>
                <strong>No hay horarios disponibles</strong><br />
                Por el momento no hay fechas ni horarios disponibles para esta experiencia. 
                Por favor, intenta más tarde o contáctanos para más información.
              </p>
            </NoSlotsMessage>
            <Button className="secondary" onClick={onClose} style={{ width: '100%', marginTop: '1rem' }}>
              Cerrar
            </Button>
          </ModalBody>
        </ModalContent>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
          <h2>{event.title}</h2>
          <p>Elige tu fecha y horario preferido</p>
        </ModalHeader>

        <ModalBody>
          <StepIndicator>
            <StepDot $active={step >= 1} />
            <StepDot $active={step >= 2} />
            <StepDot $active={step >= 3} />
          </StepIndicator>

          {step === 1 && (
            <>
              <CalendarContainer>
                <CalendarHeader>
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    disabled={!canPrevMonth()}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3>
                    {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                    <ChevronRight size={20} />
                  </button>
                </CalendarHeader>

                <CalendarGrid>
                  {dayLabels.map(day => (
                    <DayLabel key={day}>{day}</DayLabel>
                  ))}
                  {getDaysInMonth(currentMonth).map((day, index) => {
                    const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const available = isDateAvailable(day);
                    const past = isDatePast(day);
                    
                    return (
                      <DayButton
                        key={index}
                        $available={available && !past}
                        $selected={dateStr === selectedDate}
                        $disabled={past}
                        onClick={() => available && !past && handleSelectDate(day)}
                        disabled={!day || !available || past}
                      >
                        {day}
                      </DayButton>
                    );
                  })}
                </CalendarGrid>
              </CalendarContainer>

              <Button 
                className="primary" 
                disabled={!selectedDate}
                onClick={() => setStep(2)}
                style={{ width: '100%' }}
              >
                Continuar
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <SelectedInfo>
                <div className="icon"><Calendar size={24} /></div>
                <div className="info">
                  <div className="date">{formatDateFull(selectedDate)}</div>
                  <div className="time">Selecciona tu horario</div>
                </div>
              </SelectedInfo>

              <TimeSlotGrid>
                {getSlotsForDate(selectedDate).map(slot => (
                  <TimeSlot
                    key={slot.id}
                    $selected={selectedSlot?.id === slot.id}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <Clock size={16} />
                    {formatTime(slot.start_time)}
                  </TimeSlot>
                ))}
              </TimeSlotGrid>

              <ButtonRow>
                <Button className="secondary" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button 
                  className="primary" 
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                >
                  Continuar
                </Button>
              </ButtonRow>
            </>
          )}

          {step === 3 && (
            <>
              <SelectedInfo>
                <div className="icon"><Calendar size={24} /></div>
                <div className="info">
                  <div className="date">{formatDateFull(selectedDate)}</div>
                  <div className="time">{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</div>
                </div>
              </SelectedInfo>

              <FormGroup>
                <label>Nombre completo</label>
                <InputWrapper>
                  <User size={18} />
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </InputWrapper>
              </FormGroup>

              <FormGroup>
                <label>Correo electrónico</label>
                <InputWrapper>
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </InputWrapper>
              </FormGroup>

              <FormGroup>
                <label>Teléfono</label>
                <InputWrapper>
                  <Phone size={18} />
                  <input
                    type="tel"
                    placeholder="55 1234 5678"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </InputWrapper>
              </FormGroup>

              <ButtonRow>
                <Button className="secondary" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <Button 
                  className="primary" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Reservando...' : 'Confirmar'}
                </Button>
              </ButtonRow>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Overlay>
  );
};
