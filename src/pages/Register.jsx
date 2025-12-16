import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Section } from '../components/common/Section';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
// Asegúrate de importar Select si lo tienes, si no, usa un select nativo o el Input
import { Select } from '../components/common/Select'; 
import { Button } from '../components/common/Button';
import { supabase } from '@/integrations/supabase/client';

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

// --- Nuevo componente para alinear la fecha ---
const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr; // Día pequeño, Mes grande, Año mediano
  gap: 12px;
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr; // En pantallas muy pequeñas, uno debajo del otro
    gap: 8px;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: -8px; // Para acercarlo un poco a los inputs
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  background: #fee2e2;
  padding: ${props => props.theme.spacing.sm};
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  
  .success-icon {
    font-size: 4rem;
    margin-bottom: ${props => props.theme.spacing.md};
    display: block;
  }
  
  h2 { color: ${props => props.theme.colors.primary}; margin-bottom: 8px; }
  p { color: ${props => props.theme.colors.text}; line-height: 1.6; }
`;

export const Register = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  // Estado separado para la fecha para facilitar el manejo
  const [dobParts, setDobParts] = useState({
    day: '',
    month: '',
    year: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Generamos arrays para los selects
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Validaciones básicas
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error('Nombre, email y teléfono son obligatorios');
      }

      if (!formData.password || formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // 2. Construcción y validación de la fecha
      let finalDob = null;
      if (dobParts.day && dobParts.month && dobParts.year) {
        // Validar año lógico
        const yearNum = parseInt(dobParts.year);
        const currentYear = new Date().getFullYear();
        if (yearNum < 1920 || yearNum > currentYear) {
          throw new Error('Por favor ingresa un año válido');
        }
        // Formato ISO: YYYY-MM-DD
        finalDob = `${dobParts.year}-${dobParts.month}-${dobParts.day.toString().padStart(2, '0')}`;
      }

      // 3. Registro en Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: formData.name,
            phone: formData.phone,
            dob: finalDob, // Enviamos la fecha combinada
            // Eliminé 'sex' de aquí
            registration_code: code || 'DIRECT'
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/app');
      }, 3000);
    } catch (err) {
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

  const handleDateChange = (field, value) => {
    setDobParts(prev => ({
      ...prev,
      [field]: value
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
              <p>Bienvenido a LeDuo, <strong>{formData.name}</strong>.</p>
              <Button as={Link} to="/" size="lg">Volver al inicio</Button>
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
          <Subtitle>Completa tu registro para comenzar</Subtitle>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              name="name"
              label="Nombre completo"
              placeholder="Ej. Juan Pérez"
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
              placeholder="551234..."
              value={formData.phone}
              onChange={handleChange}
              required
            />
            
            {/* SECCIÓN DE FECHA DIVIDIDA */}
            <div>
              <Label>Fecha de nacimiento (opcional)</Label>
              <div style={{ marginTop: '8px' }}>
                <DateGrid>
                  {/* DÍA */}
                  <Select 
                    value={dobParts.day}
                    onChange={(e) => handleDateChange('day', e.target.value)}
                    placeholder="Día"
                  >
                    <option value="">Día</option>
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>

                  {/* MES */}
                  <Select 
                    value={dobParts.month}
                    onChange={(e) => handleDateChange('month', e.target.value)}
                    placeholder="Mes"
                  >
                    <option value="">Mes</option>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </Select>

                  {/* AÑO - Input numérico simple */}
                  <Input
                    type="number"
                    placeholder="Año"
                    value={dobParts.year}
                    onChange={(e) => handleDateChange('year', e.target.value)}
                    min="1920"
                    max={new Date().getFullYear()}
                    style={{ margin: 0 }} // Reset de margen si Input lo tiene
                  />
                </DateGrid>
              </div>
            </div>

            <Input
              type="password"
              name="password"
              label="Contraseña"
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
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </Form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#666' }}>
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