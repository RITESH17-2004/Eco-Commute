import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Group,
  Burger,
  Paper,
  Transition,
  Button,
  Text,
  Box,
  Stack,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLeaf } from '@tabler/icons-react';
import { auth } from '../firebase'; // Import your Firebase auth instance
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Import signOut and onAuthStateChanged

const HEADER_HEIGHT = 70;

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isAtTop = useRef(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        setVisible(true);
        isAtTop.current = true;
        lastScrollY.current = currentScrollY;
        return;
      }

      isAtTop.current = false;

      if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const items = [
    { link: '/', label: 'Home' },
    ...(isAuthenticated ? [
      { link: '/community', label: 'Community' },
      { link: '/pooling', label: 'Carpooling' },
      { link: '/CalculatorPage', label: 'Carbon Calculator' },
      { link: '/RequestPage', label: 'Incoming Requests' },
      { link: '/SendRequestPage', label: 'My Requests' },
      { link: '/ProfilePage', label: 'Profile' }
    ] : []),
  ];

  const links = items.map((link) => {
    const isActive = location.pathname === link.link;

    return (
      <Link
        key={link.label}
        to={link.link}
        style={{ textDecoration: 'none' }}
      >
        <Box
          style={{
            color: isActive ? '#40c057' : '#495057',
            fontSize: '15px',
            fontWeight: 500,
            padding: '8px 12px',
            borderRadius: '4px',
            position: 'relative',
            transition: 'color 0.2s ease',
          }}
          className="custom-link"
        >
          {link.label}
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              left: '10px',
              right: '10px',
              height: '2px',
              backgroundColor: '#40c057',
              transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'transform 0.2s ease',
              transformOrigin: 'center',
            }}
            className="link-underline"
          />
        </Box>
      </Link>
    );
  });

  return (
    <Box
      component="header"
      h={HEADER_HEIGHT}
      mb={120}
      bg="white"
      style={{
        borderBottom: '1px solid #e9ecef',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <Container fluid h={HEADER_HEIGHT} px={{ base: "md", sm: "xl" }}>
        <Group justify="space-between" h="100%">
          <Group>
            <IconLeaf size={34} color="#40c057" style={{ marginRight: rem(4) }} />
            <Text
              size="xl"
              fw={700}
              c="#343a40"
              style={{
                letterSpacing: '-0.5px',
                fontSize: rem(22),
                background: 'linear-gradient(45deg, #40c057, #20c997)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
            Ride2Green
            </Text>
          </Group>

          <Group gap={10} visibleFrom="sm">
            {links}
            {isAuthenticated ? (
              <Button
                variant="outline"
                color="green"
                size="sm"
                onClick={handleLogout}
                style={{
                  marginLeft: '12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  borderWidth: '1.5px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(64, 192, 87, 0.1)',
                }}
              >
                Log Out
              </Button>
            ) : (
              <Button
                variant="outline"
                color="green"
                size="sm"
                onClick={() => navigate('/Auth')}
                style={{
                  marginLeft: '12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  borderWidth: '1.5px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(64, 192, 87, 0.1)',
                }}
              >
                Sign In
              </Button>
            )}
          </Group>

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            color="#40c057"
          />
        </Group>
      </Container>

      <Transition transition="pop-top-right" duration={200} mounted={opened}>
        {(styles) => (
          <Paper
            style={{
              ...styles,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
            withBorder
            p="md"
            hiddenFrom="sm"
            pos="absolute"
            top={HEADER_HEIGHT}
            left={0}
            right={0}
          >
            <Stack gap="xl">
              {items.map((link) => {
                const isActive = location.pathname === link.link;

                return (
                  <Link
                    key={link.label}
                    to={link.link}
                    style={{
                      textDecoration: 'none',
                      color: isActive ? '#40c057' : '#495057',
                      fontSize: '15px',
                      fontWeight: 500,
                      padding: '10px 0',
                      borderLeft: isActive ? '3px solid #40c057' : '3px solid transparent',
                      paddingLeft: '10px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  color="green"
                  fullWidth
                  onClick={handleLogout}
                  style={{
                    marginTop: '8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    borderWidth: '1.5px',
                    height: '40px',
                  }}
                >
                  Log Out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  color="green"
                  fullWidth
                  onClick={() => navigate('/Auth')}
                  style={{
                    marginTop: '8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    borderWidth: '1.5px',
                    height: '40px',
                  }}
                >
                  Sign In
                </Button>
              )}
            </Stack>
          </Paper>
        )}
      </Transition>
    </Box>
  );
}