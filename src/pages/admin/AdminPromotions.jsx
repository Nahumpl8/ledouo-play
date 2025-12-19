import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Send, Calendar, Settings, Plus, Trash2, Bell, Users, MapPin, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- ESTILOS & TEMAS ---
const theme = {
  colors: {
    primary: '#1e3932', // Le Duo Green (más elegante)
    primaryForeground: '#ffffff',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    muted: '#f8fafc',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
    background: '#ffffff',
    foreground: '#0f172a',
    ring: '#94a3b8',
    inputBg: '#f8fafc',
  },
  radius: '0.75rem', // Bordes más redondeados y modernos
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

// --- KEYFRAMES ---
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- LAYOUT COMPONENTS ---

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${theme.colors.foreground};
  animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderSection = styled.div`
  margin-bottom: 2.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: ${theme.colors.foreground};
  letter-spacing: -0.025em;
`;

const Subtitle = styled.p`
  color: ${theme.colors.mutedForeground};
  margin-top: 0.75rem;
  font-size: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
`;

const Grid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FlexBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const FlexGap = styled.div`
  display: flex;
  gap: ${props => props.gap || '0.5rem'};
  align-items: center;
  flex-wrap: wrap;
`;

// --- UI COMPONENTS ---

const Card = styled.div`
  border-radius: ${theme.radius};
  border: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.background};
  box-shadow: ${theme.shadow};
  margin-bottom: 2rem;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${theme.shadowHover};
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.muted};
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${theme.colors.primary};
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.mutedForeground};
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.foreground};
`;

const StyledInput = styled.input`
  height: 2.75rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.inputBg};
  padding: 0 1rem;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    background-color: #fff;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 57, 50, 0.1); /* Sombra suave verde */
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const StyledSelect = styled.select`
  height: 2.75rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.inputBg};
  padding: 0 1rem;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-sizing: border-box;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;

  &:focus {
    outline: none;
    background-color: #fff;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 57, 50, 0.1);
  }
`;

const StyledTextarea = styled.textarea`
  min-height: 100px;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.inputBg};
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background-color: #fff;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 57, 50, 0.1);
  }
`;

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  height: 2.75rem;
  padding: 0 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  gap: 0.5rem;

  ${props => {
    if (props.variant === 'outline') return css`
      background-color: transparent;
      border-color: ${theme.colors.border};
      color: ${theme.colors.foreground};
      &:hover { 
        background-color: ${theme.colors.muted};
        border-color: ${theme.colors.foreground}; 
      }
    `;
    if (props.variant === 'destructive') return css`
      background-color: white;
      border-color: ${theme.colors.destructive};
      color: ${theme.colors.destructive};
      &:hover { 
        background-color: ${theme.colors.destructive};
        color: white;
      }
    `;
    return css`
      background-color: ${theme.colors.primary};
      color: ${theme.colors.primaryForeground};
      box-shadow: 0 4px 6px -1px rgba(30, 57, 50, 0.2);
      &:hover { 
        transform: translateY(-1px);
        box-shadow: 0 6px 8px -1px rgba(30, 57, 50, 0.3);
      }
      &:active {
        transform: translateY(0);
      }
    `;
  }}
  
  ${props => props.size === 'sm' && css`
    height: 2.25rem;
    padding: 0 0.875rem;
    font-size: 0.8rem;
  `}

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
  }
`;

// --- TABS COMPONENTS (CORREGIDO Y RESPONSIVE) ---

const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const TabsList = styled.div`
  display: flex; /* Flex para alinear */
  width: 100%;
  
  /* Responsive: Scroll horizontal suave */
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  
  /* Ocultar barra de scroll */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  gap: 0.5rem;
  padding: 0.25rem;
  background-color: ${theme.colors.muted};
  border-radius: 0.75rem;
  
  @media (min-width: 768px) {
    justify-content: center; /* En PC centrado */
  }
`;

const TabTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.5rem;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background-color: transparent;
  color: ${theme.colors.mutedForeground};
  transition: all 0.2s ease;
  flex-shrink: 0; /* Evita que se encoja en móviles */
  
  &:hover {
    color: ${theme.colors.foreground};
  }
  
  ${props => props.$active && css`
    background-color: ${theme.colors.background};
    color: ${theme.colors.primary};
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  `}
`;

// --- SWITCH COMPONENT ---

const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .3s cubic-bezier(0.4, 0.0, 0.2, 1);
  border-radius: 26px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s cubic-bezier(0.4, 0.0, 0.2, 1);
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  ${SwitchInput}:checked + & {
    background-color: ${theme.colors.primary};
  }

  ${SwitchInput}:checked + &:before {
    transform: translateX(22px);
  }
`;

// --- OTHER STYLES ---

const GrayBox = styled.div`
  background-color: ${theme.colors.muted};
  border-radius: 0.5rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.border};
    background-color: #f1f5f9;
  }
`;

const Spinner = styled.div`
  border: 3px solid ${theme.colors.muted};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  animation: ${spin} 0.8s linear infinite;
`;

const PromoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PromoItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius};
  background: #fff;
  transition: all 0.2s;
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadow};
  }
`;

const PromoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const PromoMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${theme.colors.mutedForeground};
  margin-top: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  
  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: ${theme.colors.muted};
    padding: 2px 8px;
    border-radius: 4px;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  background-color: ${theme.colors.muted};
  color: ${theme.colors.foreground};
  
  ${props => props.variant === 'audience' && css`
    background-color: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
  `}
`;

// --- MAIN COMPONENT ---

export const AdminPromotions = () => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('birthday');

  const [birthdayConfig, setBirthdayConfig] = useState({
    is_active: true,
    days_before_notification: 7,
    pre_birthday_message: '',
    pre_birthday_discount: 15,
    birthday_message: '',
    birthday_gift: '1 Galleta gratis',
    birthday_discount: 15,
    wallet_location_text: ''
  });

  const [promotions, setPromotions] = useState([]);
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    message: '',
    expires_at: '',
    target_type: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: configData } = await supabase.from('birthday_config').select('*').limit(1).single();
      if (configData) setBirthdayConfig(configData);

      const { data: promoData } = await supabase.from('wallet_promotions').select('*').order('created_at', { ascending: false });
      setPromotions(promoData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const saveBirthdayConfig = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.from('birthday_config').update({
        is_active: birthdayConfig.is_active,
        days_before_notification: birthdayConfig.days_before_notification,
        pre_birthday_message: birthdayConfig.pre_birthday_message,
        pre_birthday_discount: birthdayConfig.pre_birthday_discount,
        birthday_message: birthdayConfig.birthday_message,
        birthday_gift: birthdayConfig.birthday_gift,
        birthday_discount: birthdayConfig.birthday_discount
      }).eq('id', birthdayConfig.id);

      if (error) throw error;
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const saveLocationText = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.from('birthday_config').update({
        wallet_location_text: birthdayConfig.wallet_location_text
      }).eq('id', birthdayConfig.id);

      if (error) throw error;
      toast.success('Texto de ubicación actualizado');
    } catch (error) {
      toast.error('Error guardando texto');
    } finally {
      setSaving(false);
    }
  };

  const createPromotion = async () => {
    if (!newPromotion.title || !newPromotion.message) {
      toast.error('Por favor completa título y mensaje');
      return;
    }
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('wallet_promotions').insert({
        title: newPromotion.title,
        message: newPromotion.message,
        target_type: newPromotion.target_type,
        is_active: true,
        expires_at: newPromotion.expires_at || null,
        created_by: user?.id
      });
      if (error) throw error;
      toast.success('Promoción creada con éxito');
      setNewPromotion({ title: '', message: '', expires_at: '', target_type: 'all' });
      loadData();
    } catch (error) {
      toast.error('Error creando promoción');
    } finally {
      setSaving(false);
    }
  };

  const sendPromotion = async (promotionId) => {
    try {
      setSending(true);
      const appleResponse = await fetch('/api/wallet/admin/send-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promotionId })
      });
      const appleResult = await appleResponse.json();
      const { data: googleResult, error: googleError } = await supabase.functions.invoke('send-google-promotion', {
        body: { promotionId }
      });

      const appleNotified = appleResult.success ? appleResult.notified : 0;
      const googleNotified = googleResult?.notified || 0;

      toast.success(`Enviado: ${appleNotified} en Apple + ${googleNotified} en Google`);
      loadData();
    } catch (error) {
      toast.error('Error enviando promoción');
    } finally {
      setSending(false);
    }
  };

  const deletePromotion = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta promoción?')) return;
    try {
      const { error } = await supabase.from('wallet_promotions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Promoción eliminada');
      loadData();
    } catch (error) {
      toast.error('Error eliminando promoción');
    }
  };

  const triggerBirthdayCheck = async () => {
    try {
      setSending(true);
      const { data, error } = await supabase.functions.invoke('birthday-check');
      if (error) throw error;
      toast.success(`Check completado: ${data.birthdayNotifications} notificaciones enviadas`);
    } catch (error) {
      toast.error('Error ejecutando verificación');
    } finally {
      setSending(false);
    }
  };

  const getTargetLabel = (type) => {
    switch (type) {
      case 'new_users': return 'Nuevos (1 sello)';
      case 'near_reward': return 'Cerca del premio (6-7)';
      case 'inactive': return 'Inactivos (30 días)';
      default: return 'Todos los usuarios';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '60vh', alignItems: 'center', gap: '1rem', color: theme.colors.mutedForeground }}>
          <Spinner />
          <p>Cargando panel...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Title>Centro de Promociones</Title>
        <Subtitle>
          Gestiona las experiencias de tus clientes a través de Apple Wallet y Google Wallet
        </Subtitle>
      </HeaderSection>

      <TabsContainer>
        <TabsList>
          <TabTrigger
            $active={activeTab === 'birthday'}
            onClick={() => setActiveTab('birthday')}
          >
            <Gift size={18} style={{ marginRight: '0.5rem' }} />
            Cumpleaños
          </TabTrigger>
          <TabTrigger
            $active={activeTab === 'promotions'}
            onClick={() => setActiveTab('promotions')}
          >
            <Bell size={18} style={{ marginRight: '0.5rem' }} />
            Promociones
          </TabTrigger>
          <TabTrigger
            $active={activeTab === 'location'}
            onClick={() => setActiveTab('location')}
          >
            <MapPin size={18} style={{ marginRight: '0.5rem' }} />
            Geolocalización
          </TabTrigger>
        </TabsList>

        {/* Tab: Cumpleaños */}
        {activeTab === 'birthday' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <Card>
              <CardHeader>
                <FlexBetween>
                  <div>
                    <CardTitle>
                      <Settings size={22} />
                      Configuración Automática
                    </CardTitle>
                    <CardDescription>
                      Gestiona los beneficios automáticos para cumpleañeros
                    </CardDescription>
                  </div>
                  <FlexGap>
                    <Label htmlFor="birthday-active" style={{ cursor: 'pointer' }}>Activar sistema</Label>
                    <SwitchWrapper>
                      <SwitchInput
                        id="birthday-active"
                        type="checkbox"
                        checked={birthdayConfig.is_active}
                        onChange={(e) =>
                          setBirthdayConfig(prev => ({ ...prev, is_active: e.target.checked }))
                        }
                      />
                      <Slider />
                    </SwitchWrapper>
                  </FlexGap>
                </FlexBetween>
              </CardHeader>
              <CardContent>
                <GrayBox>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: theme.colors.primary }}>
                    <Calendar size={20} />
                    La Previa (Semana antes)
                  </h3>
                  <Grid>
                    <FormGroup>
                      <Label>Días de anticipación</Label>
                      <StyledInput
                        type="number"
                        min="1"
                        max="30"
                        value={birthdayConfig.days_before_notification}
                        onChange={(e) => setBirthdayConfig(prev => ({ ...prev, days_before_notification: parseInt(e.target.value) || 7 }))}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Descuento especial (%)</Label>
                      <StyledInput
                        type="number"
                        min="0"
                        max="100"
                        value={birthdayConfig.pre_birthday_discount}
                        onChange={(e) => setBirthdayConfig(prev => ({ ...prev, pre_birthday_discount: parseInt(e.target.value) || 0 }))}
                      />
                    </FormGroup>
                  </Grid>
                  <FormGroup>
                    <Label>Mensaje de notificación</Label>
                    <StyledTextarea
                      value={birthdayConfig.pre_birthday_message}
                      onChange={(e) => setBirthdayConfig(prev => ({ ...prev, pre_birthday_message: e.target.value }))}
                      placeholder="🎂 ¡Tu semana especial se acerca! Ven y celébralo con nosotros..."
                    />
                  </FormGroup>
                </GrayBox>

                <GrayBox>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: theme.colors.primary }}>
                    <Gift size={20} />
                    El Gran Día
                  </h3>
                  <Grid>
                    <FormGroup>
                      <Label>Regalo directo</Label>
                      <StyledInput
                        value={birthdayConfig.birthday_gift}
                        onChange={(e) => setBirthdayConfig(prev => ({ ...prev, birthday_gift: e.target.value }))}
                        placeholder="Ej: 1 Bebida Gratis"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Descuento adicional (%)</Label>
                      <StyledInput
                        type="number"
                        min="0"
                        max="100"
                        value={birthdayConfig.birthday_discount}
                        onChange={(e) => setBirthdayConfig(prev => ({ ...prev, birthday_discount: parseInt(e.target.value) || 0 }))}
                      />
                    </FormGroup>
                  </Grid>
                  <FormGroup>
                    <Label>Mensaje de felicitación</Label>
                    <StyledTextarea
                      value={birthdayConfig.birthday_message}
                      onChange={(e) => setBirthdayConfig(prev => ({ ...prev, birthday_message: e.target.value }))}
                      placeholder="🎉 ¡Feliz Cumpleaños! Hoy tu regalo te espera en Le Duo..."
                    />
                  </FormGroup>
                </GrayBox>

                <div style={{ paddingTop: '1rem', borderTop: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <StyledButton variant="outline" onClick={triggerBirthdayCheck} disabled={sending}>
                    {sending ? 'Verificando...' : 'Probar Verificación'}
                  </StyledButton>
                  <StyledButton onClick={saveBirthdayConfig} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </StyledButton>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Promociones */}
        {activeTab === 'promotions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease-out' }}>

            {/* Crear promoción */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Plus size={22} />
                  Crear Campaña
                </CardTitle>
                <CardDescription>
                  Envía notificaciones push a los pases digitales de tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Grid>
                  <FormGroup>
                    <Label>Audiencia</Label>
                    <StyledSelect
                      value={newPromotion.target_type}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, target_type: e.target.value }))}
                    >
                      <option value="all">🌍 Todos los usuarios</option>
                      <option value="new_users">🌱 Nuevos (1 sello)</option>
                      <option value="near_reward">🔥 Cerca del premio (6-7 sellos)</option>
                      <option value="inactive">💤 Inactivos (30 días sin visita)</option>
                    </StyledSelect>
                  </FormGroup>
                  <FormGroup>
                    <Label>Vence el (opcional)</Label>
                    <StyledInput
                      type="datetime-local"
                      value={newPromotion.expires_at}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, expires_at: e.target.value }))}
                    />
                  </FormGroup>
                </Grid>

                <FormGroup>
                  <Label>Título de la notificación</Label>
                  <StyledInput
                    value={newPromotion.title}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: ☕ ¡Hoy 2x1 en Lattes!"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Mensaje del pase</Label>
                  <StyledTextarea
                    value={newPromotion.message}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe los detalles de la promoción..."
                  />
                </FormGroup>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <StyledButton onClick={createPromotion} disabled={saving}>
                    {saving ? 'Creando...' : 'Crear Campaña'} <ChevronRight size={16} />
                  </StyledButton>
                </div>
              </CardContent>
            </Card>

            {/* Lista de promociones */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: theme.colors.foreground }}>Historial de Campañas</h3>
              {promotions.length === 0 ? (
                <Card>
                  <div style={{ textAlign: 'center', padding: '3rem', color: theme.colors.mutedForeground }}>
                    <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No has creado ninguna campaña aún.</p>
                  </div>
                </Card>
              ) : (
                <PromoList>
                  {promotions.map((promo) => (
                    <PromoItem key={promo.id}>
                      <PromoInfo>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0, color: theme.colors.primary }}>{promo.title}</h4>
                          <Badge variant="audience">
                            <Users size={12} style={{ marginRight: '4px' }} />
                            {getTargetLabel(promo.target_type)}
                          </Badge>
                        </div>

                        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{promo.message}</p>

                        <PromoMeta>
                          <span>Created: {format(new Date(promo.created_at), 'dd MMM', { locale: es })}</span>
                          {promo.sent_at ? (
                            <span style={{ color: '#16a34a', fontWeight: 600 }}>
                              ✅ Enviada: {format(new Date(promo.sent_at), 'dd MMM HH:mm', { locale: es })}
                            </span>
                          ) : (
                            <span style={{ color: '#d97706' }}>⏳ Borrador</span>
                          )}
                        </PromoMeta>
                      </PromoInfo>

                      <FlexGap gap="0.75rem" style={{ marginTop: '1rem' }}>
                        {!promo.sent_at && (
                          <StyledButton
                            size="sm"
                            onClick={() => sendPromotion(promo.id)}
                            disabled={sending}
                          >
                            <Send size={14} /> Enviar Ahora
                          </StyledButton>
                        )}
                        <StyledButton
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePromotion(promo.id)}
                        >
                          <Trash2 size={14} />
                        </StyledButton>
                      </FlexGap>
                    </PromoItem>
                  ))}
                </PromoList>
              )}
            </div>
          </div>
        )}

        {/* Tab: Ubicación */}
        {activeTab === 'location' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <Card>
              <CardHeader>
                <CardTitle>
                  <MapPin size={22} />
                  Geolocalización
                </CardTitle>
                <CardDescription>
                  Configura el mensaje que aparece cuando un cliente pasa cerca de tu local (Solo Apple Wallet)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GrayBox>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#e2e8f0', padding: '0.5rem', borderRadius: '8px' }}>
                      <MapPin size={24} color="#475569" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                        Sucursal Principal (Roma Norte)
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: theme.colors.mutedForeground, margin: 0, fontFamily: 'monospace' }}>
                        19.41608, -99.16274
                      </p>
                    </div>
                  </div>
                </GrayBox>

                <FormGroup>
                  <Label>Mensaje de proximidad</Label>
                  <StyledTextarea
                    value={birthdayConfig.wallet_location_text || ''}
                    onChange={(e) => setBirthdayConfig(prev => ({ ...prev, wallet_location_text: e.target.value }))}
                    placeholder="🍵 ¿Antojo de Matcha? ¡Estás en Le Duo! Entra y suma puntos ✨"
                    style={{ fontSize: '1.1rem' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: theme.colors.mutedForeground, marginTop: '0.5rem' }}>
                    💡 Tip: Usa emojis y preguntas para captar la atención. Este mensaje aparece en la pantalla de bloqueo.
                  </p>
                </FormGroup>

                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                  <div style={{
                    width: '300px',
                    background: 'url(https://images.unsplash.com/photo-1556656793-02715d8dd6f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80)',
                    backgroundSize: 'cover',
                    borderRadius: '24px',
                    padding: '1rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}></div>

                    <div style={{ position: 'relative', zIndex: 10, color: 'white', marginTop: '40px' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '12px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '8px', background: '#333',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                        }}>
                          ☕
                        </div>
                        <div>
                          <p style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, margin: 0 }}>AHORA</p>
                          <p style={{ fontSize: '13px', fontWeight: 600, margin: '2px 0 0 0', lineHeight: 1.2 }}>
                            {birthdayConfig.wallet_location_text || '🍵 ¿Antojo de Matcha? ¡Estás en Le Duo!'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ height: '300px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <StyledButton onClick={saveLocationText} disabled={saving}>
                    {saving ? 'Guardando...' : 'Actualizar Mensaje'}
                  </StyledButton>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContainer>
    </PageContainer>
  );
};

export default AdminPromotions;