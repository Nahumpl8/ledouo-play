import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, MapPin } from 'lucide-react';

// --- DATOS DE EJEMPLO (Solo mostramos 3 en el Home) ---
const PREVIEW_EVENTS = [
    {
        id: 1,
        title: "Taller de Velas Aromáticas",
        date: "14 OCT",
        time: "17:00 HRS",
        imageColor: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    },
    {
        id: 2,
        title: "Cata de Café: Orígenes",
        date: "21 OCT",
        time: "18:00 HRS",
        imageColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
        id: 3,
        title: "Arte Latte Básico",
        date: "28 OCT",
        time: "16:30 HRS",
        imageColor: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    }
];

// --- STYLED COMPONENTS ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-30px); }
`;

const BackgroundBlobs = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
`;

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: ${float} 8s ease-in-out infinite;
`;

const SectionWrapper = styled.section`
  padding: 5rem 0;
  background-color: #e5e0d8; /* Fondo ligero para diferenciar del menú */
  position: relative;
`;

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.6s ease-out;

  h2 {
    font-size: 2.5rem;
    color: #1f1f1f;
    margin-bottom: 0.5rem;
    font-weight: 800;
  }
  
  p {
    color: #666;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const MiniCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
  animation: ${fadeIn} 0.6s ease-out forwards;
  opacity: 0;
  
  /* Stagger animation delay logic would go here ideally, hardcoded below */

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }
`;

const CardHeader = styled.div`
  height: 120px;
  background: ${props => props.$bg};
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
`;

const DateBadge = styled.div`
  background: rgba(255,255,255,0.95);
  padding: 6px 12px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  position: absolute;
  top: 1rem;
  right: 1rem;

  span {
    display: block;
    color: #1f1f1f;
    line-height: 1;
  }
  .day { font-size: 1.2rem; font-weight: 800; }
  .month { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
`;

const CardBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1e3932;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  
  div { display: flex; align-items: center; gap: 6px; }
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const ViewAllBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 14px 32px;
  background-color: #2E4028;
  color: white;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(30, 57, 50, 0.2);

  &:hover {
    background-color: #152822;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(30, 57, 50, 0.3);
  }
`;

export const EventsHomePreview = () => {
    return (
        <SectionWrapper>
            <BackgroundBlobs>
                <Blob style={{ top: '-10%', left: '-20%', width: '500px', height: '500px', background: '#e0c3fc' }} />
                <Blob style={{ top: '30%', right: '-20%', width: '400px', height: '400px', background: '#8ec5fc', animationDelay: '-7s' }} />
                <Blob style={{ bottom: '-10%', left: '10%', width: '350px', height: '350px', background: '#f5576c', animationDelay: '-15s' }} />
            </BackgroundBlobs>
            <Container>
                <SectionHeader>
                    <h2>Experiencias Le Duo</h2>
                    <p>Conecta, aprende y disfruta. Talleres diseñados para amantes del café y el arte.</p>
                </SectionHeader>

                <Grid>
                    {PREVIEW_EVENTS.map((event, index) => (
                        <MiniCard key={event.id} style={{ animationDelay: `${index * 150}ms` }}>
                            <CardHeader $bg={event.imageColor}>
                                <DateBadge>
                                    <span className="day">{event.date.split(' ')[0]}</span>
                                    <span className="month">{event.date.split(' ')[1]}</span>
                                </DateBadge>
                            </CardHeader>

                            <CardBody>
                                <CardTitle>{event.title}</CardTitle>
                                <MetaInfo>
                                    <div><Clock size={16} /> {event.time}</div>
                                    <div><Calendar size={16} /> {event.date}</div>
                                </MetaInfo>
                            </CardBody>
                        </MiniCard>
                    ))}
                </Grid>

                <ActionButtonWrapper>
                    <ViewAllBtn to="/workshops">
                        Ver todos los Talleres y Eventos <ArrowRight size={20} />
                    </ViewAllBtn>
                </ActionButtonWrapper>

            </Container>
        </SectionWrapper>
    );
};