import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, User, Coffee, Star, History, Plus, Minus, Cake } from 'lucide-react'; // Agregamos Cake
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// --- STYLES ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1f1f1f;
    margin: 0 0 1rem 0;
  }
`;

const SearchBox = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
  
  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 2px solid #eee;
    border-radius: 14px;
    font-size: 1rem;
    background: white;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #1e3932;
      box-shadow: 0 4px 12px rgba(30, 57, 50, 0.1);
    }
  }
`;

const ClientsGrid = styled.div`
  display: grid;
  gap: 1.25rem;
  margin-top: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas en PC */
  }
`;

const ClientCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    border-color: #e2e8f0;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }
`;

const ClientHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
  
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1e3932 0%, #2d5a4e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    font-size: 1.2rem;
  }
  
  .info {
    flex: 1;
    min-width: 0; /* Para que el texto se corte bien */
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f1f1f;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .contact {
      margin: 0.25rem 0 0 0;
      font-size: 0.8rem;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .birthday-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 0.4rem;
      font-size: 0.75rem;
      color: #b8860b; /* Color dorado suave */
      background: #fff9e6;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
    }
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const StatBox = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0.75rem;
  text-align: center;
  border: 1px solid #f1f5f9;
  
  .icon {
    margin-bottom: 0.25rem;
    color: #1e3932;
    opacity: 0.8;
  }
  
  .value {
    font-size: 1.2rem;
    font-weight: 800;
    color: #1f1f1f;
    line-height: 1.2;
  }
  
  .label {
    font-size: 0.65rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: #1e3932;
    color: white;
    &:hover { background: #2a4a42; }
    &:active { transform: scale(0.98); }
  }
  
  &.secondary {
    background: white;
    border-color: #e2e8f0;
    color: #64748b;
    &:hover { background: #f8fafc; border-color: #cbd5e1; color: #333; }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  
  h3 { color: #333; margin: 0 0 0.5rem 0; }
  p { color: #666; margin: 0; }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #666;
`;

// --- HELPER FUNCTIONS ---

// Función para formatear cumpleaños y edad
const formatBirthdayInfo = (dobString) => {
  if (!dobString) return null;

  try {
    const dob = new Date(dobString);
    const today = new Date();

    // Calcular edad
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    // Formatear fecha (Ej: "7 de Enero")
    const dateStr = dob.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });

    // Capitalizar mes
    const formattedDate = dateStr.replace(/\b\w/g, l => l.toUpperCase());

    return `${formattedDate} • ${age} Años`;
  } catch (e) {
    return null;
  }
};

export const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    try {
      // 1. Obtener perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // 2. Obtener estado (puntos/sellos)
      const { data: states, error: statesError } = await supabase
        .from('customer_state')
        .select('*');

      if (statesError) throw statesError;

      // 3. Unir datos
      const merged = profiles?.map(profile => ({
        ...profile,
        state: states?.find(s => s.user_id === profile.id) || null
      })) || [];

      setClients(merged);
    } catch (err) {
      console.error('Error fetching clients:', err);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Función para dar sello y notificar
  const updateStamps = async (userId, currentStamps, delta, clientName) => {
    const newStamps = Math.max(0, Math.min(10, currentStamps + delta));

    try {
      // 1. Actualizar DB
      const { error } = await supabase
        .from('customer_state')
        .update({ stamps: newStamps })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(`Sellos actualizados: ${newStamps}`);

      // 2. Enviar Notificación Push (Solo si aumentamos sellos)
      if (delta > 0) {
        try {
          // Invocamos la Edge Function para enviar push a Apple/Google Wallet
          await supabase.functions.invoke('send-wallet-notification', {
            body: {
              userId: userId,
              title: '¡Ganaste un Sello! ☕',
              message: `¡Felicidades ${clientName.split(' ')[0]}! Tienes ${newStamps}/10 sellos. Estás más cerca de tu bebida gratis. 💚`
            }
          });
          // Nota: No bloqueamos la UI esperando la notificación, es "fire and forget"
        } catch (notifError) {
          console.error('Error enviando notificación:', notifError);
        }
      }

      // 3. Recargar lista localmente (optimistic update sería mejor, pero esto es seguro)
      setClients(prev => prev.map(c =>
        c.id === userId
          ? { ...c, state: { ...c.state, stamps: newStamps } }
          : c
      ));

    } catch (err) {
      console.error('Error updating stamps:', err);
      toast.error('Error al actualizar sellos');
    }
  };

  const updatePoints = async (userId, currentPoints, delta) => {
    const newPoints = Math.max(0, currentPoints + delta);

    try {
      const { error } = await supabase
        .from('customer_state')
        .update({ cashback_points: newPoints })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(`Puntos actualizados: ${newPoints}`);

      // Actualizamos estado local para que se sienta instantáneo
      setClients(prev => prev.map(c =>
        c.id === userId
          ? { ...c, state: { ...c.state, cashback_points: newPoints } }
          : c
      ));

    } catch (err) {
      console.error('Error updating points:', err);
      toast.error('Error al actualizar puntos');
    }
  };

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(search) ||
      client.email?.toLowerCase().includes(search) ||
      client.phone?.includes(search)
    );
  });

  if (loading) {
    return (
      <PageWrapper>
        <Container>
          <LoadingState>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando cartera de clientes...</p>
          </LoadingState>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container>
        <Header>
          <h1>Gestión de Clientes</h1>
          <SearchBox>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </Header>

        {filteredClients.length === 0 ? (
          <EmptyState>
            <h3>No hay clientes</h3>
            <p>{searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'Aún no hay clientes registrados.'}</p>
          </EmptyState>
        ) : (
          <ClientsGrid>
            {filteredClients.map(client => {
              const birthdayInfo = formatBirthdayInfo(client.dob); // Usamos la nueva función

              return (
                <ClientCard key={client.id}>
                  <ClientHeader>
                    <div className="avatar">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="info">
                      <h3>{client.name}</h3>
                      <p className="contact">{client.email}</p>
                      {client.phone && <p className="contact">{client.phone}</p>}

                      {/* --- NUEVO: Badge de Cumpleaños --- */}
                      {birthdayInfo && (
                        <div className="birthday-badge">
                          <Cake size={12} />
                          {birthdayInfo}
                        </div>
                      )}
                    </div>
                  </ClientHeader>

                  <StatsRow>
                    <StatBox>
                      <div className="icon"><Coffee size={18} /></div>
                      <div className="value">{client.state?.stamps || 0}/10</div>
                      <div className="label">Sellos</div>
                    </StatBox>
                    <StatBox>
                      <div className="icon"><Star size={18} /></div>
                      <div className="value">{client.state?.cashback_points || 0}</div>
                      <div className="label">Puntos</div>
                    </StatBox>
                    <StatBox>
                      <div className="icon"><History size={18} /></div>
                      <div className="value">{client.state?.level_points || 0}</div>
                      <div className="label">Nivel</div>
                    </StatBox>
                  </StatsRow>

                  <ActionsRow>
                    <ActionButton
                      className="secondary"
                      onClick={() => updateStamps(client.id, client.state?.stamps || 0, -1, client.name)}
                    >
                      <Minus size={14} />
                    </ActionButton>
                    <ActionButton
                      className="primary"
                      style={{ flex: 2 }} // Botón de sumar más grande
                      onClick={() => updateStamps(client.id, client.state?.stamps || 0, 1, client.name)}
                    >
                      <Plus size={16} /> Sello
                    </ActionButton>

                    <div style={{ width: '1px', background: '#eee', margin: '0 4px' }}></div>

                    <ActionButton
                      className="secondary"
                      onClick={() => updatePoints(client.id, client.state?.cashback_points || 0, -10)}
                    >
                      <Minus size={14} />
                    </ActionButton>
                    <ActionButton
                      className="primary"
                      style={{ background: '#b8860b' }} // Dorado para puntos
                      onClick={() => updatePoints(client.id, client.state?.cashback_points || 0, 10)}
                    >
                      <Plus size={16} /> Pts
                    </ActionButton>
                  </ActionsRow>
                </ClientCard>
              );
            })}
          </ClientsGrid>
        )}
      </Container>
    </PageWrapper>
  );
};