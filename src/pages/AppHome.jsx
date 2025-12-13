// src/pages/AppHome.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { QRCodeSVG } from 'qrcode.react';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { supabase } from '@/integrations/supabase/client';
import { addToGoogleWallet } from '../services/googleWallet';
import { addToAppleWallet } from '../services/appleWallet';
import { Crown, Trophy, Star } from 'lucide-react';
import googleWalletIcon from '/public/googleWalletICon.png';
import appleWalletIcon from '/public/appleWalletICon.png';


const STORAGE_BASE = 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images';
const STAMP_SPRITES = {
  0: `${STORAGE_BASE}/0-sellos.png`,
  1: `${STORAGE_BASE}/1-sellos.png`,
  2: `${STORAGE_BASE}/2-sellos.png`,
  3: `${STORAGE_BASE}/3-sellos.png`,
  4: `${STORAGE_BASE}/4-sellos.png`,
  5: `${STORAGE_BASE}/5-sellos.png`,
  6: `${STORAGE_BASE}/6-sellos.png`,
  7: `${STORAGE_BASE}/7-sellos.png`,
  8: `${STORAGE_BASE}/8-sellos.png`,
};

const LEGEND_THRESHOLD = 150;

function getSpriteByStamps(stampsRaw) {
  const n = Math.max(0, Math.min(8, parseInt(stampsRaw || 0, 10)));
  return STAMP_SPRITES[n] || STAMP_SPRITES[0];
}

const AppWrapper = styled.div`
  min-height: 80vh;
  background: ${props => props.theme.colors.bg};
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  h1 {
    font-family: ${props => props.theme.fontPrimary};
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.xs};
    font-size: 1.8rem;
  }
  
  p {
    color: ${props => props.theme.colors.secondary};
    font-size: 1rem;
  }
`;

const MainCard = styled(Card)`
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, #919888, #B3B792);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  }
`;

const LevelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.$isLegend ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.2)'};
  color: ${props => props.$isLegend ? '#1e3932' : 'white'};
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.$isLegend ? '0 4px 15px rgba(255, 215, 0, 0.4)' : 'none'};
`;

const StampImage = styled.img`
  width: 100%;
  max-width: 300px;
  display: block;
  margin: 12px auto;
  border-radius: 12px;
  background: white;
  position: relative;
  z-index: 1;
`;

const StampInfo = styled.div`
  text-align: center;
  position: relative;
  z-index: 1;
  
  .count {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 4px;
  }
  
  .label {
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const SecondaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const SecondaryCard = styled(Card)`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  
  .icon {
    font-size: 2rem;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 4px;
  }
  
  .label {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.secondary};
  }
`;

const RouletteCard = styled(Card)`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.$isLegend
    ? 'linear-gradient(135deg, #1e3932 0%, #2d5a4e 100%)'
    : props.theme.colors.white};
  color: ${props => props.$isLegend ? 'white' : props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const RouletteStatus = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$canSpin
    ? 'linear-gradient(135deg, #10B981, #059669)'
    : props.$isLegend
      ? 'rgba(255,255,255,0.1)'
      : props.theme.colors.bgAlt};
  color: ${props => props.$canSpin || props.$isLegend ? 'white' : props.theme.colors.text};
  border-radius: ${props => props.theme.radius};
  margin-bottom: ${props => props.theme.spacing.md};
  
  .status-icon {
    font-size: 2rem;
    margin-bottom: ${props => props.theme.spacing.sm};
    display: block;
  }
  
  .status-text {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .status-detail {
    font-size: 0.85rem;
    opacity: 0.9;
  }
`;

const ProgressSection = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.bgAlt};
  border-radius: ${props => props.theme.radius};
  
  h4 {
    font-size: 0.9rem;
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.theme.colors.primary};
  }
  
  .progress-bar {
    height: 12px;
    background: #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FFD700, #FFA500);
    border-radius: 6px;
    transition: width 0.5s ease;
  }
  
  .progress-text {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.secondary};
    text-align: center;
  }
  
  .tips {
    margin-top: ${props => props.theme.spacing.sm};
    padding-top: ${props => props.theme.spacing.sm};
    border-top: 1px solid #eee;
    
    p {
      font-size: 0.8rem;
      color: ${props => props.theme.colors.secondary};
      margin: 4px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

const QuickActionsCard = styled(Card)`
  padding: 24px;
  text-align: center;
  
  h3 {
    margin-bottom: 16px;
    color: ${props => props.theme.colors.primary};
  }
  
  .actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

// --- Nuevos Estilos para los Botones Wallet ---

const WalletButtonsRow = styled.div`
  display: flex;
  flex-direction: column; /* En celular se ven mejor uno bajo el otro */
  gap: 24px;
  margin-bottom: ${props => props.theme.spacing.lg};
  width: 100%;
  max-width: 400px; /* Que no se estiren demasiado en desktop */
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 600px) {
    flex-direction: row; /* En tablet/PC los ponemos lado a lado */
  }
`;

const WalletBtn = styled.button`
  background-color: #000000; /* Fondo negro oficial */
  color: #ffffff;
  border: 1px solid #333;
  border-radius: 12px; /* Bordes redondeados modernos */
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  height: 56px; /* Altura estándar de badges */
  position: relative;
  overflow: hidden;

  

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    background-color: #1a1a1a;
  }

  &:active {
    transform: scale(0.98);
  }

  /* Estructura del texto interno */
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.1;
  }

  .small-text {
    font-size: 0.7rem;
    font-weight: 400;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    @media (min-width: 890px) {
      font-size: 0.6rem;
      text-align: left;
    }
  }

  .big-text {
    font-size: 1.1rem;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif; /* Fuente nativa */
    @media (min-width: 890px) {
      font-size: 0.8rem;
      text-align: left;
    }
  }
`;

export const AppHome = () => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMessage, setWalletMessage] = useState('');
  const [walletLink, setWalletLink] = useState('');
  const [customer, setCustomer] = useState(null);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: customerState } = await supabase
        .from('customer_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCustomer({ ...profile, id: user.id });
      setState(customerState || {
        cashback_points: 0,
        stamps: 0,
        last_visit: null,
        level_points: 0,
        roulette_last_spin_at: null
      });
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openWalletModal = (wallet) => {
    setSelectedWallet(wallet);
    setWalletMessage('');
    setWalletModalOpen(true);
  };

  const handleAddToWallet = async () => {
    setWalletLoading(true);
    setWalletMessage('');
    setWalletLink('');

    try {
      const walletData = {
        id: customer.id,
        name: customer.name,
        cashbackPoints: state.cashback_points,
        stamps: state.stamps
      };

      if (selectedWallet === 'apple') {
        await addToAppleWallet(walletData);
        setWalletMessage('¡Pase descargado! Ábrelo para añadirlo a tu Wallet.');
        return;
      }

      const result = await addToGoogleWallet(walletData);

      if (result?.url) {
        if (result.usedPopup) {
          setWalletMessage('Redirigiendo a Google Wallet…');
          setTimeout(() => setWalletModalOpen(false), 2000);
        } else {
          try {
            const w = window.open(result.url, '_blank', 'noopener,noreferrer');
            if (!w) {
              setWalletMessage('No se pudo abrir automáticamente. Haz click en el enlace:');
              setWalletLink(result.url);
            } else {
              setWalletMessage('Redirigiendo a Google Wallet…');
              setTimeout(() => setWalletModalOpen(false), 2000);
            }
          } catch (err) {
            setWalletMessage('Error abriendo Google Wallet. Usa el enlace:');
            setWalletLink(result.url);
          }
        }
      } else {
        setWalletMessage(result.message || 'No se recibió URL de Google Wallet');
      }
    } catch (error) {
      console.error('Error añadiendo a wallet:', error);
      setWalletMessage(error.message || 'Error al añadir a Wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  const isLegend = (state?.level_points || 0) >= LEGEND_THRESHOLD;

  const canSpinRoulette = () => {
    if (!isLegend) return false;
    if (!state?.roulette_last_spin_at) return true;
    const lastSpin = new Date(state.roulette_last_spin_at);
    const now = new Date();
    const daysSinceLastSpin = Math.floor((now - lastSpin) / (1000 * 60 * 60 * 24));
    return daysSinceLastSpin >= 7;
  };

  const getRouletteStatusText = () => {
    if (!isLegend) {
      return {
        icon: '🌟',
        text: 'Exclusivo para Leduo Leyend',
        detail: 'Sube de nivel para desbloquear la ruleta'
      };
    }

    if (canSpinRoulette()) {
      return {
        icon: '🎰',
        text: '¡Puedes girar la ruleta!',
        detail: 'Haz clic para ganar premios increíbles'
      };
    }

    const lastSpin = new Date(state.roulette_last_spin_at);
    const nextSpin = new Date(lastSpin);
    nextSpin.setDate(nextSpin.getDate() + 7);
    const daysUntilNext = Math.ceil((nextSpin - new Date()) / (1000 * 60 * 60 * 24));

    return {
      icon: '⏰',
      text: 'Ruleta en cooldown',
      detail: `Podrás girar en ${daysUntilNext} día${daysUntilNext !== 1 ? 's' : ''}`
    };
  };

  const formatLastVisit = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <AppWrapper>
        <Section>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Cargando...</p>
          </div>
        </Section>
      </AppWrapper>
    );
  }

  if (!customer || !state) {
    return (
      <AppWrapper>
        <Section>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Error cargando datos del usuario</p>
          </div>
        </Section>
      </AppWrapper>
    );
  }

  const stampsSafe = Math.max(0, Math.min(8, state.stamps || 0));
  const levelPoints = state.level_points || 0;
  const progressPercent = Math.min((levelPoints / LEGEND_THRESHOLD) * 100, 100);
  const pointsToLegend = Math.max(0, LEGEND_THRESHOLD - levelPoints);
  const rouletteStatus = getRouletteStatusText();
  const canSpin = canSpinRoulette();

  return (
    <AppWrapper>
      <Section>
        <WelcomeSection>
          <h1>¡Hola, {customer.name || 'Usuario'}! ☕</h1>
          <p>Bienvenido de vuelta a LeDuo</p>
        </WelcomeSection>

        {/* Tarjeta principal de sellos */}
        <MainCard>
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <LevelBadge $isLegend={isLegend}>
              {isLegend ? <Crown size={16} /> : <Star size={16} />}
              {isLegend ? 'Leduo Leyend' : 'Cliente Le Duo'}
            </LevelBadge>

            <StampImage
              src={getSpriteByStamps(stampsSafe)}
              alt={`Progreso de sellos: ${stampsSafe} de 8`}
            />

            <StampInfo>
              <div className="count">{stampsSafe}/8</div>
              <div className="label">Sellos coleccionados</div>
            </StampInfo>
          </div>
        </MainCard>

        {/* Botones de wallet rediseñados */}
        <WalletButtonsRow>
          {/* Botón Apple Wallet */}
          <WalletBtn onClick={() => openWalletModal('apple')}>
            {/* Icono Apple SVG */}
            <img src={appleWalletIcon} alt="Apple Wallet" width="32" height="32" />
            <div className="content">
              <span className="small-text">Añadir a</span>
              <span className="big-text">Apple Wallet</span>
            </div>
          </WalletBtn>

          {/* Botón Google Wallet */}
          <WalletBtn onClick={() => openWalletModal('google')}>
            {/* Icono Google Wallet SVG (Color original) */}
            <img src={googleWalletIcon} alt="Google Wallet" width="24" height="24" />
            <div className="content">
              <span className="small-text">Añadir a</span>
              <span className="big-text">Google Wallet</span>
            </div>
          </WalletBtn>
        </WalletButtonsRow>
        {/* Cards secundarias */}
        <SecondaryGrid>
          <SecondaryCard>
            <span className="icon">📅</span>
            <div className="value">{formatLastVisit(state.last_visit)}</div>
            <div className="label">Última visita</div>
          </SecondaryCard>

          <SecondaryCard>
            <span className="icon">⭐</span>
            <div className="value">{levelPoints}</div>
            <div className="label">Puntos de nivel</div>
          </SecondaryCard>

          <SecondaryCard style={{ gridColumn: 'span 2' }}>
            <span className="icon">🎫</span>
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '12px',
              display: 'inline-block',
              margin: '8px auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <QRCodeSVG
                value={`LEDUO-${customer?.id || ''}`}
                size={100}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="label">Tu código QR</div>
          </SecondaryCard>
        </SecondaryGrid>

        {/* Sección de Ruleta */}
        <RouletteCard $isLegend={isLegend}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎰</span>
            <h3 style={{ margin: 0, color: isLegend ? 'white' : '#1e3932' }}>Ruleta LeDuo</h3>
          </div>

          <RouletteStatus $canSpin={canSpin} $isLegend={isLegend}>
            <span className="status-icon">{rouletteStatus.icon}</span>
            <div className="status-text">{rouletteStatus.text}</div>
            <div className="status-detail">{rouletteStatus.detail}</div>
          </RouletteStatus>

          {isLegend ? (
            <Button
              as={Link}
              to="/app/ruleta"
              variant={canSpin ? "primary" : "outline"}
              size="lg"
              style={{ width: '100%' }}
            >
              {canSpin ? '🎰 ¡Girar Ruleta!' : '⏰ Volver pronto'}
            </Button>
          ) : (
            <ProgressSection>
              <h4><Trophy size={16} /> Tu progreso a Leyend</h4>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="progress-text">
                <strong>{levelPoints}/{LEGEND_THRESHOLD}</strong> puntos • Te faltan <strong>{pointsToLegend}</strong> puntos
              </div>
              <div className="tips">
                <p>💡 Cada compra te acerca a Leyend</p>
                <p>🎁 Los Leyend pueden girar 1 vez/semana</p>
              </div>
            </ProgressSection>
          )}
        </RouletteCard>

        {/* Acciones rápidas */}
        <QuickActionsCard>
          <h3>Acciones rápidas</h3>
          <div className="actions">
            <Button as={Link} to="/app/cuenta" variant="ghost" size="sm">
              👤 Mi Cuenta
            </Button>
            <Button as="a" href="tel:+7711295938" variant="ghost" size="sm">
              📞 Llamar a LeDuo
            </Button>
            <Button as="a" href="https://maps.app.goo.gl/j1VUSDoehyfLLZUUA" target="_blank" variant="ghost" size="sm">
              📍 Cómo llegar
            </Button>
          </div>
        </QuickActionsCard>
      </Section>

      {/* Wallet Modal */}
      <Modal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        title={`Añadir a ${selectedWallet === 'apple' ? 'Apple' : 'Google'} Wallet`}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
            {selectedWallet === 'apple' ? '📱' : '🤖'}
          </div>

          <h3 style={{ marginBottom: '16px', color: '#686145' }}>
            Tarjeta de Lealtad LeDuo
          </h3>
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', textAlign: 'left' }}>
            <p><strong>Nombre:</strong> {customer.name || 'Cliente'}</p>
            <p><strong>Puntos:</strong> {state.cashback_points || 0} puntos</p>
            <p><strong>Sellos:</strong> {stampsSafe} de 8</p>
          </div>

          {walletMessage && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: walletMessage.includes('Error') ? '#ffe6e6' : '#e6ffe6',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              {walletMessage}
              {walletLink && (
                <div style={{ marginTop: 8 }}>
                  <a href={walletLink} target="_blank" rel="noopener noreferrer">Abrir Google Wallet</a>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={handleAddToWallet}
              variant="primary"
              disabled={walletLoading}
            >
              {walletLoading ? '⏳ Añadiendo...' : `📱 Añadir a ${selectedWallet === 'apple' ? 'Apple' : 'Google'} Wallet`}
            </Button>
            <Button
              onClick={() => setWalletModalOpen(false)}
              variant="outline"
              disabled={walletLoading}
            >
              Cancelar
            </Button>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '16px' }}>
            💡 <strong>Tip:</strong> {selectedWallet === 'apple'
              ? 'Se descargará un archivo .pkpass que podrás abrir para añadir a tu Wallet'
              : 'Con la tarjeta en tu wallet, solo escanea tu código QR en caja'}
          </p>
        </div>
      </Modal>
    </AppWrapper>
  );
};
