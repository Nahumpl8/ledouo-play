import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, Database, Mail } from 'lucide-react';

// --- STYLED COMPONENTS (Mismos que Terms.jsx para consistencia) ---

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
  max-width: 900px;
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
  
  p { margin-bottom: 1rem; }
  ul { padding-left: 1.5rem; margin-bottom: 1rem; li { margin-bottom: 0.5rem; list-style-type: disc; } }
  strong { color: #1f1f1f; font-weight: 600; }
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
  
  &:hover { color: #1e3932; }
`;

export const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Section>
            <BackgroundBlobs>
                <Blob style={{ top: '-10%', left: '-20%', width: '500px', height: '500px', background: '#e0c3fc' }} />
                <Blob style={{ bottom: '-10%', right: '-10%', width: '350px', height: '350px', background: '#92b796', animationDelay: '-5s' }} />
            </BackgroundBlobs>

            <Container>
                <BackButton to="/">
                    <ArrowLeft size={20} /> Volver al inicio
                </BackButton>

                <HeaderWrapper>
                    <Subtitle>Protección de Datos</Subtitle>
                    <SectionTitle>Aviso de Privacidad</SectionTitle>
                    <LastUpdate>Última actualización: Diciembre 2025</LastUpdate>
                </HeaderWrapper>

                <DocumentCard>
                    <Clause>
                        <ClauseTitle><Lock size={24} /> 1. Identidad del Responsable</ClauseTitle>
                        <ClauseText>
                            <p>
                                <strong>Le Duo</strong>, con domicilio en Coahuila 111, Roma Norte, Ciudad de México, es responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
                            </p>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle><Database size={24} /> 2. Datos Personales Recabados</ClauseTitle>
                        <ClauseText>
                            <p>Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos los siguientes datos personales:</p>
                            <ul>
                                <li>Nombre completo</li>
                                <li>Teléfono celular (para notificaciones de Wallet y Reservas)</li>
                                <li>Correo electrónico</li>
                                <li>Fecha de nacimiento (opcional, para promociones de cumpleaños)</li>
                            </ul>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle><Eye size={24} /> 3. Finalidad del uso de datos</ClauseTitle>
                        <ClauseText>
                            <p>Los datos personales que recabamos de usted, los utilizaremos para las siguientes finalidades que son necesarias para el servicio que solicita:</p>
                            <ul>
                                <li>Gestión de reservas para talleres y experiencias.</li>
                                <li>Creación y administración de su tarjeta de lealtad digital (Apple/Google Wallet).</li>
                                <li>Envío de notificaciones sobre el estado de sus sellos y recompensas.</li>
                                <li>Contacto en caso de cambios o cancelaciones en eventos.</li>
                            </ul>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle><Mail size={24} /> 4. Derechos ARCO</ClauseTitle>
                        <ClauseText>
                            <p>
                                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada conforme a los principios, deberes y obligaciones previstas en la normativa (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).
                            </p>
                            <p>
                                Para ejercer cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva enviando un correo electrónico a: <strong>admin@leduo.mx</strong>
                            </p>
                        </ClauseText>
                    </Clause>

                    <Clause>
                        <ClauseTitle>5. Uso de Cookies</ClauseTitle>
                        <ClauseText>
                            <p>
                                Le informamos que en nuestra página de Internet utilizamos cookies y otras tecnologías a través de las cuales es posible monitorear su comportamiento como usuario de Internet, brindarle un mejor servicio y experiencia de usuario al navegar en nuestra página.
                            </p>
                        </ClauseText>
                    </Clause>

                </DocumentCard>
            </Container>
        </Section>
    );
};