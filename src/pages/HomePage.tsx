import { Container, Title, Text, Button, Group, List, ThemeIcon, rem, Box, Stack, SimpleGrid, Card, Divider } from '@mantine/core';
import { IconCheck, IconLeaf, IconUsers, IconCar, IconChevronRight } from '@tabler/icons-react';

export function HomePage() {
  return (
    <div style={{ 
      display: 'flex', 
      alignContent:'center',
      justifyContent: 'center', 
      width: '99vw'
    }}>
      <Container size="xl" py="xl" style={{ maxWidth: '1200px', width: '100%' }}>
        {/* Hero Section with Background Gradient */}
        <Box
          style={{
            background: 'linear-gradient(135deg, rgba(0,128,128,0.1) 0%, rgba(0,128,0,0.05) 100%)',
            borderRadius: rem(24),
            padding: `${rem(100)} ${rem(20)}`,
            marginTop: rem(40),
            marginBottom: rem(80),
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Elements */}
          <Box
            style={{
              position: 'absolute',
              width: rem(300),
              height: rem(300),
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,128,128,0.1) 0%, rgba(255,255,255,0) 70%)',
              top: rem(-100),
              right: rem(-100),
              zIndex: 0
            }}
          />
          
          <Stack align="center" gap={rem(40)} style={{ position: 'relative', zIndex: 1 }}>
            <Title
              order={1}
              style={{ 
                fontSize: rem(48),
                fontWeight: 800,
                lineHeight: 1.2,
                maxWidth: rem(700),
                textAlign: 'center'
              }}
            >
              Track & Reduce Your{' '}
              <Text component="span" gradient={{ from: 'green', to: 'teal' }} variant="gradient" inherit>
                Carbon Footprint
              </Text>
            </Title>

            <Text 
              c="dimmed" 
              size="lg" 
              style={{ 
                maxWidth: rem(600),
                textAlign: 'center',
                lineHeight: 1.6
              }}
            >
              Join our community of environmentally conscious individuals and make a real impact
              on climate change. Calculate, track, and reduce your carbon emissions while connecting
              with like-minded people.
            </Text>

            <Group gap={rem(15)}>
              <Button
                size="lg"
                variant="gradient"
                gradient={{ from: 'green', to: 'teal' }}
                radius="md"
                rightSection={<IconChevronRight size={rem(18)} />}
              >
                Get Started
              </Button>
              
              <Button
                size="lg"
                variant="subtle"
                color="teal"
                radius="md"
              >
                Learn More
              </Button>
            </Group>
          </Stack>
        </Box>

        {/* Features Section */}
        <Box py={rem(40)}>
          <Title 
            order={2} 
            ta="center" 
            style={{ 
              marginBottom: rem(60),
              fontSize: rem(36)
            }}
          >
            <Text 
              span 
              variant="gradient" 
              gradient={{ from: 'teal', to: 'green' }}
              style={{
                fontSize: rem(48),
                fontWeight: 700
              }}
            >
              Features
            </Text>{' '}
            
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={rem(40)}>
            <Card padding="lg" radius="md" withBorder shadow="sm">
              <ThemeIcon size={rem(56)} radius="md" variant="light" color="green" style={{ marginBottom: rem(20) }}>
                <IconLeaf size={rem(30)} />
              </ThemeIcon>
              
              <Title order={3} mb="xs">Carbon Calculator</Title>
              
              <Text c="dimmed" size="md" style={{ lineHeight: 1.6 }}>
                Calculate your carbon footprint from various modes of transport
                and track your progress over time with detailed insights.
              </Text>
            </Card>

            <Card padding="lg" radius="md" withBorder shadow="sm">
              <ThemeIcon size={rem(56)} radius="md" variant="light" color="teal" style={{ marginBottom: rem(20) }}>
                <IconUsers size={rem(30)} />
              </ThemeIcon>
              
              <Title order={3} mb="xs">Community</Title>
              
              <Text c="dimmed" size="md" style={{ lineHeight: 1.6 }}>
                Connect with environmentally conscious individuals, share tips,
                and inspire others in our growing global community.
              </Text>
            </Card>

            <Card padding="lg" radius="md" withBorder shadow="sm">
              <ThemeIcon size={rem(56)} radius="md" variant="light" color="green" style={{ marginBottom: rem(20) }}>
                <IconCar size={rem(30)} />
              </ThemeIcon>
              
              <Title order={3} mb="xs">Carpooling</Title>
              
              <Text c="dimmed" size="md" style={{ lineHeight: 1.6 }}>
                Find carpool partners for your daily commute or long trips
                to reduce emissions and save money while building connections.
              </Text>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Why Choose Us Section */}
        <Box
          style={{
            background: 'linear-gradient(135deg, rgba(0,128,128,0.05) 0%, rgba(0,128,0,0.1) 100%)',
            padding: `${rem(80)} ${rem(20)}`,
            marginTop: rem(80),
            marginBottom: rem(40),
            borderRadius: rem(24)
          }}
        >
          <Stack align="center" gap={rem(50)}>
            <Title 
              order={2} 
              ta="center" 
              style={{ 
                fontSize: rem(36),
                maxWidth: rem(700)
              }}
            >
              Why Choose <Text component="span" variant="gradient" gradient={{ from: 'green', to: 'teal' }} inherit>Ride2Green</Text>?
            </Title>

            <Card padding="xl" radius="lg" shadow="md" style={{ width: '80%' }}>
              <List
                spacing="lg"
                size="lg"
                center
                icon={
                  <ThemeIcon size={32} radius="xl" color="teal">
                    <IconCheck size={20} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <Text size="lg" fw={500}>Accurate Calculations</Text>
                  <Text c="dimmed">Our carbon footprint calculator uses verified emission factors and real-world data</Text>
                </List.Item>
                
                <Divider my="sm" />
                
                <List.Item>
                  <Text size="lg" fw={500}>Active Community</Text>
                  <Text c="dimmed">Join thousands of users sharing their journey towards a sustainable lifestyle</Text>
                </List.Item>
                
                <Divider my="sm" />
                
                <List.Item>
                  <Text size="lg" fw={500}>Easy Carpooling</Text>
                  <Text c="dimmed">Find and connect with potential carpool partners in your area effortlessly</Text>
                </List.Item>
                
                <Divider my="sm" />
                
                <List.Item>
                  <Text size="lg" fw={500}>Track Progress</Text>
                  <Text c="dimmed">Monitor your carbon reduction journey with detailed analytics and insights</Text>
                </List.Item>
              </List>
            </Card>
            
            <Button
              size="lg"
              variant="gradient"
              gradient={{ from: 'green', to: 'teal' }}
              radius="md"
              mt={rem(20)}
            >
              Join Ride2Green Today
            </Button>
          </Stack>
        </Box>
      </Container>
    </div>
  );
}