import { useState, ChangeEvent } from 'react';
import { createTheme, MantineProvider, rem } from '@mantine/core';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Button,
  Group,
  Stack,
  Card,
  Text,
  Avatar,
  NumberInput,
  Grid,
  Badge,
  Divider,
  Box
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import Map from 'react-map-gl';
import { IconMapPin, IconArrowRight, IconCalendar, IconClock, IconUsers, IconSearch } from '@tabler/icons-react';

const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN'; // Replace with actual token

// Mantine v7 theme setup
const theme = createTheme({
  colors: {
    green: [
      '#e6f7ec',
      '#d0eeda',
      '#a3debb',
      '#76cd9b',
      '#4abd7c',
      '#2ca969',
      '#1d9e5a',
      '#128043',
      '#076632',
      '#004d21',
    ],
  },
  primaryColor: 'green',
  defaultRadius: 'md',
});

const MOCK_TRIPS = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    source: 'San Francisco, CA',
    destination: 'San Jose, CA',
    date: '2024-02-15',
    time: '09:00',
    seats: 3
  },
  {
    id: '2',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    source: 'Oakland, CA',
    destination: 'San Francisco, CA',
    date: '2024-02-15',
    time: '08:30',
    seats: 2
  }
];

export function PoolingPage() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState<number | ''>(1);

  // Handler functions
  const handleSourceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSource(event.target.value);
  };

  const handleDestinationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDestination(event.target.value);
  };

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTime(event.target.value);
  };

  const handleSeatsChange = (value: string | number) => {
    // Convert the value to a number if it's a string
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
    setSeats(numericValue);
  };

  return (
    <MantineProvider theme={theme}>
      <Box
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f1eb 100%)',
          minHeight: '100vh',
          paddingTop: rem(20),
          paddingBottom: rem(40),
          width: '99vw'
        }}
      >
        <Container size="xl" py="xl">
          <Title
            order={1}
            ta="center"
            mb="xl"
            c="green.7"
            fw={700}
            style={{ letterSpacing: '0.5px' }}
          >
            GreenRide Carpooling
          </Title>

          <Grid gutter="xl">
            <Grid.Col span={8}>
              <Paper
                shadow="sm"
                p="xl"
                withBorder
                mb="xl"
                style={{
                  borderColor: 'var(--mantine-color-gray-2)',
                  background: 'linear-gradient(to right bottom, #ffffff, #f9fffc)'
                }}
              >
                <Title order={3} mb="md" c="green.7">Find or Create a Trip</Title>
                <Grid>
                  <Grid.Col span={12}>
                    <Group grow align="flex-start">
                      <TextInput
                        label="Starting Point"
                        placeholder="Enter source location"
                        value={source}
                        onChange={handleSourceChange}
                        leftSection={<IconMapPin size={16} color="green" />}
                        styles={{
                          label: { fontSize: rem(16), marginBottom: rem(8) }
                        }}
                      />

                      <TextInput
                        label="Destination"
                        placeholder="Enter destination"
                        value={destination}
                        onChange={handleDestinationChange}
                        leftSection={<IconMapPin size={16} color="green" />}
                        styles={{
                          label: { fontSize: rem(16), marginBottom: rem(8) }
                        }}
                      />
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <Group grow>
                      <DatePickerInput
                        label="Date"
                        placeholder="Select date"
                        value={date}
                        onChange={setDate}
                        leftSection={<IconCalendar size={16} color="green" />}
                        styles={{
                          label: { fontSize: rem(16), marginBottom: rem(8) }
                        }}
                      />

                      <TimeInput
                        label="Time"
                        placeholder="Select time"
                        value={time}
                        onChange={handleTimeChange}
                        leftSection={<IconClock size={16} color="green" />}
                        styles={{
                          label: { fontSize: rem(16), marginBottom: rem(8) }
                        }}
                      />

                      <NumberInput
                        label="Seats"
                        placeholder="Number of seats"
                        value={seats}
                        onChange={handleSeatsChange}
                        min={1}
                        max={8}
                        leftSection={<IconUsers size={16} color="green" />}
                        styles={{
                          label: { fontSize: rem(16), marginBottom: rem(8) }
                        }}
                      />
                    </Group>
                  </Grid.Col>
                </Grid>

                <Group justify="flex-end" mt="lg">
                  <Button
                    variant="outline"
                    color="green"
                    leftSection={<IconSearch size={16} />}
                  >
                    Search Trips
                  </Button>
                  <Button
                    variant="gradient"
                    gradient={{ from: 'green.6', to: 'teal.7' }}
                  >
                    Create Trip
                  </Button>
                </Group>
              </Paper>

              <Title
                order={2}
                size="h3"
                mb="md"
                c="green.8"
              >
                Available Trips
              </Title>

              <Stack gap="md">
                {MOCK_TRIPS.map((trip) => (
                  <Card
                    key={trip.id}
                    shadow="sm"
                    padding="lg"
                    withBorder
                    style={{
                      borderColor: 'var(--mantine-color-gray-2)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 'var(--mantine-shadow-md)',
                        }
                      }
                    }}
                  >
                    <Group justify="space-between" mb="md">
                      <Group>
                        <Avatar
                          src={trip.user.avatar}
                          radius="xl"
                          size="lg"
                          style={{ border: '2px solid #2ca969' }}
                        />
                        <div>
                          <Text fw={600} size="lg">{trip.user.name}</Text>
                          <Badge
                            color="green"
                            variant="light"
                            radius="sm"
                          >
                            {trip.seats} seats available
                          </Badge>
                        </div>
                      </Group>
                      <Text
                        c="green.7"
                        fw={600}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {trip.date} • {trip.time}
                      </Text>
                    </Group>

                    <Divider my="md" />

                    <Group grow gap="xs" mb="md">
                      <Paper
                        p="sm"
                        withBorder
                        radius="md"
                        style={{
                          borderColor: 'var(--mantine-color-gray-2)',
                          backgroundColor: 'var(--mantine-color-gray-0)'
                        }}
                      >
                        <Text size="sm" c="dimmed">From</Text>
                        <Text fw={500}>{trip.source}</Text>
                      </Paper>

                      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <IconArrowRight size={20} color="#2ca969" />
                      </Box>

                      <Paper
                        p="sm"
                        withBorder
                        radius="md"
                        style={{
                          borderColor: 'var(--mantine-color-gray-2)',
                          backgroundColor: 'var(--mantine-color-gray-0)'
                        }}
                      >
                        <Text size="sm" c="dimmed">To</Text>
                        <Text fw={500}>{trip.destination}</Text>
                      </Paper>
                    </Group>

                    <Button
                      variant="gradient"
                      gradient={{ from: 'green.5', to: 'teal.7' }}
                      fullWidth
                      mt="md"
                    >
                      Request to Join
                    </Button>
                  </Card>
                ))}
              </Stack>
            </Grid.Col>

            <Grid.Col span={4}>
              <Paper
                shadow="sm"
                withBorder
                style={{
                  height: '600px',
                  borderColor: 'var(--mantine-color-gray-2)',
                  overflow: 'hidden'
                }}
              >
                <Map
                  initialViewState={{
                    longitude: -122.4,
                    latitude: 37.8,
                    zoom: 11
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  mapboxAccessToken={MAPBOX_TOKEN}
                />
              </Paper>

              <Paper
                mt="md"
                p="md"
                shadow="sm"
                withBorder
                style={{
                  borderColor: 'var(--mantine-color-gray-2)',
                  background: 'linear-gradient(to right, #e6f7ec, #f0fcf5)'
                }}
              >
                <Text fw={600} c="green.8" mb="xs">Pro Tips</Text>
                <Text size="sm" c="gray.7">Set your regular commute route to receive notifications when new matching trips are posted!</Text>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
    </MantineProvider>
  );
}
