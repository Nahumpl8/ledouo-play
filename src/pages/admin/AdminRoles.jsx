import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Shield, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  background: hsl(var(--background));
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: hsl(var(--muted));
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: hsl(var(--foreground));
  
  &:hover {
    background: hsl(var(--accent));
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  background: hsl(var(--card));
  color: hsl(var(--foreground));
  font-size: 1rem;
  margin-bottom: 1.5rem;
  
  &::placeholder {
    color: hsl(var(--muted-foreground));
  }
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UserCard = styled.div`
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  padding: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--primary));
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
`;

const RoleSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const RoleLabel = styled.span`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-right: 0.5rem;
`;

const RoleSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
  }
`;

const CurrentRoles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const RoleBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch(props.$role) {
      case 'admin': return 'hsl(var(--destructive) / 0.1)';
      case 'staff': return 'hsl(var(--primary) / 0.1)';
      case 'admin_events': return 'hsl(142 76% 36% / 0.1)';
      default: return 'hsl(var(--muted))';
    }
  }};
  color: ${props => {
    switch(props.$role) {
      case 'admin': return 'hsl(var(--destructive))';
      case 'staff': return 'hsl(var(--primary))';
      case 'admin_events': return 'hsl(142 76% 36%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  }};
`;

const RemoveRoleButton = styled.button`
  background: none;
  border: none;
  color: hsl(var(--destructive));
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  margin-left: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AddRoleButton = styled.button`
  padding: 0.5rem 1rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: hsl(var(--muted-foreground));
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: hsl(var(--muted-foreground));
`;

const AdminRoles = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState({});

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin_events', label: 'Admin Eventos' },
    { value: 'customer', label: 'Cliente' }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .order('name');
      
      if (profilesError) throw profilesError;
      
      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      // Combine profiles with their roles
      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        roles: roles.filter(r => r.user_id === profile.id).map(r => r.role)
      }));
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addRole = async (userId, role) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) {
        if (error.code === '23505') {
          toast.error('El usuario ya tiene este rol');
          return;
        }
        throw error;
      }
      
      toast.success('Rol agregado correctamente');
      fetchUsers();
      setSelectedRoles(prev => ({ ...prev, [userId]: '' }));
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Error al agregar rol');
    }
  };

  const removeRole = async (userId, role) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
      
      toast.success('Rol eliminado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Error al eliminar rol');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailableRoles = (currentRoles) => {
    return roleOptions.filter(opt => !currentRoles.includes(opt.value));
  };

  if (loading) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={() => navigate('/app')}>
            <ArrowLeft size={20} />
          </BackButton>
          <Title>Gestión de Roles</Title>
        </Header>
        <LoadingState>Cargando usuarios...</LoadingState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/app')}>
          <ArrowLeft size={20} />
        </BackButton>
        <Title>Gestión de Roles</Title>
      </Header>

      <SearchInput
        type="text"
        placeholder="Buscar por nombre o email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredUsers.length === 0 ? (
        <EmptyState>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No se encontraron usuarios</p>
        </EmptyState>
      ) : (
        <UserList>
          {filteredUsers.map(user => (
            <UserCard key={user.id}>
              <UserInfo>
                <UserAvatar>
                  <User size={24} />
                </UserAvatar>
                <UserDetails>
                  <UserName>{user.name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserDetails>
              </UserInfo>
              
              <RoleSection>
                <RoleLabel>Agregar rol:</RoleLabel>
                <RoleSelect
                  value={selectedRoles[user.id] || ''}
                  onChange={(e) => setSelectedRoles(prev => ({ ...prev, [user.id]: e.target.value }))}
                >
                  <option value="">Seleccionar...</option>
                  {getAvailableRoles(user.roles).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </RoleSelect>
                <AddRoleButton
                  disabled={!selectedRoles[user.id]}
                  onClick={() => addRole(user.id, selectedRoles[user.id])}
                >
                  Agregar
                </AddRoleButton>
              </RoleSection>
              
              <CurrentRoles>
                {user.roles.length === 0 ? (
                  <RoleBadge $role="customer">Sin roles asignados</RoleBadge>
                ) : (
                  user.roles.map(role => (
                    <RoleBadge key={role} $role={role}>
                      <Shield size={12} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                      {roleOptions.find(r => r.value === role)?.label || role}
                      <RemoveRoleButton onClick={() => removeRole(user.id, role)}>
                        ✕
                      </RemoveRoleButton>
                    </RoleBadge>
                  ))
                )}
              </CurrentRoles>
            </UserCard>
          ))}
        </UserList>
      )}
    </PageContainer>
  );
};

export default AdminRoles;
