import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { supabase } from '../integrations/supabase/client';

const RegisterWrapper = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.bg};
`;

const RegisterCard = styled(Card)`
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fontPrimary};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-align: center;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  
  .success-icon {
    font-size: 4rem;
    margin-bottom: ${props => props.theme.spacing.md};
    display: block;
  }
  
  h2 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p {
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  .instructions {
    background: ${props => props.theme.colors.bgAlt};
    padding: ${props => props.theme.spacing.md};
    border-radius: ${props => props.theme.radius};
    margin: ${props => props.theme.spacing.md} 0;
    
    h3 {
      color: ${props => props.theme.colors.primary};
      font-size: 1rem;
      margin-bottom: ${props => props.theme.spacing.sm};
    }
    
    ol {
      text-align: left;
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
        line-height: 1.5;
      }
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  background: #fee2e2;
  padding: ${props => props.theme.spacing.sm};
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
`;

export const Register = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sex: '',
    dob: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar campos obligatorios
      if (!formData.name || !formData.email || !formData.phone || !formData.sex) {
        throw new Error('Por favor completa todos los campos obligatorios');
      }

      // Validar contraseña
      if (!formData.password || formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Registrar usuario en Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            name: formData.name,
            phone: formData.phone,
            sex: formData.sex,
            registration_code: code || 'DIRECT'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('Este correo ya está registrado. Intenta iniciar sesión.');
        }
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('No se pudo crear la cuenta');
      }

      setSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/app');
      }, 3000);
      
    } catch (err) {
      console.error('Error de registro:', err);
      setError(err.message || 'Error al registrarse. Intenta de nuevo.');
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
      <RegisterWrapper>
        <Section>
          <RegisterCard size="lg">
            <SuccessMessage>
              <span className="success-icon">🎉</span>
              <h2>¡Registro exitoso!</h2>
              <p>
                Bienvenido a LeDuo, <strong>{formData.name}</strong>. 
                Tu cuenta ha sido creada con éxito.
              </p>
              
              <div className="instructions">
                <h3>Para empezar a acumular tus puntos:</h3>
                <ol>
                  <li>Realiza tu primera compra</li>
                  <li>¡Comienza a acumular puntos y sellos!</li>
                </ol>
              </div>
              
              <p style={{fontSize: '0.9rem', color: '#666'}}>
                Código de registro: <strong>{code}</strong>
              </p>
              
              <Button as={Link} to="/" size="lg">
                Volver al inicio
              </Button>
            </SuccessMessage>
          </RegisterCard>
        </Section>
      </RegisterWrapper>
    );
  }

  return (
    <RegisterWrapper>
      <Section>
        <RegisterCard size="lg">
          <Title>Únete a LeDuo</Title>
          <Subtitle>
            Completa tu registro para comenzar a disfrutar de beneficios exclusivos
          </Subtitle>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              name="name"
              label="Nombre completo"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
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
              type="tel"
              name="phone"
              label="Número de celular"
              placeholder="+52 55 1234 5678"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            
            <Select
              name="sex"
              label="Sexo"
              value={formData.sex}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero-no-decir">Prefiero no decir</option>
            </Select>

            <Input
              type="date"
              name="dob"
              label="Fecha de nacimiento (opcional)"
              value={formData.dob}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />

            <Input
              type="password"
              name="password"
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </Form>

          <p style={{
            textAlign: 'center', 
            marginTop: '24px', 
            fontSize: '0.9rem', 
            color: '#666'
          }}>
            Al registrarte aceptas nuestros términos y condiciones
          </p>
          
          <p style={{textAlign: 'center', marginTop: '16px'}}>
            <Link to="/" style={{color: '#686145', textDecoration: 'none'}}>
              ← Volver al inicio
            </Link>
          </p>
        </RegisterCard>
      </Section>
    </RegisterWrapper>
  );
};