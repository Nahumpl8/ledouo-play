import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container } from '../common/Container';
import { Button } from '../common/Button';
import { supabase } from '@/integrations/supabase/client';
import { Home, User, Zap, Calendar, LogOut, Scan, Plus, Users } from 'lucide-react';
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
  display: block; grid
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
  height: 100vh;
  /* Fondo gris muy claro semitransparente para contraste */
  background: rgba(240, 242, 245); 
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  padding: ${props => props.theme.spacing.md};
  z-index: 50;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const liquidGlassStyles = `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.2rem;
  
  /* FONDO: Gradiente diagonal fuerte para simular curvatura */
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.6) 0%, 
    rgba(255, 255, 255, 0.1) 100%
  );
  
  /* EFECTO BORROSO */
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  
  /* BORDES: Luz (Arriba/Izq) y Sombra (Abajo/Der) */
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  
  /* SOMBRAS MULTICAPA (La clave del realismo) */
  box-shadow: 
    /* 1. Sombra externa difusa (levanta el botón del fondo) */
    0 8px 32px 0 rgba(31, 38, 135, 0.1),
    /* 2. Brillo especular interno superior (da volumen "mojado") */
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    /* 3. Resplandor blanco suave en la mitad superior */
    inset 0 20px 30px rgba(255, 255, 255, 0.4),
    /* 4. Sombra sutil interna inferior (densidad del vidrio) */
    inset 0 -5px 10px rgba(0,0,0,0.03);

  text-decoration: none;
  color: #1e3932;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  
  /* Transición elástica */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  svg {
    width: 28px;
    height: 28px;
    color: #1e3932;
    /* El icono flota sobre el cristal */
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); 
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    /* Al hacer hover, se vuelve más "lechoso" y brillante */
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.8) 0%, 
      rgba(255, 255, 255, 0.3) 100%
    );
    border-color: rgba(255, 255, 255, 1);
    box-shadow: 
      0 15px 35px 0 rgba(31, 38, 135, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 20px 30px rgba(255, 255, 255, 0.6); /* Más brillo interno */
      
    svg {
      transform: scale(1.15) rotate(-5deg);
      color: #cba258; /* Color accent */
    }
  }

  &:active {
    transform: scale(0.96);
    box-shadow: 
      0 4px 10px 0 rgba(31, 38, 135, 0.1),
      inset 0 5px 10px rgba(0,0,0,0.05); /* Se hunde */
  }
`;

// --- MENÚ CON LIQUID GLASS GRID (Solo móvil) ---
const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;

  @media (min-width: 700px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const MenuItemButton = styled(Link)`
  ${liquidGlassStyles}
`;

// Reutilizamos la misma variable de estilos para el botón (Logout)
const MenuItemButtonElement = styled.button`
  ${liquidGlassStyles}
  cursor: pointer;
  width: 100%;
`;



const DesktopNav = styled.div`
  display: none;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
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

  const isStaff = userRoles.includes('staff')

  const isAdmin = userRoles.includes('admin');

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
                  <Button as={Link} to="/app/cuenta" variant="ghost" size="sm">
                    Mi Cuenta
                  </Button>
                  <Button as={Link} to="/app/ruleta" variant="ghost" size="sm">
                    Ruleta
                  </Button>
                  <Button as={Link} to="/eventos-talleres" variant="ghost" size="sm">
                    Eventos
                  </Button>
                  {isStaff && (
                    <Button as={Link} to="/app/scan" variant="ghost" size="sm">
                      Scan
                    </Button>
                  )}
                  {isAdmin && (
                    <>
                      <Button as={Link} to="/admin/events" variant="ghost" size="sm">
                        Crear Evento
                      </Button>
                      <Button as={Link} to="/admin/clients" variant="ghost" size="sm">
                        Clientes
                      </Button>
                    </>
                  )}
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Salir
                  </Button>
                </>
              ) : (
                <>
                  {isStaff && (
                    <>
                      <Button as={Link} to="/app/scan" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                        Escanear
                      </Button>
                      <Button as={Link} to="/#como-funciona" variant="ghost" size="sm">
                        Cómo Funciona
                      </Button>
                      <Button as={Link} to="/#beneficios" variant="ghost" size="sm">
                        Beneficios
                      </Button>
                    </>
                  )}
                  {
                    isAdmin && (
                      <>
                        <Button as={Link} to="/app/scan" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                          Escanear
                        </Button>
                        <Button as={Link} to="/admin/events" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                          Crear Eventos
                        </Button>
                        <Button as={Link} to="/admin/clients" variant="ghost" size="sm" style={{ width: '100%', marginBottom: '8px' }}>
                          Admin Clientes
                        </Button>
                        <Button as={Link} to="/#como-funciona" variant="ghost" size="sm">
                          Cómo Funciona
                        </Button>
                        <Button as={Link} to="/#beneficios" variant="ghost" size="sm">
                          Beneficios
                        </Button>
                      </>
                    )
                  }

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
            <MenuGrid>
              <MenuItemButton to="/app" title="Inicio">
                <Home size={28} />
                <span>Inicio</span>
              </MenuItemButton>

              <MenuItemButton to="/app/cuenta" title="Mi Cuenta">
                <User size={28} />
                <span>Mi Cuenta</span>
              </MenuItemButton>

              <MenuItemButton to="/app/ruleta" title="Ruleta">
                <Zap size={28} />
                <span>Ruleta</span>
              </MenuItemButton>

              <MenuItemButton to="/eventos-talleres" title="Eventos">
                <Calendar size={28} />
                <span>Eventos</span>
              </MenuItemButton>

              {isStaff && (
                <MenuItemButton to="/app/scan" title="Scan">
                  <Scan size={28} />
                  <span>Scan</span>
                </MenuItemButton>
              )}

              {isAdmin && (
                <>
                  <MenuItemButton to="/admin/events" title="Crear Evento">
                    <Plus size={28} />
                    <span>Evento</span>
                  </MenuItemButton>

                  <MenuItemButton to="/admin/clients" title="Clientes">
                    <Users size={28} />
                    <span>Clientes</span>
                  </MenuItemButton>
                </>
              )}

              <MenuItemButtonElement as="button" onClick={handleLogout} title="Salir">
                <LogOut size={28} />
                <span>Salir</span>
              </MenuItemButtonElement>
            </MenuGrid>
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