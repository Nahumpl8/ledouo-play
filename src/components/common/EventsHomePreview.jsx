import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// --- STYLED COMPONENTS ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SectionWrapper = styled.section`
  padding: 5rem 0;
  background-color: #f8f6f3;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  
  p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const month = months[date.getMonth()];
  return { day, month };
};

export const EventsHomePreview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(3);

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return null;
  }

  if (events.length === 0) {
    return (
      <SectionWrapper>
        <Container>
          <SectionHeader>
            <h2>Experiencias Le Duo</h2>
            <p>Conecta, aprende y disfruta. Talleres diseñados para amantes del café y el arte.</p>
          </SectionHeader>
          <EmptyState>
            <p>Próximamente nuevos talleres y experiencias</p>
            <ViewAllBtn to="/workshops">
              Ver Talleres <ArrowRight size={20} />
            </ViewAllBtn>
          </EmptyState>
        </Container>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <Container>
        <SectionHeader>
          <h2>Experiencias Le Duo</h2>
          <p>Conecta, aprende y disfruta. Talleres diseñados para amantes del café y el arte.</p>
        </SectionHeader>

        <Grid>
          {events.map((event, index) => {
            const { day, month } = formatEventDate(event.date);
            return (
              <MiniCard key={event.id} style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader $bg={event.image_gradient || 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'}>
                  <DateBadge>
                    <span className="day">{day}</span>
                    <span className="month">{month}</span>
                  </DateBadge>
                </CardHeader>

                <CardBody>
                  <CardTitle>{event.title}</CardTitle>
                  <MetaInfo>
                    <div><Clock size={16} /> {event.time}</div>
                    <div><Calendar size={16} /> {day} {month}</div>
                  </MetaInfo>
                </CardBody>
              </MiniCard>
            );
          })}
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
