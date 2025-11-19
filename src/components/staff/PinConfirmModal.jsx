import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styled from 'styled-components';

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

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radius};
  margin-top: ${props => props.theme.spacing.sm};
  text-align: center;
`;

export const PinConfirmModal = ({ isOpen, onClose, onConfirm, loading, error }) => {
  const [pin, setPin] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length >= 4) {
      onConfirm(pin);
    }
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Autorizar Venta"
      maxWidth="400px"
    >
      <form onSubmit={handleSubmit}>
        <p style={{ marginBottom: '16px', textAlign: 'center' }}>
          Ingresa tu PIN de seguridad para confirmar esta venta
        </p>
        
        <PinInput
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
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
            disabled={pin.length < 4 || loading}
          >
            {loading ? 'Procesando...' : 'Confirmar Venta'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};