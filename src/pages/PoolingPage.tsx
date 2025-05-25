  import { useState, ChangeEvent, useEffect } from 'react';
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
    NumberInput,
    Grid,
    Badge,
    Divider,
    Box,
    SimpleGrid,
    ScrollArea
  } from '@mantine/core';
  import { DatePickerInput, TimeInput } from '@mantine/dates';
  import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
  import 'leaflet/dist/leaflet.css';
  import { Icon } from 'leaflet';
  import { IconMapPin, IconArrowRight, IconCalendar, IconClock, IconUsers, IconSearch, IconCar, IconWalk, IconBus } from '@tabler/icons-react';
  import { collection, doc, setDoc, getDocs,getDoc, query, where, Timestamp } from 'firebase/firestore';
  import { db, auth } from '../firebase'; // Assuming firebase.ts is properly set up
  import { onAuthStateChanged, User } from 'firebase/auth';
  import { sendJoinRequest } from "../handlers/JoinRequestHandler";

  // Fix for Leaflet's default icon missing in production builds
  import markerIconPng from 'leaflet/dist/images/marker-icon.png';
  import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

  const defaultIcon = new Icon({
    iconUrl: markerIconPng.toString(),
    shadowUrl: markerShadowPng.toString(),
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

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

  // Carbon footprint data (average emissions in kg CO2 per km)
  const CARBON_FOOTPRINT = {
    car: 0.170,      // Average passenger car
    carpool: 0.085,  // Assuming 2 people sharing
    bus: 0.105,      // Public bus 
    walk: 0,         // Walking
    bike: 0          // Biking
  };

  interface LocationCoords {
    lat: number;
    lng: number;
  }

  interface Trip {
    id: string;
    user: {
      name: string;
      id?: string;
    };
    source: string;
    destination: string;
    sourceCoords?: LocationCoords;
    destinationCoords?: LocationCoords;
    date: string;
    time: string;
    seats: number;
    distance?: number;
  }

  // Component to update map view when coordinates change
  const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  };

  export function PoolingPage() {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState('');
    const [seats, setSeats] = useState<number | ''>(1);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Map state
    const [sourceCoords, setSourceCoords] = useState<LocationCoords | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<LocationCoords | null>(null);
    const [routePath, setRoutePath] = useState<[number, number][]>([]);
    const [distance, setDistance] = useState<number | null>(null);
    const [center, setCenter] = useState<[number, number]>([37.8, -122.4]);
    const [zoom, setZoom] = useState(11);

    // For carbon footprint calculation
    const [carbonFootprints, setCarbonFootprints] = useState<{[key: string]: number} | null>(null);

    // Load trips from Firestore on component mount
    useEffect(() => {
      fetchTrips();
    }, []);

    // Fetch trips from Firestore
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const tripsCollection = collection(db, 'trips');
        const querySnapshot = await getDocs(tripsCollection);
        
        const fetchedTrips: Trip[] = [];
        querySnapshot.forEach((doc) => {
          const tripData = doc.data() as Trip;
          fetchedTrips.push({
            ...tripData,
            id: doc.id
          });
        });
        
        setTrips(fetchedTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setTrips([]); // Set empty array instead of falling back to mock data
      } finally {
        setLoading(false);
      }
    };

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userName, setUserName] = useState('Anonymous User');
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          
          // Fetch user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().name) {
              setUserName(userDoc.data().name);
            }
          } catch (error) {
            console.error("Error fetching user data: ", error);
          }
        } else {
          setCurrentUser(null);
          setUserName('Anonymous User');
        }
      });
      
      return () => unsubscribe();
    }, []);

    // Search for matching trips based on source, destination and date
    const searchTrips = async () => {
      if (!source || !destination || !date) {
        alert("Please fill in the source, destination, and date fields");
        return;
      }

      try {
        setLoading(true);
        const tripsCollection = collection(db, 'trips');
        
        // Convert the date to a string format for comparison
        const dateString = date.toISOString().split('T')[0];
        
        // Create a query to find matching trips
        const q = query(
          tripsCollection,
          where("source", "==", source),
          where("destination", "==", destination),
          where("date", "==", dateString)
        );
        
        const querySnapshot = await getDocs(q);
        
        const matchingTrips: Trip[] = [];
        querySnapshot.forEach((doc) => {
          const tripData = doc.data() as Trip;
          matchingTrips.push({
            ...tripData,
            id: doc.id
          });
        });
        
        setTrips(matchingTrips);
        
        if (matchingTrips.length === 0) {
          alert("No matching trips found. Consider creating a new trip!");
        }
      } catch (error) {
        console.error("Error searching trips:", error);
        alert("Error searching for trips. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Create a new trip and store it in Firestore
    const createTrip = async () => {
      if (!source || !destination || !date || !time || !seats) {
        alert("Please fill in all required fields");
        return;
      }
    
      if (!sourceCoords || !destinationCoords) {
        alert("Please ensure locations are valid for mapping");
        return;
      }
    
      try {
        setLoading(true);
        
        // Get current user (if authentication is set up)
        const userId = currentUser?.uid || 'anonymous-user';
        
        // Use the userName from state that was set by the onAuthStateChanged listener
        // This will contain the name from Firestore if available
        
        // Create a new trip object
        const newTrip: Trip = {
          id: '', // Will be set by Firestore
          user: {
            id: userId,
            name: userName  // Using the state variable that's populated from Firestore
          },
          source,
          destination,
          sourceCoords,
          destinationCoords,
          date: date.toISOString().split('T')[0],
          time,
          seats: typeof seats === 'number' ? seats : parseInt(seats as string, 10),
          distance: distance || 0
        };
        
        // Add to Firestore
        // First create reference to the user's trips collection
        const userDocRef = doc(db, 'users', userId);
        const tripsCollectionRef = collection(userDocRef, 'trips');
        
        // Create a new trip document with auto-generated ID
        const newTripDocRef = doc(tripsCollectionRef);
        await setDoc(newTripDocRef, newTrip);
        
        // Also add to the global trips collection for easier querying
        const globalTripsCollectionRef = collection(db, 'trips');
        await setDoc(doc(globalTripsCollectionRef, newTripDocRef.id), {
          ...newTrip,
          id: newTripDocRef.id,
          createdAt: Timestamp.now()
        });
        
        alert("Trip created successfully!");
        
        // Refresh trips list
        fetchTrips();
        
        // Clear form
        setSource('');
        setDestination('');
        setDate(null);
        setTime('');
        setSeats(1);
        setSourceCoords(null);
        setDestinationCoords(null);
        setRoutePath([]);
        setCarbonFootprints(null);
        
      } catch (error) {
        console.error("Error creating trip:", error);
        alert("Error creating trip. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Handler functions
    const handleSourceChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSource(value);
      
      if (value) {
        // Geocode the source location using OpenStreetMap Nominatim API
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`);
          const data = await response.json();
          
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
            setSourceCoords(coords);
            
            // Update map view
            setCenter([coords.lat, coords.lng]);
            setZoom(13);
            
            // If destination is also set, calculate route and carbon footprint
            if (destinationCoords) {
              calculateRoute(coords, destinationCoords);
            }
          }
        } catch (error) {
          console.error("Error geocoding source:", error);
        }
      }
    };

    const handleDestinationChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setDestination(value);
      
      if (value) {
        // Geocode the destination location using OpenStreetMap Nominatim API
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`);
          const data = await response.json();
          
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
            setDestinationCoords(coords);
            
            // If source is also set, calculate route and carbon footprint
            if (sourceCoords) {
              calculateRoute(sourceCoords, coords);
            }
          }
        } catch (error) {
          console.error("Error geocoding destination:", error);
        }
      }
    };

    const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
      setTime(event.target.value);
    };

    const handleSeatsChange = (value: string | number) => {
      // Convert the value to a number if it's a string
      const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
      setSeats(numericValue);
    };

    // Calculate route between source and destination using OSRM
    const calculateRoute = async (source: LocationCoords, destination: LocationCoords) => {
      try {
        // Using OSRM public API for routing
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          // Extract the coordinates from the route geometry
          const coordinates = data.routes[0].geometry.coordinates;
          
          // Transform from [lng, lat] to [lat, lng] for react-leaflet
          const path: [number, number][] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRoutePath(path);
          
          // Calculate distance in kilometers
          const distanceInMeters = data.routes[0].distance;
          const distanceInKm = distanceInMeters / 1000;
          setDistance(distanceInKm);
          
          // Calculate carbon footprint for different modes
          const footprints = {
            car: parseFloat((distanceInKm * CARBON_FOOTPRINT.car).toFixed(2)),
            carpool: parseFloat((distanceInKm * CARBON_FOOTPRINT.carpool).toFixed(2)),
            bus: parseFloat((distanceInKm * CARBON_FOOTPRINT.bus).toFixed(2)),
            walk: 0,
            bike: 0
          };
          
          setCarbonFootprints(footprints);
          
          // Center the map to show the entire route
          const bounds = path.reduce(
            (bounds, point) => {
              return [
                [Math.min(bounds[0][0], point[0]), Math.min(bounds[0][1], point[1])],
                [Math.max(bounds[1][0], point[0]), Math.max(bounds[1][1], point[1])]
              ];
            },
            [[path[0][0], path[0][1]], [path[0][0], path[0][1]]]
          );
          
          const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
          const centerLng = (bounds[0][1] + bounds[1][1]) / 2;
          setCenter([centerLat, centerLng]);
          setZoom(10);
        }
      } catch (error) {
        console.error("Error calculating route:", error);
        
        // Fallback: If OSRM fails, just draw a straight line between points
        if (source && destination) {
          setRoutePath([[source.lat, source.lng], [destination.lat, destination.lng]]);
          
          // Calculate straight-line distance (Haversine formula)
          const R = 6371; // Earth's radius in km
          const dLat = (destination.lat - source.lat) * Math.PI / 180;
          const dLng = (destination.lng - source.lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(source.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          setDistance(distance);
          
          // Calculate carbon footprint with the straight-line distance
          const footprints = {
            car: parseFloat((distance * CARBON_FOOTPRINT.car).toFixed(2)),
            carpool: parseFloat((distance * CARBON_FOOTPRINT.carpool).toFixed(2)),
            bus: parseFloat((distance * CARBON_FOOTPRINT.bus).toFixed(2)),
            walk: 0,
            bike: 0
          };
          
          setCarbonFootprints(footprints);
          
          // Center map between the two points
          setCenter([(source.lat + destination.lat) / 2, (source.lng + destination.lng) / 2]);
          setZoom(10);
        }
      }
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
              Ride2Green Carpooling
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
                      onClick={searchTrips}
                      loading={loading}
                    >
                      Search Trips
                    </Button>
                    <Button
                      variant="gradient"
                      gradient={{ from: 'green.6', to: 'teal.7' }}
                      onClick={createTrip}
                      loading={loading}
                    >
                      Create Trip
                    </Button>
                  </Group>
                </Paper>

                <Group justify="space-between" mb="md">
                  <Title
                    order={2}
                    size="h3"
                    c="green.8"
                  >
                    Available Trips
                  </Title>
                  {trips.length > 3 && (
                    <Text size="sm" c="dimmed">Showing {trips.length} trips</Text>
                  )}
                </Group>

                {/* Added ScrollArea component with fixed height */}
                <ScrollArea h={trips.length > 3 ? 450 : 'auto'} offsetScrollbars scrollbarSize={8}>
                  <Stack gap="md">
                    {trips.length > 0 ? (
                      trips.map((trip) => (
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
                            onClick={() => {
                              if (!currentUser) {
                                alert("You must be logged in to request to join.");
                                return; 
                              }

                              // Ensure you have the source and destination values
                              const source = trip.source; // Assuming trip.source contains the source location
                              const destination = trip.destination; // Assuming trip.destination contains the destination location

                              // Call sendJoinRequest with all 6 required arguments
                              sendJoinRequest(
                                trip.id, // tripId
                                trip.user.id!, // tripOwnerId
                                currentUser.uid, // requestingUserId
                                userName, // requestingUserName
                                source, // source
                                destination // destination
                              );
                            }}
                          >
                          Request to Join
                        </Button>

                        </Card>
                      ))
                    ) : (
                      <Paper p="xl" withBorder ta="center">
                        <Text c="dimmed">No trips found matching your criteria. Create a new trip or try different search parameters.</Text>
                      </Paper>
                    )}
                  </Stack>
                </ScrollArea>
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
                  <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <ChangeView center={center} zoom={zoom} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {sourceCoords && (
                      <Marker 
                        position={[sourceCoords.lat, sourceCoords.lng]} 
                        icon={defaultIcon}
                      >
                        <Popup>
                          <Text fw={500}>Starting Point</Text>
                          <Text size="sm">{source}</Text>
                        </Popup>
                      </Marker>
                    )}
                    
                    {destinationCoords && (
                      <Marker 
                        position={[destinationCoords.lat, destinationCoords.lng]} 
                        icon={defaultIcon}
                      >
                        <Popup>
                          <Text fw={500}>Destination</Text>
                          <Text size="sm">{destination}</Text>
                        </Popup>
                      </Marker>
                    )}
                    
                    {routePath.length > 0 && (
                      <Polyline 
                        positions={routePath}
                        color="#2ca969"
                        weight={4}
                      />
                    )}
                  </MapContainer>
                </Paper>

                {carbonFootprints ? (
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
                    <Text fw={600} c="green.8" mb="md">Carbon Footprint Comparison</Text>
                    <Text size="sm" mb="md">
                      Trip distance: {distance?.toFixed(1)} km
                    </Text>
                    
                    <SimpleGrid cols={2} spacing="xs">
                      <Paper p="xs" withBorder>
                        <Group>
                          <IconCar size={20} color="#ff6b6b" />
                          <div>
                            <Text size="xs" c="dimmed">Single Car</Text>
                            <Text fw={500}>{carbonFootprints.car} kg CO₂</Text>
                          </div>
                        </Group>
                      </Paper>
                      
                      <Paper p="xs" withBorder>
                        <Group>
                          <IconCar size={20} color="#2ca969" />
                          <div>
                            <Text size="xs" c="dimmed">Carpool</Text>
                            <Text fw={500}>{carbonFootprints.carpool} kg CO₂</Text>
                          </div>
                        </Group>
                      </Paper>
                      
                      <Paper p="xs" withBorder>
                        <Group>
                          <IconBus size={20} color="#4dabf7" />
                          <div>
                            <Text size="xs" c="dimmed">Public Transit</Text>
                            <Text fw={500}>{carbonFootprints.bus} kg CO₂</Text>
                          </div>
                        </Group>
                      </Paper>
                      
                      <Paper p="xs" withBorder>
                        <Group>
                          <IconWalk size={20} color="#20c997" />
                          <div>
                            <Text size="xs" c="dimmed">Walking</Text>
                            <Text fw={500}>0 kg CO₂</Text>
                          </div>
                        </Group>
                      </Paper>
                    </SimpleGrid>
                    
                    <Text size="xs" c="dimmed" mt="md">
                      By carpooling, you save {(carbonFootprints.car - carbonFootprints.carpool).toFixed(2)} kg of CO₂ emissions per trip!
                    </Text>
                  </Paper>
                ) : (
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
                    <Text size="sm" c="gray.7">Enter your source and destination to see the route on the map and calculate carbon savings!</Text>
                  </Paper>
                )}
              </Grid.Col>
            </Grid>
          </Container>
        </Box>
      </MantineProvider>
    );
  }