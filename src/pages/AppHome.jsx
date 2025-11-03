// src/pages/AppHome.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { supabase } from '../integrations/supabase/client';
import { addToGoogleWallet, demoAddToGoogleWallet, getConfigurationStatus } from '../services/googleWallet';

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
    grid-template-columns: repeat(4, 1fr);
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
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [customerState, setCustomerState] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load customer state
      const { data: stateData } = await supabase
        .from('customer_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);
      setCustomerState(stateData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppWrapper>
        <Section>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Cargando...
          </div>
        </Section>
      </AppWrapper>
    );
  }

  const customer = profile ? {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    cashbackPoints: customerState?.cashback_points || 0,
    stamps: customerState?.stamps || 0,
    createdAt: profile.created_at
  } : null;

  const state = customerState ? {
    cashbackPoints: customerState.cashback_points || 0,
    stamps: customerState.stamps || 0,
    lastVisit: customerState.last_visit,
    roulette: {
      lastSpinAt: customerState.roulette_last_spin_at,
      mode: customerState.roulette_mode || 'weekly',
      cooldownDays: customerState.roulette_cooldown_days || 7,
      visitsSinceLastSpin: customerState.roulette_visits_since_last_spin || 0,
      requiredVisits: customerState.roulette_required_visits || 3
    }
  } : null;

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
      // Si mantienes getConfigurationStatus en el servicio, úsalo:
      const config = typeof getConfigurationStatus === 'function'
        ? getConfigurationStatus()
        : { configured: true };

      if (!config.configured) {
        const result = await demoAddToGoogleWallet(customer);
        setWalletMessage(result.message + (result.demo ? ' (Modo Demo)' : ''));
      } else {
        const result = await addToGoogleWallet(customer);
        setWalletMessage(result.message || 'Redirigiendo a Google Wallet…');
        setTimeout(() => setWalletModalOpen(false), 2000);
      }
    } catch (error) {
      console.error('Error añadiendo a wallet:', error);
      // Fallback a demo si algo falla
      try {
        const demo = await demoAddToGoogleWallet(customer);
        setWalletMessage((error?.message ? error.message + ' • ' : '') + demo.message + ' (Modo Demo)');
      } catch {
        setWalletMessage(error.message || 'Error al añadir a Google Wallet');
      }
    } finally {
      setWalletLoading(false);
    }
  };

  // Helpers de ruleta con state seguro
  const canSpinRoulette = () => {
    if (!state?.roulette?.lastSpinAt) return true;
    const lastSpin = new Date(state.roulette.lastSpinAt);
    const now = new Date();
    const daysSinceLastSpin = Math.floor((now - lastSpin) / (1000 * 60 * 60 * 24));
    if (state.roulette.mode === 'weekly') {
      return daysSinceLastSpin >= (state.roulette.cooldownDays ?? 7);
    }
    return (state.roulette.visitsSinceLastSpin ?? 0) >= (state.roulette.requiredVisits ?? 3);
  };

  const getRouletteStatusText = () => {
    if (canSpinRoulette()) {
      return {
        icon: '🎰',
        text: '¡Puedes girar la ruleta!',
        detail: 'Haz clic para ganar premios increíbles'
      };
    }
    if (state.roulette.mode === 'weekly') {
      const lastSpin = new Date(state.roulette.lastSpinAt);
      const nextSpin = new Date(lastSpin);
      nextSpin.setDate(nextSpin.getDate() + (state.roulette.cooldownDays ?? 7));
      const daysUntilNext = Math.ceil((nextSpin - new Date()) / (1000 * 60 * 60 * 24));
      return {
        icon: '⏰',
        text: 'Ruleta en cooldown',
        detail: `Podrás girar en ${daysUntilNext} día${daysUntilNext !== 1 ? 's' : ''}`
      };
    }
    const visitsNeeded = (state.roulette.requiredVisits ?? 3) - (state.roulette.visitsSinceLastSpin ?? 0);
    return {
      icon: '📍',
      text: 'Acumula más visitas',
      detail: `Te faltan ${visitsNeeded} visita${visitsNeeded !== 1 ? 's' : ''} para girar`
    };
  };

  const rouletteStatus = getRouletteStatusText();
  const canSpin = canSpinRoulette();

  const formatLastVisit = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AppWrapper>
      <Section>
        <WelcomeSection>
          <h1>¡Hola, {customer?.name || 'Usuario'}! ☕</h1>
          <p>Bienvenido de vuelta a tu portal LeDuo</p>
        </WelcomeSection>

        <StatsGrid>
          <StatCard
            gradient="linear-gradient(135deg, #686145, #919888)"
            textColor="#FFFFFF"
            valueColor="#FFFFFF"
          >
            <span className="icon">💰</span>
            <div className="value">{state?.cashbackPoints ?? 0}</div>
            <div className="label">Puntos de cashback</div>
          </StatCard>

          <StatCard
            gradient="linear-gradient(135deg, #919888, #B3B792)"
            textColor="#FFFFFF"
            valueColor="#FFFFFF"
          >
            <span className="icon">🎯</span>
            <div className="value">{(state?.stamps ?? 0)}/10</div>
            <div className="label">Sellos coleccionados</div>
          </StatCard>

          <StatCard>
            <span className="icon">📅</span>
            <div className="value" style={{ fontSize: '1.2rem' }}>
              {formatLastVisit(state?.lastVisit)}
            </div>
            <div className="label">Última visita</div>
          </StatCard>

          <StatCard>
            <span className="icon">🔥</span>
            <div className="value">{state?.roulette?.visitsSinceLastSpin ?? 0}</div>
            <div className="label">Visitas desde último giro</div>
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
                <p><strong>Nombre:</strong> {customer?.name || 'Cliente Demo'}</p>
                <p><strong>Puntos:</strong> {(state?.cashbackPoints ?? 0)} puntos</p>
                <p><strong>Sellos:</strong> {(state?.stamps ?? 0)} de 8</p>
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
