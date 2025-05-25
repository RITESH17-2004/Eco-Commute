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
  ScrollArea
} from "@mantine/core";
import { IconClock, IconCheck, IconX, IconMapPin, IconCalendar, IconArrowRight } from '@tabler/icons-react';

interface SentRequest {
  tripId: string;
  tripOwnerId: string;
  requesterName: string;
  status: string;
  source: string;
  destination: string;
  timestamp: any;
}

export function SentRequests() {
  const currentUser = auth.currentUser;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>("pending");
  const [pendingSentRequests, setPendingSentRequests] = useState<SentRequest[]>([]);
  const [acceptedSentRequests, setAcceptedSentRequests] = useState<SentRequest[]>([]);
  const [declinedSentRequests, setDeclinedSentRequests] = useState<SentRequest[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const uid = currentUser.uid;
    setIsLoading(true);

    async function fetchSentRequests() {
      const sentRequestCollection = collection(db, "users", uid, "sentRequests");
      
      // Fetch pending sent requests
      const pendingQuery = query(sentRequestCollection, where("status", "==", "pending"));
      const pendingSnapshot = await getDocs(pendingQuery);
      
      const fetchedPendingRequests = pendingSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          tripId: doc.id,
          source: data.source,
          destination: data.destination
        } as SentRequest;
      });
      setPendingSentRequests(fetchedPendingRequests);
      
      // Fetch accepted sent requests
      const acceptedQuery = query(sentRequestCollection, where("status", "==", "accepted"));
      const acceptedSnapshot = await getDocs(acceptedQuery);
      
      const fetchedAcceptedRequests = acceptedSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          tripId: doc.id,
          source: data.source,
          destination: data.destination
        } as SentRequest;
      });
      setAcceptedSentRequests(fetchedAcceptedRequests);
      
      // Fetch declined sent requests
      const declinedQuery = query(sentRequestCollection, where("status", "==", "declined"));
      const declinedSnapshot = await getDocs(declinedQuery);
      
      const fetchedDeclinedRequests = declinedSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          tripId: doc.id,
          source: data.source,
          destination: data.destination
        } as SentRequest;
      });
      setDeclinedSentRequests(fetchedDeclinedRequests);
      setIsLoading(false);
    }

    fetchSentRequests();
  }, [currentUser]);

  // Function to render request card
  const renderRequestCard = (req: SentRequest) => {    
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
            <IconMapPin size={22} />
          </ThemeIcon>
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group gap="xs" align="center">
              <Text fw={600} size="lg">
                {req.source}
              </Text>
              <IconArrowRight size={18} style={{ opacity: 0.6 }} />
              <Text fw={600} size="lg">
                {req.destination}
              </Text>
            </Group>
            
            <Group gap="xs">
              <IconCalendar size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
              <Text size="sm" c="dimmed">
                {req.status === 'pending' ? 'Sent on ' : 
                 req.status === 'accepted' ? 'Accepted on ' : 'Declined on '}
                {req.timestamp?.toDate().toLocaleDateString()}
              </Text>
            </Group>
          </Stack>
        </Group>
      </Paper>
    );
  };

  // Get empty state message based on active tab
  const getEmptyStateMessage = () => {
    switch(activeTab) {
      case 'pending':
        return "You don't have any pending requests at the moment";
      case 'accepted':
        return "No accepted requests yet - keep sending those trip requests!";
      case 'declined':
        return "Good news! You don't have any declined requests";
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
  
  // Check if scrolling should be enabled (more than 3 items)
  const needsScrolling = (items: SentRequest[]) => items.length > 3;
  
  // Calculate max height for scroll area 
  // (approximated height of 3 cards plus some padding)
  const getScrollAreaHeight = () => rem(480);

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
              My Requests
            </Title>
            <Text c="dimmed" size="md" ta="center">
              Track the status of your trip requests in one place
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
                      {pendingSentRequests.length > 0 && (
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
                          {pendingSentRequests.length}
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
                      {acceptedSentRequests.length > 0 && (
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
                          {acceptedSentRequests.length}
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
                      {declinedSentRequests.length > 0 && (
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
                          {declinedSentRequests.length}
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
                            {pendingSentRequests.length === 0 ? (
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
                              <ScrollArea h={needsScrolling(pendingSentRequests) ? getScrollAreaHeight() : undefined} offsetScrollbars>
                                {pendingSentRequests.map(req => renderRequestCard(req))}
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
                            {acceptedSentRequests.length === 0 ? (
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
                              <ScrollArea h={needsScrolling(acceptedSentRequests) ? getScrollAreaHeight() : undefined} offsetScrollbars>
                                {acceptedSentRequests.map(req => renderRequestCard(req))}
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
                            {declinedSentRequests.length === 0 ? (
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
                              <ScrollArea h={needsScrolling(declinedSentRequests) ? getScrollAreaHeight() : undefined} offsetScrollbars>
                                {declinedSentRequests.map(req => renderRequestCard(req))}
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