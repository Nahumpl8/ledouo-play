import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PageWrapper = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.bg || '#f8f6f3'};
`;

const FormCard = styled(Card)`
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fontPrimary || 'sans-serif'};
  color: ${props => props.theme.colors.primary || '#0f172a'};
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  background: #fee2e2;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: left;
`;

const SuccessMessage = styled.div`
  color: #059669;
  background: #d1fae5;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const LinkText = styled.p`
  margin-top: 1.5rem;
  color: ${props => props.theme.colors.text || '#334155'};
  font-size: 0.875rem;
  
  a {
    color: ${props => props.theme.colors.primary || '#0f172a'};
    text-decoration: none;
    font-weight: 600;
    
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
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificamos si hay sesión. El link mágico de Supabase inicia sesión automáticamente.
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Escuchamos cambios de estado por si acaso entra un segundo después.
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || session) {
              setCheckingSession(false);
            } else {
              setError('Enlace inválido o expirado.');
              setCheckingSession(false);
            }
          });

          return () => authListener.subscription.unsubscribe();
        } else {
          setCheckingSession(false);
        }
      } catch (err) {
        console.error(err);
        setError('Error verificando la sesión.');
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      toast.success("Contraseña actualizada correctamente");

      setTimeout(() => {
        navigate('/app');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Error al actualizar. Intenta de nuevo.');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <PageWrapper>
        {/* Aquí puedes usar tu componente Spinner si lo tienes importado */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </PageWrapper>
    );
  }

  if (success) {
    return (
      <PageWrapper>
        <Section>
          <FormCard>
            <Title>¡Todo listo! 🎉</Title>
            <SuccessMessage>
              Tu contraseña ha sido actualizada correctamente.
              <br />
              Te estamos redirigiendo...
            </SuccessMessage>
            <LinkText>
              <Link to="/app">Ir al inicio ahora →</Link>
            </LinkText>
          </FormCard>
        </Section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Section>
        <FormCard>
          <Title>Nueva contraseña</Title>
          <Subtitle>
            Crea una contraseña segura para tu cuenta Le Duo.
          </Subtitle>

          {error && (
            <ErrorMessage>
              ⚠️ {error} <br />
              {/* CORREGIDO: Ruta actualizada según tu Router */}
              <Link to="/app/forgot-password" style={{ fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                Solicitar nuevo enlace
              </Link>
            </ErrorMessage>
          )}

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
              disabled={!!error}
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirmar contraseña"
              placeholder="Repite tu nueva contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={!!error}
            />

            <Button type="submit" size="lg" disabled={loading || !!error}>
              {loading ? 'Guardando...' : 'Actualizar contraseña'}
            </Button>
          </Form>

          <LinkText>
            {/* CORREGIDO: Ruta actualizada según tu Router */}
            <Link to="/app/login">← Cancelar y volver</Link>
          </LinkText>
        </FormCard>
      </Section>
    </PageWrapper>
  );
};