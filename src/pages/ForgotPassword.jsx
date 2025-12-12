import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/app/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al enviar el correo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageWrapper>
        <Section>
          <FormCard size="lg">
            <Title>Revisa tu correo</Title>
            <SuccessMessage>
              📧 Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
              Por favor revisa tu bandeja de entrada (y spam) para restablecer tu contraseña.
            </SuccessMessage>
            <LinkText>
              <Link to="/app/login">← Volver al inicio de sesión</Link>
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
          <Title>Recuperar contraseña</Title>
          <p style={{marginBottom: '24px', color: '#666'}}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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
