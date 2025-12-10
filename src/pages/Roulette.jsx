import React, { useState } from 'react';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { stateStorage } from '../lib/storage';
import { mockAPI } from '../services/api';
import { Clock, Sparkles } from 'lucide-react';

const RouletteWrapper = styled.div`
  min-height: 80vh;
  background: ${props => props.theme.colors.bg};
`;

const RouletteContainer = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fontPrimary};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const RouletteCard = styled(Card)`
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
`;

const ComingSoonOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.98) 100%
  );
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: ${props => props.theme.spacing.xl};
`;

const ComingSoonBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #1e3932 0%, #2d5a4e 100%);
  color: white;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: ${props => props.theme.spacing.md};
  box-shadow: 0 8px 30px rgba(30, 57, 50, 0.3);
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
`;

const ComingSoonTitle = styled.h2`
  font-family: ${props => props.theme.fontPrimary};
  color: ${props => props.theme.colors.primary};
  font-size: 1.8rem;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ComingSoonText = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  max-width: 320px;
  line-height: 1.6;
  opacity: 0.8;
`;

const WheelContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto ${props => props.theme.spacing.lg} auto;
  opacity: 0.4;
  filter: grayscale(50%);

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    width: 280px;
    height: 280px;
  }
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 220px;
    height: 220px;
  }
`;

const Wheel = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 8px solid ${props => props.theme.colors.primary};
  box-shadow: ${props => props.theme.shadow};
  transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  transform: rotate(${props => props.rotation}deg);
`;

const Segment = styled.div`
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: 100% 100%;
  transform: rotate(${props => props.angle}deg);
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${props => props.color};
    clip-path: polygon(0 0, 100% 0, 0 100%);
  }
  
  .segment-text {
    position: absolute;
    z-index: 5;
    left: 50%;
    top: 50%;
    transform:
      rotate(-30deg)
      translate(45px, -30px)
      rotate(30deg);
    font-size: 10px;
    font-weight: bold;
    color: ${props => props.theme.colors.white};
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    white-space: nowrap;
    pointer-events: none;
  }
`;

const Pointer = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 30px solid ${props => props.theme.colors.primary};
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
`;

const StatusCard = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.bgAlt};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.radius};
  margin-bottom: ${props => props.theme.spacing.lg};
  
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

const PrizesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const PrizeCard = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radius};
  border: 2px solid ${props => props.color};
  text-align: center;
  
  .prize-icon {
    font-size: 1.5rem;
    margin-bottom: 4px;
    display: block;
  }
  
  .prize-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: ${props => props.color};
  }
`;

const segments = [
  { color: '#FF6B6B', label: '50 puntos', icon: '💰' },
  { color: '#4ECDC4', label: '1 sello', icon: '🎯' },
  { color: '#45B7D1', label: '100 puntos', icon: '💎' },
  { color: '#96CEB4', label: 'Café gratis', icon: '☕' },
  { color: '#FECA57', label: '25 puntos', icon: '⭐' },
  { color: '#FF9FF3', label: '20% desc.', icon: '🎁' }
];

// Feature flag - set to false to enable roulette
const ROULETTE_COMING_SOON = true;

export const Roulette = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  const state = stateStorage.get();

  const canSpinRoulette = () => {
    if (ROULETTE_COMING_SOON) return false;
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

  const getStatusText = () => {
    if (ROULETTE_COMING_SOON) {
      return {
        icon: '🚧',
        text: 'Próximamente',
        detail: 'Estamos preparando algo increíble para ti'
      };
    }
    
    if (canSpinRoulette()) {
      return {
        icon: '🎰',
        text: '¡Listo para girar!',
        detail: 'Haz clic en el botón para ganar premios increíbles'
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
        detail: `Podrás girar nuevamente en ${daysUntilNext} día${daysUntilNext !== 1 ? 's' : ''}`
      };
    } else {
      const visitsNeeded = state.roulette.requiredVisits - state.roulette.visitsSinceLastSpin;
      return {
        icon: '📍',
        text: 'Acumula más visitas',
        detail: `Te faltan ${visitsNeeded} visita${visitsNeeded !== 1 ? 's' : ''} para poder girar`
      };
    }
  };

  const handleSpin = async () => {
    if (!canSpinRoulette() || spinning) return;
    
    setSpinning(true);
    
    try {
      const response = await mockAPI.spinRoulette();
      const { reward, spinAngle } = response.data;
      
      const finalRotation = rotation + spinAngle;
      setRotation(finalRotation);
      
      setTimeout(() => {
        setLastResult(reward);
        setResultModalOpen(true);
        setSpinning(false);
        
        const currentState = stateStorage.get();
        const updates = {
          roulette: {
            ...currentState.roulette,
            lastSpinAt: new Date().toISOString(),
            visitsSinceLastSpin: 0
          }
        };
        
        if (reward.type === 'points') {
          updates.cashbackPoints = currentState.cashbackPoints + reward.value;
        } else if (reward.type === 'stamp') {
          updates.stamps = Math.min(currentState.stamps + reward.value, 10);
        }
        
        stateStorage.update(updates);
      }, 3000);
      
    } catch (error) {
      setSpinning(false);
      console.error('Error spinning roulette:', error);
    }
  };

  const canSpin = canSpinRoulette();
  const status = getStatusText();

  return (
    <RouletteWrapper>
      <Section>
        <RouletteContainer>
          <Title>🎰 Ruleta LeDuo</Title>
          
          <RouletteCard>
            {/* Coming Soon Overlay */}
            {ROULETTE_COMING_SOON && (
              <ComingSoonOverlay>
                <ComingSoonBadge>
                  <Clock size={20} />
                  Próximamente
                </ComingSoonBadge>
                <ComingSoonTitle>
                  <Sparkles size={24} style={{ display: 'inline', marginRight: 8 }} />
                  ¡Algo increíble viene!
                </ComingSoonTitle>
                <ComingSoonText>
                  Estamos preparando la ruleta de premios para que puedas ganar recompensas exclusivas. 
                  ¡Mantente atento!
                </ComingSoonText>
              </ComingSoonOverlay>
            )}
            
            <StatusCard canSpin={canSpin}>
              <span className="status-icon">{status.icon}</span>
              <div className="status-text">{status.text}</div>
              <div className="status-detail">{status.detail}</div>
            </StatusCard>

            <WheelContainer>
              <Pointer />
              <Wheel rotation={rotation}>
                {segments.map((segment, index) => (
                  <Segment
                    key={index}
                    angle={index * 60}
                    color={segment.color}
                  >
                    <div className="segment-text">
                      {segment.icon} {segment.label}
                    </div>
                  </Segment>
                ))}
              </Wheel>
            </WheelContainer>

            <Button
              onClick={handleSpin}
              disabled={!canSpin || spinning}
              size="lg"
              variant="outline"
            >
              {ROULETTE_COMING_SOON ? '🚧 Próximamente' : spinning ? '🎰 Girando...' : canSpin ? '🎰 ¡Girar Ruleta!' : '⏰ No disponible'}
            </Button>
          </RouletteCard>

          <Card>
            <h3 style={{textAlign: 'center', marginBottom: '16px', color: '#686145'}}>
              Premios disponibles
            </h3>
            <PrizesGrid>
              {segments.map((segment, index) => (
                <PrizeCard key={index} color={segment.color}>
                  <span className="prize-icon">{segment.icon}</span>
                  <div className="prize-label">{segment.label}</div>
                </PrizeCard>
              ))}
            </PrizesGrid>
          </Card>
        </RouletteContainer>
      </Section>

      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="🎉 ¡Felicidades!"
        maxWidth="400px"
      >
        {lastResult && (
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '4rem', marginBottom: '16px'}}>
              {lastResult.type === 'points' ? '💰' : 
               lastResult.type === 'stamp' ? '🎯' : '🎁'}
            </div>
            <h3 style={{marginBottom: '16px', color: '#686145'}}>
              ¡Ganaste!
            </h3>
            <p style={{fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px'}}>
              {lastResult.label}
            </p>
            <p style={{marginBottom: '24px', lineHeight: 1.6}}>
              Tu premio ha sido agregado automáticamente a tu cuenta. 
              ¡Gracias por ser parte de LeDuo!
            </p>
            <Button 
              onClick={() => setResultModalOpen(false)} 
              variant="primary"
              size="lg"
            >
              ¡Genial!
            </Button>
          </div>
        )}
      </Modal>
    </RouletteWrapper>
  );
};
