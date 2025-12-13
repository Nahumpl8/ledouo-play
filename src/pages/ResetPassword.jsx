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
    let mounted = true;

    const handleAuthCheck = async () => {
      // 1. REVISAR SI HAY ERROR EXPLÍCITO EN URL
      const hash = window.location.hash;
      if (hash && hash.includes('error=')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDescription = params.get('error_description') || 'Enlace inválido';
        if (mounted) {
          setError(errorDescription.replace(/\+/g, ' '));
          setCheckingSession(false);
        }
        return;
      }

      // 2. INTENTO DE RECUPERACIÓN MANUAL (El truco para Strict Mode)
      // A veces el cliente automático falla, así que buscamos el token nosotros mismos.
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (!sessionError && mounted) {
              setCheckingSession(false);
              return; // ¡Éxito manual!
            }
          } catch (e) {
            console.error("Error manual setting session:", e);
          }
        }
      }

      // 3. REVISIÓN ESTÁNDAR DE SESIÓN
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mounted) {
        setCheckingSession(false);
        return;
      }

      // 4. ESCUCHAR CAMBIOS (Para flujos más lentos)
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        // Aceptamos PASSWORD_RECOVERY o simplemente SIGNED_IN (a veces el evento varía)
        if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
          if (mounted) {
            setCheckingSession(false);
            setError('');
          }
        }
      });

      // 5. TIMEOUT EXTENDIDO (4 segundos para móviles lentos)
      setTimeout(async () => {
        if (!mounted) return;
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          setError('No pudimos verificar tu sesión. El enlace puede haber expirado.');
          setCheckingSession(false);
        }
      }, 4000); // Aumentamos a 4 segundos

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    };

    handleAuthCheck();
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
        {/* Spinner visual simple */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{
            border: '3px solid #e5e5e5',
            borderTop: '3px solid #333',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Verificando enlace...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
            <Link to="/app/login">← Cancelar y volver</Link>
          </LinkText>
        </FormCard>
      </Section>
    </PageWrapper>
  );
};