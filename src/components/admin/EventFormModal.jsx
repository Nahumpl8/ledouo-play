import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
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

const Modal = styled.div`
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 24px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  
  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: #eee;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-size: 1rem;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: #1e3932;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const GradientPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
`;

const GradientOption = styled.button`
  aspect-ratio: 1;
  border-radius: 12px;
  border: 3px solid ${props => props.$selected ? '#1e3932' : 'transparent'};
  background: ${props => props.$gradient};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
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
  margin-top: 1rem;
  
  &:hover {
    background: #2a4a42;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const GRADIENT_OPTIONS = [
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
];

export const EventFormModal = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    long_description: event?.long_description || '',
    date: event?.date || '',
    time: event?.time || '',
    location: event?.location || 'Centro',
    price: event?.price || '',
    capacity: event?.capacity || 20,
    image_gradient: event?.image_gradient || GRADIENT_OPTIONS[0],
    tags: event?.tags?.join(', ') || '',
    is_active: event?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.price) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        long_description: formData.long_description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        spots_available: event ? event.spots_available : parseInt(formData.capacity),
        image_gradient: formData.image_gradient,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_active: formData.is_active
      };

      if (event) {
        // Update
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);

        if (error) throw error;
        toast.success('Evento actualizado');
      } else {
        // Create
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) throw error;
        toast.success('Evento creado');
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving event:', err);
      toast.error('Error al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{event ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <label>Título del evento *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Taller de Velas Aromáticas"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Descripción corta *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descripción para la tarjeta..."
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Descripción completa</label>
                <textarea
                  value={formData.long_description}
                  onChange={e => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
                  placeholder="Descripción detallada del evento..."
                  style={{ minHeight: '150px' }}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Hora *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="Ej: 17:00 HRS"
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <label>Precio *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="450"
                    min="0"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Capacidad</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    min="1"
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Ubicación</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Centro"
                />
              </FormGroup>

              <FormGroup>
                <label>Tags (separados por coma)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Creativo, Relax, Práctico"
                />
              </FormGroup>

              <FormGroup>
                <label>Color del evento</label>
                <GradientPicker>
                  {GRADIENT_OPTIONS.map((gradient, idx) => (
                    <GradientOption
                      key={idx}
                      type="button"
                      $gradient={gradient}
                      $selected={formData.image_gradient === gradient}
                      onClick={() => setFormData(prev => ({ ...prev, image_gradient: gradient }))}
                    />
                  ))}
                </GradientPicker>
              </FormGroup>

              <FormGroup>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    style={{ marginRight: '0.5rem', width: 'auto' }}
                  />
                  Evento activo (visible para clientes)
                </label>
              </FormGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Guardando...' : (event ? 'Guardar Cambios' : 'Crear Evento')}
              </SubmitButton>
            </FormGrid>
          </form>
        </ModalBody>
      </Modal>
    </Overlay>
  );
};
