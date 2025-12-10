import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container } from '../common/Container';
import { Button } from '../common/Button';
import { supabase } from '@/integrations/supabase/client';
import { Home, User, Zap, Calendar, LogOut, Scan, Plus, Users, LogIn, UserPlus } from 'lucide-react';

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
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
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
  background: linear-gradient(
    180deg, 
    rgba(229, 224, 216, 0.95) 0%, 
    rgba(224, 217, 207, 0.92) 100%
  );
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-top: 1px solid rgba(179, 183, 146, 0.3);
  padding: ${props => props.theme.spacing.lg};
  z-index: 50;
  animation: slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-15px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

// Liquid Glass Styles con colores de Le Duo
const liquidGlassStyles = `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.4rem 1rem;
  
  /* FONDO: Gradiente con toques de Le Duo */
  background: linear-gradient(
    145deg,
    rgba(179, 183, 146, 0.12) 0%,   /* primary verde olivo */
    rgba(255, 255, 255, 0.7) 35%, 
    rgba(255, 255, 255, 0.5) 65%,
    rgba(203, 162, 88, 0.08) 100%   /* accent dorado sutil */
  );
  
  /* EFECTO BORROSO mejorado */
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  
  /* BORDES: Con toque de Le Duo */
  border: 1px solid rgba(179, 183, 146, 0.35);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-left-color: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  
  /* SOMBRAS MULTICAPA con colores Le Duo */
  box-shadow: 
    0 10px 40px -10px rgba(104, 97, 69, 0.15),
    0 4px 20px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    inset 0 -1px 0 rgba(104, 97, 69, 0.05),
    inset 0 20px 40px rgba(255, 255, 255, 0.4);

  text-decoration: none;
  color: #686145;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  
  /* Transición elástica mejorada */
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  svg {
    width: 26px;
    height: 26px;
    color: #686145;
    filter: drop-shadow(0 2px 4px rgba(104, 97, 69, 0.1)); 
    transition: all 0.35s ease;
  }

  &:hover {
    transform: translateY(-5px) scale(1.03);
    background: linear-gradient(
      145deg,
      rgba(179, 183, 146, 0.2) 0%,
      rgba(255, 255, 255, 0.85) 50%,
      rgba(203, 162, 88, 0.12) 100%
    );
    border-color: rgba(179, 183, 146, 0.5);
    box-shadow: 
      0 18px 50px -10px rgba(104, 97, 69, 0.2),
      0 8px 25px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 1),
      inset 0 25px 50px rgba(255, 255, 255, 0.6);
      
    svg {
      transform: scale(1.15);
      color: #B3B792;
    }
  }

  &:active {
    transform: scale(0.97) translateY(0);
    box-shadow: 
      0 4px 15px rgba(104, 97, 69, 0.12),
      inset 0 3px 8px rgba(0,0,0,0.03);
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;

  @media (min-width: 500px) {
    grid-template-columns: repeat(3, 1fr);
    max-width: 500px;
  }
`;

const MenuItemButton = styled(Link)`
  ${liquidGlassStyles}
`;

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
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) {
        loadUserRoles(session.user.id);
      }
    });

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

  const isStaff = userRoles.includes('staff');
  const isAdmin = userRoles.includes('admin');
  const isTransparent = isLandingPage && !isScrolled;

  // Build menu items based on role - RUTAS CORREGIDAS
  const getMenuItems = () => {
    const items = [];
    
    // Common items for everyone
    items.push({ to: '/', icon: Home, label: 'Inicio' });
    items.push({ to: '/workshops', icon: Calendar, label: 'Eventos' });
    
    if (isLoggedIn) {
      // Logged in users
      items.push({ to: '/app/cuenta', icon: User, label: 'Mi Cuenta' });
      items.push({ to: '/app/ruleta', icon: Zap, label: 'Ruleta' });
      
      if (isStaff || isAdmin) {
        items.push({ to: '/app/scan', icon: Scan, label: 'Scan' });
      }
      
      if (isAdmin) {
        items.push({ to: '/admin/events', icon: Plus, label: 'Crear Evento' });
        items.push({ to: '/admin/clients', icon: Users, label: 'Clientes' });
      }
    } else {
      // Not logged in - RUTAS CORREGIDAS
      items.push({ to: '/app/login', icon: LogIn, label: 'Ingresar' });
      items.push({ to: '/register', icon: UserPlus, label: 'Crear Cuenta' });
    }
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <HeaderWrapper $transparent={isTransparent}>
      <Container>
        <HeaderContent>
          {/* Logo siempre va a '/' */}
          <Logo to="/">
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
              {mobileMenuOpen ? '✕' : '☰'}
            </MobileMenuButton>

            <DesktopNav>
              {menuItems.map((item) => (
                <Button key={item.to} as={Link} to={item.to} variant="ghost" size="sm">
                  {item.label}
                </Button>
              ))}
              {isLoggedIn && (
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Salir
                </Button>
              )}
            </DesktopNav>
          </Nav>
        </HeaderContent>

        {/* Mobile Menu - Glass effect para TODOS */}
        <MobileMenu $open={mobileMenuOpen}>
          <MenuGrid>
            {menuItems.map((item) => (
              <MenuItemButton key={item.to} to={item.to} title={item.label}>
                <item.icon size={26} />
                <span>{item.label}</span>
              </MenuItemButton>
            ))}
            
            {isLoggedIn && (
              <MenuItemButtonElement onClick={handleLogout} title="Salir">
                <LogOut size={26} />
                <span>Salir</span>
              </MenuItemButtonElement>
            )}
          </MenuGrid>
        </MobileMenu>
      </Container>
    </HeaderWrapper>
  );
};