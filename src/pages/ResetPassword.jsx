import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { supabase } from '@/integrations/supabase/client';

const PageWrapper = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.bg};
`;

const FormCard = styled(Card)`
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fontPrimary};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  background: #fee2e2;
  padding: ${props => props.theme.spacing.sm};
  border-radius: 8px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  color: #059669;
  background: #d1fae5;
  padding: ${props => props.theme.spacing.md};
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
`;

const LinkText = styled.p`
  margin-top: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text};
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the recovery link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Enlace de recuperación inválido o expirado. Por favor solicita uno nuevo.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Redirect to app after 3 seconds
      setTimeout(() => {
        navigate('/app');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <PageWrapper>
        <Section>
          <FormCard size="lg">
            <Title>¡Contraseña actualizada!</Title>
            <SuccessMessage>
              ✅ Tu contraseña ha sido actualizada correctamente. 
              Serás redirigido a tu cuenta en unos segundos...
            </SuccessMessage>
            <LinkText>
              <Link to="/app">Ir a mi cuenta →</Link>
            </LinkText>
          </FormCard>
        </Section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Section>
        <FormCard size="lg">
          <Title>Nueva contraseña</Title>
          <p style={{marginBottom: '24px', color: '#666'}}>
            Ingresa tu nueva contraseña para tu cuenta de LeDuo.
          </p>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleSubmit}>
            <Input
              type="password"
              name="password"
              label="Nueva contraseña"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirmar contraseña"
              placeholder="Repite tu nueva contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </Form>

          <LinkText>
            <Link to="/app/login">← Volver al inicio de sesión</Link>
          </LinkText>
        </FormCard>
      </Section>
    </PageWrapper>
  );
};
