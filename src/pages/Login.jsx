import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { supabase } from '../integrations/supabase/client';

const LoginWrapper = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.bg};
`;

const LoginCard = styled(Card)`
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

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  // Verificar sesión existente
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate(from, { replace: true });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session && event === 'SIGNED_IN') {
        navigate(from, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Correo o contraseña incorrectos');
        }
        throw signInError;
      }

      if (!data.session) {
        throw new Error('No se pudo iniciar sesión');
      }

      // La navegación se manejará automáticamente por onAuthStateChange
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      setError(err.message || 'Error al iniciar sesión. Intenta de nuevo.');
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


  return (
    <LoginWrapper>
      <Section>
        <LoginCard size="lg">
          <Title>Ingresar a LeDuo</Title>
          <p style={{marginBottom: '24px', color: '#666'}}>
            Accede a tu cuenta para ver tus puntos, sellos y beneficios.
          </p>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Input
              type="password"
              name="password"
              label="Contraseña"
              placeholder="Tu contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Form>

          <LinkText>
            ¿No tienes cuenta? <Link to="/#registrate">Regístrate en tienda</Link>
          </LinkText>
          
          <LinkText>
            <Link to="/">← Volver al inicio</Link>
          </LinkText>
        </LoginCard>
      </Section>
    </LoginWrapper>
  );
};