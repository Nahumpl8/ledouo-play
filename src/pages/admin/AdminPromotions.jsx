import React, { useState, useEffect } from 'react';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Send, Calendar, Settings, Plus, Trash2, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AdminPromotions = () => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Birthday config
  const [birthdayConfig, setBirthdayConfig] = useState({
    is_active: true,
    days_before_notification: 7,
    pre_birthday_message: '',
    pre_birthday_discount: 15,
    birthday_message: '',
    birthday_gift: '1 Galleta gratis',
    birthday_discount: 15
  });
  
  // Promotions
  const [promotions, setPromotions] = useState([]);
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    message: '',
    expires_at: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load birthday config
      const { data: configData } = await supabase
        .from('birthday_config')
        .select('*')
        .limit(1)
        .single();
      
      if (configData) {
        setBirthdayConfig(configData);
      }
      
      // Load promotions
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

  const createPromotion = async () => {
    if (!newPromotion.title || !newPromotion.message) {
      toast.error('Completa título y mensaje');
      return;
    }

    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('wallet_promotions').insert({
        title: newPromotion.title,
        message: newPromotion.message,
        target_type: 'all',
        is_active: true,
        expires_at: newPromotion.expires_at || null,
        created_by: user?.id
      });
      
      if (error) throw error;
      
      toast.success('Promoción creada');
      setNewPromotion({ title: '', message: '', expires_at: '' });
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
      
      const response = await fetch('/api/wallet/admin/send-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promotionId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Promoción enviada a ${result.notified} dispositivos`);
        loadData();
      } else {
        throw new Error(result.error);
      }
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

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Promociones</h1>
        <p className="text-muted-foreground mt-2">
          Administra las notificaciones de Apple Wallet y promociones de cumpleaños
        </p>
      </div>

      <Tabs defaultValue="birthday" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="birthday" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Cumpleaños
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Promociones
          </TabsTrigger>
        </TabsList>

        {/* Tab: Cumpleaños */}
        <TabsContent value="birthday" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración de Cumpleaños
                  </CardTitle>
                  <CardDescription>
                    Define los mensajes y beneficios para los cumpleañeros
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="birthday-active">Activo</Label>
                  <Switch
                    id="birthday-active"
                    checked={birthdayConfig.is_active}
                    onCheckedChange={(checked) => 
                      setBirthdayConfig(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pre-cumpleaños */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Notificación Pre-Cumpleaños
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Días antes del cumpleaños</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={birthdayConfig.days_before_notification}
                      onChange={(e) => 
                        setBirthdayConfig(prev => ({ 
                          ...prev, 
                          days_before_notification: parseInt(e.target.value) || 7 
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descuento pre-cumpleaños (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={birthdayConfig.pre_birthday_discount}
                      onChange={(e) => 
                        setBirthdayConfig(prev => ({ 
                          ...prev, 
                          pre_birthday_discount: parseInt(e.target.value) || 0 
                        }))
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Mensaje pre-cumpleaños</Label>
                  <Textarea
                    value={birthdayConfig.pre_birthday_message}
                    onChange={(e) => 
                      setBirthdayConfig(prev => ({ ...prev, pre_birthday_message: e.target.value }))
                    }
                    placeholder="🎂 ¡Tu semana especial se acerca!..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Día del cumpleaños */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Día del Cumpleaños
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Regalo de cumpleaños</Label>
                    <Input
                      value={birthdayConfig.birthday_gift}
                      onChange={(e) => 
                        setBirthdayConfig(prev => ({ ...prev, birthday_gift: e.target.value }))
                      }
                      placeholder="1 Galleta gratis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descuento cumpleaños (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={birthdayConfig.birthday_discount}
                      onChange={(e) => 
                        setBirthdayConfig(prev => ({ 
                          ...prev, 
                          birthday_discount: parseInt(e.target.value) || 0 
                        }))
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Mensaje de cumpleaños</Label>
                  <Textarea
                    value={birthdayConfig.birthday_message}
                    onChange={(e) => 
                      setBirthdayConfig(prev => ({ ...prev, birthday_message: e.target.value }))
                    }
                    placeholder="🎂 ¡Feliz Cumpleaños!..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={saveBirthdayConfig} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={triggerBirthdayCheck}
                  disabled={sending}
                >
                  {sending ? 'Verificando...' : 'Ejecutar Verificación Ahora'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Promociones */}
        <TabsContent value="promotions" className="space-y-6">
          {/* Crear promoción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nueva Promoción
              </CardTitle>
              <CardDescription>
                Crea una promoción para enviar a todos los usuarios con Apple Wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={newPromotion.title}
                    onChange={(e) => 
                      setNewPromotion(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="☕ Promoción Especial"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de expiración (opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={newPromotion.expires_at}
                    onChange={(e) => 
                      setNewPromotion(prev => ({ ...prev, expires_at: e.target.value }))
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Mensaje</Label>
                <Textarea
                  value={newPromotion.message}
                  onChange={(e) => 
                    setNewPromotion(prev => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Hoy 2x1 en todas las bebidas..."
                  rows={3}
                />
              </div>
              
              <Button onClick={createPromotion} disabled={saving}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Promoción
              </Button>
            </CardContent>
          </Card>

          {/* Lista de promociones */}
          <Card>
            <CardHeader>
              <CardTitle>Promociones Activas</CardTitle>
            </CardHeader>
            <CardContent>
              {promotions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay promociones creadas
                </p>
              ) : (
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <div 
                      key={promo.id} 
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold">{promo.title}</h4>
                        <p className="text-sm text-muted-foreground">{promo.message}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>
                            Creada: {format(new Date(promo.created_at), 'dd MMM yyyy', { locale: es })}
                          </span>
                          {promo.sent_at && (
                            <span className="text-green-600">
                              Enviada: {format(new Date(promo.sent_at), 'dd MMM HH:mm', { locale: es })}
                            </span>
                          )}
                          {promo.expires_at && (
                            <span>
                              Expira: {format(new Date(promo.expires_at), 'dd MMM yyyy', { locale: es })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!promo.sent_at && (
                          <Button 
                            size="sm" 
                            onClick={() => sendPromotion(promo.id)}
                            disabled={sending}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deletePromotion(promo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
};
