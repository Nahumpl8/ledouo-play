import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { supabase } from '@/integrations/supabase/client';

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

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => props.theme.spacing.md} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.border || '#e5e5e5'};
  }
  
  span {
    padding: 0 ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.secondary};
    font-size: 14px;
  }
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px 24px;
  background: white;
  border: 1px solid ${props => props.theme.colors.border || '#e5e5e5'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: right;
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  margin-top: -8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Correo o contraseña incorrectos');
        }
        throw signInError;
      }

      navigate(from, { replace: true });
    } catch (err) {
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`
        }
      });
      
      if (googleError) throw googleError;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión con Google');
      setGoogleLoading(false);
    }
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
            
            <ForgotPasswordLink to="/app/forgot-password">
              ¿Olvidaste tu contraseña?
            </ForgotPasswordLink>

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