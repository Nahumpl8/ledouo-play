import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
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
  background: #1a1a1a; /* Un gris muy oscuro en lugar de negro total */
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  /* CORRECCIÓN DE DISEÑO PARA BOTONES NATIVOS */
  #qr-reader {
    border: none !important;
    padding: 20px !important;
  }

  #qr-reader__dashboard_section_csr button {
    background-color: ${props => props.theme.colors.primary} !important;
    color: white !important;
    border: none !important;
    padding: 12px 24px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    margin: 10px auto !important;
    cursor: pointer !important;
    display: block !important;
    width: 80%;
    transition: transform 0.1s ease;
  }

  #qr-reader__dashboard_section_csr button:active {
    transform: scale(0.98);
  }

  /* Estilo para el enlace de "Scan an Image File" */
  #qr-reader__dashboard_section_csr span {
    color: #a1a1aa !important;
    display: block;
    text-align: center;
    margin-top: 10px;
    font-size: 0.9rem;
  }

  #qr-reader__status_span {
    background: transparent !important;
    color: #fbbf24 !important; /* Color ámbar para advertencias */
    text-align: center !important;
  }

  video {
    object-fit: cover;
    border-radius: ${props => props.theme.radius};
    width: 100% !important;
  }
`;

const CustomerInfo = styled.div`
  background: ${props => props.theme.colors.bgAlt};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radius};
  margin: ${props => props.theme.spacing.md} 0;
  border: 1px solid #e5e7eb;
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p {
    margin: 8px 0;
    color: #4b5563;
  }
`;

const RewardBadge = styled.div`
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  margin-top: 12px;
  font-size: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ResultMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radius};
  text-align: center;
  margin: ${props => props.theme.spacing.md} 0;
  white-space: pre-line; 
  font-weight: 500;
  
  ${props => props.type === 'success' && `
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #6ee7b7;
  `}
  
  ${props => props.type === 'error' && `
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  `}
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: center;
`;

const ManualInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: ${props => props.theme.colors.bgAlt};
  border-radius: ${props => props.theme.radius};
  border: 1px dashed #d1d5db;
`;

const CameraErrorMessage = styled.div`
  padding: 16px;
  background: #fffbeb;
  color: #92400e;
  border-radius: 8px;
  border: 1px solid #fef3c7;
  text-align: center;
  margin: 12px 0;
  font-size: 0.95rem;
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
  const [redeemMode, setRedeemMode] = useState(false);

  const isProcessingScan = useRef(false);

  useEffect(() => {
    checkStaffAccess();
  }, []);

  useEffect(() => {
    if (!scannedUserId && isStaff && !manualMode && !isProcessingScan.current) {
      const timer = setTimeout(() => {
        initScanner();
      }, 150);
      return () => clearTimeout(timer);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => { });
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
    isProcessingScan.current = false;

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        videoConstraints: {
          facingMode: "environment"
        }
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, (error) => {
      if (typeof error === 'string' && error.includes('NotAllowedError')) {
        setCameraError('Por favor, permite el acceso a la cámara para escanear.');
      }
    });
    setScanner(html5QrcodeScanner);
  };

  const onScanSuccess = async (decodedText) => {
    if (isProcessingScan.current) return;
    isProcessingScan.current = true;

    const userIdClean = decodedText.replace(/^leduo[-:]/i, '');

    if (userIdClean.length < 10) {
      isProcessingScan.current = false;
      return;
    }

    if (scanner) {
      try {
        await scanner.clear();
      } catch (e) {
        console.error(e);
      }
    }

    setScannedUserId(userIdClean);
    await loadCustomerData(userIdClean);
  };

  const handleManualSearch = async () => {
    if (!manualUserId.trim()) return;
    const userIdClean = manualUserId.trim().replace(/^leduo[-:]/i, '');
    setScannedUserId(userIdClean);
    await loadCustomerData(userIdClean);
  };

  const loadCustomerData = async (userId) => {
    setLoading(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      const { data: state } = await supabase.from('customer_state').select('*').eq('user_id', userId).single();

      if (!profile || !state) throw new Error('No encontrado');
      setCustomerData({ profile, state });
    } catch (error) {
      setResult({ type: 'error', message: 'Cliente no registrado o ID inválido.' });
      setScannedUserId(null);
      setTimeout(() => {
        if (!manualMode) initScanner();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePinConfirm = async (pin) => {
    setLoading(true);
    setPinError(null);

    try {
      const endpoint = redeemMode ? 'redeem-reward' : 'register-purchase';
      const body = {
        userId: scannedUserId,
        staffId: currentUserId,
        staffPin: pin,
        ...(redeemMode ? {} : { amount: parseFloat(amount), notes })
      };

      const { data, error } = await supabase.functions.invoke(endpoint, { body });

      if (error) {
        if (error.message?.includes('PIN incorrecto')) {
          setPinError('PIN incorrecto. Reintenta.');
          setLoading(false);
          return;
        }
        throw error;
      }

      setResult({
        type: 'success',
        message: redeemMode ? '🎉 ¡Canje exitoso!' : `Éxito: +${data.points.earned} pts, +${data.stamps.earned} sello`
      });

      setShowPinModal(false);
      handleReset();

      setTimeout(() => {
        setResult(null);
        if (!manualMode) initScanner();
      }, 4000);

    } catch (error) {
      setResult({ type: 'error', message: 'Error en el servidor.' });
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
    setManualUserId('');
    isProcessingScan.current = false;
  };

  return (
    <ScanWrapper>
      <Section>
        <ScanCard>
          <Title>Escanear Cliente</Title>

          {!scannedUserId && (
            <>
              <ModeToggle>
                <Button variant={!manualMode ? 'primary' : 'outline'} onClick={() => { setManualMode(false); setCameraError(null); }}>
                  📷 Escáner
                </Button>
                <Button variant={manualMode ? 'primary' : 'outline'} onClick={() => setManualMode(true)}>
                  ✏️ Manual
                </Button>
              </ModeToggle>

              {manualMode ? (
                <ManualInputContainer>
                  <Input label="ID del Cliente" placeholder="Pega el ID aquí" value={manualUserId} onChange={(e) => setManualUserId(e.target.value)} />
                  <Button onClick={handleManualSearch} disabled={loading}>Buscar</Button>
                </ManualInputContainer>
              ) : (
                <ScannerContainer>
                  {cameraError && <CameraErrorMessage>{cameraError}</CameraErrorMessage>}
                  <div id="qr-reader"></div>
                </ScannerContainer>
              )}
            </>
          )}

          {scannedUserId && customerData && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <CustomerInfo>
                <h3>{customerData.profile.name}</h3>
                <p><b>Sellos:</b> {customerData.state.stamps}/8</p>
                {customerData.state.stamps >= 8 && <RewardBadge>🎁 ¡Bebida Gratis Disponible!</RewardBadge>}
              </CustomerInfo>

              <form onSubmit={(e) => { e.preventDefault(); setRedeemMode(false); setShowPinModal(true); }}>
                <Input type="number" label="Monto Compra ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required step="0.01" />
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <Button type="submit" style={{ flex: 2 }}>Registrar</Button>
                  {customerData.state.stamps >= 8 && (
                    <Button type="button" onClick={() => { setRedeemMode(true); setShowPinModal(true); }} style={{ background: '#10b981', flex: 1 }}>Canjear</Button>
                  )}
                </div>
                <Button type="button" variant="secondary" onClick={handleReset} style={{ width: '100%', marginTop: '10px' }}>Cancelar</Button>
              </form>
            </div>
          )}

          {result && <ResultMessage type={result.type}>{result.message}</ResultMessage>}
        </ScanCard>
      </Section>

      <PinConfirmModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handlePinConfirm}
        loading={loading}
        error={pinError}
      />
    </ScanWrapper>
  );
};