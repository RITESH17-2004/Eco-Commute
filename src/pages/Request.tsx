import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  Text, 
  Tabs, 
  Title, 
  Badge, 
  Group, 
  Stack, 
  Container,
  Box,
  ThemeIcon,
  Divider,
  Paper,
  rem,
  Transition,
  Loader,
  Center,
  Button,
  ScrollArea
} from "@mantine/core";
import { IconClock, IconCheck, IconX, IconMapPin, IconCalendar, IconArrowRight, IconUser } from '@tabler/icons-react';
import { respondToJoinRequest } from "../handlers/JoinRequestHandler";

interface Request {
  tripId: string;
  requesterId: string;
  requesterName: string;
  status: string;
  source: string;
  destination: string;
  timestamp: any;
}

interface AcceptedRequest {
  tripId: string;
  requesterId: string;
  requesterName?: string;
  status: string;
  source?: string;
  destination?: string;
  timestamp: any;
}

export function Requests() {
  const currentUser = auth.currentUser;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>("pending");
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<AcceptedRequest[]>([]);
  const [declinedRequests, setDeclinedRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;
  
    const uid = currentUser.uid;
    setIsLoading(true);
  
    async function fetchRequests() {
      // Fetch pending requests
      const requestCollection = collection(db, "users", uid, "requests");
      const pendingQuery = query(requestCollection, where("status", "==", "pending"));
      const pendingSnapshot = await getDocs(pendingQuery);
      
      const fetchedPendingRequests = pendingSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          tripId: doc.id, 
          source: data.source,
          destination: data.destination
        } as Request;
      });
      setPendingRequests(fetchedPendingRequests);
      
      // Fetch accepted requests
      const acceptedQuery = query(requestCollection, where("status", "==", "accepted"));
      const acceptedSnapshot = await getDocs(acceptedQuery);
      
      const fetchedAcceptedRequests = acceptedSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          tripId: doc.id,
          source: data.source,
          destination: data.destination
        } as AcceptedRequest;
      });
      setAcceptedRequests(fetchedAcceptedRequests);
      
      // Fetch declined requests
      const declinedQuery = query(requestCollection, where("status", "==", "declined"));
      const declinedSnapshot = await getDocs(declinedQuery);
      
      const fetchedDeclinedRequests = declinedSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          tripId: doc.id,
          source: data.source,
          destination: data.destination
        } as Request;
      });
      setDeclinedRequests(fetchedDeclinedRequests);
      setIsLoading(false);
    }
  
    fetchRequests();
  }, [currentUser]);

  async function handleResponse(tripId: string, requesterId: string, response: "accepted" | "declined") {
    if (!currentUser?.uid) return;

    const uid = currentUser.uid;
    
    // Use the respondToJoinRequest function from JoinRequestHandler
    await respondToJoinRequest(uid, tripId, requesterId, response);
    
    // Find the request that was responded to
    const requestToUpdate = pendingRequests.find(req => req.tripId === tripId);
    
    // Remove the request from pending requests
    setPendingRequests((prevRequests) =>
      prevRequests.filter((req) => req.tripId !== tripId)
    );

    // If accepted, add to accepted requests
    if (response === "accepted" && requestToUpdate) {
      setAcceptedRequests(prev => [...prev, {...requestToUpdate, status: "accepted"}]);
    }
    
    // If declined, add to declined requests
    if (response === "declined" && requestToUpdate) {
      setDeclinedRequests(prev => [...prev, {...requestToUpdate, status: "declined"}]);
    }

    alert(`Request ${response} successfully`);
  }

  // Function to render request card
  const renderRequestCard = (req: Request | AcceptedRequest, showActions: boolean = false) => {
    return (
      <Paper 
        key={req.tripId} 
        shadow="sm"
        p="xl" 
        mb="lg" 
        radius="md"
        withBorder
        style={{ 
          background: 'white',
          transition: 'all 0.2s ease',
          minHeight: rem(120)
        }}
      >
        <Group gap="lg">
          <ThemeIcon 
            color="blue" 
            variant="light" 
            size="xl" 
            radius="xl"
          >
            <IconUser size={22} />
          </ThemeIcon>
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text fw={600} size="lg">
              {req.requesterName} 
              {req.status === 'pending' 
                ? ' requested to join your trip' 
                : req.status === 'accepted' 
                  ? ' was accepted to join your trip' 
                  : '\'s request was declined'}
            </Text>
            
            <Group gap="xs" align="center">
              <IconMapPin size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
              <Text size="md">
                {req.source} <IconArrowRight size={14} style={{ opacity: 0.6 }} /> {req.destination}
              </Text>
            </Group>
            
            {req.timestamp && (
              <Group gap="xs">
                <IconCalendar size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                <Text size="sm" c="dimmed">
                  {req.status === 'pending' ? 'Received on ' : 
                   req.status === 'accepted' ? 'Accepted on ' : 'Declined on '}
                  {req.timestamp?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                </Text>
              </Group>
            )}
            
            {showActions && (
              <Group mt="md">
                <Button 
                  variant="filled" 
                  color="green"
                  radius="md"
                  onClick={() => handleResponse(req.tripId, req.requesterId, "accepted")}
                  style={{ 
                    transition: "all 0.2s ease", 
                    ':hover': { transform: "translateY(-2px)" } 
                  }}
                >
                  Accept
                </Button>
                <Button 
                  variant="filled" 
                  color="red"
                  radius="md"
                  onClick={() => handleResponse(req.tripId, req.requesterId, "declined")}
                  style={{ 
                    transition: "all 0.2s ease", 
                    ':hover': { transform: "translateY(-2px)" } 
                  }}
                >
                  Decline
                </Button>
              </Group>
            )}
          </Stack>
        </Group>
      </Paper>
    );
  };
  
  // Get empty state message based on active tab
  const getEmptyStateMessage = () => {
    switch(activeTab) {
      case 'pending':
        return "You don't have any pending join requests at the moment";
      case 'accepted':
        return "You haven't accepted any join requests yet";
      case 'declined':
        return "You haven't declined any requests";
      default:
        return "No requests found";
    }
  };

  // Tab style helper function
  const getTabStyle = (tabValue: string) => {
    const isActive = activeTab === tabValue;
    const baseStyle = {
      borderRadius: rem(20),
      fontWeight: 600,
      padding: `${rem(12)} ${rem(20)}`,
      transition: 'all 0.2s ease',
      fontSize: rem(16),
      margin: '0 4px',
      cursor: 'pointer',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };

    // Different styling based on tab type
    if (tabValue === 'pending') {
      return {
        ...baseStyle,
        background: isActive ? '#40c057' : 'transparent',
        color: isActive ? 'white' : 'inherit',
        ':hover': {
          background: isActive ? '#40c057' : '#e6f7e6',
          transform: 'translateY(-2px)',
          boxShadow: isActive ? '0 4px 12px rgba(64, 192, 87, 0.3)' : 'none',
        }
      };
    } else if (tabValue === 'accepted') {
      return {
        ...baseStyle,
        background: isActive ? '#339af0' : 'transparent',
        color: isActive ? 'white' : 'inherit',
        ':hover': {
          background: isActive ? '#339af0' : '#e7f5ff',
          transform: 'translateY(-2px)',
          boxShadow: isActive ? '0 4px 12px rgba(51, 154, 240, 0.3)' : 'none',
        }
      };
    } else {
      return {
        ...baseStyle,
        background: isActive ? '#fa5252' : 'transparent',
        color: isActive ? 'white' : 'inherit',
        ':hover': {
          background: isActive ? '#fa5252' : '#fff5f5',
          transform: 'translateY(-2px)',
          boxShadow: isActive ? '0 4px 12px rgba(250, 82, 82, 0.3)' : 'none',
        }
      };
    }
  };

  // Define max visible requests and scroll container height
  const MAX_VISIBLE_REQUESTS = 3;
  const SCROLL_CONTAINER_HEIGHT = rem(450); // Adjust this value as needed

  return (
    <Box 
      style={{ 
        display: 'flex', 
        alignContent: 'center',
        justifyContent: 'center', 
        width: '99vw',
        background: '#f8f9fa',
        minHeight: '100vh',
        padding: '3rem 0'
      }}
    >
      <Container size="md" py="xl" px="xl">
        <Paper 
          radius="lg" 
          p={0} 
          withBorder
          shadow="md"
          style={{
            overflow: 'hidden',
            border: '1px solid #eaeaea',
            background: 'white'
          }}
        >
          <Box p="xl" pb="md">
            <Title 
              order={1} 
              ta="center" 
              fw={800}
              style={{
                fontSize: rem(42),
                background: 'linear-gradient(135deg, #1c7ed6 0%, #20c997 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: rem(12)
              }}
            >
              Incoming Requests
            </Title>
            <Text c="dimmed" size="md" ta="center">
              Manage requests from users who want to join your trips
            </Text>
          </Box>
          
          <Divider style={{ opacity: 0.6 }} />
          
          <Box p="lg" pt="xl">
            <Group gap={0} wrap="nowrap" style={{ marginBottom: rem(32) }}>
              <Tabs 
                defaultValue="pending" 
                value={activeTab} 
                onChange={setActiveTab} 
                variant="unstyled"
                style={{ width: '100%' }}
              >
                <Tabs.List grow>
                  <Tabs.Tab 
                    value="pending" 
                    style={getTabStyle('pending')}
                  >
                    <Group gap="xs" wrap="nowrap" justify="center">
                      <IconClock size={18} />
                      <Text>Pending</Text>
                      {pendingRequests.length > 0 && (
                        <Badge 
                          size="sm" 
                          variant="filled" 
                          color={activeTab === "pending" ? "white" : "green"}
                          style={{
                            backgroundColor: activeTab === "pending" ? "white" : undefined,
                            color: activeTab === "pending" ? "#40c057" : "white",
                            transition: "all 0.2s ease"
                          }}
                          radius="xl"
                        >
                          {pendingRequests.length}
                        </Badge>
                      )}
                    </Group>
                  </Tabs.Tab>
                  
                  <Tabs.Tab 
                    value="accepted" 
                    style={getTabStyle('accepted')}
                  >
                    <Group gap="xs" wrap="nowrap" justify="center">
                      <IconCheck size={18} />
                      <Text>Accepted</Text>
                      {acceptedRequests.length > 0 && (
                        <Badge 
                          size="sm" 
                          variant="filled" 
                          color={activeTab === "accepted" ? "white" : "blue"}
                          style={{
                            backgroundColor: activeTab === "accepted" ? "white" : undefined,
                            color: activeTab === "accepted" ? "#339af0" : "white",
                            transition: "all 0.2s ease"
                          }}
                          radius="xl"
                        >
                          {acceptedRequests.length}
                        </Badge>
                      )}
                    </Group>
                  </Tabs.Tab>
                  
                  <Tabs.Tab 
                    value="declined" 
                    style={getTabStyle('declined')}
                  >
                    <Group gap="xs" wrap="nowrap" justify="center">
                      <IconX size={18} />
                      <Text>Declined</Text>
                      {declinedRequests.length > 0 && (
                        <Badge 
                          size="sm" 
                          variant="filled" 
                          color={activeTab === "declined" ? "white" : "red"}
                          style={{
                            backgroundColor: activeTab === "declined" ? "white" : undefined,
                            color: activeTab === "declined" ? "#fa5252" : "white",
                            transition: "all 0.2s ease"
                          }}
                          radius="xl"
                        >
                          {declinedRequests.length}
                        </Badge>
                      )}
                    </Group>
                  </Tabs.Tab>
                </Tabs.List>

                <Box pt="md">
                  {isLoading ? (
                    <Center style={{ padding: rem(60) }}>
                      <Loader size="md" color="blue" />
                    </Center>
                  ) : (
                    <>
                      <Transition
                        mounted={activeTab === "pending"}
                        transition="fade"
                        duration={300}
                      >
                        {(styles) => (
                          <Tabs.Panel value="pending" style={styles}>
                            {pendingRequests.length === 0 ? (
                              <Paper 
                                p="xl" 
                                radius="md" 
                                withBorder 
                                style={{ 
                                  borderStyle: 'dashed', 
                                  textAlign: 'center',
                                  background: '#f9f9f9'
                                }}
                              >
                                <Text ta="center" c="dimmed" py="md">
                                  {getEmptyStateMessage()}
                                </Text>
                              </Paper>
                            ) : (
                              <ScrollArea h={pendingRequests.length > MAX_VISIBLE_REQUESTS ? SCROLL_CONTAINER_HEIGHT : 'auto'}>
                                {pendingRequests.map(req => renderRequestCard(req, true))}
                              </ScrollArea>
                            )}
                          </Tabs.Panel>
                        )}
                      </Transition>

                      <Transition
                        mounted={activeTab === "accepted"}
                        transition="fade"
                        duration={300}
                      >
                        {(styles) => (
                          <Tabs.Panel value="accepted" style={styles}>
                            {acceptedRequests.length === 0 ? (
                              <Paper 
                                p="xl" 
                                radius="md" 
                                withBorder 
                                style={{ 
                                  borderStyle: 'dashed', 
                                  textAlign: 'center',
                                  background: '#f9f9f9'
                                }}
                              >
                                <Text ta="center" c="dimmed" py="md">
                                  {getEmptyStateMessage()}
                                </Text>
                              </Paper>
                            ) : (
                              <ScrollArea h={acceptedRequests.length > MAX_VISIBLE_REQUESTS ? SCROLL_CONTAINER_HEIGHT : 'auto'}>
                                {acceptedRequests.map(req => renderRequestCard(req))}
                              </ScrollArea>
                            )}
                          </Tabs.Panel>
                        )}
                      </Transition>

                      <Transition
                        mounted={activeTab === "declined"}
                        transition="fade"
                        duration={300}
                      >
                        {(styles) => (
                          <Tabs.Panel value="declined" style={styles}>
                            {declinedRequests.length === 0 ? (
                              <Paper 
                                p="xl" 
                                radius="md" 
                                withBorder 
                                style={{ 
                                  borderStyle: 'dashed', 
                                  textAlign: 'center',
                                  background: '#f9f9f9'
                                }}
                              >
                                <Text ta="center" c="dimmed" py="md">
                                  {getEmptyStateMessage()}
                                </Text>
                              </Paper>
                            ) : (
                              <ScrollArea h={declinedRequests.length > MAX_VISIBLE_REQUESTS ? SCROLL_CONTAINER_HEIGHT : 'auto'}>
                                {declinedRequests.map(req => renderRequestCard(req))}
                              </ScrollArea>
                            )}
                          </Tabs.Panel>
                        )}
                      </Transition>
                    </>
                  )}
                </Box>
              </Tabs>
            </Group>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}