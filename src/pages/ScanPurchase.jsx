import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styled from 'styled-components';
import { supabase } from '@/integrations/supabase/client';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const ScanWrapper = styled.div`
  min-height: 80vh;
  background: ${props => props.theme.colors.bg};
  padding: ${props => props.theme.spacing.xl} 0;
`;

const ScanCard = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fontPrimary};
  color: ${props => props.theme.colors.primary};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ScannerContainer = styled.div`
  margin: ${props => props.theme.spacing.lg} 0;
  border-radius: ${props => props.theme.radius};
  overflow: hidden;
`;

const CustomerInfo = styled.div`
  background: ${props => props.theme.colors.bgAlt};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radius};
  margin: ${props => props.theme.spacing.md} 0;
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p {
    margin: 8px 0;
    color: ${props => props.theme.colors.text};
  }
`;

const ResultMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radius};
  text-align: center;
  margin: ${props => props.theme.spacing.md} 0;
  
  ${props => props.type === 'success' && `
    background: #d1fae5;
    color: #065f46;
  `}
  
  ${props => props.type === 'error' && `
    background: #fee2e2;
    color: #991b1b;
  `}
`;

export const ScanPurchase = () => {
  const [scannedUserId, setScannedUserId] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    checkStaffAccess();
  }, []);

  useEffect(() => {
    if (!scannedUserId && isStaff) {
      initScanner();
    }
    
    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isStaff, scannedUserId]);

  const checkStaffAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setResult({ type: 'error', message: 'Debes iniciar sesión' });
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['staff', 'admin']);

    if (!roles || roles.length === 0) {
      setResult({ type: 'error', message: 'Acceso denegado. Solo staff puede usar esta función.' });
      return;
    }

    setIsStaff(true);
  };

  const initScanner = () => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanError);
    setScanner(html5QrcodeScanner);
  };

  const onScanSuccess = async (decodedText) => {
    console.log('QR escaneado:', decodedText);
    
    // Extraer userId del formato LEDUO-{userId}
    const match = decodedText.match(/LEDUO-(.+)/);
    if (!match) {
      setResult({ type: 'error', message: 'QR inválido. Debe ser un código LeDuo.' });
      return;
    }

    const userId = match[1];
    setScannedUserId(userId);
    
    if (scanner) {
      scanner.clear().catch(() => {});
    }

    // Cargar datos del cliente
    await loadCustomerData(userId);
  };

  const onScanError = (error) => {
    // Ignorar errores de escaneo continuos
    console.warn('Error escaneando QR:', error);
  };

  const loadCustomerData = async (userId) => {
    setLoading(true);
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: state } = await supabase
        .from('customer_state')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile || !state) {
        throw new Error('Cliente no encontrado');
      }

      setCustomerData({
        profile,
        state
      });
    } catch (error) {
      setResult({ type: 'error', message: 'Error cargando datos del cliente' });
      setScannedUserId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const amountNum = parseFloat(amount);
      
      if (!amountNum || amountNum <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      const { data, error } = await supabase.functions.invoke('register-purchase', {
        body: {
          userId: scannedUserId,
          amount: amountNum,
          notes
        }
      });

      if (error) throw error;

      const pointsMsg = `+${data.points.earned} puntos (Total: ${data.points.total})`;
      const stampsMsg = `+${data.stamps.earned} sello (Total: ${data.stamps.total}/8)`;
      const rewardMsg = data.rewardCreated ? ' 🎉 ¡Recompensa desbloqueada!' : '';

      setResult({
        type: 'success',
        message: `Compra registrada exitosamente.\n${pointsMsg}\n${stampsMsg}${rewardMsg}`
      });

      // Limpiar formulario
      setAmount('');
      setNotes('');
      setScannedUserId(null);
      setCustomerData(null);

      // Reiniciar scanner después de 3 segundos
      setTimeout(() => {
        setResult(null);
        initScanner();
      }, 3000);

    } catch (error) {
      console.error('Error registrando compra:', error);
      setResult({ type: 'error', message: error.message || 'Error al registrar compra' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScannedUserId(null);
    setCustomerData(null);
    setAmount('');
    setNotes('');
    setResult(null);
    initScanner();
  };

  if (!isStaff && result?.type === 'error') {
    return (
      <ScanWrapper>
        <Section>
          <ScanCard>
            <Title>Acceso Restringido</Title>
            <ResultMessage type="error">{result.message}</ResultMessage>
          </ScanCard>
        </Section>
      </ScanWrapper>
    );
  }

  return (
    <ScanWrapper>
      <Section>
        <ScanCard>
          <Title>Registrar Compra</Title>

          {!scannedUserId && (
            <>
              <p style={{ textAlign: 'center', marginBottom: '16px' }}>
                Escanea el código QR del cliente
              </p>
              <ScannerContainer>
                <div id="qr-reader"></div>
              </ScannerContainer>
            </>
          )}

          {scannedUserId && customerData && (
            <>
              <CustomerInfo>
                <h3>Cliente Identificado</h3>
                <p><strong>Nombre:</strong> {customerData.profile.name}</p>
                <p><strong>Email:</strong> {customerData.profile.email}</p>
                <p><strong>Puntos actuales:</strong> {customerData.state.cashback_points}</p>
                <p><strong>Sellos:</strong> {customerData.state.stamps}/8</p>
              </CustomerInfo>

              <form onSubmit={handleSubmit}>
                <Input
                  type="number"
                  label="Monto de la compra ($)"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  step="0.01"
                  min="0.01"
                />

                <Input
                  type="text"
                  label="Notas (opcional)"
                  placeholder="Ej: 2 cafés + 1 croissant"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ marginTop: '16px' }}
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <Button type="submit" disabled={loading} style={{ flex: 1 }}>
                    {loading ? 'Registrando...' : 'Registrar Compra'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleReset}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </>
          )}

          {result && (
            <ResultMessage type={result.type}>
              {result.message.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </ResultMessage>
          )}
        </ScanCard>
      </Section>
    </ScanWrapper>
  );
};