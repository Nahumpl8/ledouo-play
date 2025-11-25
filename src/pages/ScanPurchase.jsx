import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styled from 'styled-components';
import { supabase } from '@/integrations/supabase/client';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { PinConfirmModal } from '../components/staff/PinConfirmModal';

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
  background: #000;
  position: relative;

  #qr-reader {
    border: none !important;
  }
  
  #qr-reader__scan_region {
    background: transparent !important;
  }
  
  video {
    object-fit: cover;
    border-radius: ${props => props.theme.radius};
  }
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
  white-space: pre-line; 
  
  ${props => props.type === 'success' && `
    background: #d1fae5;
    color: #065f46;
  `}
  
  ${props => props.type === 'error' && `
    background: #fee2e2;
    color: #991b1b;
  `}
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
`;

const ManualInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: ${props => props.theme.colors.bgAlt};
  border-radius: ${props => props.theme.radius};
`;

const CameraErrorMessage = styled.div`
  padding: 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
  text-align: center;
  margin: 12px 0;
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
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualUserId, setManualUserId] = useState('');
  const [cameraError, setCameraError] = useState(null);

  // NUEVO: Referencia para evitar lecturas múltiples
  const isProcessingScan = useRef(false);

  useEffect(() => {
    checkStaffAccess();
  }, []);

  useEffect(() => {
    // Solo inicializamos si NO hay usuario escaneado y NO estamos procesando ya uno
    if (!scannedUserId && isStaff && !manualMode && !isProcessingScan.current) {
      const timer = setTimeout(() => {
        initScanner();
      }, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isStaff, scannedUserId, manualMode]);

  const checkStaffAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setResult({ type: 'error', message: 'Debes iniciar sesión' });
      return;
    }
    setCurrentUserId(user.id);
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['staff', 'admin']);

    if (!roles || roles.length === 0) {
      setResult({ type: 'error', message: 'Acceso denegado. Solo staff.' });
      return;
    }
    setIsStaff(true);
  };

  const initScanner = () => {
    setCameraError(null);
    // Aseguramos que la bandera de proceso esté limpia al iniciar
    isProcessingScan.current = false;

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        videoConstraints: {
          facingMode: "environment",
          focusMode: "continuous"
        }
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, (error) => {
      if (typeof error === 'string') {
        if (error.includes('NotAllowedError')) {
          setCameraError('Permiso de cámara denegado.');
        } else if (error.includes('NotFoundError')) {
          setCameraError('No se encontró cámara.');
        }
      }
    });
    setScanner(html5QrcodeScanner);
  };

  const onScanSuccess = async (decodedText) => {
    // 1. FRENO DE MANO: Si ya estamos procesando un código, ignoramos los siguientes
    if (isProcessingScan.current) return;
    isProcessingScan.current = true; // Bloqueamos inmediatamente

    console.log('QR Detectado (Procesando):', decodedText);

    const userIdClean = decodedText.replace(/^leduo[-:]/i, '');

    if (userIdClean.length < 10) {
      console.warn('QR inválido');
      isProcessingScan.current = false; // Liberamos si es inválido
      return;
    }

    // 2. DETENER ESCÁNER ANTES DE ACTUALIZAR ESTADO
    // Esto evita el parpadeo y errores en el DOM
    if (scanner) {
      try {
        await scanner.clear();
      } catch (e) {
        console.error("Error limpiando scanner", e);
      }
    }

    // 3. Ahora sí actualizamos el estado (React)
    setScannedUserId(userIdClean);
    await loadCustomerData(userIdClean);
  };

  const handleManualSearch = async () => {
    if (!manualUserId.trim()) return;

    const userIdClean = manualUserId.trim().replace(/^leduo[-:]/i, '');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(userIdClean)) {
      setResult({ type: 'error', message: 'ID inválido.' });
      return;
    }

    setScannedUserId(userIdClean);
    await loadCustomerData(userIdClean);
  };

  const loadCustomerData = async (userId) => {
    setLoading(true);
    setResult(null);

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

      if (!profile || !state) throw new Error('Cliente no encontrado.');

      setCustomerData({ profile, state });
    } catch (error) {
      console.error('Error loading user:', error);
      setResult({ type: 'error', message: 'No se encontró al cliente.' });
      setScannedUserId(null);

      setTimeout(() => {
        if (!manualMode) {
          setResult(null);
          initScanner();
        }
      }, 3000);
    } finally {
      setLoading(false);
      // Nota: NO ponemos isProcessingScan.current = false aquí porque
      // ya tenemos al usuario y no queremos seguir escaneando.
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setResult({ type: 'error', message: 'Monto inválido' });
      return;
    }
    setPinError(null);
    setShowPinModal(true);
  };

  const handlePinConfirm = async (pin) => {
    setLoading(true);
    setPinError(null);

    try {
      const amountNum = parseFloat(amount);
      const { data, error } = await supabase.functions.invoke('register-purchase', {
        body: {
          userId: scannedUserId,
          amount: amountNum,
          notes,
          staffId: currentUserId,
          staffPin: pin
        }
      });

      if (error) {
        if (error.message?.includes('PIN incorrecto') || (error.context && error.context.status === 401)) {
          setPinError('PIN incorrecto.');
          setLoading(false);
          return;
        }
        throw error;
      }

      const pointsMsg = `+${data.points.earned} pts`;
      const stampsMsg = `+${data.stamps.earned} sello`;
      const rewardMsg = data.rewardCreated ? ' \n🎉 ¡Recompensa!' : '';

      setResult({
        type: 'success',
        message: `Éxito: ${pointsMsg}, ${stampsMsg}${rewardMsg}`
      });

      setShowPinModal(false);
      setAmount('');
      setNotes('');
      setScannedUserId(null);
      setCustomerData(null);

      // Reiniciar ciclo
      setTimeout(() => {
        setResult(null);
        if (!manualMode) initScanner();
      }, 4000);

    } catch (error) {
      console.error(error);
      setResult({ type: 'error', message: 'Error al registrar.' });
      setShowPinModal(false);
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
    setManualUserId('');
    setCameraError(null);

    // Liberamos el bloqueo para permitir escanear de nuevo
    isProcessingScan.current = false;

    if (!manualMode) {
      setTimeout(() => initScanner(), 100);
    }
  };

  if (!isStaff && result?.type === 'error') {
    return (
      <ScanWrapper>
        <Section><ScanCard><Title>Acceso Restringido</Title><ResultMessage type="error">{result.message}</ResultMessage></ScanCard></Section>
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
              <ModeToggle>
                <Button
                  variant={!manualMode ? 'primary' : 'outline'}
                  onClick={() => {
                    setManualMode(false);
                    setResult(null);
                    isProcessingScan.current = false;
                    setTimeout(initScanner, 100);
                  }}
                >
                  📷 Escanear QR
                </Button>
                <Button
                  variant={manualMode ? 'primary' : 'outline'}
                  onClick={() => {
                    setManualMode(true);
                    if (scanner) scanner.clear().catch(() => { });
                  }}
                >
                  ✏️ Entrada Manual
                </Button>
              </ModeToggle>

              {manualMode ? (
                <ManualInputContainer>
                  <Input
                    type="text"
                    label="ID del Cliente"
                    placeholder="UUID"
                    value={manualUserId}
                    onChange={(e) => setManualUserId(e.target.value)}
                  />
                  <Button onClick={handleManualSearch} disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar Cliente'}
                  </Button>
                </ManualInputContainer>
              ) : (
                <>
                  <p style={{ textAlign: 'center', marginBottom: '16px' }}>Apunta al QR</p>
                  {cameraError && <CameraErrorMessage>{cameraError}</CameraErrorMessage>}
                  <ScannerContainer>
                    <div id="qr-reader"></div>
                  </ScannerContainer>
                </>
              )}
            </>
          )}

          {scannedUserId && customerData && (
            <>
              <CustomerInfo>
                <h3>{customerData.profile.name}</h3>
                <p>Email: {customerData.profile.email}</p>
                <p>Puntos: {customerData.state.cashback_points} | Sellos: {customerData.state.stamps}/8</p>
              </CustomerInfo>

              <form onSubmit={handleSubmit}>
                <Input
                  type="number"
                  label="Monto ($)"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  step="0.01"
                  min="0.01"
                />
                <Input
                  type="text"
                  label="Notas"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ marginTop: '16px' }}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <Button type="submit" disabled={loading} style={{ flex: 1 }}>
                    {loading ? 'Registrando...' : 'Cobrar'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleReset}>Cancelar</Button>
                </div>
              </form>
            </>
          )}

          {result && <ResultMessage type={result.type}>{result.message}</ResultMessage>}
        </ScanCard>
      </Section>

      <PinConfirmModal
        isOpen={showPinModal}
        onClose={() => { setShowPinModal(false); setPinError(null); }}
        onConfirm={handlePinConfirm}
        loading={loading}
        error={pinError}
      />
    </ScanWrapper>
  );
};