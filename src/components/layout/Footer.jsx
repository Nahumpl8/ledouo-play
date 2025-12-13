import React from 'react';
import styled from 'styled-components';
import { Container } from '../common/Container';
// import logo from '../../assets/images/logo-leduo.png';
const logo = '/lovable-uploads/logoWhite.jpg';
import { Instagram, Play, Facebook } from 'lucide-react';

const FooterWrapper = styled.footer`
  background: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl} 0 ${props => props.theme.spacing.md} 0;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: 2fr 1fr 1fr;
  }
`;

const FooterSection = styled.div`
  h3 {
    font-size: 18px;
    margin-bottom: ${props => props.theme.spacing.sm};
    color: ${props => props.theme.colors.white};
  }
  
  p, li {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.white}CC;
    line-height: 1.5;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  a {
    color: ${props => props.theme.colors.white}CC;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${props => props.theme.colors.white};
    }
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  
  img {
    height: 60px;
    width: auto;
  }
`;

const LogoText = styled.div`
  h2 {
    font-family: ${props => props.theme.fontPrimary};
    font-size: 28px;
    margin: 0 0 4px 0;
    color: ${props => props.theme.colors.white};
  }
  
  p {
    font-size: 14px;
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
    color: ${props => props.theme.colors.white}CC;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.white}20;
  color: ${props => props.theme.colors.white}80;
  font-size: 14px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
  
  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${props => props.theme.colors.white}20;
    border-radius: 50%;
    color: ${props => props.theme.colors.white};
    font-size: 18px;
    transition: all 0.3s ease;
    
    &:hover {
      background: ${props => props.theme.colors.secondary};
      transform: translateY(-2px);
    }
  }
`;

const SecondaryButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.white}20;
  border-radius: 10px;
  color: ${props => props.theme.colors.white};
  font-size: 18px;
  transition: all 0.3s ease;
  padding: 12px;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

export const Footer = () => {
  return (
    <FooterWrapper>
      <Container>
        <FooterContent>
          <FooterSection>
            <LogoSection>
              <img src={logo} alt="LeDuo" />
              <LogoText>
                <h2>LeDuo</h2>
                <p>Coffee & Bread</p>
                <p style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                  Café artesanal en el corazón de la Roma.
                  Únete a nuestro programa de lealtad y disfruta de beneficios exclusivos.
                </p>
              </LogoText>
            </LogoSection>
          </FooterSection>

          <FooterSection>
            <h3>Ubicación</h3>
            <p>
              📍 Calle Coahuila #111,<br />
              Colonia Roma Norte<br />
              06700 Ciudad de México
            </p>
            <p>
              📞 +52 771 129 59 38<br />
              ✉️ admin@leduo.mx
            </p>
          </FooterSection>

          <FooterSection>
            <h3>Horarios</h3>
            <ul>
              <li>Martes - Sábado: 8:00 - 20:00</li>
              <li>Domingos: 8:00 - 16:00</li>
            </ul>

            <h3 style={{ marginTop: '24px' }}>Síguenos</h3>
              <div className="followButtons" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SecondaryButton href="https://instagram.com/leduomx" target="_blank">
                  <Instagram size={18} />
                  Instagram
                </SecondaryButton>
                <SecondaryButton href="https://tiktok.com/@leduomx" target="_blank">
                  <Play size={18} />
                  TikTok
                </SecondaryButton>
              </div>

          </FooterSection>
        </FooterContent>

        <Copyright>
          <p>© 2025 LeDuo Coffee & Bread. Todos los derechos reservados.</p>
        </Copyright>
      </Container>
    </FooterWrapper>
  );
};