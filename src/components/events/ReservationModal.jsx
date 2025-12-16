import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, CreditCard, Banknote, User, Mail, Phone } from 'lucide-react';
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
  max-width: 450px;
  border-radius: 24px;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  background: ${props => props.$gradient};
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
    
    &::placeholder {
      color: #bbb;
    }
  }
`;

const PaymentSection = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.75rem 0;
  }
`;

const PaymentOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const PaymentOption = styled.button`
  padding: 1rem;
  border: 2px solid ${props => props.$selected ? '#1e3932' : '#eee'};
  background: ${props => props.$selected ? '#f0f7f5' : 'white'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1e3932;
  }
  
  .icon {
    margin-bottom: 0.5rem;
    color: ${props => props.$selected ? '#1e3932' : '#666'};
  }
  
  .label {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.$selected ? '#1e3932' : '#333'};
  }
  
  .desc {
    font-size: 0.7rem;
    color: #999;
    margin-top: 0.25rem;
  }
`;

const Summary = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  
  .row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    
    &:not(:last-child) {
      border-bottom: 1px solid #eee;
    }
    
    &.total {
      font-weight: 700;
      font-size: 1.1rem;
      color: #1e3932;
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.1rem;
  background: #1e3932;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2a4a42;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const InfoNote = styled.p`
  font-size: 0.8rem;
  color: #999;
  text-align: center;
  margin-top: 1rem;
  line-height: 1.5;
`;

export const ReservationModal = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'transfer'
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email, phone')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profile) {
            setFormData(prev => ({
              ...prev,
              name: profile.name || '',
              email: profile.email || session.user.email || '',
              phone: profile.phone || ''
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('event_reservations')
        .insert({
          event_id: event.id,
          user_id: user?.id || null,
          guest_name: formData.name,
          guest_email: formData.email,
          guest_phone: formData.phone,
          payment_method: formData.paymentMethod,
          total_amount: event.price,
          spots_reserved: 1
        });

      if (error) throw error;

      // Update spots available
      await supabase
        .from('events')
        .update({ spots_available: event.spots_available - 1 })
        .eq('id', event.id);

      // Formatear fecha para el email
      const eventDate = new Date(event.date + 'T12:00:00');
      const formattedDate = eventDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Enviar email de confirmación
      try {
        await supabase.functions.invoke('send-reservation-email', {
          body: {
            type: 'event',
            guestName: formData.name,
            guestEmail: formData.email,
            guestPhone: formData.phone,
            eventTitle: event.title,
            eventDate: formattedDate,
            eventTime: event.time,
            eventLocation: event.location || 'Le Duo Centro',
            paymentMethod: formData.paymentMethod,
            totalAmount: event.price
          }
        });
        console.log('Email de confirmación enviado');
      } catch (emailErr) {
        console.error('Error enviando email:', emailErr);
        // No fallar la reservación si el email falla
      }

      toast.success('¡Reservación confirmada!', {
        description: formData.paymentMethod === 'transfer' 
          ? 'Te enviamos los datos de transferencia a tu correo'
          : 'Realiza tu pago en la cafetería antes del evento'
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error creating reservation:', err);
      toast.error('Error al crear la reservación');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <Overlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </ModalContent>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader $gradient={event.image_gradient}>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
          <h2>Reservar: {event.title}</h2>
          <p>{event.spots_available} lugares disponibles</p>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label>Nombre completo</label>
              <InputWrapper>
                <User size={18} />
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
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
                  required
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
                  required
                />
              </InputWrapper>
            </FormGroup>

            <PaymentSection>
              <h3>Método de pago</h3>
              <PaymentOptions>
                <PaymentOption 
                  type="button"
                  $selected={formData.paymentMethod === 'transfer'}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer' }))}
                >
                  <div className="icon"><CreditCard size={24} /></div>
                  <div className="label">Transferencia</div>
                  <div className="desc">Te enviaremos los datos</div>
                </PaymentOption>
                <PaymentOption
                  type="button"
                  $selected={formData.paymentMethod === 'cash'}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                >
                  <div className="icon"><Banknote size={24} /></div>
                  <div className="label">Efectivo</div>
                  <div className="desc">Paga en la cafetería</div>
                </PaymentOption>
              </PaymentOptions>
            </PaymentSection>

            <Summary>
              <div className="row">
                <span>Evento</span>
                <span>{event.title}</span>
              </div>
              <div className="row">
                <span>Lugares</span>
                <span>1</span>
              </div>
              <div className="row total">
                <span>Total</span>
                <span>${event.price}</span>
              </div>
            </Summary>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Reservación'}
            </SubmitButton>

            <InfoNote>
              {formData.paymentMethod === 'transfer' 
                ? 'Recibirás los datos de transferencia en tu correo. Tu lugar se reservará por 48 horas.'
                : 'Acude a Le Duo Centro para realizar tu pago antes del evento.'}
            </InfoNote>
          </form>
        </ModalBody>
      </ModalContent>
    </Overlay>
  );
};
