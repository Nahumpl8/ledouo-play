import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Send, Calendar, Settings, Plus, Trash2, Bell, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- ESTILOS & TEMAS ---
const theme = {
  colors: {
    primary: '#0f172a',
    primaryForeground: '#ffffff',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
    background: '#ffffff',
    foreground: '#0f172a',
    ring: '#94a3b8',
  },
  radius: '0.5rem',
};

// --- KEYFRAMES ---
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// --- LAYOUT COMPONENTS ---

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: ${theme.colors.foreground};
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: ${theme.colors.foreground};
`;

const Subtitle = styled.p`
  color: ${theme.colors.mutedForeground};
  margin-top: 0.5rem;
  font-size: 1rem;
`;

const Grid = styled.div`
  display: grid;
  gap: 1rem;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.mutedForeground};
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  padding-top: 0;
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
  font-weight: 500;
  line-height: 1;
`;

const StyledInput = styled.input`
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid ${theme.colors.border};
  background-color: transparent;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }
`;

// --- NUEVO COMPONENTE: SELECT ---
const StyledSelect = styled.select`
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid ${theme.colors.border};
  background-color: transparent;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  appearance: none; /* Quita el estilo default del navegador */
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem top 50%;
  background-size: 0.65rem auto;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }
`;

const StyledTextarea = styled.textarea`
  min-height: 80px;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid ${theme.colors.border};
  background-color: transparent;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }
`;

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  height: 2.5rem;
  padding: 0 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  /* Variantes */
  ${props => {
    if (props.variant === 'outline') return css`
      background-color: transparent;
      border-color: ${theme.colors.border};
      color: ${theme.colors.foreground};
      &:hover { background-color: ${theme.colors.muted}; }
    `;
    if (props.variant === 'destructive') return css`
      background-color: ${theme.colors.destructive};
      color: ${theme.colors.destructiveForeground};
      &:hover { opacity: 0.9; }
    `;
    return css`
      background-color: ${theme.colors.primary};
      color: ${theme.colors.primaryForeground};
      &:hover { opacity: 0.9; }
    `;
  }}
  
  ${props => props.size === 'sm' && css`
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.75rem;
  `}

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;

// --- TABS COMPONENTS ---

const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TabsList = styled.div`
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background-color: ${theme.colors.muted};
  padding: 0.25rem;
  color: ${theme.colors.mutedForeground};
  width: fit-content;
`;

const TabTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.2rem;
  padding: 0.25rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  background-color: transparent;
  color: inherit;
  transition: all 0.2s;
  
  ${props => props.$active && css`
    background-color: ${theme.colors.background};
    color: ${theme.colors.foreground};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  `}
`;

// --- SWITCH COMPONENT ---

const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
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
  background-color: ${theme.colors.border};
  transition: .4s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  ${SwitchInput}:checked + & {
    background-color: ${theme.colors.primary};
  }

  ${SwitchInput}:checked + &:before {
    transform: translateX(20px);
  }
`;

// --- OTHER STYLES ---

const GrayBox = styled.div`
  background-color: ${theme.colors.muted};
  border-radius: ${theme.radius};
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Spinner = styled.div`
  border: 2px solid ${theme.colors.muted};
  border-top: 2px solid ${theme.colors.primary};
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: ${spin} 1s linear infinite;
`;

const PromoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PromoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius};
`;

const PromoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PromoMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${theme.colors.mutedForeground};
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${theme.colors.muted};
  color: ${theme.colors.foreground};
  
  /* Badge variants */
  ${props => props.variant === 'audience' && css`
    background-color: #dbeafe; /* blue-100 */
    color: #1e40af; /* blue-800 */
  `}
`;

// --- MAIN COMPONENT ---

export const AdminPromotions = () => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('birthday');
  
  // Birthday config
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
  
  // Promotions State
  const [promotions, setPromotions] = useState([]);
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    message: '',
    expires_at: '',
    target_type: 'all' // --- NUEVO: Estado para la audiencia ---
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: configData } = await supabase
        .from('birthday_config')
        .select('*')
        .limit(1)
        .single();
      
      if (configData) {
        setBirthdayConfig(configData);
      }
      
      const { data: promoData } = await supabase
        .from('wallet_promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
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
      const { error } = await supabase
        .from('birthday_config')
        .update({
          is_active: birthdayConfig.is_active,
          days_before_notification: birthdayConfig.days_before_notification,
          pre_birthday_message: birthdayConfig.pre_birthday_message,
          pre_birthday_discount: birthdayConfig.pre_birthday_discount,
          birthday_message: birthdayConfig.birthday_message,
          birthday_gift: birthdayConfig.birthday_gift,
          birthday_discount: birthdayConfig.birthday_discount
        })
        .eq('id', birthdayConfig.id);
      
      if (error) throw error;
      toast.success('Configuración guardada');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const saveLocationText = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('birthday_config')
        .update({
          wallet_location_text: birthdayConfig.wallet_location_text
        })
        .eq('id', birthdayConfig.id);
      
      if (error) throw error;
      toast.success('Texto de ubicación guardado');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const createPromotion = async () => {
    if (!newPromotion.title || !newPromotion.message) {
      toast.error('Completa título y mensaje');
      return;
    }

    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // --- MODIFICADO: Ahora guardamos el target_type ---
      const { error } = await supabase.from('wallet_promotions').insert({
        title: newPromotion.title,
        message: newPromotion.message,
        target_type: newPromotion.target_type, 
        is_active: true,
        expires_at: newPromotion.expires_at || null,
        created_by: user?.id
      });
      
      if (error) throw error;
      
      toast.success('Promoción creada');
      // Reseteamos el formulario
      setNewPromotion({ title: '', message: '', expires_at: '', target_type: 'all' });
      loadData();
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Error creando promoción');
    } finally {
      setSaving(false);
    }
  };

  const sendPromotion = async (promotionId) => {
    try {
      setSending(true);
      
      // Enviar a Apple Wallet (servidor externo)
      const appleResponse = await fetch('/api/wallet/admin/send-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promotionId })
      });
      
      const appleResult = await appleResponse.json();
      
      // Enviar a Google Wallet (edge function)
      const { data: googleResult, error: googleError } = await supabase.functions.invoke('send-google-promotion', {
        body: { promotionId }
      });
      
      if (googleError) {
        console.error('Error enviando a Google Wallet:', googleError);
      }

      const appleNotified = appleResult.success ? appleResult.notified : 0;
      const googleNotified = googleResult?.notified || 0;
      
      toast.success(`Promoción enviada: ${appleNotified} Apple + ${googleNotified} Google Wallet`);
      loadData();
    } catch (error) {
      console.error('Error sending promotion:', error);
      toast.error('Error enviando promoción');
    } finally {
      setSending(false);
    }
  };

  const deletePromotion = async (id) => {
    try {
      const { error } = await supabase
        .from('wallet_promotions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Promoción eliminada');
      loadData();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Error eliminando promoción');
    }
  };

  const triggerBirthdayCheck = async () => {
    try {
      setSending(true);
      const { data, error } = await supabase.functions.invoke('birthday-check');
      if (error) throw error;
      toast.success(`Verificación completada: ${data.preBirthdayNotifications} pre-cumple, ${data.birthdayNotifications} cumpleaños`);
    } catch (error) {
      console.error('Error triggering birthday check:', error);
      toast.error('Error ejecutando verificación');
    } finally {
      setSending(false);
    }
  };

  // Helper para mostrar etiqueta legible de audiencia
  const getTargetLabel = (type) => {
    switch(type) {
      case 'new_users': return 'Nuevos (1 sello)';
      case 'near_reward': return 'Cerca del premio (6-7)';
      case 'inactive': return 'Inactivos (30 días)';
      default: return 'Todos';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', height: '16rem', alignItems: 'center' }}>
          <Spinner />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Title>Gestión de Promociones</Title>
        <Subtitle>
          Administra las notificaciones de Apple Wallet, Google Wallet y promociones de cumpleaños
        </Subtitle>
      </HeaderSection>

      <TabsContainer>
        <TabsList>
          <TabTrigger 
            $active={activeTab === 'birthday'} 
            onClick={() => setActiveTab('birthday')}
          >
            <Gift size={16} style={{ marginRight: '0.5rem' }} />
            Cumpleaños
          </TabTrigger>
          <TabTrigger 
            $active={activeTab === 'promotions'} 
            onClick={() => setActiveTab('promotions')}
          >
            <Bell size={16} style={{ marginRight: '0.5rem' }} />
            Promociones
          </TabTrigger>
          <TabTrigger 
            $active={activeTab === 'location'} 
            onClick={() => setActiveTab('location')}
          >
            <MapPin size={16} style={{ marginRight: '0.5rem' }} />
            Ubicación
          </TabTrigger>
        </TabsList>

        {/* Tab: Cumpleaños */}
        {activeTab === 'birthday' && (
          <Card>
            <CardHeader>
              <FlexBetween>
                <div>
                  <CardTitle>
                    <Settings size={20} />
                    Configuración de Cumpleaños
                  </CardTitle>
                  <CardDescription>
                    Define los mensajes y beneficios para los cumpleañeros
                  </CardDescription>
                </div>
                <FlexGap>
                  <Label htmlFor="birthday-active">Activo</Label>
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
              {/* Contenido de Cumpleaños (Igual que antes) */}
              <GrayBox>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Calendar size={16} />
                  Notificación Pre-Cumpleaños
                </h3>
                <Grid>
                  <FormGroup>
                    <Label>Días antes del cumpleaños</Label>
                    <StyledInput
                      type="number"
                      min="1"
                      max="30"
                      value={birthdayConfig.days_before_notification}
                      onChange={(e) => setBirthdayConfig(prev => ({ ...prev, days_before_notification: parseInt(e.target.value) || 7 }))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Descuento pre-cumpleaños (%)</Label>
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
                  <Label>Mensaje pre-cumpleaños</Label>
                  <StyledTextarea
                    value={birthdayConfig.pre_birthday_message}
                    onChange={(e) => setBirthdayConfig(prev => ({ ...prev, pre_birthday_message: e.target.value }))}
                    placeholder="🎂 ¡Tu semana especial se acerca!..."
                    rows={3}
                  />
                </FormGroup>
              </GrayBox>

              <GrayBox>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Gift size={16} />
                  Día del Cumpleaños
                </h3>
                <Grid>
                  <FormGroup>
                    <Label>Regalo de cumpleaños</Label>
                    <StyledInput
                      value={birthdayConfig.birthday_gift}
                      onChange={(e) => setBirthdayConfig(prev => ({ ...prev, birthday_gift: e.target.value }))}
                      placeholder="1 Galleta gratis"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Descuento cumpleaños (%)</Label>
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
                  <Label>Mensaje de cumpleaños</Label>
                  <StyledTextarea
                    value={birthdayConfig.birthday_message}
                    onChange={(e) => setBirthdayConfig(prev => ({ ...prev, birthday_message: e.target.value }))}
                    placeholder="🎂 ¡Feliz Cumpleaños!..."
                    rows={3}
                  />
                </FormGroup>
              </GrayBox>

              <FlexGap gap="1rem">
                <StyledButton onClick={saveBirthdayConfig} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </StyledButton>
                <StyledButton variant="outline" onClick={triggerBirthdayCheck} disabled={sending}>
                  {sending ? 'Verificando...' : 'Ejecutar Verificación Ahora'}
                </StyledButton>
              </FlexGap>
            </CardContent>
          </Card>
        )}

        {/* Tab: Promociones */}
        {activeTab === 'promotions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Crear promoción */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Plus size={20} />
                  Nueva Promoción
                </CardTitle>
                <CardDescription>
                  Crea una promoción para enviar a todos los usuarios con Apple Wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* --- NUEVA SECCIÓN DE AUDIENCIA --- */}
                <Grid>
                  <FormGroup>
                    <Label>Audiencia Objetivo</Label>
                    <StyledSelect
                      value={newPromotion.target_type}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, target_type: e.target.value }))}
                    >
                      <option value="all">Todos los usuarios</option>
                      <option value="new_users">Nuevos (1 sello)</option>
                      <option value="near_reward">Cerca del premio (6-7 sellos)</option>
                      <option value="inactive">Inactivos (30 días sin visita)</option>
                    </StyledSelect>
                  </FormGroup>
                  <FormGroup>
                    <Label>Fecha de expiración (opcional)</Label>
                    <StyledInput
                      type="datetime-local"
                      value={newPromotion.expires_at}
                      onChange={(e) => 
                        setNewPromotion(prev => ({ ...prev, expires_at: e.target.value }))
                      }
                    />
                  </FormGroup>
                </Grid>

                <Grid>
                  <FormGroup>
                    <Label>Título</Label>
                    <StyledInput
                      value={newPromotion.title}
                      onChange={(e) => 
                        setNewPromotion(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="☕ Promoción Especial"
                    />
                  </FormGroup>
                </Grid>
                
                <FormGroup>
                  <Label>Mensaje</Label>
                  <StyledTextarea
                    value={newPromotion.message}
                    onChange={(e) => 
                      setNewPromotion(prev => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Hoy 2x1 en todas las bebidas..."
                    rows={3}
                  />
                </FormGroup>
                
                <div>
                  <StyledButton onClick={createPromotion} disabled={saving}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Crear Promoción
                  </StyledButton>
                </div>
              </CardContent>
            </Card>

            {/* Lista de promociones */}
            <Card>
              <CardHeader>
                <CardTitle>Promociones Activas</CardTitle>
              </CardHeader>
              <CardContent>
                {promotions.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: theme.colors.mutedForeground }}>
                    No hay promociones creadas
                  </p>
                ) : (
                  <PromoList>
                    {promotions.map((promo) => (
                      <PromoItem key={promo.id}>
                        <PromoInfo>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <h4 style={{ fontWeight: 600, margin: 0 }}>{promo.title}</h4>
                            {/* --- MOSTRAR AUDIENCIA --- */}
                            <Badge variant="audience">
                              <Users size={12} style={{ marginRight: '4px' }}/>
                              {getTargetLabel(promo.target_type)}
                            </Badge>
                          </div>
                          
                          <p style={{ fontSize: '0.875rem', color: theme.colors.mutedForeground, margin: '0.5rem 0' }}>{promo.message}</p>
                          <PromoMeta>
                            <span>
                              Creada: {format(new Date(promo.created_at), 'dd MMM yyyy', { locale: es })}
                            </span>
                            {promo.sent_at && (
                              <span style={{ color: '#16a34a' }}>
                                Enviada: {format(new Date(promo.sent_at), 'dd MMM HH:mm', { locale: es })}
                              </span>
                            )}
                            {promo.expires_at && (
                              <span>
                                Expira: {format(new Date(promo.expires_at), 'dd MMM yyyy', { locale: es })}
                              </span>
                            )}
                          </PromoMeta>
                        </PromoInfo>
                        <FlexGap gap="0.5rem">
                          {!promo.sent_at && (
                            <StyledButton 
                              size="sm" 
                              onClick={() => sendPromotion(promo.id)}
                              disabled={sending}
                            >
                              <Send size={14} style={{ marginRight: '0.25rem' }} />
                              Enviar
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Ubicación */}
        {activeTab === 'location' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <MapPin size={20} />
                Notificación por Ubicación
              </CardTitle>
              <CardDescription>
                Mensaje que aparece en la pantalla de bloqueo del iPhone cuando el usuario está cerca de Le Duo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GrayBox>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  📍 Coordenadas de Le Duo
                </h3>
                <p style={{ fontSize: '0.875rem', color: theme.colors.mutedForeground, margin: 0 }}>
                  Lat: 19.41608, Long: -99.16274 (Coahuila 111, Roma Norte, CDMX)
                </p>
              </GrayBox>
              
              <FormGroup>
                <Label>Mensaje de notificación</Label>
                <StyledTextarea
                  value={birthdayConfig.wallet_location_text || ''}
                  onChange={(e) => setBirthdayConfig(prev => ({ ...prev, wallet_location_text: e.target.value }))}
                  placeholder="🍵 ¿Antojo de Matcha o Café? ¡Estás cerca de Le Duo! Ven y disfruta ✨"
                  rows={3}
                />
                <p style={{ fontSize: '0.75rem', color: theme.colors.mutedForeground, marginTop: '0.25rem' }}>
                  Este mensaje aparece cuando el usuario con Apple Wallet está a ~100m de Le Duo
                </p>
              </FormGroup>

              <GrayBox>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>📱 Vista previa (iPhone Lock Screen)</h4>
                <div style={{ 
                  background: 'linear-gradient(to bottom, #1a1a1a, #2a2a2a)', 
                  borderRadius: '12px', 
                  padding: '1rem',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: 'rgb(212, 197, 185)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      ☕
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>Tarjeta de Lealtad</p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: '0.25rem 0 0 0' }}>
                        {birthdayConfig.wallet_location_text || '🍵 ¿Antojo de Matcha o Café? ¡Estás cerca de Le Duo! Ven y disfruta ✨'}
                      </p>
                    </div>
                  </div>
                </div>
              </GrayBox>

              <StyledButton onClick={saveLocationText} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Texto'}
              </StyledButton>
            </CardContent>
          </Card>
        )}
      </TabsContainer>
    </PageContainer>
  );
};

export default AdminPromotions;