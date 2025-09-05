import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container } from '../common/Container';
import { Button } from '../common/Button';
import { authStorage } from '../../lib/storage';
// import logo from '../../assets/images/logo-leduo.png';
const logo = '/lovable-uploads/3eb489f6-f1b0-4d84-8bbc-971d4d1b45b0.png';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.white};
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
  transition: all 0.3s ease;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} 0;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.md} 0;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  img {
    height: 40px;
    width: auto;
    
    @media (min-width: ${props => props.theme.breakpoints.tablet}) {
      height: 48px;
    }
  }
`;

const LogoText = styled.div`
  display: none;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: block;
  }
  
  h1 {
    font-family: ${props => props.theme.fontPrimary};
    font-size: 24px;
    color: ${props => props.theme.colors.primary};
    margin: 0;
  }
  
  p {
    font-size: 12px;
    color: ${props => props.theme.colors.secondary};
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const MobileMenuButton = styled.button`
  display: block;
  background: none;
  border: none;
  font-size: 24px;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const MobileMenu = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.white};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const DesktopNav = styled.div`
  display: none;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: flex;
  }
`;

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = authStorage.isLoggedIn();
  const isAppRoute = location.pathname.startsWith('/app');

  const handleLogout = () => {
    authStorage.logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <HeaderWrapper>
      <Container>
        <HeaderContent>
          <Logo to={isLoggedIn ? '/app' : '/'}>
            <img src={logo} alt="LeDuo" />
            <LogoText>
              <h1>LeDuo</h1>
              <p>Coffee & Bread</p>
            </LogoText>
          </Logo>

          <Nav>
            <MobileMenuButton 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              ☰
            </MobileMenuButton>

            <DesktopNav>
              {isLoggedIn && isAppRoute ? (
                <>
                  <Button as={Link} to="/app" variant="ghost" size="sm">
                    Inicio
                  </Button>
                  <Button as={Link} to="/app/ruleta" variant="ghost" size="sm">
                    Ruleta
                  </Button>
                  <Button as={Link} to="/app/cuenta" variant="ghost" size="sm">
                    Mi Cuenta
                  </Button>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Salir
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/#como-funciona" variant="ghost" size="sm">
                    Cómo Funciona
                  </Button>
                  <Button as={Link} to="/#beneficios" variant="ghost" size="sm">
                    Beneficios
                  </Button>
                  {!isLoggedIn && (
                    <Button as={Link} to="/app/login" variant="primary" size="sm">
                      Ingresar
                    </Button>
                  )}
                </>
              )}
            </DesktopNav>
          </Nav>
        </HeaderContent>

        <MobileMenu isOpen={mobileMenuOpen}>
          {isLoggedIn && isAppRoute ? (
            <>
              <Button as={Link} to="/app" variant="ghost" size="sm" style={{width: '100%', marginBottom: '8px'}}>
                Inicio
              </Button>
              <Button as={Link} to="/app/ruleta" variant="ghost" size="sm" style={{width: '100%', marginBottom: '8px'}}>
                Ruleta
              </Button>
              <Button as={Link} to="/app/cuenta" variant="ghost" size="sm" style={{width: '100%', marginBottom: '8px'}}>
                Mi Cuenta
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" style={{width: '100%'}}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/#como-funciona" variant="ghost" size="sm" style={{width: '100%', marginBottom: '8px'}}>
                Cómo Funciona
              </Button>
              <Button as={Link} to="/#beneficios" variant="ghost" size="sm" style={{width: '100%', marginBottom: '8px'}}>
                Beneficios
              </Button>
              {!isLoggedIn && (
                <Button as={Link} to="/app/login" variant="primary" size="sm" style={{width: '100%'}}>
                  Ingresar
                </Button>
              )}
            </>
          )}
        </MobileMenu>
      </Container>
    </HeaderWrapper>
  );
};