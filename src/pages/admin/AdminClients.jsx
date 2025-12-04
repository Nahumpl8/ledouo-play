import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, User, Coffee, Star, History, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    
    &:focus {
      outline: none;
      border-color: #1e3932;
    }
  }
`;

const ClientsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ClientCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
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
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  
  .info {
    flex: 1;
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f1f1f;
    }
    
    p {
      margin: 0.25rem 0 0 0;
      font-size: 0.85rem;
      color: #666;
    }
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

const StatBox = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  
  .icon {
    margin-bottom: 0.5rem;
    color: #1e3932;
  }
  
  .value {
    font-size: 1.3rem;
    font-weight: 800;
    color: #1f1f1f;
  }
  
  .label {
    font-size: 0.7rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: #1e3932;
    color: white;
    
    &:hover {
      background: #2a4a42;
    }
  }
  
  &.secondary {
    background: #f0f0f0;
    color: #333;
    
    &:hover {
      background: #e5e5e5;
    }
  }
  
  &.danger {
    background: #fee;
    color: #c00;
    
    &:hover {
      background: #fcc;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  
  h3 {
    color: #333;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #666;
    margin: 0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem;
`;

export const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    try {
      // Fetch profiles with customer_state
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch customer states
      const { data: states, error: statesError } = await supabase
        .from('customer_state')
        .select('*');

      if (statesError) throw statesError;

      // Merge data
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

  const updateStamps = async (userId, currentStamps, delta) => {
    const newStamps = Math.max(0, Math.min(10, currentStamps + delta));
    
    try {
      const { error } = await supabase
        .from('customer_state')
        .update({ stamps: newStamps })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success(`Sellos actualizados: ${newStamps}`);
      fetchClients();
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
      fetchClients();
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
            {filteredClients.map(client => (
              <ClientCard key={client.id}>
                <ClientHeader>
                  <div className="avatar">
                    <User size={24} />
                  </div>
                  <div className="info">
                    <h3>{client.name}</h3>
                    <p>{client.email} {client.phone && `• ${client.phone}`}</p>
                  </div>
                </ClientHeader>

                <StatsRow>
                  <StatBox>
                    <div className="icon"><Coffee size={20} /></div>
                    <div className="value">{client.state?.stamps || 0}/10</div>
                    <div className="label">Sellos</div>
                  </StatBox>
                  <StatBox>
                    <div className="icon"><Star size={20} /></div>
                    <div className="value">{client.state?.cashback_points || 0}</div>
                    <div className="label">Puntos</div>
                  </StatBox>
                  <StatBox>
                    <div className="icon"><History size={20} /></div>
                    <div className="value">{client.state?.level_points || 0}</div>
                    <div className="label">Nivel</div>
                  </StatBox>
                </StatsRow>

                <ActionsRow>
                  <ActionButton 
                    className="primary"
                    onClick={() => updateStamps(client.id, client.state?.stamps || 0, 1)}
                  >
                    <Plus size={16} /> Sello
                  </ActionButton>
                  <ActionButton 
                    className="secondary"
                    onClick={() => updateStamps(client.id, client.state?.stamps || 0, -1)}
                  >
                    <Minus size={16} /> Sello
                  </ActionButton>
                  <ActionButton 
                    className="primary"
                    onClick={() => updatePoints(client.id, client.state?.cashback_points || 0, 10)}
                  >
                    <Plus size={16} /> 10 Pts
                  </ActionButton>
                  <ActionButton 
                    className="secondary"
                    onClick={() => updatePoints(client.id, client.state?.cashback_points || 0, -10)}
                  >
                    <Minus size={16} /> 10 Pts
                  </ActionButton>
                </ActionsRow>
              </ClientCard>
            ))}
          </ClientsGrid>
        )}
      </Container>
    </PageWrapper>
  );
};
