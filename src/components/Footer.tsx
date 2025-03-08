import { Container, Group, ActionIcon, Text, Box, Divider, rem } from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconLeaf } from '@tabler/icons-react';

export function Footer() {
  return (
    <Box 
      component="footer" 
      style={{
        marginTop: rem(0),
        borderTop: '1px solid rgba(0, 128, 128, 0.2)',
        width: '100%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,128,128,0.05) 100%)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%'
      }}>
        <Container size="xl" py="xl" style={{ maxWidth: '1200px', width: '100%' }}>
          <Group justify="space-between" gap={rem(30)} wrap="wrap">
            <Group>
              <IconLeaf size={26} style={{ color: '#20c997' }} />
              <Text 
                fw={700} 
                size="xl"
                gradient={{ from: 'teal', to: 'green' }}
                variant="gradient"
              >
                Eco-Commute
              </Text>
            </Group>

            <Group gap={rem(12)} wrap="nowrap">
              <ActionIcon size="lg" variant="light" color="teal" radius="md">
                <IconBrandTwitter style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" variant="light" color="teal" radius="md">
                <IconBrandYoutube style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" variant="light" color="teal" radius="md">
                <IconBrandInstagram style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Group>
          
          <Divider 
            my={rem(24)} 
            style={{ 
              opacity: 0.4,
              background: 'linear-gradient(90deg, rgba(0,128,128,0) 0%, rgba(0,128,128,0.4) 50%, rgba(0,128,128,0) 100%)'
            }}
          />
          
          <Group justify="space-between" gap={rem(20)} wrap="wrap">
            <Text c="dimmed" size="sm">
              Making a greener planet, one step at a time
            </Text>
            
            <Text c="dimmed" size="sm">
              © {new Date().getFullYear()} Carbon Sync. All rights reserved.
            </Text>
          </Group>
        </Container>
      </div>
    </Box>
  );
}