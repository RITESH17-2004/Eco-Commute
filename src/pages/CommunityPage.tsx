import { useState } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Text, 
  Avatar, 
  Group, 
  Button,
  Textarea,
  Stack,
  Card,
  Image,
  ActionIcon,
  Divider,
  Badge,
  Flex,
  Box,
  rem
} from '@mantine/core';
import { IconHeart, IconMessageCircle2, IconShare, IconSend, IconPhoto, IconVideo, IconMoodSmile } from '@tabler/icons-react';

// Simple CSS variable for responsive title
const titleStyles = {
  '@media (max-width: 768px)': {
    fontSize: 'var(--mantine-font-size-xl)'
  }
};

const MOCK_POSTS = [
  {
    id: '1',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      badge: 'Eco Champion'
    },
    content: "Just calculated my carbon footprint and reduced it by 20% this month! Here's how I did it: switched to public transport twice a week, started composting at home, and reduced my meat consumption. Small changes really do add up!",
    image: '',
    likes: 24,
    comments: 7,
    created_at: '2024-02-10T10:30:00Z'
  },
  {
    id: '2',
    user: {
      name: 'Michael Chen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      badge: 'New Member'
    },
    content: "Started carpooling with my colleagues this week. It's amazing how much we can reduce emissions by sharing rides! We've also started planning our routes more efficiently to minimize fuel consumption.",
    likes: 18,
    comments: 3,
    created_at: '2024-02-10T09:15:00Z'
  }
];

export function CommunityPage() {
  const [newPost, setNewPost] = useState('');

  const handleSubmit = () => {
    // Handle post submission
    setNewPost('');
  };

  return (
    <Box 
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f1eb 100%)',
        minHeight: '100vh',
        paddingTop: rem(20),
        paddingBottom: rem(40),
        width: '99vw'
      }}>
      <Container size="md" py={{ base: 'md', sm: 'xl' }}>
        <Title
          order={1}
          ta="center"
          mb={{ base: 'lg', sm: 'xl' }}
          c="green.8"
          fw={800}
          style={titleStyles}
        >
          Community Feed
        </Title>

        <Paper
          shadow="md"
          radius="lg"
          p={{ base: 'md', sm: 'xl' }}
          withBorder
          mb="xl"
          bg="green.0"
        >
          <Textarea
            placeholder="What eco-friendly actions are you taking today?"
            minRows={3}
            value={newPost}
            onChange={(event) => setNewPost(event.currentTarget.value)}
            radius="md"
            size="md"
            mb="md"
          />
          
          <Flex gap="xs" mb="md" wrap="wrap">
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
              <IconPhoto size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
              <IconVideo size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
              <IconMoodSmile size={18} stroke={1.5} />
            </ActionIcon>
          </Flex>

          <Button 
            onClick={handleSubmit}
            variant="gradient"
            gradient={{ from: 'teal.6', to: 'green.8', deg: 105 }}
            radius="xl"
            size="md"
            disabled={!newPost.trim()}
            rightSection={<IconSend size={16} />}
          >
            Share with Community
          </Button>
        </Paper>

        <Stack gap="lg">
          {MOCK_POSTS.map((post) => (
            <Card 
              key={post.id} 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
              bg="white"
            >
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  <Avatar 
                    src={post.user.avatar} 
                    radius="xl" 
                    size="lg"
                    alt={post.user.name}
                  />
                  <div>
                    <Group gap={8} align="center">
                      <Text fw={700} size="md">{post.user.name}</Text>
                      <Badge 
                        color={post.user.badge === 'Eco Champion' ? 'green' : 'blue'} 
                        variant="light" 
                        size="sm"
                      >
                        {post.user.badge}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </div>
                </Group>
              </Group>

              <Text size="md" lh={1.6} mb="md">{post.content}</Text>

              {post.image && (
                <Image
                  src={post.image}
                  height={180}
                  radius="md"
                  alt="Post image"
                  mb="md"
                />
              )}

              <Divider my="xs" />

              <Group gap="lg">
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="pink" radius="xl">
                    <IconHeart size={18} stroke={1.5} />
                  </ActionIcon>
                  <Text size="sm" c="dimmed">{post.likes || 0}</Text>
                </Group>

                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue" radius="xl">
                    <IconMessageCircle2 size={18} stroke={1.5} />
                  </ActionIcon>
                  <Text size="sm" c="dimmed">{post.comments || 0}</Text>
                </Group>

                <Group gap="xs" ml="auto">
                  <ActionIcon variant="subtle" color="teal" radius="xl">
                    <IconShare size={18} stroke={1.5} />
                  </ActionIcon>
                  <Text size="sm" c="dimmed">Share</Text>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      </Container>
    </Box>  
  );
}