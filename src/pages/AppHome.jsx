import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { stateStorage, customerStorage } from '../lib/storage';

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
  
  const customer = customerStorage.get();
  const state = stateStorage.get();

  const openWalletModal = (wallet) => {
    setSelectedWallet(wallet);
    setWalletModalOpen(true);
  };

  // Calculate roulette status
  const canSpinRoulette = () => {
    if (!state.roulette.lastSpinAt) return true;
    
    const lastSpin = new Date(state.roulette.lastSpinAt);
    const now = new Date();
    const daysSinceLastSpin = Math.floor((now - lastSpin) / (1000 * 60 * 60 * 24));
    
    if (state.roulette.mode === 'weekly') {
      return daysSinceLastSpin >= state.roulette.cooldownDays;
    } else {
      return state.roulette.visitsSinceLastSpin >= state.roulette.requiredVisits;
    }
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
      nextSpin.setDate(nextSpin.getDate() + state.roulette.cooldownDays);
      const daysUntilNext = Math.ceil((nextSpin - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        icon: '⏰',
        text: 'Ruleta en cooldown',
        detail: `Podrás girar en ${daysUntilNext} día${daysUntilNext !== 1 ? 's' : ''}`
      };
    } else {
      const visitsNeeded = state.roulette.requiredVisits - state.roulette.visitsSinceLastSpin;
      return {
        icon: '📍',
        text: 'Acumula más visitas',
        detail: `Te faltan ${visitsNeeded} visita${visitsNeeded !== 1 ? 's' : ''} para girar`
      };
    }
  };

  const rouletteStatus = getRouletteStatusText();
  const canSpin = canSpinRoulette();

  // Format last visit
  const formatLastVisit = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
            <div className="value">{state.cashbackPoints}</div>
            <div className="label">Puntos de cashback</div>
          </StatCard>

          <StatCard 
            gradient="linear-gradient(135deg, #919888, #B3B792)"
            textColor="#FFFFFF"
            valueColor="#FFFFFF"
          >
            <span className="icon">🎯</span>
            <div className="value">{state.stamps}/10</div>
            <div className="label">Sellos coleccionados</div>
          </StatCard>

          <StatCard>
            <span className="icon">📅</span>
            <div className="value" style={{fontSize: '1.2rem'}}>
              {formatLastVisit(state.lastVisit)}
            </div>
            <div className="label">Última visita</div>
          </StatCard>

          <StatCard>
            <span className="icon">🔥</span>
            <div className="value">{state.roulette.visitsSinceLastSpin}</div>
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
              style={{width: '100%'}}
            >
              {canSpin ? '🎰 Girar Ruleta' : '⏰ Ver Ruleta'}
            </Button>
          </ActionCard>
        </ActionsGrid>

        {/* Quick Actions */}
        <Card>
          <div style={{padding: '24px', textAlign: 'center'}}>
            <h3 style={{marginBottom: '16px', color: '#686145'}}>Acciones rápidas</h3>
            <div style={{
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap', 
              justifyContent: 'center'
            }}>
              <Button as={Link} to="/app/cuenta" variant="ghost" size="sm">
                👤 Mi Cuenta
              </Button>
              <Button as="a" href="tel:+5255123456" variant="ghost" size="sm">
                📞 Llamar a LeDuo
              </Button>
              <Button as="a" href="https://maps.google.com" target="_blank" variant="ghost" size="sm">
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
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '4rem', marginBottom: '16px'}}>
            {selectedWallet === 'apple' ? '📱' : '🤖'}
          </div>
          <h3 style={{marginBottom: '16px', color: '#686145'}}>
            Función disponible próximamente
          </h3>
          <p style={{marginBottom: '24px', lineHeight: 1.6}}>
            Estamos trabajando en la integración con {selectedWallet === 'apple' ? 'Apple' : 'Google'} Wallet. 
            Pronto podrás guardar tu tarjeta LeDuo directamente en tu dispositivo móvil.
          </p>
          <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '24px'}}>
            Por ahora, simplemente muestra tu app en caja para identificarte.
          </p>
          <Button onClick={() => setWalletModalOpen(false)} variant="primary">
            Entendido
          </Button>
        </div>
      </Modal>
    </AppWrapper>
  );
};