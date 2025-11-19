import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { SetupPinModal } from '../components/staff/SetupPinModal';
import { supabase } from '@/integrations/supabase/client';
import { customerStorage, stateStorage } from '../lib/storage';

const AccountWrapper = styled.div`
  min-height: 80vh;
  background: ${props => props.theme.colors.bg};
`;

const AccountContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fontPrimary};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const ProfileCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  .icon {
    font-size: 1.5rem;
  }
  
  h2 {
    color: ${props => props.theme.colors.primary};
    margin: 0;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FullWidthField = styled.div`
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-column: 1 / -1;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.sm};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.bgAlt};
  border-radius: ${props => props.theme.radius};
  
  .icon {
    font-size: 1.5rem;
  }
  
  .content {
    .value {
      font-weight: bold;
      color: ${props => props.theme.colors.primary};
    }
    
    .label {
      font-size: 0.8rem;
      color: ${props => props.theme.colors.text};
      opacity: 0.7;
    }
  }
`;

const SuccessMessage = styled.div`
  background: #dcfce7;
  color: #166534;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radius};
  margin-bottom: ${props => props.theme.spacing.md};
  text-align: center;
  font-weight: 500;
`;

const InfoBox = styled.div`
  background: ${props => props.theme.colors.bgAlt};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radius};
  margin-top: ${props => props.theme.spacing.lg};
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p {
    margin-bottom: ${props => props.theme.spacing.sm};
    line-height: 1.5;
  }
  
  ul {
    padding-left: 20px;
    
    li {
      margin-bottom: 4px;
      line-height: 1.4;
    }
  }
`;

export const Account = () => {
  const [customer, setCustomer] = useState(customerStorage.get() || {});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  
  const state = stateStorage.get();

  useEffect(() => {
    checkStaffStatus();
  }, []);

  const checkStaffStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Check if user is staff or admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['staff', 'admin']);

    if (roles && roles.length > 0) {
      setIsStaff(true);

      // Check if PIN is configured
      const { data: profile } = await supabase
        .from('profiles')
        .select('staff_pin')
        .eq('id', user.id)
        .single();

      setHasPin(!!profile?.staff_pin);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to localStorage
      customerStorage.set(customer);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCustomer(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculate roulette status
  const getRouletteNextSpin = () => {
    if (!state.roulette.lastSpinAt) return 'Disponible ahora';
    
    const lastSpin = new Date(state.roulette.lastSpinAt);
    const now = new Date();
    const daysSinceLastSpin = Math.floor((now - lastSpin) / (1000 * 60 * 60 * 24));
    
    if (state.roulette.mode === 'weekly') {
      const daysUntilNext = state.roulette.cooldownDays - daysSinceLastSpin;
      if (daysUntilNext <= 0) return 'Disponible ahora';
      return `En ${daysUntilNext} día${daysUntilNext !== 1 ? 's' : ''}`;
    } else {
      const visitsNeeded = state.roulette.requiredVisits - state.roulette.visitsSinceLastSpin;
      if (visitsNeeded <= 0) return 'Disponible ahora';
      return `Faltan ${visitsNeeded} visita${visitsNeeded !== 1 ? 's' : ''}`;
    }
  };

  return (
    <AccountWrapper>
      <Section>
        <AccountContainer>
          <Title>👤 Mi Cuenta</Title>

          {/* Profile Information */}
          <ProfileCard size="lg">
            <CardHeader>
              <span className="icon">📝</span>
              <h2>Información Personal</h2>
            </CardHeader>

            {showSuccess && (
              <SuccessMessage>
                ✅ Información actualizada correctamente
              </SuccessMessage>
            )}

            <Form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="name"
                label="Nombre completo"
                placeholder="Tu nombre"
                value={customer.name || ''}
                onChange={handleChange}
                required
              />
              
              <Input
                type="email"
                name="email"
                label="Correo electrónico"
                placeholder="tu@email.com"
                value={customer.email || ''}
                onChange={handleChange}
                required
              />
              
              <Input
                type="tel"
                name="phone"
                label="Número de celular"
                placeholder="+52 55 1234 5678"
                value={customer.phone || ''}
                onChange={handleChange}
                required
              />
              
              <Select
                name="sex"
                label="Sexo"
                value={customer.sex || ''}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero-no-decir">Prefiero no decir</option>
              </Select>

              <FullWidthField>
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? 'Guardando...' : '💾 Guardar cambios'}
                </Button>
              </FullWidthField>
            </Form>
          </ProfileCard>

          {/* Account Statistics */}
          <ProfileCard size="lg">
            <CardHeader>
              <span className="icon">📊</span>
              <h2>Estadísticas de mi cuenta</h2>
            </CardHeader>

            <StatsGrid>
              <StatItem>
                <span className="icon">💰</span>
                <div className="content">
                  <div className="value">{state.cashbackPoints}</div>
                  <div className="label">Puntos cashback</div>
                </div>
              </StatItem>

              <StatItem>
                <span className="icon">🎯</span>
                <div className="content">
                  <div className="value">{state.stamps}/10</div>
                  <div className="label">Sellos</div>
                </div>
              </StatItem>

              <StatItem>
                <span className="icon">📅</span>
                <div className="content">
                  <div className="value">{formatJoinDate(customer.createdAt)}</div>
                  <div className="label">Miembro desde</div>
                </div>
              </StatItem>

              <StatItem>
                <span className="icon">🎰</span>
                <div className="content">
                  <div className="value">{getRouletteNextSpin()}</div>
                  <div className="label">Próxima ruleta</div>
                </div>
              </StatItem>
            </StatsGrid>
          </ProfileCard>

          {/* Staff PIN Configuration */}
          {isStaff && (
            <ProfileCard size="lg">
              <CardHeader>
                <span className="icon">🔐</span>
                <h2>PIN de Seguridad</h2>
              </CardHeader>

              <InfoBox>
                <p>
                  {hasPin 
                    ? 'Tu PIN de seguridad está configurado. Lo necesitas para autorizar ventas en el sistema de escaneo.'
                    : 'Configura un PIN de 4-6 dígitos para autorizar ventas. Este PIN será requerido cada vez que proceses una compra.'
                  }
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowPinModal(true)}
                  style={{ marginTop: '16px' }}
                >
                  {hasPin ? '🔄 Cambiar PIN' : '🔒 Configurar PIN'}
                </Button>
              </InfoBox>
            </ProfileCard>
          )}

          {/* Account Information */}
          <Card size="lg">
            <CardHeader>
              <span className="icon">ℹ️</span>
              <h2>Información de la cuenta</h2>
            </CardHeader>

            <InfoBox>
              <h3>🎯 Sobre tu programa de lealtad</h3>
              <p>
                <strong>Estado:</strong> Cuenta activa<br />
                <strong>ID de cliente:</strong> #{customer.id || 'No asignado'}<br />
                <strong>Fuente de registro:</strong> {customer.source === 'qr' ? 'Código QR en tienda' : 'En línea'}
              </p>

              <h3>🏆 Cómo ganar más puntos</h3>
              <ul>
                <li>Visita la cafetería regularmente para acumular sellos</li>
                <li>Gana puntos con cada compra (5% de cashback)</li>
                <li>Gira la ruleta semanalmente para premios especiales</li>
                <li>Participa en eventos y promociones exclusivas</li>
              </ul>

              <h3>📱 Consejos</h3>
              <ul>
                <li>Agrega tu tarjeta LeDuo a tu wallet móvil</li>
                <li>Revisa tu app antes de cada visita</li>
                <li>No olvides canjear tus puntos por recompensas</li>
              </ul>
            </InfoBox>
          </Card>
        </AccountContainer>
      </Section>

      <SetupPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowSuccess(true);
          setHasPin(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }}
        hasExistingPin={hasPin}
      />
    </AccountWrapper>
  );
};