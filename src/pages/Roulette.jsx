import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Crown, Trophy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const LEGEND_THRESHOLD = 150;

const RouletteWrapper = styled.div`
  min-height: 80vh;
  background: ${props => props.theme.colors.bg};
`;

const RouletteContainer = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: ${props => props.theme.spacing.md};
  
  &:hover {
    opacity: 0.8;
  }
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

const LockedOverlay = styled.div`
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

const LockBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1e3932;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: ${props => props.theme.spacing.md};
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.3);
`;

const LockTitle = styled.h2`
  font-family: ${props => props.theme.fontPrimary};
  color: ${props => props.theme.colors.primary};
  font-size: 1.6rem;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const LockText = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  max-width: 320px;
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProgressCard = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  padding: ${props => props.theme.spacing.lg};
  width: 100%;
  max-width: 350px;
  
  h4 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: ${props => props.theme.colors.primary};
    margin: 0 0 ${props => props.theme.spacing.md} 0;
  }
  
  .progress-bar {
    height: 16px;
    background: #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FFD700, #FFA500);
    border-radius: 8px;
    transition: width 0.5s ease;
  }
  
  .stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: ${props => props.theme.colors.secondary};
    margin-bottom: ${props => props.theme.spacing.md};
    
    strong {
      color: ${props => props.theme.colors.primary};
    }
  }
  
  .tips {
    text-align: left;
    border-top: 1px solid #eee;
    padding-top: ${props => props.theme.spacing.sm};
    
    h5 {
      font-size: 0.85rem;
      color: ${props => props.theme.colors.primary};
      margin: 0 0 8px 0;
    }
    
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

const WheelContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto ${props => props.theme.spacing.lg} auto;
  opacity: ${props => props.$locked ? 0.4 : 1};
  filter: ${props => props.$locked ? 'grayscale(50%)' : 'none'};

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
  transform: rotate(${props => props.$rotation}deg);
`;

const Segment = styled.div`
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: 100% 100%;
  transform: rotate(${props => props.$angle}deg);
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${props => props.$color};
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
  background: ${props => props.$canSpin 
    ? 'linear-gradient(135deg, #10B981, #059669)' 
    : props.theme.colors.bgAlt};
  color: ${props => props.$canSpin ? props.theme.colors.white : props.theme.colors.text};
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const PrizeCard = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radius};
  border: 2px solid ${props => props.$color};
  text-align: center;
  
  .prize-icon {
    font-size: 1.5rem;
    margin-bottom: 4px;
    display: block;
  }
  
  .prize-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: ${props => props.$color};
  }
`;

const LegendBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1e3932;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: ${props => props.theme.spacing.md};
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
`;

const segments = [
  { color: '#FF6B6B', label: '50 puntos', icon: '💰', type: 'points', value: 50 },
  { color: '#4ECDC4', label: '1 sello', icon: '🎯', type: 'stamp', value: 1 },
  { color: '#45B7D1', label: '100 puntos', icon: '💎', type: 'points', value: 100 },
  { color: '#96CEB4', label: 'Café gratis', icon: '☕', type: 'coffee', value: 1 },
  { color: '#FECA57', label: '25 puntos', icon: '⭐', type: 'points', value: 25 },
  { color: '#FF9FF3', label: '20% desc.', icon: '🎁', type: 'discount', value: 20 }
];

export const Roulette = () => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserState();
  }, []);

  const loadUserState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data: customerState } = await supabase
        .from('customer_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setState(customerState || { level_points: 0, roulette_last_spin_at: null });
    } catch (error) {
      console.error('Error loading state:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLegend = (state?.level_points || 0) >= LEGEND_THRESHOLD;
  const levelPoints = state?.level_points || 0;
  const progressPercent = Math.min((levelPoints / LEGEND_THRESHOLD) * 100, 100);
  const pointsToLegend = Math.max(0, LEGEND_THRESHOLD - levelPoints);

  const canSpinRoulette = () => {
    if (!isLegend) return false;
    if (!state?.roulette_last_spin_at) return true;
    
    const lastSpin = new Date(state.roulette_last_spin_at);
    const now = new Date();
    const daysSinceLastSpin = Math.floor((now - lastSpin) / (1000 * 60 * 60 * 24));
    
    return daysSinceLastSpin >= 7;
  };

  const getStatusText = () => {
    if (!isLegend) {
      return {
        icon: '🔒',
        text: 'Ruleta bloqueada',
        detail: 'Solo para clientes Leduo Leyend'
      };
    }
    
    if (canSpinRoulette()) {
      return {
        icon: '🎰',
        text: '¡Listo para girar!',
        detail: 'Haz clic en el botón para ganar premios increíbles'
      };
    }
    
    const lastSpin = new Date(state.roulette_last_spin_at);
    const nextSpin = new Date(lastSpin);
    nextSpin.setDate(nextSpin.getDate() + 7);
    const daysUntilNext = Math.ceil((nextSpin - new Date()) / (1000 * 60 * 60 * 24));
    
    return {
      icon: '⏰',
      text: 'Ruleta en cooldown',
      detail: `Podrás girar nuevamente en ${daysUntilNext} día${daysUntilNext !== 1 ? 's' : ''}`
    };
  };

  const handleSpin = async () => {
    if (!canSpinRoulette() || spinning) return;
    
    setSpinning(true);
    
    try {
      // Random result
      const resultIndex = Math.floor(Math.random() * segments.length);
      const reward = segments[resultIndex];
      
      // Calculate spin angle (multiple rotations + landing on result)
      const segmentAngle = 360 / segments.length;
      const targetAngle = 360 - (resultIndex * segmentAngle) - (segmentAngle / 2);
      const spinAngle = 1800 + targetAngle; // 5 full rotations + target
      
      const finalRotation = rotation + spinAngle;
      setRotation(finalRotation);
      
      setTimeout(async () => {
        setLastResult(reward);
        setResultModalOpen(true);
        setSpinning(false);
        
        // Update database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const updates = {
            roulette_last_spin_at: new Date().toISOString(),
            roulette_visits_since_last_spin: 0
          };
          
          // Add reward based on type
          if (reward.type === 'points') {
            updates.cashback_points = (state.cashback_points || 0) + reward.value;
          } else if (reward.type === 'stamp') {
            updates.stamps = Math.min((state.stamps || 0) + reward.value, 8);
          }
          
          await supabase
            .from('customer_state')
            .update(updates)
            .eq('user_id', user.id);
          
          // Also save reward to rewards table
          await supabase
            .from('rewards')
            .insert({
              user_id: user.id,
              type: reward.type,
              value: String(reward.value),
              description: reward.label,
              source: 'roulette',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            });
          
          // Refresh state
          loadUserState();
        }
      }, 3000);
      
    } catch (error) {
      setSpinning(false);
      console.error('Error spinning roulette:', error);
      toast.error('Error al girar la ruleta');
    }
  };

  if (loading) {
    return (
      <RouletteWrapper>
        <Section>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Cargando...</p>
          </div>
        </Section>
      </RouletteWrapper>
    );
  }

  const canSpin = canSpinRoulette();
  const status = getStatusText();

  return (
    <RouletteWrapper>
      <Section>
        <RouletteContainer>
          <BackButton onClick={() => navigate('/app')}>
            <ArrowLeft size={20} />
            Volver
          </BackButton>

          <Title>🎰 Ruleta LeDuo</Title>
          
          {isLegend && (
            <LegendBadge>
              <Crown size={16} />
              Leduo Leyend
            </LegendBadge>
          )}
          
          <RouletteCard>
            {/* Locked Overlay for non-Legend users */}
            {!isLegend && (
              <LockedOverlay>
                <LockBadge>
                  <Lock size={20} />
                  Exclusivo Leyend
                </LockBadge>
                <LockTitle>
                  🌟 ¡Conviértete en Leduo Leyend!
                </LockTitle>
                <LockText>
                  La ruleta está disponible exclusivamente para nuestros clientes más fieles.
                </LockText>
                
                <ProgressCard>
                  <h4><Trophy size={18} /> Tu progreso</h4>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="stats">
                    <span><strong>{levelPoints}</strong> / {LEGEND_THRESHOLD} pts</span>
                    <span>Faltan <strong>{pointsToLegend}</strong> pts</span>
                  </div>
                  <div className="tips">
                    <h5>¿Cómo subir de nivel?</h5>
                    <p>💰 Cada $10 de compra = 1 punto</p>
                    <p>🎯 Completa sellos para bonus</p>
                    <p>⭐ Los Leyend giran 1 vez/semana</p>
                  </div>
                </ProgressCard>
                
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/app')}
                  style={{ marginTop: '16px' }}
                >
                  Ver mi progreso
                </Button>
              </LockedOverlay>
            )}
            
            {isLegend && (
              <StatusCard $canSpin={canSpin}>
                <span className="status-icon">{status.icon}</span>
                <div className="status-text">{status.text}</div>
                <div className="status-detail">{status.detail}</div>
              </StatusCard>
            )}

            <WheelContainer $locked={!isLegend}>
              <Pointer />
              <Wheel $rotation={rotation}>
                {segments.map((segment, index) => (
                  <Segment
                    key={index}
                    $angle={index * 60}
                    $color={segment.color}
                  >
                    <div className="segment-text">
                      {segment.icon} {segment.label}
                    </div>
                  </Segment>
                ))}
              </Wheel>
            </WheelContainer>

            {isLegend && (
              <Button
                onClick={handleSpin}
                disabled={!canSpin || spinning}
                size="lg"
                variant={canSpin ? "primary" : "outline"}
                style={{ width: '100%' }}
              >
                {spinning ? '🎰 Girando...' : canSpin ? '🎰 ¡Girar Ruleta!' : '⏰ Volver pronto'}
              </Button>
            )}
          </RouletteCard>

          <Card>
            <h3 style={{textAlign: 'center', marginBottom: '16px', color: '#686145'}}>
              Premios disponibles
            </h3>
            <PrizesGrid>
              {segments.map((segment, index) => (
                <PrizeCard key={index} $color={segment.color}>
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
              {lastResult.icon}
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
