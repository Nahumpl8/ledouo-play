import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Scale, FileText } from 'lucide-react';

// --- STYLED COMPONENTS (Reutilizados para coherencia) ---

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
`;

const BackgroundBlobs = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
`;

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: ${float} 20s infinite ease-in-out;
`;

const Section = styled.section`
  padding: 2rem 0 4rem 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
  
  @media (min-width: 1024px) {
    padding: 4rem 0;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 900px; /* Un poco más angosto para lectura */
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeUp} 0.6s ease forwards;
`;

const Subtitle = styled.span`
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #1e3932;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const SectionTitle = styled.h1`
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
  margin-top: 0;
  color: #1f1f1f;
`;

const LastUpdate = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-top: 1rem;
  font-style: italic;
`;

// --- NUEVOS ESTILOS PARA EL DOCUMENTO ---

const DocumentCard = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
  border-radius: 24px;
  padding: 2rem;
  animation: ${fadeUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  
  @media (min-width: 768px) {
    padding: 4rem;
  }
`;

const Clause = styled.div`
  margin-bottom: 2.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ClauseTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e3932;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ClauseText = styled.div`
  color: #4a5568;
  line-height: 1.8;
  font-size: 1rem;
  
  p {
    margin-bottom: 1rem;
  }
  
  ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    
    li {
      margin-bottom: 0.5rem;
      list-style-type: disc;
    }
  }
  
  strong {
    color: #1f1f1f;
    font-weight: 600;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: color 0.2s;
  
  &:hover {
    color: #1e3932;
  }
`;

export const Terms = () => {
    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Section>
            <BackgroundBlobs>
                <Blob style={{ top: '-10%', left: '-20%', width: '500px', height: '500px', background: '#e0c3fc' }} />
                <Blob style={{ top: '30%', right: '-20%', width: '400px', height: '400px', background: '#8ec5fc', animationDelay: '-7s' }} />
                <Blob style={{ bottom: '-10%', left: '10%', width: '350px', height: '350px', background: '#f5576c', animationDelay: '-15s' }} />
            </BackgroundBlobs>

            <Container>
                <BackButton to="/">
                    <ArrowLeft size={20} /> Volver al inicio
                </BackButton>

                <HeaderWrapper>
                    <Subtitle>Información Legal</Subtitle>
                    <SectionTitle>Términos y Condiciones</SectionTitle>
                    <LastUpdate>Última actualización: Diciembre 2025</LastUpdate>
                </HeaderWrapper>

                <DocumentCard>
                    <Clause>
                        <ClauseTitle><FileText size={24} /> 1. Introducción</ClauseTitle>
                        <ClauseText>
                            <p>
                                Bienvenido a <strong>Le Duo</strong>. Estos términos y condiciones rigen el uso de nuestro sitio web, nuestros servicios en sucursal y nuestro programa de lealtad digital. Al acceder a nuestros servicios, aceptas cumplir con estos términos.
                            </p>
                            <p>
                                Le Duo es un establecimiento dedicado a la venta de café de especialidad, matcha, panadería y la impartición de talleres recreativos, ubicado en Coahuila 111, Roma Norte, Ciudad de México.
                            </p>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle><Scale size={24} /> 2. Talleres y Experiencias</ClauseTitle>
                        <ClauseText>
                            <p>
                                La reserva de lugares para nuestros talleres y experiencias está sujeta a disponibilidad. Para confirmar tu asistencia, es necesario completar el proceso de registro y pago correspondiente.
                            </p>
                            <ul>
                                <li><strong>Cancelaciones:</strong> Las cancelaciones realizadas con al menos 48 horas de anticipación podrán ser reagendadas o reembolsadas al 100%.</li>
                                <li><strong>Cancelaciones tardías:</strong> Las cancelaciones con menos de 48 horas de anticipación no son reembolsables debido a la logística de materiales y espacios reservados.</li>
                                <li><strong>Puntualidad:</strong> Recomendamos llegar 10 minutos antes del inicio de la experiencia. Nos reservamos el derecho de iniciar la actividad a la hora programada.</li>
                            </ul>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle><ShieldCheck size={24} /> 3. Programa de Lealtad (Wallet)</ClauseTitle>
                        <ClauseText>
                            <p>
                                Nuestro programa de lealtad digital (Apple Wallet y Google Wallet) es personal e intransferible.
                            </p>
                            <ul>
                                <li>Se otorgará <strong>1 sello</strong> por cada compra en sucursal sin monto mínimo (máximo 2 compras/sellos al día).</li>
                                <li>Al acumular <strong>8 sellos</strong>, el cliente recibirá un cupón válido por una bebida (cualquiera que elija) GRATIS de tamaño mediano.</li>
                                <li>Los sellos y recompensas no tienen valor monetario y no pueden ser canjeados por efectivo.</li>
                                <li>Le Duo se reserva el derecho de modificar o suspender el programa de lealtad en cualquier momento, respetando los beneficios ya adquiridos por los usuarios activos.</li>
                                <li>El mal uso del programa (intentos de falsificación o duplicación) resultará en la cancelación inmediata de la tarjeta digital.</li>
                            </ul>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle>4. Privacidad y Datos Personales</ClauseTitle>
                        <ClauseText>
                            <p>
                                En Le Duo nos tomamos muy en serio tu privacidad. Los datos recopilados (nombre, correo electrónico, teléfono y fecha de nacimiento) se utilizan exclusivamente para:
                            </p>
                            <ul>
                                <li>Gestionar tus reservas de talleres.</li>
                                <li>Administrar tu cuenta del programa de lealtad.</li>
                                <li>Enviarte notificaciones relevantes (como tu regalo de cumpleaños, confirmaciones de compra o promociones en Le Duo).</li>
                            </ul>
                            <p>
                                No compartimos tu información con terceros con fines comerciales sin tu consentimiento explícito.
                            </p>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle>5. Modificaciones</ClauseTitle>
                        <ClauseText>
                            <p>
                                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en este sitio web. Se recomienda revisar esta página periódicamente.
                            </p>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle>6. Contacto</ClauseTitle>
                        <ClauseText>
                            <p>
                                Si tienes alguna duda sobre estos términos, por favor contáctanos:
                            </p>
                            <ul>
                                <li>Email: admin@leduo.mx</li>
                                <li>Dirección: Coahuila 111, Roma Norte, CDMX</li>
                            </ul>
                        </ClauseText>
                    </Clause>

                </DocumentCard>
            </Container>
        </Section>
    );
};