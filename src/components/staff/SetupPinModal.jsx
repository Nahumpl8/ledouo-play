import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styled from 'styled-components';
import { supabase } from '@/integrations/supabase/client';

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.md};
`;

const PinInput = styled(Input)`
  input {
    font-size: 24px;
    letter-spacing: 8px;
    text-align: center;
    font-family: monospace;
  }
`;

const Message = styled.div`
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radius};
  margin-top: ${props => props.theme.spacing.sm};
  text-align: center;
  
  ${props => props.type === 'error' && `
    background: #fee2e2;
    color: #991b1b;
  `}
  
  ${props => props.type === 'success' && `
    background: #d1fae5;
    color: #065f46;
  `}
`;

const InfoText = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.5;
`;

export const SetupPinModal = ({ isOpen, onClose, onSuccess, hasExistingPin }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones
    if (pin.length < 4 || pin.length > 6) {
      setMessage({ type: 'error', text: 'El PIN debe tener entre 4 y 6 dígitos' });
      return;
    }

    if (pin !== confirmPin) {
      setMessage({ type: 'error', text: 'Los PINs no coinciden' });
      return;
    }

    setLoading(true);

    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No se encontró el usuario');
      }

      // Hashear el PIN usando SHA-256
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPin = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Guardar PIN hasheado en la base de datos
      const { error } = await supabase
        .from('profiles')
        .update({ staff_pin: hashedPin })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: hasExistingPin ? 'PIN actualizado exitosamente' : 'PIN configurado exitosamente' });
      
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error setting PIN:', error);
      setMessage({ type: 'error', text: 'Error al guardar el PIN' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setConfirmPin('');
    setMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={hasExistingPin ? "Cambiar PIN de Seguridad" : "Configurar PIN de Seguridad"}
      maxWidth="450px"
    >
      <form onSubmit={handleSubmit}>
        <InfoText>
          {hasExistingPin 
            ? 'Ingresa un nuevo PIN de 4-6 dígitos para autorizar ventas.'
            : 'Configura un PIN de 4-6 dígitos que utilizarás para autorizar ventas. Mantenlo seguro y no lo compartas.'
          }
        </InfoText>
        
        <PinInput
          type="password"
          inputMode="numeric"
          maxLength={6}
          label="Nuevo PIN (4-6 dígitos)"
          placeholder="••••"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />

        <PinInput
          type="password"
          inputMode="numeric"
          maxLength={6}
          label="Confirmar PIN"
          placeholder="••••"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
        />

        {message && (
          <Message type={message.type}>
            {message.text}
          </Message>
        )}

        <ButtonGroup>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={pin.length < 4 || confirmPin.length < 4 || loading}
          >
            {loading ? 'Guardando...' : hasExistingPin ? 'Actualizar PIN' : 'Guardar PIN'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};