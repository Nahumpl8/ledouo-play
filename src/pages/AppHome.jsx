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

// Sprites estáticos 0..8 sellos (tus imágenes)
const STAMP_SPRITES = {
  0: 'https://i.ibb.co/63CV4yN/0-sellos.png',
  1: 'https://i.ibb.co/Z6JMptkH/1-sello.png',
  2: 'https://i.ibb.co/VYD6Kpk0/2-sellos.png',
  3: 'https://i.ibb.co/BHbybkYM/3-sellos.png',
  4: 'https://i.ibb.co/39YtppFz/4-sellos.png',
  5: 'https://i.ibb.co/pBpkMX7L/5-sellos.png',
  6: 'https://i.ibb.co/KzcK4mXh/6-sellos.png',
  7: 'https://i.ibb.co/358Mc3Q4/7-sellos.png',
  8: 'https://i.ibb.co/ZzJSwPhT/8-sellos.png',
};

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
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h1 {
    font-family: ${props => props.theme.fontPrimary};
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p {
    color: ${props => props.theme.colors.secondary};
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.gradient || props.theme.colors.white};
  color: ${props => props.textColor || props.theme.colors.text};
  
  .icon {
    font-size: 2.5rem;
    margin-bottom: ${props => props.theme.spacing.sm};
    display: block;
  }
  
  .value {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 4px;
    color: ${props => props.valueColor || 'inherit'};
  }
  
  .label {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ActionCard = styled(Card)`
  padding: ${props => props.theme.spacing.lg};
  
  .header {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    margin-bottom: ${props => props.theme.spacing.md};
    
    .icon {
      font-size: 1.5rem;
    }
    
    h3 {
      color: ${props => props.theme.colors.primary};
      margin: 0;
    }
  }
  
  p {
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.md};
    line-height: 1.5;
  }
`;

const WalletButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: row;
  }
`;

const RouletteStatus = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.canSpin ?
    'linear-gradient(135deg, #10B981, #059669)' :
    props.theme.colors.bgAlt
  };
  color: ${props => props.canSpin ? props.theme.colors.white : props.theme.colors.text};
  border-radius: ${props => props.theme.radius};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.md};
  
  .status-icon {
    font-size: 2rem;
    margin-bottom: ${props => props.theme.spacing.sm};
    display: block;
  }
  
  .status-text {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .status-detail {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

export const AppHome = () => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMessage, setWalletMessage] = useState('');
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
        roulette_visits_since_last_spin: 0
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
    if (selectedWallet !== 'google') return;
    setWalletLoading(true);
    setWalletMessage('');

    try {
      const walletData = {
        id: customer.id,
        name: customer.name,
        cashbackPoints: state.cashback_points,
        stamps: state.stamps
      };

      const result = await addToGoogleWallet(walletData);
      setWalletMessage(result.message || 'Redirigiendo a Google Wallet…');
      setTimeout(() => setWalletModalOpen(false), 2000);
    } catch (error) {
      console.error('Error añadiendo a wallet:', error);
      setWalletMessage(error.message || 'Error al añadir a Google Wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  // Helpers de ruleta con state seguro
  const canSpinRoulette = () => {
    if (!state?.roulette_last_spin_at) return true;
    const lastSpin = new Date(state.roulette_last_spin_at);
    const now = new Date();
    const daysSinceLastSpin = Math.floor((now - lastSpin) / (1000 * 60 * 60 * 24));
    const mode = state.roulette_mode || 'weekly';
    if (mode === 'weekly') {
      return daysSinceLastSpin >= (state.roulette_cooldown_days || 7);
    }
    return (state.roulette_visits_since_last_spin || 0) >= (state.roulette_required_visits || 3);
  };

  const getRouletteStatusText = () => {
    if (canSpinRoulette()) {
      return {
        icon: '🎰',
        text: '¡Puedes girar la ruleta!',
        detail: 'Haz clic para ganar premios increíbles'
      };
    }
    const mode = state?.roulette_mode || 'weekly';
    if (mode === 'weekly') {
      const lastSpin = new Date(state.roulette_last_spin_at);
      const nextSpin = new Date(lastSpin);
      nextSpin.setDate(nextSpin.getDate() + (state.roulette_cooldown_days || 7));
      const daysUntilNext = Math.ceil((nextSpin - new Date()) / (1000 * 60 * 60 * 24));
      return {
        icon: '⏰',
        text: 'Ruleta en cooldown',
        detail: `Podrás girar en ${daysUntilNext} día${daysUntilNext !== 1 ? 's' : ''}`
      };
    }
    const visitsNeeded = (state.roulette_required_visits || 3) - (state.roulette_visits_since_last_spin || 0);
    return {
      icon: '📍',
      text: 'Acumula más visitas',
      detail: `Te faltan ${visitsNeeded} visita${visitsNeeded !== 1 ? 's' : ''} para girar`
    };
  };

  const rouletteStatus = state ? getRouletteStatusText() : { icon: '🎰', text: '', detail: '' };
  const canSpin = state ? canSpinRoulette() : false;

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

  return (
    <AppWrapper>
      <Section>
        <WelcomeSection>
          <h1>¡Hola, {customer.name || 'Usuario'}! ☕</h1>
          <p>Bienvenido de vuelta a tu portal LeDuo</p>
        </WelcomeSection>

        <StatsGrid>
          {/* Card de Sellos con sprite */}
          <StatCard
            gradient="linear-gradient(135deg, #919888, #B3B792)"
            textColor="#FFFFFF"
            valueColor="#FFFFFF"
          >
            <span className="icon">🎯</span>

            {/* Sprite de sellos (0..8) */}
            <img
              src={getSpriteByStamps(stampsSafe)}
              alt={`Progreso de sellos: ${stampsSafe} de 8`}
              style={{
                width: '100%',
                maxWidth: 280,
                display: 'block',
                margin: '12px auto 6px',
                borderRadius: 8,
                background: '#fff'
              }}
            />

            <div className="value">{stampsSafe}/8</div>
            <div className="label">Sellos coleccionados</div>
          </StatCard>

          <StatCard>
            <span className="icon">📅</span>
            <div className="value" style={{ fontSize: '1.2rem' }}>
              {formatLastVisit(state.last_visit)}
            </div>
            <div className="label">Última visita</div>
          </StatCard>

          <StatCard>
            <span className="icon">🔥</span>
            <div className="value">{state.roulette_visits_since_last_spin || 0}</div>
            <div className="label">Visitas desde último giro</div>
          </StatCard>

          <StatCard>
            <span className="icon">🎫</span>
            <div style={{ 
              background: 'white', 
              padding: '16px', 
              borderRadius: '12px',
              display: 'inline-block',
              margin: '12px auto'
            }}>
              <QRCodeSVG 
                value={`leduo:${customer?.id || ''}`}
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="label">Tu código QR</div>
          </StatCard>
        </StatsGrid>

        <ActionsGrid>
          <ActionCard hover>
            <div className="header">
              <span className="icon">📱</span>
              <h3>Añadir a Wallet</h3>
            </div>
            <p>
              Guarda tu tarjeta LeDuo en tu wallet móvil para acceso rápido y
              pagos sin contacto en nuestra cafetería.
            </p>
            <WalletButtons>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openWalletModal('apple')}
              >
                📱 Apple Wallet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openWalletModal('google')}
              >
                🤖 Google Wallet
              </Button>
            </WalletButtons>
          </ActionCard>

          <ActionCard hover>
            <div className="header">
              <span className="icon">🎰</span>
              <h3>Ruleta LeDuo</h3>
            </div>

            <RouletteStatus canSpin={canSpin}>
              <span className="status-icon">{rouletteStatus.icon}</span>
              <div className="status-text">{rouletteStatus.text}</div>
              <div className="status-detail">{rouletteStatus.detail}</div>
            </RouletteStatus>

            <Button
              as={Link}
              to="/app/ruleta"
              variant={canSpin ? "primary" : "outline"}
              size="lg"
              disabled={!canSpin}
              style={{ width: '100%' }}
            >
              {canSpin ? '🎰 Girar Ruleta' : '⏰ Ver Ruleta'}
            </Button>
          </ActionCard>
        </ActionsGrid>

        {/* Quick Actions */}
        <Card>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '16px', color: '#686145' }}>Acciones rápidas</h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
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
          </div>
        </Card>
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

          {selectedWallet === 'google' ? (
            <>
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
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button
                  onClick={handleAddToWallet}
                  variant="primary"
                  disabled={walletLoading}
                >
                  {walletLoading ? '⏳ Añadiendo...' : '📱 Añadir a Google Wallet'}
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
                💡 <strong>Tip:</strong> Con la tarjeta en tu wallet, solo escanea tu código QR en caja
              </p>
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: '16px', color: '#686145' }}>
                Próximamente disponible
              </h3>
              <p style={{ marginBottom: '24px', lineHeight: 1.6 }}>
                Apple Wallet requiere configuración adicional con certificados de desarrollador de Apple.
              </p>
              <Button onClick={() => setWalletModalOpen(false)} variant="primary">
                Entendido
              </Button>
            </>
          )}
        </div>
      </Modal>
    </AppWrapper>
  );
};
