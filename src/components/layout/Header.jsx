import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container } from '../common/Container';
import { Button } from '../common/Button';
import { supabase } from '@/integrations/supabase/client';
// import logo from '../../assets/images/logo-leduo.png';
const logo = '/lovable-uploads/3eb489f6-f1b0-4d84-8bbc-971d4d1b45b0.png';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.$transparent ? 'transparent' : props.theme.colors.white};
  box-shadow: ${props => props.$transparent ? 'none' : '0 2px 20px rgba(0, 0, 0, 0.08)'};
  backdrop-filter: ${props => props.$transparent ? 'none' : 'blur(10px)'};
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
  display: ${props => props.$open ? 'block' : 'none'};
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAppRoute = location.pathname.startsWith('/app');
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) {
        loadUserRoles(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        loadUserRoles(session.user.id);
      } else {
        setUserRoles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserRoles = async (userId) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (data) {
      setUserRoles(data.map(r => r.role));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    if (isLandingPage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isLandingPage]);

  const isStaff = userRoles.includes('staff') || userRoles.includes('admin');

  const isTransparent = isLandingPage && !isScrolled;

  return (
    <HeaderWrapper $transparent={isTransparent}>
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
                  <Button as={Link} to="/eventos-talleres" variant="ghost" size="sm">
                    Talleres y Eventos
                  </Button>
                  <Button as={Link} to="/app/ruleta" variant="ghost" size="sm">
                    Ruleta
                  </Button>
                  <Button as={Link} to="/app/cuenta" variant="ghost" size="sm">
                    Mi Cuenta
                  </Button>
                  {isStaff && (
                    <Button as={Link} to="/app/scan" variant="ghost" size="sm">
                      Escanear
                    </Button>
                  )}
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

        <MobileMenu $open={mobileMenuOpen}>
          {isLoggedIn && isAppRoute ? (
            <>
              <Button as={Link} to="/" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Inicio
              </Button>
              <Button as={Link} to="/app" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Mi cuenta
              </Button>
              <Button as={Link} to="/app/ruleta" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Ruleta
              </Button>
              <Button as={Link} to="/eventos-talleres" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Talleres y Eventos
              </Button>
              <Button as={Link} to="/app/cuenta" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Mi Cuenta
              </Button>
              {isStaff && (
                <Button as={Link} to="/app/scan" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                  Escanear
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm" style={{ width: '100%' }}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Inicio
              </Button>
              <Button as={Link} to="/eventos-talleres" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Talleres y Eventos
              </Button>
              <Button as={Link} to="/#como-funciona" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Cómo Funciona
              </Button>
              <Button as={Link} to="/#beneficios" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                Beneficios
              </Button>

              {!isLoggedIn && (
                <Button as={Link} to="/app/login" variant="primary" size="sm" style={{ width: '100%' }}>
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