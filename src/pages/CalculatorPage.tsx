import { useState } from 'react';
import { 
  Container, 
  Title, 
  Select, 
  NumberInput, 
  Button, 
  Paper, 
  Text,
  Stack,
  Group,
  List,
  MantineProvider,
  createTheme,
  Box,
  rem,
  MantineColorsTuple
} from '@mantine/core';
import { IconLeaf, IconBus, IconCar, IconTrain, IconPlane } from '@tabler/icons-react';

// Custom theme with nature-inspired colors for Mantine v7
const carbonColors: MantineColorsTuple = [
  '#e8f5e9',
  '#c8e6c9',
  '#a5d6a7',
  '#81c784',
  '#66bb6a',
  '#4caf50',
  '#43a047',
  '#388e3c',
  '#2e7d32',
  '#1b5e20'
];

const theme = createTheme({
  colors: {
    carbon: carbonColors,
  },
  primaryColor: 'carbon',
  primaryShade: { light: 6, dark: 8 },
});

const EMISSION_FACTORS = {
  car: 0.404,
  bus: 0.14,
  train: 0.14,
  plane: 0.257
};

export function CalculatorPage() {
  const [transport, setTransport] = useState<string | null>(null);
  const [miles, setMiles] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [impact, setImpact] = useState<string>('');

  const calculateEmissions = () => {
    if (transport && typeof miles === 'number') {
      const emissions = miles * (EMISSION_FACTORS[transport as keyof typeof EMISSION_FACTORS]);
      setResult(emissions);
      
      // Set impact message based on emissions
      if (emissions < 5) {
        setImpact('Low impact – Great job!');
      } else if (emissions < 20) {
        setImpact('Moderate impact – Consider alternatives for longer trips');
      } else {
        setImpact('High impact – Look for ways to reduce your carbon footprint');
      }
    }
  };

  // Get transport icon
  const getTransportIcon = () => {
    switch(transport) {
      case 'car': return <IconCar size={24} />;
      case 'bus': return <IconBus size={24} />;
      case 'train': return <IconTrain size={24} />;
      case 'plane': return <IconPlane size={24} />;
      default: return null;
    }
  };

  return (
    <MantineProvider theme={theme}>
      <Box 
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f1eb 100%)',
          minHeight: '100vh',
          paddingTop: rem(35),
          paddingBottom: rem(40),
          width: '99vw'
        }}
      >
        <Container size="sm" py="xl">
          <Paper 
            shadow="md" 
            radius="lg" 
            p={0} 
            withBorder 
            style={{ overflow: 'hidden', marginBottom: rem(80) }} // Increased from 30 to 60
          >
            <Box 
              p="xl" 
              style={{ 
                background: 'linear-gradient(135deg, #00ff00 -10%, #008080 100%)',
                color: 'white'
              }}
            >
              <Group justify="center" gap="xs">
                <IconLeaf size={36} />
                <Title order={1} ta="center">
                  Ride2Green
                </Title>
              </Group>
              <Text ta="center" size="lg" mt="xs">
                Measure and Understand Your Carbon Footprint
              </Text>
            </Box>

            <Box p="xl">
              <Stack gap="xl">
                <Select
                  label="Mode of Transport"
                  placeholder="Select transport mode"
                  data={[
                    { value: 'car', label: 'Car' },
                    { value: 'bus', label: 'Bus' },
                    { value: 'train', label: 'Train' },
                    { value: 'plane', label: 'Airplane' }
                  ]}
                  value={transport}
                  onChange={setTransport}
                  size="md"
                  styles={{
                    label: { fontSize: rem(16), marginBottom: rem(8) }
                  }}
                />

                <NumberInput
                  label="Distance"
                  description="Enter distance in miles"
                  placeholder="Enter miles"
                  value={miles}
                  onChange={(value) => {
                    // In Mantine v7, NumberInput onChange returns number | string | undefined
                    // We need to handle all possible types
                    if (typeof value === 'number') {
                      setMiles(value);
                    } else if (typeof value === 'string') {
                      const parsedValue = parseFloat(value);
                      setMiles(isNaN(parsedValue) ? 0 : parsedValue);
                    } else {
                      setMiles(0);
                    }
                  }}
                  min={0}
                  size="md"
                  styles={{
                    label: { fontSize: rem(16), marginBottom: rem(8) },
                    description: { fontSize: rem(16), marginBottom: rem(8) }
                  }}
                />

                <Button 
                  onClick={calculateEmissions}
                  variant="gradient"
                  gradient={{ from: 'green', to: 'teal' }}
                  disabled={!transport || !miles}
                  leftSection={<IconLeaf size={18} />}
                  size="lg"
                  fullWidth
                >
                  Calculate Emissions
                </Button>

                {result !== null && (
                  <Paper 
                    p="lg" 
                    radius="md" 
                    withBorder
                    bg="rgba(230, 245, 230, 0.5)"
                    mt="md"
                  >
                    <Stack gap="md">
                      <Group>
                        {getTransportIcon()}
                        <Text fw={500} size="lg">
                          {miles} miles by {transport}
                        </Text>
                      </Group>
                      
                      <Group justify="space-between" wrap="wrap">
                        <Text size="lg" fw={700}>Your Carbon Footprint:</Text>
                        <Text 
                          size="xl" 
                          fw={700} 
                          c="carbon.7"
                        >
                          {result.toFixed(2)} kg CO2
                        </Text>
                      </Group>
                      
                      <Text c="dimmed" fw={500} size="lg">
                        {impact}
                      </Text>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Box>
          </Paper>

          <Paper 
            shadow="md" 
            radius="lg" 
            p="xl" 
            withBorder 
            bg="white"
            mt={rem(30)} // Added explicit top margin here too
            style={{ marginBottom: rem(30) }}
          >
            <Title order={3} mb="lg" c="carbon.7">Understanding Your Impact</Title>
            <Text size="md">
              Your carbon footprint is measured in kilograms of CO2 equivalent (kg CO2e).
              This calculation takes into account the average emissions for your chosen mode of transport.
              To reduce your carbon footprint, consider:
            </Text>
            <List 
              mt="lg"
              spacing="md"
              icon={<IconLeaf size={18} style={{ color: carbonColors[6] }} />}
            >
              <List.Item>Using public transportation when possible</List.Item>
              <List.Item>Carpooling with others</List.Item>
              <List.Item>Choosing direct routes to minimize distance</List.Item>
              <List.Item>Walking or cycling for short distances</List.Item>
            </List>
            
            <Box mt="xl">
              <Text size="sm" c="dimmed" ta="center">
                Ride2Green — Making sustainability measurable and actionable
              </Text>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MantineProvider>
  );
}