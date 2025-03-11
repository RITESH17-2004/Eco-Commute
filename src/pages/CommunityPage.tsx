import { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Text,
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
  rem,
  Collapse,
  Avatar,
  Tooltip,
  LoadingOverlay,
  ThemeIcon,
  Transition,
  Menu,
  ScrollArea
} from '@mantine/core';
import { 
  IconHeart, 
  IconHeartFilled, 
  IconMessageCircle2, 
  IconShare, 
  IconSend, 
  IconPhoto, 
  IconVideo, 
  IconMoodSmile, 
  IconLeaf, 
  IconRecycle, 
  IconX, 
  IconDotsVertical,
  IconFlag,
  IconBookmark,
  IconInfoCircle,
  IconChevronDown,
  IconChevronUp,
  IconUserCircle
} from '@tabler/icons-react';
import { db } from '../firebase'; // Import your existing Firebase configuration
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, updateDoc, arrayUnion, increment, arrayRemove, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// Enhanced responsive styles
const titleStyles = {
  fontFamily: "'Poppins', sans-serif",
  letterSpacing: '-0.5px',
  fontWeight: 900,
  backgroundImage: 'linear-gradient(135deg, #1E8449 0%, #27AE60 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '@media (max-width: 768px)': {
    fontSize: 'var(--mantine-font-size-xl)'
  }
};

// Custom card hover effect
const cardHoverStyles = {
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.1)'
  }
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return `${Math.floor(diffInMs / (1000 * 60))}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
};

export function CommunityPage() {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('Anonymous User');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInitial, setShowInitial] = useState(false);
  const commentInputRefs = useRef<{[key: string]: HTMLTextAreaElement}>({});
  const commentSectionRefs = useRef<{[key: string]: HTMLDivElement}>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const auth = getAuth();
  
  // Add a maximum number of visible posts before scrolling
  const MAX_VISIBLE_POSTS = 4;
  // Add a maximum number of visible comments before scrolling
  const MAX_VISIBLE_COMMENTS = 3;

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

  // Fetch posts from Firebase when component mounts
  useEffect(() => {
    setLoading(true);
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('created_at', 'desc'));

    // Set up real-time listener for posts
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JS Date if needed
        created_at: doc.data().created_at?.toDate ? 
                    doc.data().created_at.toDate().toISOString() : 
                    new Date().toISOString(),
        // Ensure these arrays exist
        likedBy: doc.data().likedBy || [],
        comments: doc.data().comments || []
      }));
      setPosts(postsList);
      setLoading(false);
      setTimeout(() => setShowInitial(true), 300);
    });

    // Clean up listener on component unmount
    return () => unsubscribe();
  }, []);

  // Handle click outside for comments
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      expandedComments.forEach(postId => {
        const commentSectionRef = commentSectionRefs.current[postId];
        const commentButton = document.querySelector(`[data-comment-button="${postId}"]`);
        
        if (commentSectionRef && 
            !commentSectionRef.contains(event.target as Node) && 
            !commentButton?.contains(event.target as Node)) {
          setExpandedComments(prev => prev.filter(id => id !== postId));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedComments]);

  // Focus text area when clicking on post box
  const focusTextArea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = async () => {
    if (!newPost.trim()) return;
    
    setSubmitting(true);
    try {
      // Add new post to Firestore
      await addDoc(collection(db, 'posts'), {
        userId: currentUser?.uid || 'anonymous',
        user: {
          name: userName,
          badge: userName !== 'Anonymous User' ? 'Eco Contributor' : 'Guest'  // Better default badge
        },
        content: newPost,
        likes: 0,
        likedBy: [],
        comments: [],
        created_at: serverTimestamp() // Use server timestamp for consistency
      });

      // Clear the input field
      setNewPost('');
    } catch (error) {
      console.error("Error adding post: ", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      // Maybe show a login prompt
      alert("Please log in to like posts");
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    
    if (!post) return;
    
    try {
      if (post.likedBy.includes(currentUser.uid)) {
        // User already liked the post, so unlike it
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
      } else {
        // User hasn't liked the post yet, so like it
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };
  
  const toggleComments = (postId: string) => {
    setExpandedComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    
    // Focus on comment input when opening
    if (!expandedComments.includes(postId)) {
      setTimeout(() => {
        if (commentInputRefs.current[postId]) {
          commentInputRefs.current[postId].focus();
        }
      }, 100);
    }
  };
  
  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };
  
  const submitComment = async (postId: string) => {
    if (!currentUser) {
      alert("Please log in to comment");
      return;
    }
    
    const comment = commentInputs[postId];
    if (!comment || !comment.trim()) return;
    
    const postRef = doc(db, 'posts', postId);
    
    try {
      const newComment = {
        userId: currentUser.uid,
        userName: userName,
        text: comment.trim(),
        timestamp: new Date().toISOString()
      };
      
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      
      // Clear comment input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };
  
  const deletePost = async (postId: string) => {
    if (!currentUser) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post || post.userId !== currentUser.uid) {
      alert("You can only delete your own posts");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    }
  };

  const getBadgeColors = (badge: string) => {
    switch(badge) {
      case 'Eco Champion':
        return { from: 'teal.7', to: 'green.7', deg: 105 };
      case 'Eco Contributor':
        return { from: 'green.5', to: 'teal.5', deg: 105 };
      case 'Guest':
        return { from: 'gray.5', to: 'gray.6', deg: 105 };
      default:
        return { from: 'blue.5', to: 'cyan.5', deg: 105 };
    }
  };

  // Calculate the appropriate height for posts ScrollArea based on screen size
  const getPostsScrollAreaHeight = () => {
    // Use dynamic calculation based on viewport height
    if (typeof window !== 'undefined') {
      const vh = window.innerHeight;
      // Adjust height based on viewport height, with a maximum
      return Math.min(vh * 0.6, 600);
    }
    return 600; // Default fallback
  };

  return (
    <Box 
      style={{
        minHeight: '100vh',
        paddingTop: rem(20),
        paddingBottom: rem(40),
        width: '99vw',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(232, 245, 233, 0.4) 0%, rgba(232, 245, 233, 0.1) 100%)'
      }}>
      {/* Decorative elements */}
      <Box 
        style={{ 
          position: 'absolute', 
          top: rem(40), 
          left: rem(-20), 
          opacity: 0.15, 
          transform: 'rotate(-15deg)' 
        }}>
        <IconLeaf size={rem(120)} color="#2E7D32" />
      </Box>
      <Box 
        style={{ 
          position: 'absolute', 
          bottom: rem(40), 
          right: rem(-20), 
          opacity: 0.15, 
          transform: 'rotate(15deg)' 
        }}>
        <IconRecycle size={rem(120)} color="#2E7D32" />
      </Box>
      
      <Container size="md" py={{ base: 'md', sm: 'xl' }}>
        <div style={{ position: 'relative' }}>
          <LoadingOverlay 
            visible={loading} 
            zIndex={1000} 
            overlayProps={{ blur: 2, backgroundOpacity: 0.3 }}
            loaderProps={{ color: 'green', variant: 'dots' }}
          />
          
          <Transition mounted={showInitial} transition="fade" duration={500}>
            {(styles) => (
              <div style={styles}>
                <Title
                  order={1}
                  ta="center"
                  mb={{ base: 'lg', sm: 'xl' }}
                  style={titleStyles}
                >
                  EcoConnect Community
                </Title>
                <Text ta="center" mb="xl" c="dimmed" size="lg">
                  Share your sustainable journey and connect with like-minded individuals
                </Text>

                <Paper
                  shadow="sm"
                  radius="lg"
                  p={{ base: 'md', sm: 'xl' }}
                  withBorder
                  mb="xl"
                  bg="white"
                  style={{ 
                    borderLeft: '4px solid var(--mantine-color-green-6)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                    cursor: 'text'
                  }}
                  onClick={focusTextArea}
                >
                  <Group gap="sm" mb="md">
                    <ThemeIcon size={42} radius="xl" color="green.1" c="green.7">
                      {currentUser ? (
                        userName.charAt(0).toUpperCase()
                      ) : (
                        <IconUserCircle size={24} />
                      )}
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="sm" c="green.7">
                        {userName !== 'Anonymous User' ? userName : 'Sign in to share with your name'}
                      </Text>
                      <Badge 
                        color="green" 
                        variant="light"
                        size="xs"
                      >
                        {userName !== 'Anonymous User' ? 'Eco Contributor' : 'Guest'}
                      </Badge>
                    </div>
                  </Group>
                  
                  <Textarea
                    ref={textareaRef}
                    placeholder="What eco-friendly actions are you taking today?"
                    minRows={3}
                    value={newPost}
                    onChange={(event) => setNewPost(event.currentTarget.value)}
                    radius="md"
                    size="md"
                    mb="md"
                    autosize
                    maxRows={10}
                    styles={{
                      input: {
                        border: '1px solid #E0F2F1',
                        '&:focus': {
                          borderColor: 'var(--mantine-color-green-5)'
                        }
                      }
                    }}
                  />
                  
                  <Group justify="space-between" wrap="nowrap">
                    <Flex gap="xs" wrap="wrap">
                      <Tooltip label="Add Photo" withArrow position="bottom">
                        <ActionIcon variant="light" color="green" size="lg" radius="xl">
                          <IconPhoto size={18} stroke={1.5} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Add Video" withArrow position="bottom">
                        <ActionIcon variant="light" color="green" size="lg" radius="xl">
                          <IconVideo size={18} stroke={1.5} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Add Emoji" withArrow position="bottom">
                        <ActionIcon variant="light" color="green" size="lg" radius="xl">
                          <IconMoodSmile size={18} stroke={1.5} />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>

                    <Button 
                      onClick={handleSubmit}
                      variant="gradient"
                      gradient={{ from: 'teal.6', to: 'green.8', deg: 105 }}
                      radius="xl"
                      size="md"
                      disabled={!newPost.trim() || submitting}
                      rightSection={<IconSend size={16} />}
                      loading={submitting}
                      style={{ 
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(46, 125, 50, 0.25)'
                        }
                      }}
                    >
                      Share
                    </Button>
                  </Group>
                </Paper>

                <Group justify="space-between" mb="lg">
                  <Text fw={700} size="lg" c="green.8">Recent Activity</Text>
                  <Button 
                    variant="subtle" 
                    color="gray"
                    radius="xl"
                    size="xs"
                    rightSection={<IconChevronDown size={16} />}
                  >
                    Sort by: Recent
                  </Button>
                </Group>

                <Stack gap="lg">
                  {loading ? (
                    Array(3).fill(0).map((_, index) => (
                      <Card key={index} shadow="sm" padding="lg" radius="md" withBorder bg="white">
                        <LoadingOverlay visible />
                      </Card>
                    ))
                  ) : posts.length > 0 ? (
                    // Always use ScrollArea for posts with dynamic height calculation
                    <ScrollArea 
                      h={posts.length > MAX_VISIBLE_POSTS ? getPostsScrollAreaHeight() : 'auto'} 
                      type="auto" 
                      offsetScrollbars
                      styles={{
                        viewport: { paddingRight: 8 }
                      }}
                    >
                      <Stack gap="lg" pb="md">
                        {posts.map((post) => (
                          <Card 
                            key={post.id} 
                            shadow="sm" 
                            padding="lg" 
                            radius="md" 
                            withBorder
                            bg="white"
                            style={cardHoverStyles}
                          >
                            <Group justify="space-between" mb="xs">
                              <Group gap="sm">
                                <Avatar 
                                  size="md" 
                                  color="green" 
                                  radius="xl"
                                >
                                  {post.user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <div>
                                  <Group gap={8} align="center">
                                    <Text fw={700} size="md">{post.user.name}</Text>
                                    <Badge 
                                      color={post.user.badge === 'Eco Champion' ? 'green' : 'blue'} 
                                      variant="gradient"
                                      gradient={getBadgeColors(post.user.badge)}
                                      size="sm"
                                    >
                                      {post.user.badge}
                                    </Badge>
                                  </Group>
                                  <Text size="sm" c="dimmed">
                                    {formatDate(post.created_at)}
                                  </Text>
                                </div>
                              </Group>
                              
                              <Menu shadow="md" width={200} position="bottom-end">
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray">
                                    <IconDotsVertical size={18} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  {currentUser && post.userId === currentUser.uid && (
                                    <Menu.Item 
                                      color="red" 
                                      leftSection={<IconX size={14} />}
                                      onClick={() => deletePost(post.id)}
                                    >
                                      Delete post
                                    </Menu.Item>
                                  )}
                                  <Menu.Item leftSection={<IconBookmark size={14} />}>
                                    Save post
                                  </Menu.Item>
                                  <Menu.Item leftSection={<IconFlag size={14} />}>
                                    Report
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>

                            <Text size="md" lh={1.6} mb="md" style={{ fontSize: rem(15) }}>{post.content}</Text>

                            {post.image && (
                              <Image
                                src={post.image}
                                height={180}
                                radius="md"
                                alt="Post image"
                                mb="md"
                              />
                            )}

                            <Divider my="xs" color="gray.2" />

                            <Group gap="lg">
                              <Tooltip label={currentUser && post.likedBy.includes(currentUser.uid) ? "Unlike" : "Like"} withArrow position="bottom">
                                <Group gap="xs">
                                  <ActionIcon 
                                    variant="light" 
                                    color="pink" 
                                    radius="xl" 
                                    size="md"
                                    onClick={() => handleLike(post.id)}
                                  >
                                    {currentUser && post.likedBy.includes(currentUser.uid) ? (
                                      <IconHeartFilled size={18} stroke={1.5} />
                                    ) : (
                                      <IconHeart size={18} stroke={1.5} />
                                    )}
                                  </ActionIcon>
                                  <Text size="sm" c="dimmed" fw={500}>{post.likedBy.length || 0}</Text>
                                </Group>
                              </Tooltip>

                              <Tooltip label="Comments" withArrow position="bottom">
                                <Group gap="xs">
                                  <ActionIcon 
                                    variant="light" 
                                    color="blue" 
                                    radius="xl" 
                                    size="md"
                                    onClick={() => toggleComments(post.id)}
                                    data-comment-button={post.id}
                                  >
                                    <IconMessageCircle2 size={18} stroke={1.5} />
                                  </ActionIcon>
                                  <Text size="sm" c="dimmed" fw={500}>{post.comments?.length || 0}</Text>
                                </Group>
                              </Tooltip>

                              <Tooltip label="Share" withArrow position="bottom">
                                <Group gap="xs" ml="auto">
                                  <ActionIcon variant="light" color="teal" radius="xl" size="md">
                                    <IconShare size={18} stroke={1.5} />
                                  </ActionIcon>
                                </Group>
                              </Tooltip>
                            </Group>
                            
                            {/* Comments Section */}
                            <Collapse in={expandedComments.includes(post.id)}>
                              <Box mt="md" ref={el => {
                                if (el) commentSectionRefs.current[post.id] = el;
                              }}>
                                <Group justify="space-between" mb="sm">
                                  <Text fw={600} size="sm">Comments ({post.comments?.length || 0})</Text>
                                  <ActionIcon 
                                    variant="subtle" 
                                    onClick={() => toggleComments(post.id)}
                                    size="sm"
                                  >
                                    <IconChevronUp size={18} />
                                  </ActionIcon>
                                </Group>
                                
                                {/* Comment List with ScrollArea - improved height handling */}
                                {post.comments && post.comments.length > 0 ? (
                                  <ScrollArea 
                                    h={post.comments.length > MAX_VISIBLE_COMMENTS ? 200 : 'auto'} 
                                    offsetScrollbars 
                                    mb="md"
                                    styles={{
                                      root: { 
                                        border: '1px solid var(--mantine-color-gray-3)', 
                                        borderRadius: 'var(--mantine-radius-md)',
                                        // Add a max-height to ensure it doesn't grow too large on mobile
                                        maxHeight: '50vh'
                                      },
                                      viewport: { padding: '8px' }
                                    }}
                                  >
                                    <Stack gap="xs">
                                      {post.comments.map((comment: any, index: number) => (
                                        <Paper 
                                          key={index} 
                                          p="xs" 
                                          withBorder 
                                          radius="md"
                                          bg="gray.0"
                                          style={{ borderLeft: '2px solid var(--mantine-color-blue-4)' }}
                                        >
                                          <Group gap="sm" mb={4}>
                                            <Avatar 
                                              size="sm" 
                                              radius="xl" 
                                              color="blue"
                                            >
                                              {comment.userName.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <div style={{ flex: 1 }}>
                                            <Group justify="space-between">
                                              <Text fw={600} size="sm">{comment.userName}</Text>
                                              <Text size="xs" c="dimmed">
                                                {formatDate(comment.timestamp)}
                                              </Text>
                                            </Group>
                                            </div>
                                          </Group>
                                          <Text size="sm" mt={4}>{comment.text}</Text>
                                        </Paper>
                                      ))}
                                    </Stack>
                                  </ScrollArea>
                                ) : (
                                  <Paper p="sm" radius="md" bg="gray.0" ta="center" mb="md">
                                    <Text c="dimmed" size="sm" fs="italic">
                                      Be the first to comment!
                                    </Text>
                                  </Paper>
                                )}
                                
                                {/* Comment Input */}
                                <Group align="flex-start">
                                  <Avatar 
                                    size="sm" 
                                    radius="xl" 
                                    color="green"
                                  >
                                    {userName.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Textarea
                                    placeholder="Add a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => handleCommentChange(post.id, e.currentTarget.value)}
                                    radius="md"
                                    autosize
                                    maxRows={4}
                                    size="sm"
                                    style={{ flex: 1 }}
                                    ref={(el) => {
                                      if (el) commentInputRefs.current[post.id] = el;
                                    }}
                                  />
                                  <Button
                                    variant="gradient"
                                    gradient={{ from: 'blue.5', to: 'cyan.5' }}
                                    size="sm"
                                    radius="xl"
                                    onClick={() => submitComment(post.id)}
                                    disabled={!commentInputs[post.id]?.trim()}
                                  >
                                    Post
                                  </Button>
                                </Group>
                              </Box>
                            </Collapse>
                          </Card>
                        ))}
                      </Stack>
                    </ScrollArea>
                  ) : (
                    <Paper p="xl" radius="md" bg="gray.0" ta="center">
                      <IconInfoCircle size={48} color="var(--mantine-color-green-6)" style={{ opacity: 0.6 }} />
                      <Text size="lg" fw={600} mt="md" mb="xs">No posts yet</Text>
                      <Text c="dimmed">Be the first to share your eco-friendly journey!</Text>
                    </Paper>
                  )}
                </Stack>
              </div>
            )}
          </Transition>
        </div>
      </Container>
    </Box>  
  );
}