import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Coffee, MessageCircle, ChevronDown } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const typing = keyframes`
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const SectionWrapper = styled.section`
  padding: 1rem 0;
  background: linear-gradient(180deg, #fff 0%, #f5f0eb 100%);
  position: relative;
`;

const Container = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChatItem = styled.div`
  animation: ${fadeIn} 0.6s ease-out forwards;
  opacity: 0;
  animation-delay: ${props => props.$delay}ms;
`;

const QuestionBubble = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid ${props => props.$isOpen ? '#2E4028' : '#e5e0d8'};
  border-radius: 20px 20px 20px 4px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  max-width: 85%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  
  &:hover {
    border-color: #2E4028;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 640px) {
    max-width: 95%;
  }
`;

const CustomerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.2rem;
`;

const QuestionContent = styled.div`
  flex: 1;
  
  span {
    font-size: 0.7rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  p {
    margin: 4px 0 0;
    font-weight: 600;
    color: #1f1f1f;
    font-size: 1rem;
  }
`;

const ChevronIcon = styled(ChevronDown)`
  transition: transform 0.3s ease;
  color: #2E4028;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const AnswerWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
  overflow: hidden;
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: all 0.4s ease;
`;

const AnswerBubble = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(135deg, #2E4028, #3d5535);
  border-radius: 20px 20px 4px 20px;
  padding: 1.25rem;
  max-width: 85%;
  box-shadow: 0 8px 25px rgba(46, 64, 40, 0.25);
  animation: ${props => props.$isOpen ? css`${slideIn} 0.4s ease-out` : 'none'};
  
  @media (max-width: 640px) {
    max-width: 95%;
  }
`;

const BaristaAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: #2E4028;
  }
`;

const AnswerContent = styled.div`
  flex: 1;
  
  span {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  p {
    margin: 4px 0 0;
    color: white;
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 0;
  
  span {
    width: 8px;
    height: 8px;
    background: rgba(255,255,255,0.5);
    border-radius: 50%;
    animation: ${typing} 1.4s infinite;
    
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

const FAQ_DATA = [
  {
    emoji: "📍",
    question: "¿Dónde están ubicados y cuál es su horario?",
    answer: "Nos encuentras en el corazón de la Roma Norte: Coahuila 111, CDMX. Abrimos de Martes a Sábado de 8am a 8pm, y Domingos de 9am a 4pm. ¡Cerramos los lunes para recargar energías!"
  },
  {
    emoji: "☕",
    question: "¿Cómo funciona el programa de lealtad?",
    answer: "Es nuestra forma de consentirte. Con cada bebida que pidas ganas 1 sello digital. Al juntar 8 sellos, ¡te regalamos la siguiente bebida totalmente gratis! Sin tarjetas de plástico, todo en tu celular."
  },
  {
    emoji: "☕️",
    question: "¿De dónde es su café?",
    answer: "Es un café de especialidad de Veracruz, México. En el café podrás encontrar notas a chocolate, nuez y cítricos, con una acidez balanceada y un cuerpo medio. Perfecto para disfrutar solo o en tus bebidas favoritas."
  },
  {
    emoji: "🍵",
    question: "¿Cuál es la especialidad de la casa?",
    answer: "¡Definitivamente nuestro Matcha! Seleccionamos el mejor grado ceremonial y creamos recetas únicas (tienes que probar el de temporada). También horneamos pan dulce delicioso todos los días."
  },
  {
    emoji: "🐾",
    question: "¿Son Pet Friendly?",
    answer: "¡Sí, al 100%! Nos encanta recibir a tus peluditos. Tienen su propio espacio y siempre son bienvenidos a acompañarte mientras disfrutas tu café."
  },
  {
    emoji: "💻",
    question: "¿Puedo ir a trabajar en la cafetería?",
    answer: "¡Claro! Tenemos WiFi de alta velocidad, enchufes accesibles y sillas cómodas. Es el spot ideal para hacer home office, estudiar o tener reuniones creativas con un buen ambiente."
  },
  {
    emoji: "📱",
    question: "¿Necesito descargar una app para los puntos?",
    answer: "¡No! Odiamos que tengas el celular lleno de apps. Tu tarjeta Le Duo vive directamente en tu Apple Wallet o Google Wallet. Se actualiza sola y siempre la tienes a la mano."
  }
];

export const FAQChatSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SectionWrapper>
      <Container>
        <SectionHeader>
          <h2>
            <MessageCircle size={32} color="#2E4028" />
            Preguntas Frecuentes
          </h2>
          <p>Conversemos sobre tus dudas del programa de lealtad</p>
        </SectionHeader>

        <ChatContainer>
          {FAQ_DATA.map((faq, index) => (
            <ChatItem key={index} $delay={index * 100}>
              <QuestionBubble
                onClick={() => toggleFAQ(index)}
                $isOpen={openIndex === index}
              >
                <CustomerAvatar>{faq.emoji}</CustomerAvatar>
                <QuestionContent>
                  <span>Cliente pregunta</span>
                  <p>{faq.question}</p>
                </QuestionContent>
                <ChevronIcon size={20} $isOpen={openIndex === index} />
              </QuestionBubble>

              <AnswerWrapper $isOpen={openIndex === index}>
                <AnswerBubble $isOpen={openIndex === index}>
                  <BaristaAvatar>
                    <Coffee size={20} />
                  </BaristaAvatar>
                  <AnswerContent>
                    <span>Le Duo responde</span>
                    <p>{faq.answer}</p>
                  </AnswerContent>
                </AnswerBubble>
              </AnswerWrapper>
            </ChatItem>
          ))}
        </ChatContainer>
      </Container>
    </SectionWrapper>
  );
};
