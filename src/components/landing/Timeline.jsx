import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const TimelineWrapper = styled.div`
  position: relative;
  padding: ${props => props.theme.spacing.xl} 0;
`;

const TimelineTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 40px;
      left: 10%;
      right: 10%;
      height: 2px;
      background: ${props => props.theme.colors.bgAlt};
      z-index: 0;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 40px;
      left: 10%;
      height: 2px;
      width: ${props => props.$progress}%;
      max-width: 80%;
      background: ${props => props.theme.colors.primary};
      z-index: 1;
      transition: width 0.8s ease-out;
    }
  }
`;

const TimelineStep = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  position: relative;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: center;
    flex: 1;
    text-align: center;
    
    &:not(:last-child)::after {
      content: '→';
      position: absolute;
      right: -30px;
      top: 30px;
      font-size: 1.5rem;
      color: ${props => props.theme.colors.primary};
      opacity: 0.5;
    }
  }
`;

const StepNumber = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.white};
  color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.primary};
  border: 3px solid ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  font-family: ${props => props.theme.fontPrimary};
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
  
  ${props => props.$active && `
    box-shadow: 0 8px 24px ${props.theme.colors.primary}40;
    transform: scale(1.1);
  `}
`;

const StepContent = styled.div`
  flex: 1;
  
  h3 {
    font-family: ${props => props.theme.fontPrimary};
    font-size: 1.75rem;
    color: ${props => props.theme.colors.accent};
    margin-bottom: ${props => props.theme.spacing.xs};
    font-weight: 600;
  }
  
  p {
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    font-size: 1rem;
    opacity: 0.85;
  }
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    margin-top: ${props => props.theme.spacing.md};
  }
`;

export const Timeline = () => {
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setProgress(80), 200);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: 1,
      title: 'Regístrate',
      description: 'Crea tu cuenta en nuestra sucursal o en línea. Es rápido y gratis.',
    },
    {
      number: 2,
      title: 'Acumula',
      description: 'Gana puntos y sellos con cada compra automáticamente.',
    },
    {
      number: 3,
      title: 'Disfruta',
      description: 'Canjea recompensas, gira la ruleta y aprovecha beneficios exclusivos.',
    },
  ];

  return (
    <TimelineWrapper ref={timelineRef}>
      <TimelineTrack $progress={progress}>
        {steps.map((step, index) => (
          <TimelineStep key={step.number}>
            <StepNumber $active={progress >= (index * 40)}>
              {step.number}
            </StepNumber>
            <StepContent>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </StepContent>
          </TimelineStep>
        ))}
      </TimelineTrack>
    </TimelineWrapper>
  );
};
